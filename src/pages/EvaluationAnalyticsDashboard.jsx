import { useEvaluations } from '@/hooks/useEvaluations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../components/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Award, Clock, Target, Users, CheckCircle2 } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function EvaluationAnalyticsDashboard() {
  const { language, isRTL, t } = useLanguage();

  const { useAllEvaluations, useAllExperts, useAllAssignments } = useEvaluations();

  const { data: evaluations = [] } = useAllEvaluations();
  const { data: experts = [] } = useAllExperts();
  const { data: assignments = [] } = useAllAssignments();

  // Analytics calculations
  const evaluationsByEntityType = evaluations.reduce((acc, e) => {
    acc[e.entity_type] = (acc[e.entity_type] || 0) + 1;
    return acc;
  }, {});

  const evaluationsByRecommendation = evaluations.reduce((acc, e) => {
    acc[e.recommendation] = (acc[e.recommendation] || 0) + 1;
    return acc;
  }, {});

  const avgScoreByExpert = {};
  const evalCountByExpert = {};
  evaluations.forEach(e => {
    if (!avgScoreByExpert[e.expert_email]) {
      avgScoreByExpert[e.expert_email] = [];
    }
    avgScoreByExpert[e.expert_email].push(e.overall_score);
    evalCountByExpert[e.expert_email] = (evalCountByExpert[e.expert_email] || 0) + 1;
  });

  const topExperts = Object.entries(evalCountByExpert)
    .map(([email, count]) => ({
      email,
      count,
      avgScore: avgScoreByExpert[email].reduce((a, b) => a + b, 0) / avgScoreByExpert[email].length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const avgResponseTime = assignments.filter(a => a.completed_date && a.assigned_date)
    .reduce((sum, a) => {
      const hours = (new Date(a.completed_date) - new Date(a.assigned_date)) / (1000 * 60 * 60);
      return sum + hours;
    }, 0) / Math.max(assignments.filter(a => a.completed_date).length, 1);

  const consensusRate = evaluations.filter(e => e.is_consensus_reached).length / Math.max(evaluations.length, 1) * 100;

  const chartData = Object.entries(evaluationsByEntityType).map(([type, count]) => ({
    name: type.replace(/_/g, ' '),
    count
  }));

  const pieData = Object.entries(evaluationsByRecommendation).map(([rec, count]) => ({
    name: rec,
    value: count
  }));

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 to-blue-900 bg-clip-text text-transparent">
          {t({ en: 'Evaluation Analytics Dashboard', ar: 'لوحة تحليلات التقييم' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Cross-entity evaluation metrics and expert performance', ar: 'مقاييس التقييم متعددة الكيانات وأداء الخبراء' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <Award className="h-8 w-8 text-purple-600 mb-2" />
            <p className="text-3xl font-bold text-purple-600">{evaluations.length}</p>
            <p className="text-sm text-slate-600">Total Evaluations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Users className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-3xl font-bold text-blue-600">{Object.keys(evalCountByExpert).length}</p>
            <p className="text-sm text-slate-600">Active Evaluators</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Clock className="h-8 w-8 text-amber-600 mb-2" />
            <p className="text-3xl font-bold text-amber-600">{Math.round(avgResponseTime)}</p>
            <p className="text-sm text-slate-600">Avg Response (hrs)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-3xl font-bold text-green-600">{Math.round(consensusRate)}%</p>
            <p className="text-sm text-slate-600">Consensus Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Target className="h-8 w-8 text-teal-600 mb-2" />
            <p className="text-3xl font-bold text-teal-600">
              {(evaluations.reduce((s, e) => s + e.overall_score, 0) / Math.max(evaluations.length, 1)).toFixed(1)}
            </p>
            <p className="text-sm text-slate-600">Avg Score</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Evaluations by Entity Type', ar: 'التقييمات حسب نوع الكيان' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Recommendations Distribution', ar: 'توزيع التوصيات' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Top 10 Evaluators', ar: 'أفضل 10 مقيّمين' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topExperts.map((expert, idx) => (
              <div key={expert.email} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600">
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{expert.email}</p>
                  <p className="text-xs text-slate-500">{expert.count} evaluations</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">{expert.avgScore.toFixed(1)}</p>
                  <p className="text-xs text-slate-500">Avg Score</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(EvaluationAnalyticsDashboard, { requireAdmin: true });
