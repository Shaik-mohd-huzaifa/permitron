const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { initTaskUtils } = require('../utils/taskUtils');

// Sample task data (replace with database in production)
let tasks = [
  {
    id: '1',
    title: 'Implement auth routes',
    description: 'Create authentication endpoints for login and registration',
    status: 'done',
    assignedTo: '1',
    createdBy: '1',
    dueDate: '2025-05-10'
  },
  {
    id: '2',
    title: 'Integrate OpenAI',
    description: 'Add OpenAI services to enhance the application',
    status: 'in-progress',
    assignedTo: '2',
    createdBy: '1',
    dueDate: '2025-05-15'
  }
];

// Initialize task utilities with reference to tasks array
initTaskUtils(tasks);

// GET /api/tasks - Get all tasks
router.get('/', (req, res) => {
  // In a real app, this would filter tasks based on user permissions
  // For now, just return all tasks
  res.json(tasks);
});

// GET /api/tasks/:id - Get a specific task
router.get('/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  res.json(task);
});

// POST /api/tasks - Create a new task
router.post('/', (req, res) => {
  try {
    const { title, description, status, assignedTo, dueDate } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Get user id from JWT token (in a real app)
    const userId = req.body.createdBy || '1'; // Placeholder
    
    const newTask = {
      id: uuidv4(),
      title,
      description: description || '',
      status: status || 'todo',
      assignedTo: assignedTo || null,
      createdBy: userId,
      dueDate: dueDate || null,
      createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      error: 'Failed to create task', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', (req, res) => {
  try {
    const taskId = req.params.id;
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // In a real app, check permissions here using Permit.io
    
    const updatedTask = {
      ...tasks[taskIndex],
      ...req.body,
      id: taskId // Ensure ID doesn't change
    };
    
    tasks[taskIndex] = updatedTask;
    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      error: 'Failed to update task', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', (req, res) => {
  try {
    const taskId = req.params.id;
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // In a real app, check permissions here using Permit.io
    
    tasks = tasks.filter(t => t.id !== taskId);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      error: 'Failed to delete task', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
module.exports.tasks = tasks;
