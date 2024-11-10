import React from 'react';
import { ChevronDown, Edit2, Trash2 } from 'lucide-react';
import { Assistant } from '../types/assistant';

interface AssistantSelectorProps {
  assistants: Assistant[];
  currentAssistantId: string | null;
  onSelect: (assistantId: string | null) => void;
  onEdit?: (assistant: Assistant) => void;
  onDelete?: (assistant: Assistant) => void;
}

export const AssistantSelector: React.FC<AssistantSelectorProps> = ({
  assistants,
  currentAssistantId,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const currentAssistant = assistants.find(a => a.id === currentAssistantId);

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <select
          value={currentAssistantId || ''}
          onChange={(e) => onSelect(e.target.value || null)}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Default Assistant</option>
          {assistants.map((assistant) => (
            <option key={assistant.id} value={assistant.id}>
              {assistant.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
      </div>
      
      {currentAssistant && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit?.(currentAssistant)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Edit Assistant"
          >
            <Edit2 className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${currentAssistant.name}"?`)) {
                onDelete?.(currentAssistant);
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Delete Assistant"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      )}
    </div>
  );
};