export interface Log {
  id: string;
  name: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  assistantId: string;
  createdAt: Date;
  updatedAt: Date;
}