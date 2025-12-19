import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { usePrompt } from '@/hooks/usePrompt';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  AlertCircle, CheckCircle2, Clock, TrendingUp, Target, 
  FileText, Users, Calendar, Loader2, Sparkles, Zap, BookOpen 
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import MyWeekAhead from '../components/MyWeekAhead';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { WORKLOAD_PRIORITIES_PROMPT_TEMPLATE, WORKLOAD_PRIORITIES_SCHEMA, formatWorkItemsForPrioritization } from '@/lib/ai/prompts/workload/prioritization';

function MyWorkloadDashboard() {
  const { language, isRTL, t } = useLanguage();
  const [aiPriorities, setAiPriorities] = useState(null);
  const { invoke: invokeAI, status, isLoading: loadingAI, rateLimitInfo, isAvailable } = usePrompt(null);
  const { user } = useAuth();

  const { data: myChallenges = [] } = useQuery({
    queryKey: ['my-challenges', user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('challenges').select('*').eq('is_deleted', false);
      return data?.filter(c => c.created_by === user?.email || c.reviewer === user?.email) || [];
    },
    enabled: !!user
  });

  const { data: myPilots = [] } = useQuery({
    queryKey: ['my-pilots', user?.email],
    queryFn: async () => {
      const { data } = await supabase
        .from('pilots')
        .select('*')
        .eq('is_deleted', false);
      return data?.filter(p => p.created_by === user?.email || p.team?.some(t => t.email === user?.email)) || [];
    },
    enabled: !!user
  });

  const { data: myTasks = [] } = useQuery({
    queryKey: ['my-tasks', user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('tasks').select('*');
      return data?.filter(t => t.assigned_to === user?.email || t.created_by === user?.email) || [];
    },
    enabled: !!user
  });

  const { data: myExpertAssignments = [] } = useQuery({
    queryKey: ['my-expert-assignments', user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('expert_assignments').select('*');
      return data?.filter(a => a.expert_email === user?.email) || [];
    },
    enabled: !!user
  });

  const generateAIPriorities = async () => {
    const workItems = formatWorkItemsForPrioritization({
      challenges: myChallenges,
      pilots: myPilots,
      tasks: myTasks
    });

    const { success, data } = await invokeAI({
      prompt: WORKLOAD_PRIORITIES_PROMPT_TEMPLATE({ workItems }),
      response_json_schema: WORKLOAD_PRIORITIES_SCHEMA
    });

    if (success) {
      setAiPriorities(data.priorities || []);
    }
  };

  const urgentChallenges = myChallenges.filter(c => c.priority === 'tier_1' && c.status === 'under_review');
  const overdueTasks = myTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed');
  const activePilots = myPilots.filter(p => ['active', 'monitoring'].includes(p.stage));
  const pendingExpertReviews = myExpertAssignments.filter(a => a.status === 'accepted' || a.status === 'in_progress');
  const overdueExpertReviews = myExpertAssignments.filter(a => a.due_date && new Date(a.due_date) < new Date() && a.status !== 'completed');

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {t({ en: 'My Workload', ar: 'عبء عملي' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Unified view of all your responsibilities', ar: 'عرض موحد لجميع مسؤولياتك' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={generateAIPriorities} disabled={loadingAI || !isAvailable} className="bg-purple-600">
            {loadingAI ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'AI Prioritize', ar: 'الأولوية بالذكاء' })}
          </Button>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        </div>
      </div>

      {/* AI Priorities */}
      {aiPriorities && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'Top 3 Priorities for Today', ar: 'أولوياتك الـ3 اليوم' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiPriorities.map((priority, i) => (
              <div key={i} className="p-4 bg-white rounded-lg border-2 border-purple-200">
                <div className="flex items-start gap-3">
                  <Badge className="bg-purple-600 text-lg">{i + 1}</Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{priority.item}</h3>
                    <p className="text-sm text-slate-600 mt-1">{priority.urgency_reason}</p>
                    <p className="text-sm text-blue-700 mt-2">
                      <Zap className="h-4 w-4 inline mr-1" />
                      {priority.recommended_action}
                    </p>
                    <Badge variant="outline" className="mt-2">{priority.estimated_minutes} min</Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Workload Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'My Challenges', ar: 'تحدياتي' })}</p>
                <p className="text-3xl font-bold text-blue-600">{myChallenges.length}</p>
                {urgentChallenges.length > 0 && (
                  <Badge className="mt-2 bg-red-600">{urgentChallenges.length} {t({ en: 'urgent', ar: 'عاجل' })}</Badge>
                )}
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'My Pilots', ar: 'تجاربي' })}</p>
                <p className="text-3xl font-bold text-purple-600">{myPilots.length}</p>
                <Badge className="mt-2 bg-green-600">{activePilots.length} {t({ en: 'active', ar: 'نشط' })}</Badge>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'My Tasks', ar: 'مهامي' })}</p>
                <p className="text-3xl font-bold text-amber-600">{myTasks.length}</p>
                {overdueTasks.length > 0 && (
                  <Badge className="mt-2 bg-red-600">{overdueTasks.length} {t({ en: 'overdue', ar: 'متأخر' })}</Badge>
                )}
              </div>
              <CheckCircle2 className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Completion Rate', ar: 'معدل الإكمال' })}</p>
                <p className="text-3xl font-bold text-green-600">
                  {myTasks.length > 0 ? Math.round((myTasks.filter(t => t.status === 'completed').length / myTasks.length) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Week Ahead Preview */}
      <MyWeekAhead />

      {/* Expert Assignments Card */}
      {myExpertAssignments.length > 0 && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <BookOpen className="h-5 w-5" />
                {t({ en: 'My Expert Assignments', ar: 'مهامي كخبير' })}
              </CardTitle>
              <Link to={createPageUrl('ExpertAssignmentQueue')}>
                <Button size="sm" className="bg-purple-600">
                  {t({ en: 'View All', ar: 'عرض الكل' })}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold text-blue-600">{pendingExpertReviews.length}</p>
                <p className="text-xs text-slate-600">{t({ en: 'In Progress', ar: 'قيد التنفيذ' })}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold text-red-600">{overdueExpertReviews.length}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Overdue', ar: 'متأخر' })}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold text-green-600">
                  {myExpertAssignments.filter(a => a.status === 'completed').length}
                </p>
                <p className="text-xs text-slate-600">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
              </div>
            </div>

            <div className="space-y-2">
              {myExpertAssignments.filter(a => a.status !== 'completed').slice(0, 3).map((assignment) => (
                <div key={assignment.id} className="p-3 bg-white rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={
                      assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      assignment.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }>
                      {assignment.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {assignment.assignment_type}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{assignment.entity_type?.replace(/_/g, ' ')}</p>
                  {assignment.due_date && (
                    <p className="text-xs text-slate-600 mt-1">
                      {t({ en: 'Due:', ar: 'موعد:' })} {assignment.due_date}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Items by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'My Active Challenges', ar: 'تحدياتي النشطة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myChallenges.slice(0, 5).map((challenge) => (
                <Link key={challenge.id} to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}>
                  <div className="p-3 border rounded-lg hover:bg-blue-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{challenge.code}</Badge>
                          <Badge className={challenge.priority === 'tier_1' ? 'bg-red-600' : 'bg-blue-600'}>
                            {challenge.status}
                          </Badge>
                        </div>
                        <p className="font-medium text-slate-900 text-sm">{challenge.title_en}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {myChallenges.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  {t({ en: 'No active challenges', ar: 'لا توجد تحديات نشطة' })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'My Active Pilots', ar: 'تجاربي النشطة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myPilots.slice(0, 5).map((pilot) => (
                <Link key={pilot.id} to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
                  <div className="p-3 border rounded-lg hover:bg-purple-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{pilot.code}</Badge>
                          <Badge>{pilot.stage}</Badge>
                        </div>
                        <p className="font-medium text-slate-900 text-sm">{pilot.title_en}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {myPilots.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  {t({ en: 'No active pilots', ar: 'لا توجد تجارب نشطة' })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Quick Actions', ar: 'إجراءات سريعة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to={createPageUrl('MyApprovals')}>
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t({ en: 'Approvals', ar: 'الموافقات' })}
              </Button>
            </Link>
            <Link to={createPageUrl('MyDeadlines')}>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                {t({ en: 'Deadlines', ar: 'المواعيد' })}
              </Button>
            </Link>
            <Link to={createPageUrl('MyPerformance')}>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                {t({ en: 'Performance', ar: 'الأداء' })}
              </Button>
            </Link>
            <Link to={createPageUrl('MyApplications')}>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                {t({ en: 'Applications', ar: 'الطلبات' })}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Last 7 Days Activity', ar: 'نشاط آخر 7 أيام' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{t({ en: 'Challenges created', ar: 'تحديات منشأة' })}</span>
              <Badge variant="outline">
                {myChallenges.filter(c => new Date(c.created_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{t({ en: 'Tasks completed', ar: 'مهام مكتملة' })}</span>
              <Badge variant="outline">
                {myTasks.filter(t => t.status === 'completed' && new Date(t.updated_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{t({ en: 'Pilot milestones reached', ar: 'معالم التجارب المحققة' })}</span>
              <Badge variant="outline">
                {myPilots.reduce((acc, p) => acc + (p.milestones?.filter(m => m.status === 'completed').length || 0), 0)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(MyWorkloadDashboard, { requiredPermissions: [] });