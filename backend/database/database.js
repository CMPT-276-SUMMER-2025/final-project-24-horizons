import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const Database = sqlite3.verbose().Database;

class DatabaseManager {
  constructor() {
    this.db = null;
    this.dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'studysync.db');
  }

  async connect() {
    return new Promise((resolve, reject) => {
      // Ensure the database directory exists
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Error opening database:', err.message);
          reject(err);
        } else {
          console.log(`✅ Connected to SQLite database at: ${this.dbPath}`);
          
          // Enable foreign keys
          this.db.run('PRAGMA foreign_keys = ON');
          
          // Configure for better performance
          this.db.run('PRAGMA journal_mode = WAL');
          this.db.run('PRAGMA synchronous = NORMAL');
          this.db.run('PRAGMA cache_size = 1000');
          this.db.run('PRAGMA temp_store = memory');
          
          resolve();
        }
      });
    });
  }

  async initialize() {
    try {
      await this.connect();
      await this.runSchema();
      console.log('🗄️ Database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      throw error;
    }
  }

  async runSchema() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await this.run(statement);
      }
    }
  }

  // Promisify database methods for async/await
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('❌ Database run error:', err.message);
          console.error('SQL:', sql);
          console.error('Params:', params);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('❌ Database get error:', err.message);
          console.error('SQL:', sql);
          console.error('Params:', params);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('❌ Database all error:', err.message);
          console.error('SQL:', sql);
          console.error('Params:', params);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Transaction support
  async transaction(callback) {
    await this.run('BEGIN TRANSACTION');
    try {
      const result = await callback(this);
      await this.run('COMMIT');
      return result;
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  // Search functionality
  async searchNotes(userId, searchTerm) {
    const sql = `
      SELECT id, title, content, 
             DATE(created_at) as date,
             created_at as createdAt,
             updated_at as updatedAt
      FROM notes 
      WHERE user_id = ? AND (
        title LIKE ? OR content LIKE ?
      )
      ORDER BY created_at DESC
    `;
    const searchPattern = `%${searchTerm}%`;
    return this.all(sql, [userId, searchPattern, searchPattern]);
  }

  // User management
  async upsertUser(user) {
    const sql = `
      INSERT INTO users (id, email, name, picture, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        email = excluded.email,
        name = excluded.name,
        picture = excluded.picture,
        updated_at = CURRENT_TIMESTAMP
    `;
    return this.run(sql, [user.id, user.email, user.name, user.picture]);
  }

  // Notes CRUD operations
  async createNote(userId, title, content) {
    // Ensure user exists in database first
    await this.ensureUserExists(userId);
    
    const sql = `
      INSERT INTO notes (user_id, title, content)
      VALUES (?, ?, ?)
    `;
    const result = await this.run(sql, [userId, title, content]);
    return this.get('SELECT * FROM notes WHERE id = ?', [result.id]);
  }

  // Helper method to ensure user exists
  async ensureUserExists(userId) {
    const existingUser = await this.get('SELECT id FROM users WHERE id = ?', [userId]);
    if (!existingUser) {
      // Create a minimal user record if it doesn't exist
      console.log(`⚠️ User ${userId} not found in database, creating minimal record`);
      await this.run(
        'INSERT OR IGNORE INTO users (id, email, name) VALUES (?, ?, ?)',
        [userId, `user-${userId}@unknown.com`, 'Unknown User']
      );
    }
  }

  async getUserNotes(userId) {
    const sql = `
      SELECT id, title, content, 
             DATE(created_at) as date,
             created_at as createdAt,
             updated_at as updatedAt
      FROM notes 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    return this.all(sql, [userId]);
  }

  async updateNote(noteId, userId, title, content) {
    const sql = `
      UPDATE notes 
      SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;
    await this.run(sql, [title, content, noteId, userId]);
    return this.get('SELECT * FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);
  }

  async deleteNote(noteId, userId) {
    const sql = `DELETE FROM notes WHERE id = ? AND user_id = ?`;
    return this.run(sql, [noteId, userId]);
  }

  // Flashcards CRUD operations
  async createFlashcard(userId, front, back) {
    // Ensure user exists in database first
    await this.ensureUserExists(userId);
    
    const sql = `
      INSERT INTO flashcards (user_id, front, back)
      VALUES (?, ?, ?)
    `;
    const result = await this.run(sql, [userId, front, back]);
    return this.get('SELECT * FROM flashcards WHERE id = ?', [result.id]);
  }

  async getUserFlashcards(userId) {
    const sql = `
      SELECT id, front, back,
             DATE(created_at) as date,
             created_at as createdAt,
             updated_at as updatedAt
      FROM flashcards 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    return this.all(sql, [userId]);
  }

  async updateFlashcard(flashcardId, userId, front, back) {
    const sql = `
      UPDATE flashcards 
      SET front = ?, back = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;
    await this.run(sql, [front, back, flashcardId, userId]);
    return this.get('SELECT * FROM flashcards WHERE id = ? AND user_id = ?', [flashcardId, userId]);
  }

  async deleteFlashcard(flashcardId, userId) {
    const sql = `DELETE FROM flashcards WHERE id = ? AND user_id = ?`;
    return this.run(sql, [flashcardId, userId]);
  }

  // Goals CRUD operations
  async createGoal(userId, goal) {
    // Ensure user exists in database first
    await this.ensureUserExists(userId);
    
    const sql = `INSERT INTO goals (user_id, goal) VALUES (?, ?)`;
    const result = await this.run(sql, [userId, goal]);
    return this.get('SELECT * FROM goals WHERE id = ?', [result.id]);
  }

  async getUserGoals(userId) {
    const sql = `SELECT goal FROM goals WHERE user_id = ? ORDER BY created_at DESC`;
    const rows = await this.all(sql, [userId]);
    return rows.map(row => row.goal);
  }

  async deleteGoal(userId, goalIndex) {
    // Get goals in order
    const goals = await this.getUserGoals(userId);
    if (goalIndex < 0 || goalIndex >= goals.length) {
      throw new Error('Invalid goal index');
    }
    
    const goalToDelete = goals[goalIndex];
    const sql = `DELETE FROM goals WHERE user_id = ? AND goal = ? LIMIT 1`;
    return this.run(sql, [userId, goalToDelete]);
  }

  async updateUserGoals(userId, goals) {
    await this.transaction(async (db) => {
      // Delete all existing goals for user
      await db.run('DELETE FROM goals WHERE user_id = ?', [userId]);
      
      // Insert new goals
      for (const goal of goals) {
        await db.run('INSERT INTO goals (user_id, goal) VALUES (?, ?)', [userId, goal]);
      }
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err.message);
        } else {
          console.log('✅ Database connection closed');
        }
      });
    }
  }
}

const dbManager = new DatabaseManager();

export default dbManager;
