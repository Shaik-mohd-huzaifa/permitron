/**
 * LLM Task Processor
 * Handles natural language commands for task creation, updating, status changes, and deletion
 * with Permit.io authorization checks
 */
const { createTask, updateTask, deleteTask, changeTaskStatus, findTasks } = require('./taskUtils');

/**
 * Process a message for task-related commands and execute the appropriate action
 * @param {string} message - User message
 * @param {string} userId - User ID
 * @param {Object} permit - Permit.io instance
 * @returns {Object} Response with actions taken and confirmation
 */
async function processTaskCommand(message, userId, permit) {
  const lowerMsg = message.toLowerCase();
  let result = null;
  let actionTaken = false;
  let taskId = null;
  
  // Extract task ID if present in the message
  const idMatch = message.match(/task\s+(id\s*[:=]?\s*|#|number\s*[:=]?\s*)['"]?([a-zA-Z0-9-]+)['"]?/i) || 
                  message.match(/id\s*[:=]?\s*['"]?([a-zA-Z0-9-]+)['"]?/i);
  
  if (idMatch && idMatch[2]) {
    taskId = idMatch[2];
  } else if (idMatch && idMatch[1]) {
    taskId = idMatch[1];
  }

  // Create task pattern
  if (
    lowerMsg.includes('create task') || 
    lowerMsg.includes('add task') || 
    lowerMsg.includes('new task') ||
    lowerMsg.match(/create\s+a\s+task/) ||
    lowerMsg.match(/add\s+a\s+task/) ||
    lowerMsg.match(/make\s+a\s+task/) ||
    (lowerMsg.includes('task') && (
      lowerMsg.includes('create') || 
      lowerMsg.includes('add') || 
      lowerMsg.includes('new') ||
      lowerMsg.includes('make')
    ))
  ) {
    // Check permission with Permit.io
    try {
      const permitted = permit ? 
        await permit.check({
          user: { id: userId, key: userId },
          action: "create",
          resource: "task"
        }) : true;
      
      if (!permitted) {
        return {
          actionTaken: true,
          action: 'create_task',
          success: false,
          response: "❌ You don't have permission to create tasks."
        };
      }
    } catch (error) {
      console.error('Permit.io check error:', error);
    }
    
    // Extract task description using various patterns
    let description = "";
    
    // Try several extraction patterns
    const extractPatterns = [
      // "create a task for adding new feature"
      /(?:create|add|new|make)(?:\s+a)?\s+task\s+for\s+(.+)/i,
      // "create task: adding new feature"
      /(?:create|add|new|make)(?:\s+a)?\s+task\s*:?\s*(.+)/i,
      // "task for adding new feature"
      /task\s+for\s+(.+)/i,
      // "add a task to add new feature"
      /(?:create|add|new|make)(?:\s+a)?\s+task\s+to\s+(.+)/i,
      // "create a new task that will add features"
      /(?:create|add|new|make)(?:\s+a)?(?:\s+new)?\s+task\s+(?:that|which|to)\s+(.+)/i
    ];
    
    for (const pattern of extractPatterns) {
      const match = message.match(pattern);
      if (match && match[1] && match[1].trim().length > 0) {
        description = match[1].trim();
        break;
      }
    }
    
    // If no pattern matched but we detected a task creation intent, use the full message
    if (!description && (
      lowerMsg.includes('task') && (
        lowerMsg.includes('create') || 
        lowerMsg.includes('add') || 
        lowerMsg.includes('new')
      )
    )) {
      description = message;
    }
    
    if (description) {
      result = createTask(description, userId);
      actionTaken = true;
      
      if (result.success) {
        return {
          actionTaken: true,
          action: 'create_task',
          success: true,
          response: `✅ Task created: "${result.task.title}" (ID: ${result.task.id})`,
          taskId: result.task.id
        };
      }
    }
  }
  
  // Update task pattern
  else if (
    lowerMsg.includes('update task') || 
    lowerMsg.includes('modify task') ||
    lowerMsg.includes('change task') ||
    lowerMsg.includes('edit task') ||
    (lowerMsg.includes('task') && (
      lowerMsg.includes('update') || 
      lowerMsg.includes('modify') || 
      lowerMsg.includes('change') ||
      lowerMsg.includes('edit')
    ))
  ) {
    if (!taskId) {
      return {
        actionTaken: true,
        action: 'update_task',
        success: false,
        response: "❌ I need a task ID to update. Please specify which task to update (use format: task #ID)."
      };
    }
    
    // Check permission with Permit.io
    try {
      const taskToUpdate = findTasks({ id: taskId });
      let permitted = false;
      
      if (permit && taskToUpdate.success && taskToUpdate.tasks.length > 0) {
        const task = taskToUpdate.tasks[0];
        permitted = await permit.check({
          user: { id: userId, key: userId },
          action: "update",
          resource: "task",
          context: {
            task: {
              createdBy: task.createdBy,
              assignedTo: task.assignedTo
            }
          }
        });
      }
      
      if (permit && !permitted) {
        return {
          actionTaken: true,
          action: 'update_task',
          success: false,
          response: "❌ You don't have permission to update this task."
        };
      }
    } catch (error) {
      console.error('Permit.io check error:', error);
    }
    
    // Extract updates from message
    const updates = {};
    
    // Try to extract title
    const titleMatch = message.match(/title\s*[:=]?\s*['"]?([^'"]+)['"]?/i);
    if (titleMatch && titleMatch[1]) {
      updates.title = titleMatch[1].trim();
    }
    
    // Try to extract description
    const descMatch = message.match(/description\s*[:=]?\s*['"]?([^'"]+)['"]?/i);
    if (descMatch && descMatch[1]) {
      updates.description = descMatch[1].trim();
    }
    
    result = updateTask(taskId, updates, userId);
    actionTaken = true;
    
    if (result.success) {
      return {
        actionTaken: true,
        action: 'update_task',
        success: true,
        response: `✅ Task ${result.task.id} updated: "${result.task.title}"`,
        taskId: result.task.id
      };
    }
  }
  
  // Change task status pattern
  else if (
    lowerMsg.includes('change status') || 
    lowerMsg.includes('set status') ||
    lowerMsg.includes('move task') ||
    lowerMsg.match(/task\s+to\s+(todo|in-progress|progress|done|doing)/i) ||
    lowerMsg.match(/mark\s+(as\s+)?(todo|in-progress|progress|done|doing)/) ||
    (lowerMsg.includes('task') && (
      lowerMsg.includes(' to todo') || 
      lowerMsg.includes(' to in-progress') || 
      lowerMsg.includes(' to progress') || 
      lowerMsg.includes(' to done') ||
      lowerMsg.includes(' to doing')
    ))
  ) {
    if (!taskId) {
      return {
        actionTaken: true,
        action: 'change_status',
        success: false,
        response: "❌ I need a task ID to change status. Please specify which task (use format: task #ID)."
      };
    }
    
    // Check permission with Permit.io
    try {
      const taskToUpdate = findTasks({ id: taskId });
      let permitted = false;
      
      if (permit && taskToUpdate.success && taskToUpdate.tasks.length > 0) {
        const task = taskToUpdate.tasks[0];
        permitted = await permit.check({
          user: { id: userId, key: userId },
          action: "change_status",
          resource: "task",
          context: {
            task: {
              createdBy: task.createdBy,
              assignedTo: task.assignedTo
            }
          }
        });
      }
      
      if (permit && !permitted) {
        return {
          actionTaken: true,
          action: 'change_status',
          success: false,
          response: "❌ You don't have permission to change the status of this task."
        };
      }
    } catch (error) {
      console.error('Permit.io check error:', error);
    }
    
    // Determine the requested status
    let newStatus = null;
    if (lowerMsg.includes('todo') || lowerMsg.includes('to do')) {
      newStatus = 'todo';
    } else if (lowerMsg.includes('progress') || lowerMsg.includes('in-progress') || lowerMsg.includes('in progress') || lowerMsg.includes('doing')) {
      newStatus = 'in-progress';
    } else if (lowerMsg.includes('done') || lowerMsg.includes('complete') || lowerMsg.includes('finished')) {
      newStatus = 'done';
    }
    
    if (!newStatus) {
      return {
        actionTaken: true,
        action: 'change_status',
        success: false,
        response: "❌ I couldn't determine the status you want to set. Please specify todo, in-progress, or done."
      };
    }
    
    result = changeTaskStatus(taskId, newStatus, userId);
    actionTaken = true;
    
    if (result.success) {
      return {
        actionTaken: true,
        action: 'change_status',
        success: true,
        response: `✅ Task ${result.task.id} status changed to "${newStatus}": "${result.task.title}"`,
        taskId: result.task.id
      };
    }
  }
  
  // Delete task pattern
  else if (
    lowerMsg.includes('delete task') || 
    lowerMsg.includes('remove task') || 
    lowerMsg.includes('trash task') ||
    (lowerMsg.includes('task') && (
      lowerMsg.includes('delete') || 
      lowerMsg.includes('remove') || 
      lowerMsg.includes('trash')
    ))
  ) {
    if (!taskId) {
      return {
        actionTaken: true,
        action: 'delete_task',
        success: false,
        response: "❌ I need a task ID to delete. Please specify which task to delete (use format: task #ID)."
      };
    }
    
    // Check permission with Permit.io
    try {
      const taskToDelete = findTasks({ id: taskId });
      let permitted = false;
      
      if (permit && taskToDelete.success && taskToDelete.tasks.length > 0) {
        const task = taskToDelete.tasks[0];
        permitted = await permit.check({
          user: { id: userId, key: userId },
          action: "delete",
          resource: "task",
          context: {
            task: {
              createdBy: task.createdBy
            }
          }
        });
      }
      
      if (permit && !permitted) {
        return {
          actionTaken: true,
          action: 'delete_task',
          success: false,
          response: "❌ You don't have permission to delete this task."
        };
      }
    } catch (error) {
      console.error('Permit.io check error:', error);
    }
    
    result = deleteTask(taskId, userId);
    actionTaken = true;
    
    if (result.success) {
      return {
        actionTaken: true,
        action: 'delete_task',
        success: true,
        response: `✅ Task ${taskId} deleted successfully.`
      };
    }
  }
  
  // List tasks pattern
  else if (
    lowerMsg.includes('list tasks') || 
    lowerMsg.includes('show tasks') || 
    lowerMsg.includes('my tasks') ||
    lowerMsg.includes('all tasks') ||
    (lowerMsg.includes('task') && (
      lowerMsg.includes('list') || 
      lowerMsg.includes('show') || 
      lowerMsg.includes('view') ||
      lowerMsg.includes('get')
    ))
  ) {
    // Check permission with Permit.io for the read action
    let permissionFilter = {};
    
    try {
      if (permit) {
        const permitted = await permit.check({
          user: { id: userId, key: userId },
          action: "read",
          resource: "task"
        });
        
        if (!permitted) {
          // If not generally permitted to read all tasks, they might be allowed to read their own
          const permittedOwn = await permit.check({
            user: { id: userId, key: userId },
            action: "read",
            resource: "task",
            context: {
              task: {
                createdBy: userId
              }
            }
          });
          
          if (permittedOwn) {
            // Only show tasks they created
            permissionFilter = { createdBy: userId };
          } else {
            return {
              actionTaken: true,
              action: 'list_tasks',
              success: false,
              response: "❌ You don't have permission to view tasks."
            };
          }
        }
      }
    } catch (error) {
      console.error('Permit.io check error:', error);
    }
    
    // Extract any filtering criteria
    const criteria = { ...permissionFilter };
    
    // Check for status filter
    if (lowerMsg.includes('todo')) {
      criteria.status = 'todo';
    } else if (lowerMsg.includes('progress')) {
      criteria.status = 'in-progress';
    } else if (lowerMsg.includes('done') || lowerMsg.includes('completed')) {
      criteria.status = 'done';
    }
    
    result = findTasks(criteria);
    actionTaken = true;
    
    if (result.success) {
      if (result.tasks.length === 0) {
        return {
          actionTaken: true,
          action: 'list_tasks',
          success: true,
          response: '📋 No tasks found matching your criteria.'
        };
      }
      
      const statusEmojis = {
        'todo': '⏳',
        'in-progress': '⚙️',
        'done': '✅'
      };
      
      const taskList = result.tasks.map(task => 
        `${statusEmojis[task.status] || '•'} **${task.title}** (ID: ${task.id}) - *${task.status}*`
      ).join('\n');
      
      return {
        actionTaken: true,
        action: 'list_tasks',
        success: true,
        response: `📋 Here are your tasks:\n\n${taskList}`
      };
    }
  }
  
  // Check if LLM can manage tasks on user's behalf
  try {
    if (permit && !actionTaken) {
      const permitted = await permit.check({
        user: { id: userId, key: userId },
        action: "manage_tasks",
        resource: "llm"
      });
      
      if (!permitted) {
        return {
          actionTaken: true,
          success: false,
          response: "❌ You don't have permission to use the LLM for task management operations."
        };
      }
    }
  } catch (error) {
    console.error('Permit.io check error:', error);
  }
  
  // No task command identified
  if (!actionTaken) {
    return {
      actionTaken: false,
      response: null
    };
  }
  
  // If we reach here, there was an error in a task operation
  return {
    actionTaken: true,
    success: false,
    response: `❌ ${result.error || 'An error occurred while processing your request.'}`
  };
}

module.exports = {
  processTaskCommand
};
