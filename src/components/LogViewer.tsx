import React from 'react';
import { format } from 'date-fns';
import { ChatLog } from '../utils/loadLogs';
import { Download } from 'lucide-react';

interface LogViewerProps {
  logs: ChatLog[];
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const handleDownload = (log: ChatLog) => {
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-log-${format(new Date(log.timestamp), 'yyyy-MM-dd-HH-mm-ss')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log.id} className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">
              {format(new Date(log.timestamp), 'PPpp')}
            </span>
            <button
              onClick={() => handleDownload(log)}
              className="text-blue-500 hover:text-blue-600 p-1 rounded"
              title="Download log"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Messages: {log.messages.length}
          </div>
        </div>
      ))}
    </div>
  );
};