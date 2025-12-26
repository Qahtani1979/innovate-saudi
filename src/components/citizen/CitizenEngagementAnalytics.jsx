import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { Users, TrendingUp, MapPin, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useCitizenFeedback } from '@/hooks/useCitizenFeedback';

export default function CitizenEngagementAnalytics() {
  const { language, t } = useLanguage();

  const { data: feedback = [] } = useCitizenFeedback({
    isPublished: undefined // Get all feedback for analytics
  });

  const totalSubmissions = feedback.length;
  // @ts-ignore
  const avgVotes = feedback.reduce((acc, f) => acc + (f.vote_count || 0), 0) / (totalSubmissions || 1);

  const topicCounts = feedback.reduce((acc, f) => {
    // @ts-ignore
    const topic = f.feedback_type || 'general';
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {});

  const topicData = Object.entries(topicCounts).map(([topic, count]) => ({
    topic: topic.replace(/_/g, ' '),
    count
  }));

  const sentimentData = [
    // @ts-ignore
    { name: 'Positive', value: feedback.filter(f => f.sentiment === 'positive').length, color: '#10b981' },
    // @ts-ignore
    { name: 'Neutral', value: feedback.filter(f => f.sentiment === 'neutral').length, color: '#6b7280' },
    // @ts-ignore
    { name: 'Negative', value: feedback.filter(f => f.sentiment === 'negative').length, color: '#ef4444' }
  ].filter(d => d.value > 0);

  const recentTrend = feedback
    .slice(0, 30)
    .reduce((acc, f) => {
      // @ts-ignore
      const month = new Date(f.created_at || f.created_date).toLocaleDateString('en-US', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

  const trendData = Object.entries(recentTrend).map(([month, count]) => ({ month, count }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          {t({ en: 'Citizen Engagement Analytics', ar: 'تحليلات مشاركة المواطنين' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <MessageSquare className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{totalSubmissions}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Ideas', ar: 'إجمالي الأفكار' })}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{avgVotes.toFixed(0)}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg Votes', ar: 'متوسط الأصوات' })}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <MapPin className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{new Set(feedback.map(f => f.location)).size}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Locations', ar: 'المواقع' })}</p>
          </div>
        </div>

        {topicData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3">
              {t({ en: 'Topics Distribution', ar: 'توزيع المواضيع' })}
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topicData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="topic" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {sentimentData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3">
              {t({ en: 'Sentiment Analysis', ar: 'تحليل المشاعر' })}
            </h4>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={sentimentData} dataKey="value" cx="50%" cy="50%" outerRadius={60} label>
                  {sentimentData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}