import React from 'react';
import { format } from 'date-fns';
import { Bot, User } from 'lucide-react';
import { formatMarkdown } from '../utils/markdown';
import { Message } from '../types/chat';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';
  const formattedContent = formatMarkdown(message.content);
  
  // Extract image if present
  const imageMatch = message.content.match(/\[Image:\s*(.*?)\]/);
  const textContent = message.content.replace(/\[Image:\s*.*?\]/, '').trim();
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-500' : 'bg-gray-600'
      }`}>
        {isUser ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
      </div>
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-lg px-4 py-2 ${
          isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
        } ${isStreaming ? 'animate-pulse' : ''}`}>
          {imageMatch && (
            <div className="mb-2">
              <img 
                src={imageMatch[1]} 
                alt="Uploaded content"
                className="max-w-full rounded-lg max-h-[300px] object-contain"
              />
            </div>
          )}
          {textContent && (
            <div dangerouslySetInnerHTML={{ __html: formatMarkdown(textContent) }} />
          )}
        </div>
        <span className="text-xs text-gray-500 mt-1">
          {format(message.timestamp, 'HH:mm')}
        </span>
      </div>
    </div>
  );
};