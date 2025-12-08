import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';

export function useWebSocketNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Note: WebSocket implementation placeholder
    // In production, this would connect to a WebSocket server
    // For now, we'll use polling as fallback
    
    const pollNotifications = async () => {
      try {
        const data = await base44.entities.Notification.filter(
          { recipient_email: userId, is_read: false },
          '-created_date',
          5
        );
        setNotifications(data);
      } catch (error) {
        console.error('Notification polling error:', error);
      }
    };

    // Initial fetch
    pollNotifications();
    
    // Poll every 30 seconds
    const interval = setInterval(pollNotifications, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  const showToast = (notification) => {
    const icons = {
      success: CheckCircle,
      warning: AlertCircle,
      info: Info,
      default: Bell
    };
    
    const Icon = icons[notification.type] || icons.default;
    
    toast(notification.title, {
      description: notification.message,
      icon: <Icon className="h-5 w-5" />,
      action: notification.action_url ? {
        label: 'View',
        onClick: () => window.location.href = notification.action_url
      } : undefined
    });
  };

  return {
    notifications,
    isConnected,
    showToast
  };
}

// Real-time notification component
export function RealTimeNotificationProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { notifications, showToast } = useWebSocketNotifications(user?.email);

  // Show toast for new notifications
  useEffect(() => {
    if (notifications.length > 0) {
      // Only show the most recent one as toast
      const latest = notifications[0];
      if (latest && !latest.is_read) {
        showToast(latest);
      }
    }
  }, [notifications]);

  return <>{children}</>;
}