import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Bell, Mail, Smartphone, MessageSquare } from 'lucide-react';

export default function AINotificationRouterPanel({ notification }) {
  const { language, t } = useLanguage();

  const analyzeUrgency = (notif) => {
    const urgentKeywords = ['overdue', 'critical', 'urgent', 'deadline', 'approval required'];
    const content = (notif.title + ' ' + notif.message).toLowerCase();
    
    const isCritical = urgentKeywords.some(kw => content.includes(kw));
    const isHigh = notif.priority === 'high' || content.includes('important');
    
    if (isCritical) return 'critical';
    if (isHigh) return 'high';
    return 'medium';
  };

  const getRoutingChannels = (urgency) => {
    if (urgency === 'critical') return ['email', 'sms', 'in_app'];
    if (urgency === 'high') return ['email', 'in_app'];
    if (urgency === 'medium') return ['in_app'];
    return ['digest'];
  };

  const urgency = analyzeUrgency(notification);
  const channels = getRoutingChannels(urgency);

  const urgencyColors = {
    critical: 'bg-red-50 border-red-300 text-red-700',
    high: 'bg-orange-50 border-orange-300 text-orange-700',
    medium: 'bg-blue-50 border-blue-300 text-blue-700',
    low: 'bg-slate-50 border-slate-300 text-slate-700'
  };

  return (
    <Card className={`border-2 ${urgencyColors[urgency]}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bell className="h-4 w-4" />
            {t({ en: 'Smart Routing', ar: 'التوجيه الذكي' })}
          </CardTitle>
          <Badge className={urgency === 'critical' ? 'bg-red-600' : urgency === 'high' ? 'bg-orange-600' : 'bg-blue-600'}>
            {urgency.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-slate-700 mb-2">
            {t({ en: 'Delivery Channels:', ar: 'قنوات التسليم:' })}
          </p>
          <div className="flex flex-wrap gap-2">
            {channels.includes('email') && (
              <Badge variant="outline" className="text-xs">
                <Mail className="h-3 w-3 mr-1" /> Email
              </Badge>
            )}
            {channels.includes('sms') && (
              <Badge variant="outline" className="text-xs">
                <Smartphone className="h-3 w-3 mr-1" /> SMS
              </Badge>
            )}
            {channels.includes('in_app') && (
              <Badge variant="outline" className="text-xs">
                <MessageSquare className="h-3 w-3 mr-1" /> In-App
              </Badge>
            )}
            {channels.includes('digest') && (
              <Badge variant="outline" className="text-xs">
                Daily Digest
              </Badge>
            )}
          </div>
        </div>

        <div className="p-3 bg-white/50 rounded text-xs text-slate-600">
          {urgency === 'critical' && t({ 
            en: 'Critical notifications sent immediately via all channels', 
            ar: 'الإشعارات الحرجة تُرسل فوراً عبر جميع القنوات' 
          })}
          {urgency === 'high' && t({ 
            en: 'High priority sent via email and in-app', 
            ar: 'الأولوية العالية تُرسل عبر البريد وداخل التطبيق' 
          })}
          {urgency === 'medium' && t({ 
            en: 'Standard notifications via in-app only', 
            ar: 'الإشعارات القياسية عبر داخل التطبيق فقط' 
          })}
        </div>
      </CardContent>
    </Card>
  );
}