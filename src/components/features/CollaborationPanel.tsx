import React, { useState } from 'react';
import { Bell } from 'lucide-react';

interface CollaborationPanelProps {
  notifications?: string[];
  messages?: Array<{ id: string; text: string; timestamp?: string }>;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ notifications, messages }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <Bell className="w-6 h-6" />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800">Collaboration</h3>
          </div>
          <div className="p-4 max-h-64 overflow-y-auto">
            {notifications && notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <div key={index} className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-800">{notification}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent activity</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborationPanel;

