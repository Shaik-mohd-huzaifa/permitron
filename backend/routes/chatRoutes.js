const express = require('express');
const router = express.Router();
const { generateResponse } = require('../utils/openai');
const { processTaskCommand } = require('../utils/llmTaskProcessor');

// GET /api/chats - Get chat history (placeholder)
router.get('/', (req, res) => {
  res.json({ message: 'Chat history endpoint' });
});

// POST /api/chats - Send a message to AI
router.post('/', async (req, res) => {
  try {
    const { message, systemPrompt, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get user ID from request or use default
    const userId = req.body.userId || '1'; // In a real app, get from auth middleware

    // Access the permit.io instance from the request (added by middleware in server.js)
    const permit = req.permit;

    // First try to process as a task command
    const taskResult = await processTaskCommand(message, userId, permit);
    
    // If it was handled as a task command, return the response directly
    if (taskResult.actionTaken && taskResult.response) {
      return res.json({ 
        success: true,
        message: taskResult.response,
        actionTaken: taskResult.action,
        timestamp: new Date().toISOString()
      });
    }

    // Build enhanced system prompt that includes task management capabilities
    const taskSystemPrompt = systemPrompt ? 
      systemPrompt :
      `You are a helpful task management assistant. You can help users manage their tasks using natural language.
      
      Users can interact with you using natural language like:
      - "Create a task for adding new feature" - Creates a new task
      - "Update task #123 with new description" - Updates an existing task
      - "Move task #123 to in-progress" - Changes task status
      - "Delete task #123" - Removes a task
      - "Show me my tasks" - Lists all tasks
      - "Show me my in-progress tasks" - Lists filtered tasks
      
      For other questions, provide helpful assistance.`;

    // Call OpenAI to generate a response for non-task commands
    const aiResponse = await generateResponse(message, taskSystemPrompt, history);
    
    // Return the AI response
    res.json({ 
      success: true,
      message: aiResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
