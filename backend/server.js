const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { Permit } = require('permitio');

// Load env variables
dotenv.config();

// Routes
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Permit.io
const permit = new Permit({
  pdp: process.env.PERMIT_PDP_URL,
  apiKey: process.env.PERMIT_API_KEY,
  environment: process.env.PERMIT_ENV || 'dev',
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Make permit available in the request
app.use((req, res, next) => {
  req.permit = permit;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/users', userRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Permitron API - Role-Based Access Management' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Permitron API running on port ${PORT}`);
});

module.exports = app;
