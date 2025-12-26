import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { usePersonalizedDashboardData } from '@/hooks/usePersonalizedDashboardData';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Sparkles, CheckCircle, AlertCircle, Calendar, TrendingUp, Loader2, Target, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';

function PersonalizedDashboard() {
  const { t, isRTL } = useLanguage();
  const { user: currentUser } = useAuth();
  const [aiSummary, setAiSummary] = useState(null);
  const { invokeAI, status, isLoading: loading, rateLimitInfo, isAvailable } = useAIWithFallback();

  const { myTasks, myApprovals, myChallenges, myPilots } = usePersonalizedDashboardData(currentUser?.email);

  const generateAIDailySummary = async () => {
    const { success, data } = await invokeAI({
      prompt: `Generate a personalized daily briefing for this user on the Saudi Municipal Innovation Platform:

User: ${currentUser?.full_name}
Role: ${currentUser?.role}
Department: ${currentUser?.department || 'N/A'}

Today's Workload:
- ${myTasks.length} pending tasks
- ${myApprovals.length} approvals waiting
- ${myChallenges.length} active challenges
- ${myPilots.length} active pilots

Recent activities and priorities need to be summarized.

Provide:
1. A motivational greeting
2. Top 3 priorities for today
3. Quick wins (easy tasks to complete)
4. Important deadlines this week
5. Opportunities to explore`,
      response_json_schema: {
        type: 'object',
        properties: {
          greeting: { type: 'string' },
          top_priorities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                urgency: { type: 'string' }
              }
            }
          },
          quick_wins: {
            type: 'array',
            items: { type: 'string' }
          },
          deadlines: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                item: { type: 'string' },
                date: { type: 'string' }
              }
            }
          },
          opportunities: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });

    if (success) {
      setAiSummary(data);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: `Welcome back, ${currentUser?.full_name}`, ar: `مرحباً بعودتك، ${currentUser?.full_name}` })}
        </h1>
        <p className="text-xl text-white/90">
          {new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* AI Daily Summary */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              {t({ en: 'Your Day Ahead', ar: 'يومك القادم' })}
            </CardTitle>
            <Button onClick={generateAIDailySummary} disabled={loading || !isAvailable} size="sm" className="bg-purple-600">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t({ en: 'Generate Summary', ar: 'توليد ملخص' })}
            </Button>
            <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3" />
              <p className="text-sm text-slate-600">{t({ en: 'Analyzing your workload...', ar: 'جاري تحليل عملك...' })}</p>
            </div>
          ) : aiSummary ? (
            <div className="space-y-4">
              <p className="text-lg text-purple-900 font-medium">{aiSummary.greeting}</p>

              <div className="p-4 bg-white rounded-lg border-l-4 border-red-500">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-red-600" />
                  {t({ en: 'Top Priorities Today', ar: 'الأولويات اليوم' })}
                </h4>
                <div className="space-y-2">
                  {aiSummary.top_priorities?.map((priority, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Badge className={
                        priority.urgency === 'high' ? 'bg-red-600' :
                          priority.urgency === 'medium' ? 'bg-orange-600' :
                            'bg-blue-600'
                      }>
                        {idx + 1}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{priority.title}</p>
                        <p className="text-xs text-slate-600">{priority.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  {t({ en: 'Quick Wins', ar: 'إنجازات سريعة' })}
                </h4>
                <ul className="space-y-1 text-sm">
                  {aiSummary.quick_wins?.map((win, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>{win}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {aiSummary.deadlines?.length > 0 && (
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    {t({ en: 'Upcoming Deadlines', ar: 'المواعيد القادمة' })}
                  </h4>
                  <div className="space-y-1 text-sm">
                    {aiSummary.deadlines.map((deadline, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span>{deadline.item}</span>
                        <span className="text-amber-700 font-medium">{deadline.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8">
              {t({ en: 'Click "Generate Summary" to get your personalized daily briefing', ar: 'انقر "توليد ملخص" للحصول على ملخصك اليومي' })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to={createPageUrl('TaskManagement')}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600">{myTasks.length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Pending Tasks', ar: 'المهام المعلقة' })}</p>
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl('MyApprovals')}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-orange-600">{myApprovals.length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Approvals Needed', ar: 'موافقات مطلوبة' })}</p>
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl('MyChallenges')}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-white">
            <CardContent className="pt-6 text-center">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600">{myChallenges.length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Active Challenges', ar: 'التحديات النشطة' })}</p>
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl('MyPilots')}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-600">{myPilots.length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Active Pilots', ar: 'التجارب النشطة' })}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Your Recent Activity', ar: 'نشاطك الأخير' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.description}</p>
                  </div>
                </div>
                {task.due_date && (
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(task.due_date).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(PersonalizedDashboard, { requiredPermissions: [] });
