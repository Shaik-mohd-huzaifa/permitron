import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { ChatSession, Message } from '../types';
import { useTaskStore } from './taskStore';
import axios from 'axios';

// API base URL - update if your backend runs on a different port
const API_BASE_URL = 'http://localhost:5000/api';

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  createSession: (userId: string) => string;
  selectSession: (sessionId: string) => void;
  addMessage: (content: string, sender: 'user' | 'assistant', taskId?: string) => void;
  processUserMessage: (content: string, userId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      
      createSession: (userId) => {
        const sessionId = uuidv4();
        const now = Date.now();
        
        const newSession: ChatSession = {
          id: sessionId,
          userId,
          title: `Session ${new Date(now).toLocaleString()}`,
          messages: [
            {
              id: uuidv4(),
              content: "Hello! I'm your task assistant. How can I help you today?",
              sender: 'assistant',
              timestamp: now,
            },
          ],
          createdAt: now,
          updatedAt: now,
        };
        
        set(state => ({
          sessions: [...state.sessions, newSession],
          currentSessionId: sessionId,
        }));
        
        return sessionId;
      },
      
      selectSession: (sessionId) => {
        set({ currentSessionId: sessionId });
      },
      
      addMessage: (content, sender, taskId) => {
        const { currentSessionId, sessions } = get();
        if (!currentSessionId) return;
        
        const newMessage: Message = {
          id: uuidv4(),
          content,
          sender,
          timestamp: Date.now(),
          taskId,
        };
        
        set({
          sessions: sessions.map(session => 
            session.id === currentSessionId
              ? {
                  ...session,
                  messages: [...session.messages, newMessage],
                  updatedAt: Date.now(),
                }
              : session
          ),
        });
      },
      
      processUserMessage: async (content, userId) => {
        const { addMessage, currentSessionId, sessions } = get();
        if (!currentSessionId) return;
        
        // Add the user message
        addMessage(content, 'user');
        
        try {
          // Get conversation history
          const currentSession = sessions.find(s => s.id === currentSessionId);
          if (!currentSession) return;
          
          // Format history for API
          const messageHistory = currentSession.messages.slice(-10).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          }));
          
          // Call the backend API
          const response = await axios.post(`${API_BASE_URL}/chats`, {
            message: content,
            systemPrompt: "You are a helpful task assistant that can help users manage their tasks and projects. Be concise and helpful.",
            history: messageHistory
          });
          
          // Process the AI response
          if (response.data && response.data.success) {
            const aiMessage = response.data.message;
            addMessage(aiMessage, 'assistant');
            
            // Still process local commands for task management
            const lowerContent = content.toLowerCase();
            
            // Handle task creation command
            if (lowerContent.includes('create task') || lowerContent.includes('add task')) {
              // Extract task details with regex (very basic)
              const titleMatch = content.match(/titled?\s*["|'](.+?)["|']/i);
              const title = titleMatch ? titleMatch[1] : 'New Task';
              
              const descMatch = content.match(/description\s*["|'](.+?)["|']/i);
              const description = descMatch ? descMatch[1] : 'Task created from chat';
              
              const priorityMatch = content.match(/priority\s*["|']?(low|medium|high|urgent)["|']?/i);
              const priority = priorityMatch ? priorityMatch[1].toLowerCase() as 'low' | 'medium' | 'high' | 'urgent' : 'medium';
              
              // Create the task
              useTaskStore.getState().addTask({
                title,
                description,
                status: 'todo',
                priority,
                assigneeId: null,
                createdBy: userId,
                labels: [],
              });
            }
          } else {
            addMessage("Sorry, there was an error processing your message. Please try again.", 'assistant');
          }
        } catch (error) {
          console.error('Error calling chat API:', error);
          addMessage("I'm having trouble connecting to the server. Please check your connection and try again.", 'assistant');
          
          // Fallback to local processing if API fails
          fallbackLocalProcessing(content, userId);
        }
      },
    }),
    {
      name: 'chat-storage',
    }
  )
);

// Fallback function for local processing when API fails
const fallbackLocalProcessing = (content: string, userId: string) => {
  const { addMessage } = useChatStore.getState();
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('create task') || lowerContent.includes('add task')) {
    // Extract task details with regex (very basic)
    const titleMatch = content.match(/titled?\s*["|'](.+?)["|']/i);
    const title = titleMatch ? titleMatch[1] : 'New Task';
    
    const descMatch = content.match(/description\s*["|'](.+?)["|']/i);
    const description = descMatch ? descMatch[1] : 'Task created from chat';
    
    const priorityMatch = content.match(/priority\s*["|']?(low|medium|high|urgent)["|']?/i);
    const priority = priorityMatch ? priorityMatch[1].toLowerCase() as 'low' | 'medium' | 'high' | 'urgent' : 'medium';
    
    // Create the task
    const task = useTaskStore.getState().addTask({
      title,
      description,
      status: 'todo',
      priority,
      assigneeId: null,
      createdBy: userId,
      labels: [],
    });
    
    addMessage(`I've created a new task "${title}" with ${priority} priority and added it to your To Do column.`, 'assistant', task.id);
  } 
  else if (lowerContent.includes('list tasks') || lowerContent.includes('show tasks')) {
    const tasks = useTaskStore.getState().tasks;
    
    if (tasks.length === 0) {
      addMessage("You don't have any tasks yet. Would you like me to create one for you?", 'assistant');
    } else {
      const taskStatus = tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const statusSummary = Object.entries(taskStatus)
        .map(([status, count]) => `${count} in ${status.replace('-', ' ')}`)
        .join(', ');
      
      addMessage(`You have ${tasks.length} tasks (${statusSummary}). Would you like me to list them by status or priority?`, 'assistant');
    }
  }
  else if (lowerContent.includes('help')) {
    addMessage(`
I can help you manage your tasks. Try these commands:
- "Create task titled 'Task name' with description 'Task details' priority 'medium'"
- "List tasks" or "Show tasks"
- "How many tasks do I have in progress?"
- "What's my workload?"

For admin users, you can also:
- Assign tasks to team members
- Create reports on team performance
- Schedule meetings and deadlines
    `, 'assistant');
  }
  else {
    addMessage("I'm not sure how to help with that. Try asking me to create a task, list your tasks, or type 'help' for more options.", 'assistant');
  }
};