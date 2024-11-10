export interface Assistant {
  id: string;
  name: string;
  systemPrompt: string;
  createdAt: Date;
}

export interface AssistantStore {
  assistants: Assistant[];
  currentAssistantId: string | null;
}