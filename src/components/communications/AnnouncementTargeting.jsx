import { useState } from 'react';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { useAllUserProfiles } from '@/hooks/useUserProfiles';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Megaphone, Send, Users, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AnnouncementTargeting() {
  const { language, t } = useLanguage();
  const { notify, isNotifying } = useNotificationSystem();
  const { data: users = [] } = useAllUserProfiles();

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target_roles: [],
    target_regions: [],
    target_sectors: [],
    scheduled_date: '',
    channels: ['in_app']
  });

  const handleSend = async () => {
    // Send to targeted users
    const targeted = users.filter(u => {
      // @ts-ignore
      const userRole = u.role || u.persona_type;
      if (formData.target_roles.length > 0 && !formData.target_roles.includes(userRole)) return false;
      return true;
    });

    // @ts-ignore
    const targetedEmails = targeted.map(u => u.email).filter(Boolean);

    if (targetedEmails.length === 0) {
      toast.warning(t({ en: 'No users match the selected criteria', ar: 'لا يوجد مستخدمين يطابقون المعايير' }));
      return;
    }

    try {
      await notify({
        type: 'announcement',
        recipientEmails: targetedEmails,
        title: formData.title,
        message: formData.message,
        sendEmail: formData.channels.includes('email'),
        emailTemplate: 'campaign.announcement',
        emailVariables: {
          title: formData.title,
          message: formData.message
        },
        entityType: 'announcement',
        entityId: 'broadcast'
      });

      toast.success(t({
        en: `Sent to ${targetedEmails.length} users`,
        ar: `أُرسل لـ ${targetedEmails.length} مستخدم`
      }));
      setFormData({ title: '', message: '', target_roles: [], target_regions: [], target_sectors: [], scheduled_date: '', channels: ['in_app'] });

    } catch (error) {
      toast.error(t({ en: 'Failed to send announcement', ar: 'فشل إرسال الإعلان' }));
      console.error(error);
    }
  };

  const toggleRole = (role) => {
    setFormData(prev => ({
      ...prev,
      target_roles: prev.target_roles.includes(role)
        ? prev.target_roles.filter(r => r !== role)
        : [...prev.target_roles, role]
    }));
  };

  const toggleChannel = (channel) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Targeted Announcement', ar: 'الإعلان المستهدف' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            {t({ en: 'Title', ar: 'العنوان' })}
          </label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={t({ en: 'Announcement title', ar: 'عنوان الإعلان' })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            {t({ en: 'Message', ar: 'الرسالة' })}
          </label>
          <Textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={4}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            <Users className="h-4 w-4 inline mr-1" />
            {t({ en: 'Target Audience', ar: 'الجمهور المستهدف' })}
          </label>
          <div className="flex flex-wrap gap-2">
            {['admin', 'user', 'municipality_admin', 'startup_user', 'researcher'].map(role => (
              <button
                key={role}
                onClick={() => toggleRole(role)}
                className={`px-3 py-1.5 rounded border text-xs ${formData.target_roles.includes(role) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300'}`}
              >
                {role.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            {t({ en: 'Channels', ar: 'القنوات' })}
          </label>
          <div className="flex flex-wrap gap-2">
            {['in_app', 'email', 'sms'].map(channel => (
              <button
                key={channel}
                onClick={() => toggleChannel(channel)}
                className={`px-3 py-1.5 rounded border text-xs ${formData.channels.includes(channel) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'}`}
              >
                {channel.replace(/_/g, ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            {t({ en: 'Schedule (optional)', ar: 'الجدولة (اختياري)' })}
          </label>
          <Input
            type="datetime-local"
            value={formData.scheduled_date}
            onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={!formData.title || !formData.message || isNotifying}
          className="w-full bg-indigo-600"
        >
          {isNotifying ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          {formData.scheduled_date
            ? t({ en: 'Schedule Announcement', ar: 'جدولة الإعلان' })
            : t({ en: 'Send Now', ar: 'إرسال الآن' })
          }
        </Button>
      </CardContent>
    </Card>
  );
}