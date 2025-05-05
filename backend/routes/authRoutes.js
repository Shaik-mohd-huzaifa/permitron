const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Sample user data (replace with database in production)
const users = [
  {
    id: '1',
    username: 'admin',
    password: '$2a$10$XQHEv5SMtPiP.nKjEQaMZeu2.NJu7.fbNnFbQWe9HJ7o1YC1JTM/S', // hashed "password123"
    email: 'admin@example.com',
    role: 'admin'
  },
  {
    id: '2',
    username: 'user',
    password: '$2a$10$XQHEv5SMtPiP.nKjEQaMZeu2.NJu7.fbNnFbQWe9HJ7o1YC1JTM/S', // hashed "password123"
    email: 'user@example.com',
    role: 'user'
  }
];

// POST /api/auth/login - Authenticate user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Find user (in a real app, you would query a database)
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // In a real app, compare hashed password with bcrypt.compare
    // For this placeholder, we'll just simulate successful auth
    const isMatch = true; // replace with bcrypt.compare in real app
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Return user info and token
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Auth API error:', error);
    res.status(500).json({ 
      error: 'Authentication failed', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/auth/register - Register new user
router.post('/register', (req, res) => {
  res.status(501).json({ message: 'Registration endpoint not yet implemented' });
});

module.exports = router;
