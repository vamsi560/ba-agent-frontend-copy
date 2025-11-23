import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Notification as NotificationType } from '../../types';

interface NotificationProps {
  notification: NotificationType;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
  if (!notification.show) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${
      notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
      notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
      'bg-blue-50 border-blue-200 text-blue-800'
    }`}>
      <div className="flex items-center gap-2">
        {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
        {notification.type === 'error' && <XCircle className="w-5 h-5" />}
        <span className="font-medium">{notification.message}</span>
      </div>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        ×
      </button>
    </div>
  );
};

export default Notification;

