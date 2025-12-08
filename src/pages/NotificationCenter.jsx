import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Bell, CheckCircle, AlertCircle, Clock, Filter, Trash2, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ProtectedPage from '../components/permissions/ProtectedPage';

function NotificationCenter() {
  const { language, isRTL, t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me()
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: async () => {
      const all = await base44.entities.Notification.list('-created_date', 100);
      return all.filter(n => n.recipient_email === user?.email);
    },
    enabled: !!user
  });

  const markAsRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  const deleteNotification = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await Promise.all(
        notifications.filter(n => !n.read).map(n => base44.entities.Notification.update(n.id, { read: true }))
      );
    },
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  const filteredNotifications = notifications.filter(n => {
    const readMatch = filter === 'all' || (filter === 'unread' && !n.read) || (filter === 'read' && n.read);
    const typeMatch = typeFilter === 'all' || 
      (typeFilter === 'expert' && (n.type === 'expert_assignment' || n.category === 'expert')) ||
      (typeFilter === 'approval' && n.type === 'approval') ||
      (typeFilter === 'alert' && n.type === 'alert') ||
      (typeFilter === 'reminder' && n.type === 'reminder');
    return readMatch && typeMatch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const typeConfig = {
    approval: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    alert: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    reminder: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    expert_assignment: { icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    info: { icon: Bell, color: 'text-slate-600', bg: 'bg-slate-50' }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Bell className="h-8 w-8 text-blue-600" />
            {t({ en: 'Notifications', ar: 'الإشعارات' })}
          </h1>
          {unreadCount > 0 && (
            <p className="text-slate-600 mt-1">
              {t({ en: `${unreadCount} unread notifications`, ar: `${unreadCount} إشعار غير مقروء` })}
            </p>
          )}
        </div>
        <Button onClick={() => markAllAsRead.mutate()} disabled={unreadCount === 0}>
          {t({ en: 'Mark all as read', ar: 'وضع علامة مقروء للكل' })}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2">
          {['all', 'unread', 'read'].map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {t({ en: f.charAt(0).toUpperCase() + f.slice(1), ar: f === 'all' ? 'الكل' : f === 'unread' ? 'غير مقروء' : 'مقروء' })}
            </Button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Filter className="h-5 w-5 text-slate-500 self-center" />
          {['all', 'expert', 'approval', 'alert', 'reminder'].map(tf => (
            <Button
              key={tf}
              variant={typeFilter === tf ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter(tf)}
              className={typeFilter === tf && tf === 'expert' ? 'bg-purple-600' : ''}
            >
              {t({ 
                en: tf === 'all' ? 'All Types' : 
                    tf === 'expert' ? 'Expert' : 
                    tf === 'approval' ? 'Approvals' : 
                    tf === 'alert' ? 'Alerts' : 'Reminders',
                ar: tf === 'all' ? 'كل الأنواع' : 
                    tf === 'expert' ? 'خبير' : 
                    tf === 'approval' ? 'موافقات' : 
                    tf === 'alert' ? 'تنبيهات' : 'تذكيرات'
              })}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredNotifications.map(notification => {
          const config = typeConfig[notification.type] || typeConfig.info;
          const Icon = config.icon;

          return (
            <Card key={notification.id} className={`${!notification.read ? 'border-2 border-blue-200' : ''} hover:shadow-md transition-shadow`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${config.bg}`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className={`font-medium ${!notification.read ? 'text-slate-900' : 'text-slate-600'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button variant="ghost" size="sm" onClick={() => markAsRead.mutate(notification.id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => deleteNotification.mutate(notification.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                      </span>
                      {!notification.read && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          {t({ en: 'New', ar: 'جديد' })}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredNotifications.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">
              {t({ en: 'No notifications', ar: 'لا إشعارات' })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(NotificationCenter, { requiredPermissions: [] });