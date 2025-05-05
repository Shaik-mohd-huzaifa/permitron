const express = require('express');
const router = express.Router();

// Sample user data (replace with database in production)
const users = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    username: 'user',
    email: 'user@example.com',
    role: 'user',
    createdAt: '2025-01-02T00:00:00Z'
  }
];

// GET /api/users - Get all users
router.get('/', (req, res) => {
  // In a real app, check permissions using Permit.io
  // Only return limited user data for security
  const safeUsers = users.map(user => ({
    id: user.id,
    username: user.username,
    role: user.role
  }));
  
  res.json(safeUsers);
});

// GET /api/users/:id - Get a specific user
router.get('/:id', (req, res) => {
  // In a real app, check permissions using Permit.io
  const user = users.find(u => u.id === req.params.id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Only return limited user data for security
  const safeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
  
  res.json(safeUser);
});

// PUT /api/users/:id - Update a user
router.put('/:id', (req, res) => {
  // In a real app, check permissions using Permit.io
  const userIndex = users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Don't allow updating sensitive fields
  const { username, email } = req.body;
  const updatedUser = {
    ...users[userIndex],
    username: username || users[userIndex].username,
    email: email || users[userIndex].email
  };
  
  users[userIndex] = updatedUser;
  
  // Return limited user data
  const safeUser = {
    id: updatedUser.id,
    username: updatedUser.username,
    email: updatedUser.email,
    role: updatedUser.role
  };
  
  res.json(safeUser);
});

// POST /api/users/:id/role - Update user role (admin only)
router.post('/:id/role', (req, res) => {
  // In a real app, check if user is admin using Permit.io
  const { role } = req.body;
  const userIndex = users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }
  
  // Update user role
  users[userIndex].role = role;
  
  res.json({ message: 'User role updated successfully' });
});

module.exports = router;
