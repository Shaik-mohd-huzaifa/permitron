import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Plus, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { formatDate } from '../../lib/utils';

export const ChatInterface = () => {
  const { user } = useAuthStore();
  const { 
    sessions, 
    currentSessionId, 
    createSession, 
    selectSession, 
    processUserMessage 
  } = useChatStore();
  
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get current session
  const currentSession = currentSessionId 
    ? sessions.find(s => s.id === currentSessionId) 
    : null;
  
  // Filter sessions for the current user
  const userSessions = useMemo(() => {
    return user 
      ? sessions.filter(s => s.userId === user.id)
      : [];
  }, [user, sessions]);
  
  // Create a new session if user has none
  useEffect(() => {
    if (user && userSessions.length === 0) {
      createSession(user.id);
    } else if (user && !currentSessionId && userSessions.length > 0) {
      selectSession(userSessions[0].id);
    }
  }, [user, userSessions, currentSessionId, createSession, selectSession]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);
  
  const handleCreateSession = () => {
    if (user) {
      createSession(user.id);
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user || !currentSessionId || isProcessing) return;
    
    setIsProcessing(true);
    const messageToSend = message;
    setMessage('');
    
    try {
      await processUserMessage(messageToSend, user.id);
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="flex h-full">
      {/* Chat sessions sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto flex-shrink-0">
        <div className="p-4">
          <Button 
            className="w-full"
            leftIcon={<Plus size={16} />}
            onClick={handleCreateSession}
            size="sm"
          >
            New Conversation
          </Button>
        </div>
        
        <div className="px-3 pb-3">
          {userSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => selectSession(session.id)}
              className={`
                p-2 rounded-md cursor-pointer mb-1
                ${currentSessionId === session.id 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'hover:bg-gray-100'}
              `}
            >
              <div className="flex items-center">
                <MessageSquare size={16} className="mr-2 text-gray-500" />
                <div className="overflow-hidden">
                  <div className="font-medium truncate">
                    {session.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(session.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {userSessions.length === 0 && (
            <div className="text-center text-gray-500 text-sm p-4">
              No conversations yet
            </div>
          )}
        </div>
      </div>
      
      {/* Chat main area */}
      <div className="flex-1 flex flex-col h-full">
        {currentSession ? (
          <>
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 max-h-[calc(100vh-180px)]">
              {currentSession.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-3xl rounded-lg p-3
                      ${msg.sender === 'user' 
                        ? 'bg-indigo-100 text-gray-800 rounded-tr-none' 
                        : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none'}
                    `}
                  >
                    {msg.sender === 'assistant' && (
                      <div className="flex items-center mb-1">
                        <Avatar size="sm" />
                        <span className="ml-2 font-medium text-sm">Task Assistant</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {formatDate(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  disabled={isProcessing}
                />
                <Button
                  type="submit"
                  className="rounded-l-none"
                  disabled={!message.trim() || isProcessing}
                  rightIcon={<Send size={16} />}
                >
                  Send
                </Button>
              </form>
              <div className="mt-2 text-xs text-gray-500">
                Try: "Create a task titled 'Update documentation' with priority 'high'" or "List my tasks"
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Welcome to the Task Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  This AI assistant can help you manage your tasks. Start a new conversation to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4">
                  <li>Create tasks directly from chat</li>
                  <li>Check task status and progress</li>
                  <li>Get summaries of your workload</li>
                  <li>Receive recommendations for task prioritization</li>
                </ul>
                <Button
                  onClick={handleCreateSession}
                  leftIcon={<Plus size={16} />}
                  className="w-full"
                >
                  Start a New Conversation
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};