import React, { useState, useEffect } from 'react';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { Message } from '../types/chat';
import { OpenAISettings } from './SettingsModal';
import { getChatCompletion } from '../utils/openai';
import { generateSystemPrompt } from '../utils/promptGenerator';
import { generateAssistantName } from '../utils/assistantNaming';
import { addAssistant, updateAssistant } from '../utils/assistantStorage';
import { Save } from 'lucide-react';
import { Assistant } from '../types/assistant';

const CREATOR_SYSTEM_PROMPT = `You are an assistant that helps users design a system prompt to instruct an LLM to log and categorize data according to specific needs. Through a series of guided questions, help users define key log categories, desired data fields, formatting preferences, and any custom logging requirements.

When you have gathered sufficient information (typically after 4-5 message exchanges), you must call the createAssistant function:

<function_call>
createAssistant
parameters:
{
  "ready": true
}
</function_call>

After the assistant is created, let the user know they can start using their new logging assistant.`;

interface CreatorWindowProps {
  settings: OpenAISettings;
  onAssistantCreated?: () => void;
  onClose: () => void;
  editingAssistant?: Assistant | null;
}

export const CreatorWindow: React.FC<CreatorWindowProps> = ({ 
  settings,
  onAssistantCreated,
  onClose,
  editingAssistant
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [hasCreatedAssistant, setHasCreatedAssistant] = useState(false);

  useEffect(() => {
    const initialMessage: Message = {
      role: 'assistant',
      content: editingAssistant 
        ? `I'm here to help you modify the "${editingAssistant.name}" assistant. Let's review and update its logging capabilities. What would you like to change?`
        : "Hello! I'll help you create a custom logging assistant. Please describe the type of data you want to log and categorize, and I'll guide you through the process with some questions.",
      timestamp: new Date()
    };
    setMessages([initialMessage]);
    setHasCreatedAssistant(false);
  }, [editingAssistant]);

  const handleCreateAssistant = async () => {
    try {
      const [systemPrompt, assistantName] = await Promise.all([
        generateSystemPrompt(settings, messages),
        generateAssistantName(settings, messages)
      ]);

      if (systemPrompt) {
        if (editingAssistant) {
          const updatedAssistant = {
            ...editingAssistant,
            name: assistantName,
            systemPrompt,
          };
          updateAssistant(updatedAssistant);
        } else {
          const newAssistant = {
            id: Date.now().toString(),
            name: assistantName,
            systemPrompt,
            createdAt: new Date()
          };
          addAssistant(newAssistant);
        }
        
        setHasCreatedAssistant(true);
        
        const confirmationMessage: Message = {
          role: 'assistant',
          content: `✨ I've ${editingAssistant ? 'updated' : 'created'} the assistant "**${assistantName}**". You can now start using your logging assistant by clicking the Return to Chat button.`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, confirmationMessage]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating assistant:', error);
      return false;
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!settings.useOllama && !settings.apiKey) {
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const tempMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };
    setStreamingMessage(tempMessage);

    try {
      const response = await getChatCompletion(
        settings,
        [
          { role: 'system', content: CREATOR_SYSTEM_PROMPT },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: userMessage.role, content: userMessage.content }
        ],
        (chunk) => {
          setStreamingMessage(prev => prev ? { ...prev, content: prev.content + chunk } : null);
        }
      );

      // Check for function calls in the response
      if (response.includes('<function_call>')) {
        const match = response.match(/<function_call>\n([\s\S]*?)\n<\/function_call>/);
        if (match) {
          const [_, functionContent] = match;
          const [functionName, ...paramLines] = functionContent.split('\n');
          
          if (functionName.trim() === 'createAssistant') {
            await handleCreateAssistant();
            return;
          }
        }
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamingMessage(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold text-gray-700">
          {editingAssistant ? `Editing: ${editingAssistant.name}` : 'Assistant Creator'}
        </h2>
        <button
          onClick={() => {
            if (hasCreatedAssistant) {
              onAssistantCreated?.();
            }
            onClose();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          title="Save and return to chat"
        >
          <Save className="h-4 w-4" />
          Return to Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        {streamingMessage && (
          <ChatMessage message={streamingMessage} isStreaming={true} />
        )}
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        settings={settings}
      />
    </div>
  );
};