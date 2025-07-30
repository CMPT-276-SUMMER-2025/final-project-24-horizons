import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import dbManager from '../database/database.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verify Google token and create session
router.post('/google', async (req, res) => {
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
    const jwtToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Set HTTP-only cookie
    res.cookie('auth_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    
    console.log(`🍪 Auth cookie set for user: ${user.email}`);
    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ Auth error:', error);
    if (error.message.includes('Token used too early')) {
      return res.status(401).json({ error: 'Token timing issue, please try again' });
    }
    res.status(401).json({ error: 'Invalid token', details: error.message });
  }
});

// Get current user
router.get('/me', (req, res) => {
  console.log(`👤 Current user request for: ${req.user.email}`);
  res.json({ user: req.user });
});

// Logout
router.post('/logout', (req, res) => {
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

export default router;