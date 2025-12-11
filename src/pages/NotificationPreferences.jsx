import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Bell, Mail, Smartphone, Clock, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

export default function NotificationPreferences() {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-prefs', currentUser?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_email', currentUser?.email)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!currentUser
  });

  const [localPrefs, setLocalPrefs] = useState(null);

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    } else if (currentUser) {
      // Default preferences
      setLocalPrefs({
        user_email: currentUser.email,
        channel: 'both',
        frequency: 'realtime',
        categories: {
          challenges: true,
          pilots: true,
          approvals: true,
          comments: true,
          mentions: true,
          team_updates: true,
          system_announcements: true
        },
        quiet_hours: {
          enabled: false,
          start_time: '22:00',
          end_time: '08:00'
        }
      });
    }
  }, [preferences, currentUser]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (preferences?.id) {
        return base44.entities.UserNotificationPreference.update(preferences.id, data);
      } else {
        return base44.entities.UserNotificationPreference.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notification-prefs']);
      toast.success(t({ en: 'Preferences saved', ar: 'تم حفظ التفضيلات' }));
    }
  });

  const handleSave = () => {
    saveMutation.mutate(localPrefs);
  };

  if (isLoading || !localPrefs) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '🔔 Notification Preferences', ar: '🔔 تفضيلات الإشعارات' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Customize how and when you receive notifications', ar: 'خصص كيف ومتى تتلقى الإشعارات' })}
        </p>
      </div>

      {/* Channel Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t({ en: 'Notification Channel', ar: 'قناة الإشعارات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={localPrefs.channel} onValueChange={(val) => setLocalPrefs({...localPrefs, channel: val})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {t({ en: 'Email Only', ar: 'البريد فقط' })}
                </div>
              </SelectItem>
              <SelectItem value="in_app">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  {t({ en: 'In-App Only', ar: 'داخل التطبيق فقط' })}
                </div>
              </SelectItem>
              <SelectItem value="both">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  {t({ en: 'Both Email & In-App', ar: 'البريد والتطبيق' })}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t({ en: 'Notification Frequency', ar: 'تكرار الإشعارات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={localPrefs.frequency} onValueChange={(val) => setLocalPrefs({...localPrefs, frequency: val})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">{t({ en: 'Real-time (Instant)', ar: 'فوري' })}</SelectItem>
              <SelectItem value="daily_digest">{t({ en: 'Daily Digest', ar: 'ملخص يومي' })}</SelectItem>
              <SelectItem value="weekly_digest">{t({ en: 'Weekly Digest', ar: 'ملخص أسبوعي' })}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Category Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Notification Categories', ar: 'فئات الإشعارات' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(localPrefs.categories).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => setLocalPrefs({
                    ...localPrefs,
                    categories: { ...localPrefs.categories, [key]: checked }
                  })}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t({ en: 'Quiet Hours', ar: 'ساعات الهدوء' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t({ en: 'Enable quiet hours', ar: 'تفعيل ساعات الهدوء' })}
              </span>
              <Switch
                checked={localPrefs.quiet_hours?.enabled}
                onCheckedChange={(checked) => setLocalPrefs({
                  ...localPrefs,
                  quiet_hours: { ...localPrefs.quiet_hours, enabled: checked }
                })}
              />
            </div>

            {localPrefs.quiet_hours?.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-600 mb-2 block">
                    {t({ en: 'Start time', ar: 'وقت البداية' })}
                  </label>
                  <input
                    type="time"
                    value={localPrefs.quiet_hours.start_time}
                    onChange={(e) => setLocalPrefs({
                      ...localPrefs,
                      quiet_hours: { ...localPrefs.quiet_hours, start_time: e.target.value }
                    })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-2 block">
                    {t({ en: 'End time', ar: 'وقت النهاية' })}
                  </label>
                  <input
                    type="time"
                    value={localPrefs.quiet_hours.end_time}
                    onChange={(e) => setLocalPrefs({
                      ...localPrefs,
                      quiet_hours: { ...localPrefs.quiet_hours, end_time: e.target.value }
                    })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-gradient-to-r from-blue-600 to-purple-600">
          {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {t({ en: 'Save Preferences', ar: 'حفظ التفضيلات' })}
        </Button>
      </div>
    </div>
  );
}