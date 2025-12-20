import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Users, TrendingUp, MessageSquare, MapPin, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function CitizenEngagementDashboard() {
  const { language, t } = useLanguage();

  const { data: ideas = [] } = useQuery({
    queryKey: ['citizen-ideas'],
    queryFn: () => base44.entities.CitizenIdea.list(),
    initialData: []
  });

  const totalVotes = ideas.reduce((sum, i) => sum + (i.vote_count || 0), 0);
  const totalComments = ideas.reduce((sum, i) => sum + (i.comment_count || 0), 0);
  const conversionRate = ideas.length > 0 
    ? Math.round((ideas.filter(i => i.status === 'converted_to_challenge').length / ideas.length) * 100)
    : 0;

  const categoryData = ideas.reduce((acc, idea) => {
    const cat = idea.category || 'other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  const sentimentData = [
    { name: 'Positive', value: ideas.filter(i => i.ai_classification?.sentiment === 'positive').length },
    { name: 'Neutral', value: ideas.filter(i => i.ai_classification?.sentiment === 'neutral').length },
    { name: 'Negative', value: ideas.filter(i => i.ai_classification?.sentiment === 'negative').length }
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const topIdeas = [...ideas]
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, 5);

  return (
    <PageLayout>
      <PageHeader
        title={{ en: 'Citizen Engagement Analytics', ar: 'تحليلات مشاركة المواطنين' }}
        subtitle={{ en: 'Track citizen participation, trending topics, and sentiment', ar: 'تتبع مشاركة المواطنين والمواضيع الرائجة والمشاعر' }}
        icon={<BarChart3 className="h-6 w-6 text-white" />}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{ideas.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Ideas Submitted', ar: 'أفكار مقدمة' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{totalVotes}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Votes', ar: 'إجمالي الأصوات' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{totalComments}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Comments', ar: 'تعليقات' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <MessageSquare className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-indigo-600">{conversionRate}%</p>
            <p className="text-sm text-slate-600">{t({ en: 'Conversion Rate', ar: 'معدل التحويل' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Ideas by Category', ar: 'الأفكار حسب الفئة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Sentiment Analysis', ar: 'تحليل المشاعر' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Ideas */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Top Voted Ideas', ar: 'الأفكار الأكثر تصويتاً' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topIdeas.map((idea, i) => (
              <div key={idea.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded border">
                <Badge className="bg-indigo-600">#{i + 1}</Badge>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-slate-900">{idea.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span>{idea.vote_count || 0} votes</span>
                    {idea.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {idea.location}
                      </span>
                    )}
                  </div>
                </div>
                <Badge className={idea.status === 'converted_to_challenge' ? 'bg-green-600' : 'bg-slate-300'}>
                  {idea.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(CitizenEngagementDashboard, { requiredPermissions: [], requiredRoles: ['Communication Manager', 'GDISB Strategy Lead'] });