import { Assistant, AssistantStore } from '../types/assistant';

const ASSISTANT_STORE_KEY = 'assistant_store';

export const getAssistantStore = (): AssistantStore => {
  try {
    const stored = localStorage.getItem(ASSISTANT_STORE_KEY);
    if (!stored) return { assistants: [], currentAssistantId: null };
    
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      assistants: parsed.assistants.map((a: any) => ({
        ...a,
        createdAt: new Date(a.createdAt)
      }))
    };
  } catch (error) {
    console.error('Error loading assistant store:', error);
    return { assistants: [], currentAssistantId: null };
  }
};

export const saveAssistantStore = (store: AssistantStore): void => {
  localStorage.setItem(ASSISTANT_STORE_KEY, JSON.stringify(store));
};

export const addAssistant = (assistant: Assistant): void => {
  const store = getAssistantStore();
  store.assistants.push(assistant);
  store.currentAssistantId = assistant.id;
  saveAssistantStore(store);
};

export const updateAssistant = (assistant: Assistant): void => {
  const store = getAssistantStore();
  const index = store.assistants.findIndex(a => a.id === assistant.id);
  if (index !== -1) {
    store.assistants[index] = assistant;
    saveAssistantStore(store);
  }
};

export const deleteAssistant = (assistantId: string): void => {
  const store = getAssistantStore();
  store.assistants = store.assistants.filter(a => a.id !== assistantId);
  if (store.currentAssistantId === assistantId) {
    store.currentAssistantId = null;
  }
  saveAssistantStore(store);
};

export const setCurrentAssistant = (assistantId: string | null): void => {
  const store = getAssistantStore();
  store.currentAssistantId = assistantId;
  saveAssistantStore(store);
};

export const getCurrentAssistant = (): Assistant | null => {
  const store = getAssistantStore();
  if (!store.currentAssistantId) return null;
  return store.assistants.find(a => a.id === store.currentAssistantId) || null;
};