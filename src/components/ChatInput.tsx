import React, { useState, useRef } from 'react';
import { Send, Mic, Image } from 'lucide-react';
import { AudioRecorder } from './AudioRecorder';
import { OpenAISettings } from './SettingsModal';
import { convertToBase64 } from '../utils/imageUtils';

interface ChatInputProps {
  onSendMessage: (message: string, imageBase64?: string) => void;
  disabled?: boolean;
  settings: OpenAISettings;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled, settings }) => {
  const [message, setMessage] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleTranscription = (text: string) => {
    setMessage(text);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('Image size must be less than 10MB');
      return;
    }

    setIsProcessingImage(true);
    try {
      const base64 = await convertToBase64(file);
      const imageUrl = URL.createObjectURL(file);
      onSendMessage(`Analyzing image:\n[Image: ${imageUrl}]`, base64);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t border-gray-200">
      <AudioRecorder 
        onTranscription={handleTranscription}
        settings={settings}
        disabled={disabled}
      />
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
      
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isProcessingImage}
        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        title="Upload image"
      >
        <Image className="h-5 w-5" />
      </button>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message or record audio..."
        disabled={disabled}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      />
      
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        <Send className="h-4 w-4" />
        Send
      </button>
    </form>
  );
};