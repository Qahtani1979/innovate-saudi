import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../LanguageContext';
import { Bell, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { useAllUserProfiles } from '@/hooks/useUserProfiles';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function AutomatedStakeholderNotifier({ entity, entityType }) {
  const { t } = useLanguage();
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const { data: users = [] } = useAllUserProfiles();
  const { notify, isNotifying } = useNotificationSystem();

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const stakeholderGroups = {
    challenge: ['municipality_admin', 'user', 'startup_user'],
    pilot: ['municipality_admin', 'user', 'startup_user'],
    rd_project: ['researcher', 'user', 'municipality_admin'],
    program: ['user', 'mentor', 'partner']
  };

  const sendNotifications = async () => {
    const { success, data } = await invokeAI({
      prompt: `Generate stakeholder notification for:

ENTITY TYPE: ${entityType}
ENTITY NAME: ${entity.title_en || entity.name_en}
STATUS: ${entity.status || entity.stage}
RECIPIENTS: ${selectedRecipients.join(', ')}

Create:
1. Subject line (concise, actionable)
2. Email body (personalized per recipient group)
3. Key action items
4. Links to relevant pages`,
      response_json_schema: {
        type: "object",
        properties: {
          notifications: {
            type: "array",
            items: {
              type: "object",
              properties: {
                recipient_group: { type: "string" },
                subject: { type: "string" },
                body: { type: "string" },
                action_items: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    if (success && data) {
      let totalSent = 0;
      for (const notif of data.notifications || []) {
        // Find users in this group
        const targetedUsers = users.filter(u => u.role === notif.recipient_group || u.persona_type === notif.recipient_group);
        const emails = targetedUsers.map(u => u.email).filter(Boolean);

        if (emails.length > 0) {
          await notify({
            type: 'stakeholder_update',
            entityType: entityType,
            entityId: entity.id,
            recipientEmails: emails,
            title: notif.subject,
            message: notif.body,
            metadata: {
              action_items: notif.action_items,
              recipient_group: notif.recipient_group
            }
          });
          totalSent += emails.length;
        }
      }

      toast.success(t({
        en: `Notifications sent to ${totalSent} users across ${data.notifications?.length} groups`,
        ar: `تنبيهات أُرسلت لـ ${totalSent} مستخدم عبر ${data.notifications?.length} مجموعات`
      }));
    }
  };

  const recipients = stakeholderGroups[entityType] || [];

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          {t({ en: 'Stakeholder Notifier', ar: 'مُعلم أصحاب المصلحة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} />

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">
              {t({ en: 'Select recipient groups:', ar: 'اختر مجموعات المستلمين:' })}
            </p>
            <div className="space-y-2">
              {recipients.map((group) => (
                <div key={group} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded">
                  <Checkbox
                    checked={selectedRecipients.includes(group)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRecipients([...selectedRecipients, group]);
                      } else {
                        setSelectedRecipients(selectedRecipients.filter(r => r !== group));
                      }
                    }}
                  />
                  <Badge variant="outline" className="capitalize">{group.replace(/_/g, ' ')}</Badge>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={sendNotifications}
            disabled={isLoading || isNotifying || selectedRecipients.length === 0 || !isAvailable}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
          >
            {(isLoading || isNotifying) ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Send AI-Generated Notifications', ar: 'إرسال إشعارات ذكية' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
