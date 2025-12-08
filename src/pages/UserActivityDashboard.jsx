import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Activity, TrendingUp, AlertTriangle, Users, Sparkles, Loader2, Eye, Clock, Target, Shield } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import FeatureUsageHeatmap from '../components/access/FeatureUsageHeatmap';
import UserHealthScores from '../components/access/UserHealthScores';
import PredictiveChurnAnalysis from '../components/access/PredictiveChurnAnalysis';
import ProtectedPage from '../components/permissions/ProtectedPage';

function UserActivityDashboard() {
  const { language, isRTL, t } = useLanguage();
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [anomalies, setAnomalies] = useState(null);

  const { data: accessLogs = [] } = useQuery({
    queryKey: ['access-logs'],
    queryFn: () => base44.entities.AccessLog.list('-created_date', 500)
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const handleGenerateInsights = async () => {
    setAiLoading(true);
    try {
      const topUsers = Object.entries(
        accessLogs.reduce((acc, log) => {
          acc[log.user_email] = (acc[log.user_email] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1]).slice(0, 10);

      const actionBreakdown = accessLogs.reduce((acc, log) => {
        acc[log.action_type] = (acc[log.action_type] || 0) + 1;
        return acc;
      }, {});

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze user activity patterns for a Saudi municipal innovation platform:

Total Actions: ${accessLogs.length}
Total Users: ${users.length}
Active Users (last 30 days): ${topUsers.length}

Top 10 Most Active Users:
${topUsers.map(([email, count]) => `${email}: ${count} actions`).join('\n')}

Action Breakdown:
${Object.entries(actionBreakdown).map(([action, count]) => `${action}: ${count}`).join('\n')}

Provide bilingual insights on:
1. User engagement health
2. Usage patterns and trends
3. Productivity insights
4. Recommendations for increasing adoption`,
        response_json_schema: {
          type: 'object',
          properties: {
            engagement_health: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' }, score: { type: 'number' } } },
            usage_patterns: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            productivity_insights: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            adoption_recommendations: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
          }
        }
      });
      setAiInsights(result);
    } catch (error) {
      toast.error(t({ en: 'AI analysis failed', ar: 'فشل التحليل الذكي' }));
    } finally {
      setAiLoading(false);
    }
  };

  const handleDetectAnomalies = async () => {
    setAiLoading(true);
    try {
      const suspiciousLogs = accessLogs.filter(log => log.is_suspicious || (log.anomaly_score || 0) > 70);
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Detect access anomalies in this Saudi municipal innovation platform:

Total Access Logs: ${accessLogs.length}
Flagged as Suspicious: ${suspiciousLogs.length}

Recent Activity Patterns:
${accessLogs.slice(0, 20).map(log => `${log.user_email}: ${log.action_type} on ${log.entity_type} at ${log.created_date}`).join('\n')}

Identify:
1. Unusual access patterns (time, frequency, entity types)
2. Potential security risks
3. Users with abnormal behavior
4. Recommendations for monitoring`,
        response_json_schema: {
          type: 'object',
          properties: {
            unusual_patterns: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' }, severity: { type: 'string' } } } },
            security_risks: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            flagged_users: { type: 'array', items: { type: 'string' } },
            monitoring_recommendations: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
          }
        }
      });
      setAnomalies(result);
      toast.success(t({ en: 'Anomaly detection complete', ar: 'اكتمل اكتشاف الشذوذ' }));
    } catch (error) {
      toast.error(t({ en: 'Anomaly detection failed', ar: 'فشل اكتشاف الشذوذ' }));
    } finally {
      setAiLoading(false);
    }
  };

  const activityData = accessLogs.slice(0, 30).reduce((acc, log) => {
    const date = new Date(log.created_date).toLocaleDateString();
    const existing = acc.find(d => d.date === date);
    if (existing) existing.count++;
    else acc.push({ date, count: 1 });
    return acc;
  }, []).reverse();

  const actionTypeData = Object.entries(
    accessLogs.reduce((acc, log) => {
      acc[log.action_type] = (acc[log.action_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '📊 User Activity & Analytics', ar: '📊 نشاط المستخدمين والتحليلات' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Monitor user engagement, detect anomalies, and optimize platform adoption', ar: 'مراقبة تفاعل المستخدمين واكتشاف الشذوذ وتحسين اعتماد المنصة' })}
        </p>
      </div>

      {/* AI Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={handleGenerateInsights} disabled={aiLoading} className="bg-purple-600">
          {aiLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {t({ en: 'Generate AI Insights', ar: 'توليد رؤى ذكية' })}
        </Button>
        <Button onClick={handleDetectAnomalies} disabled={aiLoading} variant="outline" className="border-red-300 text-red-700">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {t({ en: 'Detect Anomalies', ar: 'كشف الشذوذ' })}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{accessLogs.length}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Total Actions', ar: 'إجمالي الإجراءات' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{users.length}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Total Users', ar: 'إجمالي المستخدمين' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">
              {users.length > 0 ? (accessLogs.length / users.length).toFixed(1) : 0}
            </p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Avg Actions/User', ar: 'متوسط الإجراءات/مستخدم' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{accessLogs.filter(l => l.is_suspicious).length}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Suspicious Activity', ar: 'نشاط مشبوه' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Activity Insights', ar: 'رؤى النشاط الذكية' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-slate-900">{t({ en: 'Engagement Health', ar: 'صحة التفاعل' })}</h4>
                <div className="text-3xl font-bold text-purple-600">{aiInsights.engagement_health?.score}/100</div>
              </div>
              <p className="text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {aiInsights.engagement_health?.[language] || aiInsights.engagement_health?.en}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">{t({ en: 'Usage Patterns', ar: 'أنماط الاستخدام' })}</h4>
                <ul className="space-y-1 text-sm">
                  {aiInsights.usage_patterns?.map((pattern, i) => (
                    <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      📊 {pattern[language] || pattern.en}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">{t({ en: 'Productivity Insights', ar: 'رؤى الإنتاجية' })}</h4>
                <ul className="space-y-1 text-sm">
                  {aiInsights.productivity_insights?.map((insight, i) => (
                    <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      💡 {insight[language] || insight.en}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-900 mb-2">{t({ en: 'Adoption Recommendations', ar: 'توصيات الاعتماد' })}</h4>
              <ul className="space-y-1 text-sm">
                {aiInsights.adoption_recommendations?.map((rec, i) => (
                  <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    🎯 {rec[language] || rec.en}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Anomaly Detection */}
      {anomalies && (
        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              {t({ en: 'AI Anomaly Detection', ar: 'اكتشاف الشذوذ الذكي' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {anomalies.unusual_patterns?.map((pattern, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border-l-4 border-red-500">
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-slate-700 flex-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {pattern[language] || pattern.en}
                    </p>
                    <Badge className={
                      pattern.severity === 'high' ? 'bg-red-600' :
                      pattern.severity === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'
                    }>
                      {pattern.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {anomalies.flagged_users?.length > 0 && (
              <div className="p-4 bg-red-100 rounded-lg border border-red-300">
                <h4 className="font-semibold text-red-900 mb-2">{t({ en: 'Flagged Users', ar: 'مستخدمون مميزون' })}</h4>
                <div className="flex flex-wrap gap-2">
                  {anomalies.flagged_users.map((user, i) => (
                    <Badge key={i} className="bg-red-600">{user}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Activity Timeline (Last 30 Days)', ar: 'الجدول الزمني للنشاط (آخر 30 يوماً)' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Actions by Type', ar: 'الإجراءات حسب النوع' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={actionTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {actionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage & Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureUsageHeatmap />
        <UserHealthScores users={users} />
      </div>

      {/* Churn Analysis */}
      <PredictiveChurnAnalysis users={users} />

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Most Active Users', ar: 'المستخدمون الأكثر نشاطاً' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(
              accessLogs.reduce((acc, log) => {
                acc[log.user_email] = (acc[log.user_email] || 0) + 1;
                return acc;
              }, {})
            )
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([email, count], i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{email}</p>
                      <p className="text-xs text-slate-500">{count} {t({ en: 'actions', ar: 'إجراء' })}</p>
                    </div>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${(count / accessLogs.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-600">{((count / accessLogs.length) * 100).toFixed(1)}%</p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(UserActivityDashboard, { requiredPermissions: ['analytics_view_all', 'user_manage'] });