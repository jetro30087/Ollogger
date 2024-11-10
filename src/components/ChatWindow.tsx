import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from '../types/chat';
import { OpenAISettings } from './SettingsModal';
import { ChatInput } from './ChatInput';
import { LogDownloader } from './LogDownloader';
import { getChatCompletion } from '../utils/openai';
import { formatMessage } from '../utils/messageFormatting';
import { Log } from '../types/log';
import { ChatMessage } from './ChatMessage';

interface ChatWindowProps {
  assistantName: string;
  systemPrompt: string;
  currentLog: Log | null;
  onUpdateMessages: (messages: Message[]) => void;
  settings: OpenAISettings;
  onClose?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  assistantName,
  systemPrompt,
  currentLog,
  onUpdateMessages,
  settings,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  useEffect(() => {
    if (currentLog) {
      setMessages(currentLog.messages);
      hasInitialized.current = true;
    } else if (systemPrompt && !hasInitialized.current) {
      const match = systemPrompt.match(/INITIAL_MESSAGE:\s*(.*?)(?:\n|$)/);
      if (match) {
        setMessages([{
          role: 'assistant',
          content: match[1],
          timestamp: new Date()
        }]);
      }
      hasInitialized.current = true;
    }
  }, [currentLog, systemPrompt]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const updateParentMessages = useCallback((newMessages: Message[]) => {
    if (hasInitialized.current && currentLog) {
      onUpdateMessages(newMessages);
    }
  }, [currentLog, onUpdateMessages]);

  const handleSendMessage = async (content: string, imageBase64?: string) => {
    if (!settings.useOllama && !settings.apiKey) {
      setError('Please configure OpenAI settings first');
      return;
    }

    setError(null);
    const newUserMessage: Message = {
      role: 'user',
      content: imageBase64 ? `${content}\n[Image: ${imageBase64}]` : content,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    updateParentMessages(updatedMessages);
    setIsLoading(true);

    // Initialize streaming message
    const tempMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };
    setStreamingMessage(tempMessage);

    try {
      const chatMessages = [
        { role: 'system', content: systemPrompt },
        ...updatedMessages.map(m => ({ role: m.role, content: m.content }))
      ];

      let fullResponse = '';
      await getChatCompletion(
        settings,
        chatMessages,
        (chunk) => {
          fullResponse += chunk;
          setStreamingMessage(prev => prev ? { ...prev, content: fullResponse } : null);
          scrollToBottom();
        }
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      updateParentMessages(finalMessages);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get response';
      setError(errorMessage);
      console.error('Chat completion error:', error);
    } finally {
      setIsLoading(false);
      setStreamingMessage(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex justify-between items-center bg-white shadow-sm p-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {assistantName} - {currentLog?.name || 'New Chat'}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        
        {messages.map((message, index) => (
          <ChatMessage
            key={`${message.timestamp.getTime()}-${index}`}
            message={message}
          />
        ))}
        
        {streamingMessage && (
          <ChatMessage
            message={streamingMessage}
            isStreaming={true}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="mb-4">
          <LogDownloader
            messages={messages}
            assistantName={assistantName}
            settings={settings}
          />
        </div>
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          settings={settings}
        />
      </div>
    </div>
  );
};