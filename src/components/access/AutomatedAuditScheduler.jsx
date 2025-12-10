import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../LanguageContext';
import { toast } from 'sonner';
import {
  Calendar, Clock, CheckCircle2, Settings, Bell
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AutomatedAuditScheduler() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // Fetch audit configuration from platform_config
  const { data: config } = useQuery({
    queryKey: ['audit-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_config')
        .select('*')
        .eq('key', 'rbac_audit_schedule')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      return data?.value || {
        enabled: false,
        frequency: 'weekly',
        notify_admins: true,
        auto_cleanup_stale: false
      };
    }
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig) => {
      const key = 'rbac_audit_schedule';
      
      // Check if exists
      const { data: existing } = await supabase
        .from('platform_config')
        .select('id')
        .eq('key', key)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('platform_config')
          .update({ value: newConfig })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('platform_config')
          .insert({ key, value: newConfig });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['audit-config']);
      toast.success(t({ en: 'Settings updated', ar: 'تم تحديث الإعدادات' }));
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  if (!config) return null;

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          {t({ en: 'Automated Audit Schedule', ar: 'جدولة التدقيق الآلي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {t({ en: 'Enable Automated Audits', ar: 'تفعيل التدقيقات الآلية' })}
            </span>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(checked) => 
              updateConfigMutation.mutate({ ...config, enabled: checked })
            }
          />
        </div>

        {config.enabled && (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Audit Frequency', ar: 'تكرار التدقيق' })}
              </label>
              <Select
                value={config.frequency}
                onValueChange={(value) => 
                  updateConfigMutation.mutate({ ...config, frequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">
                    {t({ en: 'Daily', ar: 'يومياً' })}
                  </SelectItem>
                  <SelectItem value="weekly">
                    {t({ en: 'Weekly (Monday)', ar: 'أسبوعياً (الاثنين)' })}
                  </SelectItem>
                  <SelectItem value="biweekly">
                    {t({ en: 'Bi-weekly', ar: 'كل أسبوعين' })}
                  </SelectItem>
                  <SelectItem value="monthly">
                    {t({ en: 'Monthly (1st)', ar: 'شهرياً (الأول)' })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {t({ en: 'Notify Admins', ar: 'إشعار المسؤولين' })}
                </span>
              </div>
              <Switch
                checked={config.notify_admins}
                onCheckedChange={(checked) => 
                  updateConfigMutation.mutate({ ...config, notify_admins: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {t({ en: 'Auto-cleanup Stale Roles', ar: 'تنظيف الأدوار القديمة تلقائياً' })}
                </span>
              </div>
              <Switch
                checked={config.auto_cleanup_stale}
                onCheckedChange={(checked) => 
                  updateConfigMutation.mutate({ ...config, auto_cleanup_stale: checked })
                }
              />
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-900">
                    {t({ en: 'Scheduler Active', ar: 'المجدول نشط' })}
                  </p>
                  <p className="text-green-700">
                    {t({ en: 'Next audit:', ar: 'التدقيق التالي:' })} {config.frequency} 
                    {config.notify_admins && ` • ${t({ en: 'Admins will be notified', ar: 'سيتم إشعار المسؤولين' })}`}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
