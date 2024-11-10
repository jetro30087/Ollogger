import { Message } from '../types/chat';

export interface ChatLog {
  id: number;
  timestamp: string;
  messages: Message[];
}

export const loadLogs = (): ChatLog[] => {
  try {
    const logs = JSON.parse(localStorage.getItem('chatLogs') || '[]');
    return logs.map((log: ChatLog) => ({
      ...log,
      messages: log.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }));
  } catch (error) {
    console.error('Error loading logs:', error);
    return [];
  }
};