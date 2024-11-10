export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatLog {
  messages: Message[];
  timestamp: Date;
}