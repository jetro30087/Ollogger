import React, { useState, useEffect } from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: OpenAISettings) => void;
  settings: OpenAISettings;
}

export interface OpenAISettings {
  apiKey: string;
  autoSendTranscription: boolean;
  useOllama: boolean;
  ollamaModel: string;
  ollamaEndpoint: string;
  useWhisperCpp: boolean;
  whisperCppEndpoint: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  settings,
}) => {
  const [localSettings, setLocalSettings] = useState<OpenAISettings>({
    apiKey: settings.apiKey || '',
    autoSendTranscription: settings.autoSendTranscription || false,
    useOllama: settings.useOllama || false,
    ollamaModel: settings.ollamaModel || 'llama2',
    ollamaEndpoint: settings.ollamaEndpoint || 'http://localhost:11434',
    useWhisperCpp: settings.useWhisperCpp || false,
    whisperCppEndpoint: settings.whisperCppEndpoint || 'http://localhost:8080'
  });

  useEffect(() => {
    setLocalSettings({
      apiKey: settings.apiKey || '',
      autoSendTranscription: settings.autoSendTranscription || false,
      useOllama: settings.useOllama || false,
      ollamaModel: settings.ollamaModel || 'llama2',
      ollamaEndpoint: settings.ollamaEndpoint || 'http://localhost:11434',
      useWhisperCpp: settings.useWhisperCpp || false,
      whisperCppEndpoint: settings.whisperCppEndpoint || 'http://localhost:8080'
    });
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="useOllama"
              checked={localSettings.useOllama}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, useOllama: e.target.checked }))}
              className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="useOllama" className="text-sm text-gray-700">
              Use Ollama (Local AI) instead of OpenAI
            </label>
          </div>

          {localSettings.useOllama && (
            <>
              <div>
                <label htmlFor="ollamaEndpoint" className="block text-sm font-medium text-gray-700 mb-1">
                  Ollama Endpoint
                </label>
                <input
                  type="text"
                  id="ollamaEndpoint"
                  value={localSettings.ollamaEndpoint}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, ollamaEndpoint: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="http://localhost:11434"
                  required
                />
              </div>
              <div>
                <label htmlFor="ollamaModel" className="block text-sm font-medium text-gray-700 mb-1">
                  Ollama Model
                </label>
                <input
                  type="text"
                  id="ollamaModel"
                  value={localSettings.ollamaModel}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, ollamaModel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="llama2"
                  required
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="useWhisperCpp"
                  checked={localSettings.useWhisperCpp}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, useWhisperCpp: e.target.checked }))}
                  className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="useWhisperCpp" className="text-sm text-gray-700">
                  Use Whisper.cpp for voice transcription
                </label>
              </div>
              {localSettings.useWhisperCpp && (
                <div>
                  <label htmlFor="whisperCppEndpoint" className="block text-sm font-medium text-gray-700 mb-1">
                    Whisper.cpp Endpoint
                  </label>
                  <input
                    type="text"
                    id="whisperCppEndpoint"
                    value={localSettings.whisperCppEndpoint}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, whisperCppEndpoint: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="http://localhost:8080"
                    required
                  />
                </div>
              )}
            </>
          )}

          {!localSettings.useOllama && (
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                OpenAI API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={localSettings.apiKey}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="sk-..."
                required={!localSettings.useOllama}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoSendTranscription"
              checked={localSettings.autoSendTranscription}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, autoSendTranscription: e.target.checked }))}
              className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="autoSendTranscription" className="text-sm text-gray-700">
              Automatically send voice messages after transcription
            </label>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};