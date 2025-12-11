import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export function useWebSocketNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const pollNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_email', userId)
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(5);
        if (!error) setNotifications(data || []);
      } catch (error) {
        console.error('Notification polling error:', error);
      }
    };

    pollNotifications();
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

export function RealTimeNotificationProvider({ children }) {
  const { user } = useAuth();

  const { notifications, showToast } = useWebSocketNotifications(user?.email);

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      if (latest && !latest.is_read) {
        showToast(latest);
      }
    }
  }, [notifications]);

  return <>{children}</>;
}