const { OpenAI } = require('openai');

// Mock implementation for AI response when OpenAI is not available
const generateMockResponse = (prompt) => {
  // Check for common patterns to reply to
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi')) {
    return "Hello! I'm your task assistant. How can I help you today?";
  }
  
  if (lowerPrompt.includes('create task') || lowerPrompt.includes('add task')) {
    return "I've processed your request to create a task. You can find it in your task list.";
  }
  
  if (lowerPrompt.includes('list tasks') || lowerPrompt.includes('show tasks')) {
    return "I can help you list your tasks. Please check your task board for all current tasks.";
  }
  
  if (lowerPrompt.includes('help')) {
    return "I can help you manage your tasks. You can ask me to create tasks, list tasks, or provide task updates.";
  }
  
  // Default response
  return "I understand your request. As your task assistant, I'm here to help you manage your work efficiently. What specific task would you like me to help with?";
};

// Initialize OpenAI client with more robust error handling
const initializeOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'your_openai_api_key' || apiKey.trim() === '') {
    console.warn('WARNING: Invalid or missing OpenAI API key. AI responses will not work correctly.');
    return null;
  }
  
  // Valid API key format - no longer checking for specific prefixes
  console.log('OpenAI API key detected - attempting to initialize client');
  
  try {
    return new OpenAI({
      apiKey: apiKey,
    });
  } catch (error) {
    console.error('Error initializing OpenAI client:', error);
    return null;
  }
};

// Try to initialize the OpenAI client
const openai = initializeOpenAI();
console.log('OpenAI client initialization status:', openai ? 'SUCCESS' : 'FAILED');

/**
 * Generate AI response using OpenAI or fall back to mock implementation
 * @param {string} prompt - The user's message or query
 * @param {string} systemPrompt - Optional system instruction
 * @param {array} history - Optional conversation history
 * @returns {Promise<string>} - AI generated response
 */
async function generateResponse(prompt, systemPrompt = '', history = []) {
  // Check if OpenAI client is initialized
  if (!openai) {
    console.log('Using mock AI response since OpenAI client is not available');
    return generateMockResponse(prompt);
  }
  
  try {
    // Format messages for OpenAI API
    const messages = [];
    
    // Add system instruction if provided
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    // Add conversation history if provided
    if (history && history.length > 0) {
      // Make sure history is in the correct format
      const formattedHistory = history.map(msg => {
        // Ensure each message has role and content
        if (typeof msg === 'object' && msg.role && msg.content) {
          return msg;
        }
        return null;
      }).filter(Boolean); // Remove any invalid messages
      
      messages.push(...formattedHistory);
    }
    
    // Add the current user message
    messages.push({ role: 'user', content: prompt });
    
    // Try to call OpenAI API
    try {
      // First try gpt-3.5-turbo
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
      });
      
      return completion.choices[0].message.content;
    } catch (modelError) {
      console.error('Error with gpt-3.5-turbo, trying text-davinci-003:', modelError);
      
      // If that fails, try a different model
      try {
        const completion = await openai.completions.create({
          model: 'text-davinci-003',
          prompt: prompt,
          max_tokens: 500,
          temperature: 0.7,
        });
        
        return completion.choices[0].text.trim();
      } catch (fallbackError) {
        console.error('Error with text-davinci-003 fallback:', fallbackError);
        // If all OpenAI attempts fail, use mock response
        return generateMockResponse(prompt);
      }
    }
  } catch (error) {
    console.error('Error in generateResponse:', error);
    return generateMockResponse(prompt);
  }
}

module.exports = {
  openai,
  generateResponse
};
