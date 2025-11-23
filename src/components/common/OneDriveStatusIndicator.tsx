import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { apiService } from '../../services/apiService';

const OneDriveStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'not_connected' | 'not_configured' | 'not_authenticated' | 'error'>('checking');
  const [message, setMessage] = useState<string>('');

  const checkStatus = async () => {
    try {
      const data = await apiService.getOneDriveStatus();
      
      if (data.configured === false) {
        setStatus('not_configured');
        setMessage('OneDrive not configured');
      } else if (data.user_connected) {
        setStatus('connected');
        setMessage('Connected to OneDrive');
      } else {
        setStatus('not_connected');
        setMessage('Not connected to OneDrive');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to check status');
    }
  };

  useEffect(() => {
    checkStatus();
    
    // Listen for refresh events
    const handleRefresh = () => checkStatus();
    window.addEventListener('onedrive-status-refresh', handleRefresh);
    
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('onedrive-status-refresh', handleRefresh);
    };
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'not_connected':
        return <XCircle className="w-4 h-4 text-orange-500" />;
      case 'not_configured':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'not_authenticated':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'not_connected':
        return 'Not Connected';
      case 'not_configured':
        return 'Not Configured';
      case 'not_authenticated':
        return 'Please Login';
      case 'error':
        return 'Error';
      default:
        return 'Checking...';
    }
  };

  return (
    <div className="flex items-center gap-1 text-xs">
      {getStatusIcon()}
      <span className={`font-medium ${
        status === 'connected' ? 'text-green-600' : 
        status === 'not_connected' ? 'text-orange-600' : 
        status === 'not_configured' ? 'text-red-600' : 
        status === 'not_authenticated' ? 'text-yellow-600' : 
        status === 'error' ? 'text-yellow-600' : 'text-blue-600'
      }`}>
        {getStatusText()}
      </span>
    </div>
  );
};

export default OneDriveStatusIndicator;

