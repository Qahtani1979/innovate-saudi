import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { MessageSquare, Clock, TrendingUp, Mail, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useCommunicationHub } from '@/hooks/useCommunicationHub';

export default function CommunicationAnalytics() {
  const { language, t } = useLanguage();
  const { messages: messagesQuery, allNotifications: notificationsQuery } = useCommunicationHub();

  const messages = messagesQuery.data || [];
  const notifications = notificationsQuery.data || [];
  const isLoading = messagesQuery.isLoading || notificationsQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const avgResponseTime = messages.length > 0
    ? messages
      .filter(m => m.metadata?.replied_at && m.created_at)
      .reduce((sum, m) => {
        const hours = (new Date(m.metadata.replied_at).getTime() - new Date(m.created_at).getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0) / (messages.filter(m => m.metadata?.replied_at).length || 1)
    : 0;

  const readRate = notifications.length > 0
    ? Math.round((notifications.filter(n => n.is_read).length / notifications.length) * 100)
    : 0;

  const sentimentCounts = {
    positive: messages.filter(m => m.metadata?.sentiment === 'positive').length,
    neutral: messages.filter(m => m.metadata?.sentiment === 'neutral').length,
    negative: messages.filter(m => m.metadata?.sentiment === 'negative').length
  };

  const dailyActivity = messages.reduce((acc, m) => {
    const date = new Date(m.created_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const activityData = Object.entries(dailyActivity)
    .slice(-7)
    .map(([date, count]) => ({ date: date.substring(0, 5), count }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Communication Analytics', ar: 'تحليلات الاتصالات' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Track message effectiveness and engagement', ar: 'تتبع فعالية الرسائل والمشاركة' })}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{messages.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Messages', ar: 'رسائل' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{avgResponseTime.toFixed(1)}h</p>
            <p className="text-sm text-slate-600">{t({ en: 'Avg Response', ar: 'متوسط الاستجابة' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Mail className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{readRate}%</p>
            <p className="text-sm text-slate-600">{t({ en: 'Read Rate', ar: 'معدل القراءة' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-indigo-600">{sentimentCounts.positive}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Positive', ar: 'إيجابي' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Message Activity (Last 7 Days)', ar: 'نشاط الرسائل (آخر 7 أيام)' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={activityData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Sentiment Distribution', ar: 'توزيع المشاعر' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded border-2 border-green-300 text-center">
              <p className="text-3xl font-bold text-green-600">{sentimentCounts.positive}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Positive', ar: 'إيجابي' })}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded border-2 border-yellow-300 text-center">
              <p className="text-3xl font-bold text-yellow-600">{sentimentCounts.neutral}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Neutral', ar: 'محايد' })}</p>
            </div>
            <div className="p-4 bg-red-50 rounded border-2 border-red-300 text-center">
              <p className="text-3xl font-bold text-red-600">{sentimentCounts.negative}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Negative', ar: 'سلبي' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}