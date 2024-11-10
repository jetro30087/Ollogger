import React, { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { Message } from '../types/chat';
import { OpenAISettings } from './SettingsModal';
import { format } from 'date-fns';
import { saveLogLocally, createCSV } from '../utils/logUtils';

interface LogDownloaderProps {
  messages: Message[];
  assistantName: string;
  settings: OpenAISettings;
}

export const LogDownloader: React.FC<LogDownloaderProps> = ({
  messages,
  assistantName,
  settings
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownloadLog = () => {
    const timestamp = format(new Date(), 'yyyy-MM-dd-HH-mm-ss');
    const fileName = `${assistantName.toLowerCase().replace(/\s+/g, '-')}-log-${timestamp}.json`;
    
    // Save locally
    saveLogLocally(messages, assistantName);
    
    // Download to user's computer
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCreateCSV = async () => {
    if (!settings.useOllama && !settings.apiKey) {
      alert('Please configure OpenAI settings first');
      return;
    }

    setIsProcessing(true);
    try {
      const csvContent = await createCSV(messages, assistantName, settings);
      const timestamp = format(new Date(), 'yyyy-MM-dd-HH-mm-ss');
      const fileName = `${assistantName.toLowerCase().replace(/\s+/g, '-')}-data-${timestamp}.csv`;
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating CSV:', error);
      alert('Failed to create CSV. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleDownloadLog}
        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        title="Download chat log"
      >
        <Download className="h-4 w-4" />
        Download Log
      </button>
      <button
        onClick={handleCreateCSV}
        disabled={isProcessing}
        className={`flex items-center gap-1 px-3 py-1 text-sm ${
          isProcessing 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-500 hover:bg-green-600'
        } text-white rounded transition-colors`}
        title="Create CSV from chat log"
      >
        <FileSpreadsheet className="h-4 w-4" />
        {isProcessing ? 'Processing...' : 'Create CSV'}
      </button>
    </div>
  );
};