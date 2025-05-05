import React from 'react';
import { ChatInterface } from '../components/chat/ChatInterface';

export const ChatPage = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Chat Assistant</h1>
        <p className="text-gray-600">
          Get help managing your tasks or create new ones directly from chat.
        </p>
      </div>
      
      <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
};