import { Log } from '../types/log';

const LOG_STORE_KEY = 'log_store';

interface LogStoreData {
  logs: Log[];
  currentLogId: string | null;
}

export interface LogStore {
  [assistantId: string]: LogStoreData;
}

export const getLogStore = (assistantId?: string): LogStore | LogStoreData => {
  try {
    const stored = localStorage.getItem(LOG_STORE_KEY);
    const store: LogStore = stored ? JSON.parse(stored) : {};
    
    // Convert dates in all logs
    Object.keys(store).forEach(id => {
      store[id].logs = store[id].logs.map((log: any) => ({
        ...log,
        createdAt: new Date(log.createdAt),
        updatedAt: new Date(log.updatedAt),
        messages: log.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    });

    // If assistantId is provided, return just that assistant's data
    if (assistantId) {
      return store[assistantId] || { logs: [], currentLogId: null };
    }

    return store;
  } catch (error) {
    console.error('Error loading log store:', error);
    return assistantId ? { logs: [], currentLogId: null } : {};
  }
};

export const saveLogStore = (store: LogStore): void => {
  localStorage.setItem(LOG_STORE_KEY, JSON.stringify(store));
};

export const createNewLog = (assistantId: string): Log => {
  const store = getLogStore() as LogStore;
  
  // Get the assistant's system prompt from the assistant store
  const assistantStore = JSON.parse(localStorage.getItem('assistant_store') || '{}');
  const assistant = assistantStore.assistants?.find((a: any) => a.id === assistantId);
  
  // Extract icebreaker message from system prompt
  let icebreaker = '';
  if (assistant?.systemPrompt) {
    const match = assistant.systemPrompt.match(/INITIAL_MESSAGE:\s*(.*?)(?:\n|$)/);
    if (match) {
      icebreaker = match[1];
    }
  }

  const newLog: Log = {
    id: Date.now().toString(),
    name: 'New Log',
    assistantId,
    messages: icebreaker ? [{
      role: 'assistant',
      content: icebreaker,
      timestamp: new Date()
    }] : [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  if (!store[assistantId]) {
    store[assistantId] = { logs: [], currentLogId: null };
  }

  store[assistantId].logs.push(newLog);
  store[assistantId].currentLogId = newLog.id;
  saveLogStore(store);

  return newLog;
};

export const updateLog = (assistantId: string, logId: string, name?: string, messages?: Log['messages']): void => {
  const store = getLogStore() as LogStore;
  if (!store[assistantId]) return;

  const logIndex = store[assistantId].logs.findIndex(l => l.id === logId);
  if (logIndex !== -1) {
    const log = store[assistantId].logs[logIndex];
    store[assistantId].logs[logIndex] = {
      ...log,
      name: name ?? log.name,
      messages: messages ?? log.messages,
      updatedAt: new Date()
    };
    saveLogStore(store);
  }
};

export const deleteLog = (assistantId: string, logId: string): void => {
  const store = getLogStore() as LogStore;
  if (!store[assistantId]) return;

  store[assistantId].logs = store[assistantId].logs.filter(l => l.id !== logId);
  if (store[assistantId].currentLogId === logId) {
    store[assistantId].currentLogId = store[assistantId].logs[0]?.id || null;
  }
  saveLogStore(store);
};

export const setCurrentLog = (assistantId: string, logId: string | null): void => {
  const store = getLogStore() as LogStore;
  if (!store[assistantId]) {
    store[assistantId] = { logs: [], currentLogId: null };
  }
  store[assistantId].currentLogId = logId;
  saveLogStore(store);
};

export const getCurrentLog = (assistantId: string): Log | null => {
  const store = getLogStore() as LogStore;
  if (!store[assistantId]?.currentLogId) return null;
  return store[assistantId].logs.find(l => l.id === store[assistantId].currentLogId) || null;
};

export const updateLogMessages = (assistantId: string, logId: string, messages: Log['messages']): void => {
  const store = getLogStore() as LogStore;
  if (!store[assistantId]) return;

  const logIndex = store[assistantId].logs.findIndex(l => l.id === logId);
  if (logIndex !== -1) {
    store[assistantId].logs[logIndex].messages = messages;
    store[assistantId].logs[logIndex].updatedAt = new Date();
    saveLogStore(store);
  }
};