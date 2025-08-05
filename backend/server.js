import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import crypto from 'crypto';
import dbManager from './database/database.js';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3009;

// Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  console.log(`User-Agent: ${userAgent}`);
  
  // Log request body for POST/PUT requests (excluding sensitive data)
  if ((method === 'POST' || method === 'PUT') && req.body) {
    const logBody = { ...req.body };
    // Hide sensitive fields
    if (logBody.token) logBody.token = '[HIDDEN]';
    if (logBody.password) logBody.password = '[HIDDEN]';
    console.log('Request Body:', JSON.stringify(logBody, null, 2));
  }
  
  console.log('---');
  next();
});

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'https://studysync-backend.uttamsharma.com',
      'https://studysync-ai.netlify.app'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(cookieParser());
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;

// Verify Google token and create session
app.post('/api/auth/google', async (req, res) => {
  console.log('🔐 Google authentication request received');
  console.log('Request headers:', req.headers);
  console.log('Request body:', { ...req.body, token: req.body.token ? '[HIDDEN]' : undefined });
  
  try {
    const { token } = req.body;
    
    if (!token) {
      console.log('❌ No token provided in request');
      return res.status(400).json({ error: 'No token provided' });
    }
    
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    console.log(`✅ Google token verified for user: ${payload.email}`);
    
    // Create user object
    const user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
    
    // Save/update user in database
    try {
      await dbManager.upsertUser(user);
      console.log(`💾 User saved to database: ${user.email}`);
    } catch (dbError) {
      console.error('❌ Failed to save user to database:', dbError);
      return res.status(500).json({ error: 'Database error during authentication' });
    }
    
    // Create JWT token
    const jwtToken = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    
    // Set HTTP-only cookie
    res.cookie('auth_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      // Remove or conditionally set domain
      ...(process.env.NODE_ENV === 'production' && process.env.COOKIE_DOMAIN && {
        domain: process.env.COOKIE_DOMAIN
      })
    });
    
    console.log(`🍪 Auth cookie set for user: ${user.email}`);
    console.log('Cookie details:', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ Auth error:', error);
    if (error.message.includes('Token used too early')) {
      return res.status(401).json({ error: 'Token timing issue, please try again' });
    }
    res.status(401).json({ error: 'Invalid token', details: error.message });
  }
});

// Enhanced JWT verification
const authenticateToken = (req, res, next) => {
  console.log('🔍 Authenticating token...');
  console.log('Available cookies:', req.cookies);
  console.log('Headers:', req.headers);
  
  const token = req.cookies.auth_token;
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ 
      error: 'No token provided',
      message: 'Authentication required. Please log in.' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add token expiry check
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      console.log('❌ Token expired');
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
      });
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Your session has expired. Please log in again.' 
      });
    }
    
    console.log(`✅ Token verified for user: ${decoded.email}`);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });
    res.status(401).json({ 
      error: 'Invalid token',
      message: 'Authentication failed. Please log in again.' 
    });
  }
};

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  console.log(`👤 Current user request for: ${req.user.email}`);
  res.json({ user: req.user });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  console.log('🚪 Logout request received');
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  });
  console.log('🍪 Auth cookie cleared');
  res.json({ success: true });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize database
await dbManager.initialize();

