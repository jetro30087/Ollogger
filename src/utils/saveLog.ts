import { Message } from '../types/chat';

const LOGS_KEY = 'chat_logs';

export interface SavedLog {
  id: number;
  timestamp: string;
  assistantName: string;
  messages: Message[];
}

export const saveLog = (messages: Message[], assistantName: string): void => {
  try {
    const existingLogs = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      assistantName,
      messages: messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }))
    };
    
    existingLogs.push(newLog);
    localStorage.setItem(LOGS_KEY, JSON.stringify(existingLogs));
  } catch (error) {
    console.error('Error saving log:', error);
  }
};

export const getAllLogs = () => {
  try {
    return JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
  } catch (error) {
    console.error('Error loading logs:', error);
    return [];
  }
};