import React, { useState, useEffect } from 'react';
import { Settings, Plus } from 'lucide-react';
import { SettingsModal, OpenAISettings } from './components/SettingsModal';
import { ChatWindow } from './components/ChatWindow';
import { CreatorWindow } from './components/CreatorWindow';
import { AssistantSelector } from './components/AssistantSelector';
import { LogSidebar } from './components/LogSidebar';
import { ReminderButton } from './components/ReminderButton';
import { loadSettings, saveSettings, loadPrompt } from './utils/storage';
import { getAssistantStore, setCurrentAssistant, deleteAssistant } from './utils/assistantStorage';
import { getLogStore, createNewLog, updateLog, deleteLog, setCurrentLog } from './utils/logStorage';
import { Assistant } from './types/assistant';
import { Log } from './types/log';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<OpenAISettings>(loadSettings());
  const [showCreator, setShowCreator] = useState(false);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [currentAssistantId, setCurrentAssistantId] = useState<string | null>(null);
  const [editingAssistant, setEditingAssistant] = useState<Assistant | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [currentLogId, setCurrentLogId] = useState<string | null>(null);
  const [defaultMessages, setDefaultMessages] = useState<Log['messages']>([]);

  useEffect(() => {
    const store = getAssistantStore();
    setAssistants(store.assistants);
    setCurrentAssistantId(store.currentAssistantId);

    // Initialize default messages with the default assistant's icebreaker
    const defaultPrompt = loadPrompt();
    const match = defaultPrompt.match(/INITIAL_MESSAGE:\s*(.*?)(?:\n|$)/);
    if (match) {
      setDefaultMessages([{
        role: 'assistant',
        content: match[1],
        timestamp: new Date()
      }]);
    }
  }, []);

  const handleAssistantSelect = (assistantId: string | null) => {
    setCurrentAssistantId(assistantId);
    setCurrentAssistant(assistantId);
    
    if (assistantId) {
      const logStore = getLogStore(assistantId);
      if (logStore.logs.length === 0) {
        // Create a new log with icebreaker for the selected assistant
        const newLog = createNewLog(assistantId);
        setLogs([newLog]);
        setCurrentLogId(newLog.id);
      } else {
        setLogs(logStore.logs);
        setCurrentLogId(logStore.currentLogId || logStore.logs[0].id);
      }
    } else {
      // Reset to default messages when switching to default assistant
      const defaultPrompt = loadPrompt();
      const match = defaultPrompt.match(/INITIAL_MESSAGE:\s*(.*?)(?:\n|$)/);
      if (match) {
        setDefaultMessages([{
          role: 'assistant',
          content: match[1],
          timestamp: new Date()
        }]);
      }
      setLogs([]);
      setCurrentLogId(null);
    }
  };

  const handleSaveSettings = (newSettings: OpenAISettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleCreateLog = () => {
    if (!currentAssistantId) return;
    const newLog = createNewLog(currentAssistantId);
    setLogs(prev => [...prev, newLog]);
    setCurrentLogId(newLog.id);
  };

  const handleUpdateMessages = (messages: Log['messages']) => {
    if (currentAssistantId && currentLogId) {
      updateLog(currentAssistantId, currentLogId, undefined, messages);
    }
  };

  const handleDeleteAssistant = (assistant: Assistant) => {
    deleteAssistant(assistant.id);
    const store = getAssistantStore();
    setAssistants(store.assistants);
    if (currentAssistantId === assistant.id) {
      handleAssistantSelect(null);
    }
  };

  const currentAssistant = currentAssistantId 
    ? assistants.find(a => a.id === currentAssistantId)
    : null;

  const currentLog = currentLogId && logs.length > 0
    ? logs.find(l => l.id === currentLogId)
    : null;

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">Log Assistant</h1>
        <div className="flex items-center gap-4">
          <AssistantSelector
            assistants={assistants}
            currentAssistantId={currentAssistantId}
            onSelect={handleAssistantSelect}
            onEdit={setEditingAssistant}
            onDelete={handleDeleteAssistant}
          />
          <ReminderButton assistantName={currentAssistant?.name || 'Default Assistant'} />
          <button
            onClick={() => setShowCreator(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            title="Create new assistant"
          >
            <Plus className="h-5 w-5 text-gray-600" />
            Create Assistant
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Settings"
          >
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        {!showCreator && currentAssistantId && (
          <LogSidebar
            logs={logs}
            currentAssistantId={currentAssistantId}
            onCreateLog={handleCreateLog}
            onSelectLog={setCurrentLogId}
            onRenameLog={(logId, name) => updateLog(currentAssistantId, logId, name)}
            onDeleteLog={(logId) => deleteLog(currentAssistantId, logId)}
            selectedLogId={currentLogId}
          />
        )}

        <div className="flex-1">
          {showCreator ? (
            <CreatorWindow
              settings={settings}
              onAssistantCreated={() => {
                const store = getAssistantStore();
                setAssistants(store.assistants);
                setShowCreator(false);
                handleAssistantSelect(null);
              }}
              onClose={() => {
                setShowCreator(false);
                handleAssistantSelect(null);
              }}
              editingAssistant={editingAssistant}
            />
          ) : (
            <ChatWindow
              assistantName={currentAssistant?.name || 'Default Assistant'}
              systemPrompt={currentAssistant?.systemPrompt || loadPrompt()}
              currentLog={currentAssistant ? currentLog : { 
                id: 'default',
                name: 'Default Chat',
                messages: defaultMessages,
                assistantId: 'default',
                createdAt: new Date(),
                updatedAt: new Date()
              }}
              onUpdateMessages={handleUpdateMessages}
              settings={settings}
            />
          )}
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        settings={settings}
      />
    </div>
  );
}

export default App;