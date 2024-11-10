import React, { useState } from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2, Plus, ChevronRight, ChevronDown } from 'lucide-react';
import { Log } from '../types/log';

interface LogSidebarProps {
  logs: Log[];
  currentAssistantId: string;
  onCreateLog: () => void;
  onSelectLog: (logId: string) => void;
  onRenameLog: (logId: string, newName: string) => void;
  onDeleteLog: (logId: string) => void;
  selectedLogId: string | null;
}

export const LogSidebar: React.FC<LogSidebarProps> = ({
  logs = [], // Provide default empty array
  currentAssistantId,
  onCreateLog,
  onSelectLog,
  onRenameLog,
  onDeleteLog,
  selectedLogId
}) => {
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  // Group logs by date
  const groupedLogs = logs.reduce((groups: { [key: string]: Log[] }, log) => {
    const date = format(new Date(log.createdAt), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {});

  const handleRenameClick = (log: Log) => {
    setEditingLogId(log.id);
    setEditingName(log.name);
  };

  const handleRenameSubmit = (logId: string) => {
    if (editingName.trim()) {
      onRenameLog(logId, editingName.trim());
    }
    setEditingLogId(null);
    setEditingName('');
  };

  const toggleGroup = (date: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Logs</h2>
        <button
          onClick={onCreateLog}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          title="Create new log"
        >
          <Plus className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedLogs).map(([date, dateLogs]) => (
          <div key={date} className="mb-2">
            <button
              onClick={() => toggleGroup(date)}
              className="flex items-center w-full p-2 hover:bg-gray-200 rounded transition-colors"
            >
              {expandedGroups[date] ? (
                <ChevronDown className="h-4 w-4 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              <span className="text-sm font-medium">
                {format(new Date(date), 'MMMM d, yyyy')}
              </span>
            </button>

            {expandedGroups[date] && dateLogs.map(log => (
              <div
                key={log.id}
                className={`ml-6 mb-1 p-2 rounded cursor-pointer ${
                  selectedLogId === log.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
              >
                {editingLogId === log.id ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleRenameSubmit(log.id)}
                      onKeyPress={(e) => e.key === 'Enter' && handleRenameSubmit(log.id)}
                      className="flex-1 px-2 py-1 text-sm border rounded"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between group">
                    <span
                      onClick={() => onSelectLog(log.id)}
                      className="flex-1 text-sm truncate"
                    >
                      {log.name}
                    </span>
                    <div className="hidden group-hover:flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameClick(log);
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full"
                        title="Rename log"
                      >
                        <Edit2 className="h-3 w-3 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLog(log.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full ml-1"
                        title="Delete log"
                      >
                        <Trash2 className="h-3 w-3 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};