/**
 * Utility functions for task operations via LLM
 */
const { v4: uuidv4 } = require('uuid');

// This is a temporary reference to the tasks array in taskRoutes.js
// In a real application, this would be replaced with a database reference
let tasks = null;

/**
 * Initialize the task utils with a reference to the tasks array
 * @param {Array} tasksArray - Reference to the tasks array
 */
function initTaskUtils(tasksArray) {
  tasks = tasksArray;
}

/**
 * Create a new task from natural language input
 * @param {string} description - Natural language description of the task
 * @param {string} userId - User ID creating the task
 * @returns {Object} Created task or error object
 */
function createTask(description, userId) {
  try {
    if (!tasks) {
      return { error: 'Task system not initialized' };
    }

    // Clean up the description - remove phrases like "create a task for" if present
    let cleanDescription = description.replace(/^(create|add|make)(\s+a)?\s+task\s+(for|to|that|which)?\s+/i, '');
    
    // Extract title from description - take first sentence or full text if short
    let title = cleanDescription;
    if (cleanDescription.length > 50) {
      // Take first sentence or first 50 chars
      const firstSentenceMatch = cleanDescription.match(/^.*?[.!?]/);
      title = firstSentenceMatch 
        ? firstSentenceMatch[0].trim() 
        : cleanDescription.substring(0, 50).trim() + '...';
    }

    // Capitalize first letter of title
    title = title.charAt(0).toUpperCase() + title.slice(1);

    const newTask = {
      id: uuidv4(),
      title: title,
      description: cleanDescription,
      status: 'todo',
      assignedTo: userId, // Default assign to creator
      createdBy: userId,
      dueDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString() // Add updatedAt for consistency
    };

    tasks.push(newTask);
    return { success: true, task: newTask };
  } catch (error) {
    console.error('Error creating task:', error);
    return { error: 'Failed to create task', details: error.message };
  }
}

/**
 * Update an existing task
 * @param {string} taskId - ID of the task to update
 * @param {Object} updates - Object containing fields to update
 * @param {string} userId - User ID making the update
 * @returns {Object} Updated task or error object
 */
function updateTask(taskId, updates, userId) {
  try {
    if (!tasks) {
      return { error: 'Task system not initialized' };
    }

    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return { error: 'Task not found' };
    }

    // In a real application, check permissions here using Permit.io

    const updatedTask = {
      ...tasks[taskIndex],
      ...updates,
      id: taskId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString() // Update the timestamp
    };

    tasks[taskIndex] = updatedTask;
    return { success: true, task: updatedTask };
  } catch (error) {
    console.error('Error updating task:', error);
    return { error: 'Failed to update task', details: error.message };
  }
}

/**
 * Delete a task
 * @param {string} taskId - ID of the task to delete
 * @param {string} userId - User ID making the deletion
 * @returns {Object} Success message or error object
 */
function deleteTask(taskId, userId) {
  try {
    if (!tasks) {
      return { error: 'Task system not initialized' };
    }

    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return { error: 'Task not found' };
    }

    // In a real application, check permissions here using Permit.io

    tasks = tasks.filter(t => t.id !== taskId);
    return { success: true, message: 'Task deleted successfully' };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { error: 'Failed to delete task', details: error.message };
  }
}

/**
 * Change task status
 * @param {string} taskId - ID of the task 
 * @param {string} newStatus - New status (todo, in-progress, done)
 * @param {string} userId - User ID making the status change
 * @returns {Object} Updated task or error object
 */
function changeTaskStatus(taskId, newStatus, userId) {
  try {
    if (!tasks) {
      return { error: 'Task system not initialized' };
    }

    // Validate status
    const validStatuses = ['todo', 'in-progress', 'done'];
    if (!validStatuses.includes(newStatus)) {
      return { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
    }

    return updateTask(taskId, { status: newStatus }, userId);
  } catch (error) {
    console.error('Error changing task status:', error);
    return { error: 'Failed to change task status', details: error.message };
  }
}

/**
 * Find tasks by different criteria to support natural language queries
 * @param {Object} criteria - Object with search criteria (title, status, assignedTo, etc.)
 * @returns {Array} Matching tasks
 */
function findTasks(criteria = {}) {
  try {
    if (!tasks) {
      return { error: 'Task system not initialized' };
    }

    let filteredTasks = [...tasks];

    // Filter by various criteria
    if (criteria.title) {
      const titleLower = criteria.title.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(titleLower));
    }

    if (criteria.status) {
      filteredTasks = filteredTasks.filter(task => 
        task.status === criteria.status);
    }

    if (criteria.assignedTo) {
      filteredTasks = filteredTasks.filter(task => 
        task.assignedTo === criteria.assignedTo);
    }

    if (criteria.createdBy) {
      filteredTasks = filteredTasks.filter(task => 
        task.createdBy === criteria.createdBy);
    }

    return { success: true, tasks: filteredTasks };
  } catch (error) {
    console.error('Error finding tasks:', error);
    return { error: 'Failed to find tasks', details: error.message };
  }
}

module.exports = {
  initTaskUtils,
  createTask,
  updateTask,
  deleteTask,
  changeTaskStatus,
  findTasks
};
