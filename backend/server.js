import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import crypto from 'crypto';

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
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'https://studysync-backend.uttamsharma.com',
    'https://studysync-ai.netlify.app'
    // Add any other domains you want to allow
  ],
  credentials: true
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
    
    // Create JWT token
    const jwtToken = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    
    // Set HTTP-only cookie
    res.cookie('auth_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
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
  const token = req.cookies.auth_token;
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add token expiry check
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      console.log('❌ Token expired');
      res.clearCookie('auth_token');
      return res.status(401).json({ error: 'Token expired' });
    }
    
    console.log(`✅ Token verified for user: ${decoded.email}`);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    res.clearCookie('auth_token');
    res.status(401).json({ error: 'Invalid token' });
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

// In-memory storage for user goals (in production, use a database)
const userGoals = new Map();

// Get user's goals
app.get('/api/user/goals', authenticateToken, (req, res) => {
  console.log(`🎯 Goals request for user: ${req.user.email}`);
  const userId = req.user.id;
  const goals = userGoals.get(userId) || [];
  res.json({ goals });
});

// Add a goal for the user
app.post('/api/user/goals', authenticateToken, (req, res) => {
  console.log(`➕ Add goal request for user: ${req.user.email}`);
  const userId = req.user.id;
  const { goal } = req.body;
  
  if (!goal || typeof goal !== 'string' || !goal.trim()) {
    return res.status(400).json({ error: 'Goal is required and must be a non-empty string' });
  }
  
  const trimmedGoal = goal.trim();
  const currentGoals = userGoals.get(userId) || [];
  
  // Check if goal already exists
  if (currentGoals.includes(trimmedGoal)) {
    return res.status(400).json({ error: 'Goal already exists' });
  }
  
  const updatedGoals = [...currentGoals, trimmedGoal];
  userGoals.set(userId, updatedGoals);
  
  console.log(`✅ Goal added for ${req.user.email}: "${trimmedGoal}"`);
  res.json({ goals: updatedGoals });
});

// Remove a goal for the user
app.delete('/api/user/goals/:index', authenticateToken, (req, res) => {
  console.log(`🗑️ Remove goal request for user: ${req.user.email}`);
  const userId = req.user.id;
  const goalIndex = parseInt(req.params.index);
  
  const currentGoals = userGoals.get(userId) || [];
  
  if (goalIndex < 0 || goalIndex >= currentGoals.length) {
    return res.status(400).json({ error: 'Invalid goal index' });
  }
  
  const updatedGoals = currentGoals.filter((_, index) => index !== goalIndex);
  userGoals.set(userId, updatedGoals);
  
  console.log(`✅ Goal removed for ${req.user.email} at index ${goalIndex}`);
  res.json({ goals: updatedGoals });
});

// Update all goals for the user (bulk update)
app.put('/api/user/goals', authenticateToken, (req, res) => {
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
  
  userGoals.set(userId, uniqueGoals);
  
  console.log(`✅ Goals updated for ${req.user.email}: ${uniqueGoals.length} goals`);
  res.json({ goals: uniqueGoals });
});

// Protected routes example
app.get('/api/user/dashboard', authenticateToken, (req, res) => {
  console.log(`📊 Dashboard data request for: ${req.user.email}`);
  res.json({ message: 'Dashboard data', user: req.user });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('💥 Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 Request logging enabled`);
});