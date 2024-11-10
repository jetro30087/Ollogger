import { Message } from '../types/chat';
import { OpenAISettings } from '../components/SettingsModal';
import { getChatCompletion } from './openai';

const LOGS_STORAGE_KEY = 'assistant_logs';

export const saveLogLocally = (messages: Message[], assistantName: string): void => {
  try {
    const storedLogs = JSON.parse(localStorage.getItem(LOGS_STORAGE_KEY) || '{}');
    const assistantLogs = storedLogs[assistantName] || [];
    
    assistantLogs.push({
      timestamp: new Date().toISOString(),
      messages: messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }))
    });

    storedLogs[assistantName] = assistantLogs;
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(storedLogs));
  } catch (error) {
    console.error('Error saving log locally:', error);
  }
};

export const createCSV = async (
  messages: Message[], 
  assistantName: string, 
  settings: OpenAISettings
): Promise<string> => {
  const systemPrompt = `You are a data extraction specialist. Analyze the following chat log and create a CSV formatted output. 
  Extract all relevant data points from the assistant's responses and structure them into a clear, organized CSV format. 
  Include headers that accurately describe each data column. Focus on numerical data, categories, dates, and key information.
  Only output the CSV content, no explanations or additional text.`;

  const messagesContent = messages
    .filter(m => m.role === 'assistant')
    .map(m => m.content)
    .join('\n\n');

  const csvContent = await getChatCompletion(settings, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: messagesContent }
  ]);

  return csvContent;
};