// Get user's goals
app.get('/api/user/goals', authenticateToken, async (req, res) => {
  console.log(`🎯 Goals request for user: ${req.user.email}`);
  const userId = req.user.id;
  
  try {
    const goals = await dbManager.getUserGoals(userId);
    res.json({ goals });
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Add a goal for the user
app.post('/api/user/goals', authenticateToken, async (req, res) => {
  console.log(`➕ Add goal request for user: ${req.user.email}`);
  const userId = req.user.id;
  const { goal } = req.body;
  
  if (!goal || typeof goal !== 'string' || !goal.trim()) {
    return res.status(400).json({ error: 'Goal is required and must be a non-empty string' });
  }
  
  const trimmedGoal = goal.trim();
  
  try {
    // Check if goal already exists
    const currentGoals = await dbManager.getUserGoals(userId);
    if (currentGoals.includes(trimmedGoal)) {
      return res.status(400).json({ error: 'Goal already exists' });
    }
    
    await dbManager.createGoal(userId, trimmedGoal);
    const updatedGoals = await dbManager.getUserGoals(userId);
    
    console.log(`✅ Goal added for ${req.user.email}: "${trimmedGoal}"`);
    res.json({ goals: updatedGoals });
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to add goal' });
  }
});

// Remove a goal for the user
app.delete('/api/user/goals/:index', authenticateToken, async (req, res) => {
  console.log(`🗑️ Remove goal request for user: ${req.user.email}`);
  const userId = req.user.id;
  const goalIndex = parseInt(req.params.index);
  
  try {
    await dbManager.deleteGoal(userId, goalIndex);
    const updatedGoals = await dbManager.getUserGoals(userId);
    
    console.log(`✅ Goal removed for ${req.user.email} at index ${goalIndex}`);
    res.json({ goals: updatedGoals });
  } catch (error) {
    console.error('❌ Database error:', error);
    if (error.message === 'Invalid goal index') {
      res.status(400).json({ error: 'Invalid goal index' });
    } else {
      res.status(500).json({ error: 'Failed to remove goal' });
    }
  }
});

// Update all goals for the user (bulk update)
app.put('/api/user/goals', authenticateToken, async (req, res) => {
  console.log(`📝 Update goals request for user: ${req.user.email}`);
  const userId = req.user.id;
  const { goals } = req.body;
  
  if (!Array.isArray(goals)) {
    return res.status(400).json({ error: 'Goals must be an array' });
  }
  
  // Validate each goal
  const validGoals = goals.filter(goal => 
    typeof goal === 'string' && goal.trim().length > 0
  ).map(goal => goal.trim());
  
  // Remove duplicates
  const uniqueGoals = [...new Set(validGoals)];
  
  try {
    await dbManager.updateUserGoals(userId, uniqueGoals);
    
    console.log(`✅ Goals updated for ${req.user.email}: ${uniqueGoals.length} goals`);
    res.json({ goals: uniqueGoals });
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to update goals' });
  }
});

// Notes API endpoints

// Get user's notes
app.get('/api/notes', authenticateToken, async (req, res) => {
  console.log(`📝 Notes request for user: ${req.user.email}`);
  const userId = req.user.id;
  
  try {
    const notes = await dbManager.getUserNotes(userId);
    res.json(notes);
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create a new note
app.post('/api/notes', authenticateToken, async (req, res) => {
  console.log(`➕ Add note request for user: ${req.user.email}`);
  const userId = req.user.id;
  const { title, content } = req.body;
  
  if (!title && !content) {
    return res.status(400).json({ error: 'Title or content is required' });
  }
  
  try {
    const newNote = await dbManager.createNote(
      userId, 
      title?.trim() || 'Untitled Note', 
      content?.trim() || ''
    );
    
    console.log(`✅ Note created for ${req.user.email}: "${newNote.title}"`);
    res.status(201).json(newNote);
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update a note
app.put('/api/notes/:id', authenticateToken, async (req, res) => {
  console.log(`📝 Update note request for user: ${req.user.email}`);
  const userId = req.user.id;
  const noteId = parseInt(req.params.id);
  const { title, content } = req.body;
  
  try {
    const updatedNote = await dbManager.updateNote(
      noteId, 
      userId, 
      title?.trim() || 'Untitled Note', 
      content?.trim() || ''
    );
    
    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    console.log(`✅ Note updated for ${req.user.email}: "${updatedNote.title}"`);
    res.json(updatedNote);
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete a note
app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  console.log(`🗑️ Delete note request for user: ${req.user.email}`);
  const userId = req.user.id;
  const noteId = parseInt(req.params.id);
  
  try {
    const result = await dbManager.deleteNote(noteId, userId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    console.log(`✅ Note deleted for ${req.user.email}, ID: ${noteId}`);
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Search notes endpoint
app.get('/api/notes/search', authenticateToken, async (req, res) => {
  console.log(`🔍 Search notes request for user: ${req.user.email}`);
  const userId = req.user.id;
  const { q: searchTerm } = req.query;
  
  if (!searchTerm || typeof searchTerm !== 'string' || !searchTerm.trim()) {
    return res.status(400).json({ error: 'Search term is required' });
  }
  
  try {
    const notes = await dbManager.searchNotes(userId, searchTerm.trim());
    console.log(`✅ Found ${notes.length} notes for search term: "${searchTerm}"`);
    res.json(notes);
  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({ error: 'Failed to search notes' });
  }
});

// Flashcards API endpoints

// Get user's flashcards
app.get('/api/flashcards', authenticateToken, async (req, res) => {
  console.log(`🃏 Flashcards request for user: ${req.user.email}`);
  const userId = req.user.id;
  
  try {
    const flashcards = await dbManager.getUserFlashcards(userId);
    res.json(flashcards);
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// Create a new flashcard
app.post('/api/flashcards', authenticateToken, async (req, res) => {
  console.log(`➕ Add flashcard request for user: ${req.user.email}`);
  const userId = req.user.id;
  const { front, back } = req.body;
  
  if (!front && !back) {
    return res.status(400).json({ error: 'Front or back is required' });
  }
  
  try {
    const newFlashcard = await dbManager.createFlashcard(
      userId,
      front?.trim() || 'Untitled Front',
      back?.trim() || ''
    );
    
    console.log(`✅ Flashcard created for ${req.user.email}: "${newFlashcard.front}"`);
    res.status(201).json(newFlashcard);
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to create flashcard' });
  }
});

// Update a flashcard
app.put('/api/flashcards/:id', authenticateToken, async (req, res) => {
  console.log(`📝 Update flashcard request for user: ${req.user.email}`);
  const userId = req.user.id;
  const flashcardId = parseInt(req.params.id);
  const { front, back } = req.body;
  
  try {
    const updatedFlashcard = await dbManager.updateFlashcard(
      flashcardId,
      userId,
      front?.trim() || 'Untitled Front',
      back?.trim() || ''
    );
    
    if (!updatedFlashcard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    
    console.log(`✅ Flashcard updated for ${req.user.email}: "${updatedFlashcard.front}"`);
    res.json(updatedFlashcard);
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to update flashcard' });
  }
});

// Delete a flashcard
app.delete('/api/flashcards/:id', authenticateToken, async (req, res) => {
  console.log(`🗑️ Delete flashcard request for user: ${req.user.email}`);
  const userId = req.user.id;
  const flashcardId = parseInt(req.params.id);
  
  try {
    const result = await dbManager.deleteFlashcard(flashcardId, userId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    
    console.log(`✅ Flashcard deleted for ${req.user.email}, ID: ${flashcardId}`);
    res.json({ success: true, message: 'Flashcard deleted successfully' });
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ error: 'Failed to delete flashcard' });
  }
});

// Protected routes
app.get('/api/user/dashboard', authenticateToken, (req, res) => {
  console.log(`📊 Dashboard data request for: ${req.user.email}`);
  res.json({ message: 'Dashboard data', user: req.user });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('💥 Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 Request logging enabled`);
  console.log(`💾 Database path: ${process.env.DATABASE_PATH || './database/studysync.db'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT. Shutting down gracefully...');
  dbManager.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM. Shutting down gracefully...');
  dbManager.close();
  process.exit(0);
});