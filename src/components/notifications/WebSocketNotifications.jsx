import { useEffect } from 'react';
import { toast } from 'sonner';
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

export function useWebSocketNotifications(userEmail) {
  const { notifications, isLoading } = useNotifications(userEmail, {
    refetchInterval: 30000 // 30 seconds polling
  });

  const showToast = (notification) => {
    const icons = {
      success: CheckCircle,
      warning: AlertCircle,
      info: Info,
      default: Bell
    };

    // Support both table schemas (type vs notification_type)
    const type = notification.type || notification.notification_type || 'default';
    const Icon = icons[type] || icons.default;

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
    isConnected: !isLoading, // Use loading state as connection placeholder
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
