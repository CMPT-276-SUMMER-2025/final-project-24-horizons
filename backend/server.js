import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dbManager from './database/database.js';
import { requestLogger } from './middleware/logging.js';
import { authenticateToken } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import goalsRoutes from './routes/goals.js';
import flashcardsRoutes from './routes/flashcards.js';

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

// Middleware
app.use(requestLogger);
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'https://studysync-backend.uttamsharma.com',
    'https://studysync-ai.netlify.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connectivity
    await dbManager.get('SELECT 1');
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', authenticateToken, notesRoutes);
app.use('/api/user/goals', authenticateToken, goalsRoutes);
app.use('/api/flashcards', authenticateToken, flashcardsRoutes);

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

// Initialize database
await dbManager.initialize();

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