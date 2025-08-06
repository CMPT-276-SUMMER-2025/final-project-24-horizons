// Import required modules for SQLite database operations
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file path for ES modules (replaces __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const Database = sqlite3.verbose().Database;

/**
 * DatabaseManager class handles all database operations for the StudySync application
 * Provides CRUD operations for users, notes, flashcards, and goals
 */
class DatabaseManager {
  constructor() {
    this.db = null; // SQLite database connection instance
    // Use environment variable for database path or default to local directory
    this.dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'studysync.db');
  }

  /**
   * Establishes connection to the SQLite database
   * Creates database directory if it doesn't exist
   * Configures SQLite pragmas for optimal performance
   */
  async connect() {
    return new Promise((resolve, reject) => {
      // Ensure the database directory exists
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Create database connection
      this.db = new Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Error opening database:', err.message);
          reject(err);
        } else {
          console.log(`✅ Connected to SQLite database at: ${this.dbPath}`);
          
          // Enable foreign key constraints
          this.db.run('PRAGMA foreign_keys = ON');
          
          // Configure SQLite for better performance
          this.db.run('PRAGMA journal_mode = WAL'); // Write-Ahead Logging for better concurrency
          this.db.run('PRAGMA synchronous = NORMAL'); // Balance between speed and safety
          this.db.run('PRAGMA cache_size = 1000'); // Increase cache size
          this.db.run('PRAGMA temp_store = memory'); // Store temporary tables in memory
          
          resolve();
        }
      });
    });
  }

  /**
   * Initializes the database by connecting and running the schema
   * This method should be called when starting the application
   */
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

  /**
   * Reads and executes the SQL schema file to create database tables
   * Splits schema by semicolons and executes each statement individually
   */
  async runSchema() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and filter out empty statements
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    // Execute each SQL statement
    for (const statement of statements) {
      if (statement.trim()) {
        await this.run(statement);
      }
    }
  }

  /**
   * Promisified wrapper for SQLite's run method
   * Used for INSERT, UPDATE, DELETE operations
   * @param {string} sql - SQL statement to execute
   * @param {Array} params - Parameters for the SQL statement
   * @returns {Promise<Object>} Object containing lastID and changes count
   */
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('❌ Database run error:', err.message);
          console.error('SQL:', sql);
          console.error('Params:', params);
          reject(err);
        } else {
          // 'this' refers to the SQLite statement context
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  /**
   * Promisified wrapper for SQLite's get method
   * Used for SELECT operations that return a single row
   * @param {string} sql - SQL statement to execute
   * @param {Array} params - Parameters for the SQL statement
   * @returns {Promise<Object|undefined>} Single row result or undefined
   */
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

  /**
   * Promisified wrapper for SQLite's all method
   * Used for SELECT operations that return multiple rows
   * @param {string} sql - SQL statement to execute
   * @param {Array} params - Parameters for the SQL statement
   * @returns {Promise<Array>} Array of row results
   */
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

  /**
   * Executes multiple database operations within a transaction
   * Automatically rolls back on error and commits on success
   * @param {Function} callback - Async function that performs database operations
   * @returns {Promise<any>} Result from the callback function
   */
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

  /**
   * Searches for notes containing the specified term in title or content
   * @param {string} userId - ID of the user whose notes to search
   * @param {string} searchTerm - Term to search for
   * @returns {Promise<Array>} Array of matching notes
   */
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

  /**
   * Creates or updates a user record using UPSERT operation
   * Updates existing user data or creates new record if user doesn't exist
   * @param {Object} user - User object with id, email, name, and picture
   * @returns {Promise<Object>} Database operation result
   */
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

  /**
   * Creates a new note for the specified user
   * Ensures user exists before creating the note
   * @param {string} userId - ID of the user creating the note
   * @param {string} title - Title of the note
   * @param {string} content - Content of the note
   * @returns {Promise<Object>} The created note object
   */
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

  /**
   * Helper method to ensure a user exists in the database
   * Creates a minimal user record if the user doesn't exist
   * @param {string} userId - ID of the user to check/create
   */
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

  /**
   * Retrieves all notes for a specific user
   * @param {string} userId - ID of the user whose notes to retrieve
   * @returns {Promise<Array>} Array of user's notes ordered by creation date
   */
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

  /**
   * Updates an existing note
   * Only allows users to update their own notes
   * @param {number} noteId - ID of the note to update
   * @param {string} userId - ID of the user updating the note
   * @param {string} title - New title for the note
   * @param {string} content - New content for the note
   * @returns {Promise<Object>} The updated note object
   */
  async updateNote(noteId, userId, title, content) {
    const sql = `
      UPDATE notes 
      SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;
    await this.run(sql, [title, content, noteId, userId]);
    return this.get('SELECT * FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);
  }

  /**
   * Deletes a note
   * Only allows users to delete their own notes
   * @param {number} noteId - ID of the note to delete
   * @param {string} userId - ID of the user deleting the note
   * @returns {Promise<Object>} Database operation result
   */
  async deleteNote(noteId, userId) {
    const sql = `DELETE FROM notes WHERE id = ? AND user_id = ?`;
    return this.run(sql, [noteId, userId]);
  }

  /**
   * Creates a new flashcard for the specified user
   * Ensures user exists before creating the flashcard
   * @param {string} userId - ID of the user creating the flashcard
   * @param {string} front - Front side content of the flashcard
   * @param {string} back - Back side content of the flashcard
   * @returns {Promise<Object>} The created flashcard object
   */
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

  /**
   * Retrieves all flashcards for a specific user
   * @param {string} userId - ID of the user whose flashcards to retrieve
   * @returns {Promise<Array>} Array of user's flashcards ordered by creation date
   */
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

  /**
   * Updates an existing flashcard
   * Only allows users to update their own flashcards
   * @param {number} flashcardId - ID of the flashcard to update
   * @param {string} userId - ID of the user updating the flashcard
   * @param {string} front - New front side content
   * @param {string} back - New back side content
   * @returns {Promise<Object>} The updated flashcard object
   */
  async updateFlashcard(flashcardId, userId, front, back) {
    const sql = `
      UPDATE flashcards 
      SET front = ?, back = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;
    await this.run(sql, [front, back, flashcardId, userId]);
    return this.get('SELECT * FROM flashcards WHERE id = ? AND user_id = ?', [flashcardId, userId]);
  }

  /**
   * Deletes a flashcard
   * Only allows users to delete their own flashcards
   * @param {number} flashcardId - ID of the flashcard to delete
   * @param {string} userId - ID of the user deleting the flashcard
   * @returns {Promise<Object>} Database operation result
   */
  async deleteFlashcard(flashcardId, userId) {
    const sql = `DELETE FROM flashcards WHERE id = ? AND user_id = ?`;
    return this.run(sql, [flashcardId, userId]);
  }

  /**
   * Creates a new goal for the specified user
   * Ensures user exists before creating the goal
   * @param {string} userId - ID of the user creating the goal
   * @param {string} goal - Goal text content
   * @returns {Promise<Object>} The created goal object
   */
  async createGoal(userId, goal) {
    // Ensure user exists in database first
    await this.ensureUserExists(userId);
    
    const sql = `INSERT INTO goals (user_id, goal) VALUES (?, ?)`;
    const result = await this.run(sql, [userId, goal]);
    return this.get('SELECT * FROM goals WHERE id = ?', [result.id]);
  }

  /**
   * Retrieves all goals for a specific user
   * @param {string} userId - ID of the user whose goals to retrieve
   * @returns {Promise<Array>} Array of goal strings ordered by creation date
   */
  async getUserGoals(userId) {
    const sql = `SELECT goal FROM goals WHERE user_id = ? ORDER BY created_at DESC`;
    const rows = await this.all(sql, [userId]);
    return rows.map(row => row.goal);
  }

  /**
   * Deletes a goal by its index position
   * @param {string} userId - ID of the user deleting the goal
   * @param {number} goalIndex - Zero-based index of the goal to delete
   * @returns {Promise<Object>} Database operation result
   * @throws {Error} If goalIndex is invalid
   */
  async deleteGoal(userId, goalIndex) {
    // Get goals in order to validate index
    const goals = await this.getUserGoals(userId);
    if (goalIndex < 0 || goalIndex >= goals.length) {
      throw new Error('Invalid goal index');
    }
    
    const goalToDelete = goals[goalIndex];
    const sql = `DELETE FROM goals WHERE user_id = ? AND goal = ? LIMIT 1`;
    return this.run(sql, [userId, goalToDelete]);
  }

  /**
   * Replaces all goals for a user with a new set of goals
   * Uses a transaction to ensure data consistency
   * @param {string} userId - ID of the user whose goals to update
   * @param {Array<string>} goals - Array of new goal strings
   */
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

  /**
   * Closes the database connection
   * Should be called when shutting down the application
   */
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

// Create and export a single instance of the database manager
const dbManager = new DatabaseManager();

export default dbManager;
