import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  GraduationCap, ClipboardCheck, Clock, TrendingUp, CheckCircle2,
  AlertCircle, Star, Calendar, FileText, Users, Award, ArrowRight,
  BarChart3, Target, Zap
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import FirstActionRecommender from '../components/onboarding/FirstActionRecommender';
import ProfileCompletenessCoach from '../components/onboarding/ProfileCompletenessCoach';

function ExpertDashboard() {
  const { language, isRTL, t } = useLanguage();
  const { user, userProfile } = useAuth();

  // Fetch expert profile
  const { data: expertProfile } = useQuery({
    queryKey: ['expert-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expert_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch my assignments
  const { data: myAssignments = [] } = useQuery({
    queryKey: ['expert-assignments', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expert_assignments')
        .select(`
          *,
          expert_panel:expert_panels(name_en, name_ar)
        `)
        .eq('expert_email', user?.email)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.email
  });

  // Fetch my evaluations
  const { data: myEvaluations = [] } = useQuery({
    queryKey: ['expert-evaluations', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expert_evaluations')
        .select('*')
        .eq('evaluator_email', user?.email)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.email
  });

  // Fetch upcoming deadlines
  const { data: upcomingDeadlines = [] } = useQuery({
    queryKey: ['expert-deadlines', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expert_assignments')
        .select('*')
        .eq('expert_email', user?.email)
        .eq('status', 'assigned')
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.email
  });

  // Calculate stats
  const pendingAssignments = myAssignments.filter(a => a.status === 'assigned' || a.status === 'in_progress');
  const completedAssignments = myAssignments.filter(a => a.status === 'completed');
  const completedEvaluations = myEvaluations.filter(e => e.status === 'completed');
  
  // Calculate average score from completed evaluations
  const avgScore = completedEvaluations.length > 0 
    ? (completedEvaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / completedEvaluations.length).toFixed(1)
    : 0;

  // Completion rate
  const totalAssignments = myAssignments.length;
  const completionRate = totalAssignments > 0 
    ? Math.round((completedAssignments.length / totalAssignments) * 100)
    : 0;

  const statusColors = {
    assigned: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const statusLabels = {
    assigned: { en: 'Assigned', ar: 'مُسند' },
    in_progress: { en: 'In Progress', ar: 'قيد التنفيذ' },
    completed: { en: 'Completed', ar: 'مكتمل' },
    cancelled: { en: 'Cancelled', ar: 'ملغى' }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <GraduationCap className="h-8 w-8 text-amber-600" />
            </div>
            {t({ en: 'Expert Dashboard', ar: 'لوحة الخبير' })}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t({ en: 'Manage your evaluations and track your performance', ar: 'إدارة تقييماتك وتتبع أدائك' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl('EvaluationPanel')}>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              {t({ en: 'Start Evaluation', ar: 'بدء التقييم' })}
            </Button>
          </Link>
        </div>
      </div>

      {/* Onboarding Helpers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FirstActionRecommender persona="expert" />
        <ProfileCompletenessCoach />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Pending', ar: 'معلق' })}
                </p>
                <p className="text-3xl font-bold text-yellow-600">{pendingAssignments.length}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Completed', ar: 'مكتمل' })}
                </p>
                <p className="text-3xl font-bold text-green-600">{completedAssignments.length}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Completion Rate', ar: 'معدل الإنجاز' })}
                </p>
                <p className="text-3xl font-bold text-blue-600">{completionRate}%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Avg. Score Given', ar: 'متوسط الدرجات' })}
                </p>
                <p className="text-3xl font-bold text-purple-600">{avgScore}</p>
              </div>
              <Star className="h-10 w-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Assignments */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                {t({ en: 'Pending', ar: 'معلق' })} ({pendingAssignments.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                {t({ en: 'Completed', ar: 'مكتمل' })} ({completedAssignments.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                {t({ en: 'All', ar: 'الكل' })} ({myAssignments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4 space-y-3">
              {pendingAssignments.length === 0 ? (
                <Card className="bg-muted/50">
                  <CardContent className="py-8 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {t({ en: 'No pending assignments. Great job!', ar: 'لا توجد مهام معلقة. عمل رائع!' })}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                pendingAssignments.map((assignment) => (
                  <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={statusColors[assignment.status]}>
                              {t(statusLabels[assignment.status] || { en: assignment.status, ar: assignment.status })}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {assignment.assignment_type}
                            </span>
                          </div>
                          <h4 className="font-medium">
                            {t({ 
                              en: assignment.expert_panel?.name_en || 'Assignment', 
                              ar: assignment.expert_panel?.name_ar || 'مهمة' 
                            })}
                          </h4>
                          {assignment.due_date && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              {t({ en: 'Due:', ar: 'الموعد:' })} {new Date(assignment.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Link to={createPageUrl('EvaluationPanel')}>
                          <Button size="sm" variant="outline">
                            {t({ en: 'Start', ar: 'ابدأ' })}
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-4 space-y-3">
              {completedAssignments.length === 0 ? (
                <Card className="bg-muted/50">
                  <CardContent className="py-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {t({ en: 'No completed assignments yet', ar: 'لا توجد مهام مكتملة بعد' })}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                completedAssignments.slice(0, 5).map((assignment) => (
                  <Card key={assignment.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge className={statusColors[assignment.status]}>
                            {t(statusLabels[assignment.status])}
                          </Badge>
                          <h4 className="font-medium mt-1">
                            {t({ 
                              en: assignment.expert_panel?.name_en || 'Assignment', 
                              ar: assignment.expert_panel?.name_ar || 'مهمة' 
                            })}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {t({ en: 'Completed:', ar: 'اكتمل:' })} {new Date(assignment.completed_at || assignment.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="all" className="mt-4 space-y-3">
              {myAssignments.length === 0 ? (
                <Card className="bg-muted/50">
                  <CardContent className="py-8 text-center">
                    <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {t({ en: 'No assignments found', ar: 'لا توجد مهام' })}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                myAssignments.slice(0, 10).map((assignment) => (
                  <Card key={assignment.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge className={statusColors[assignment.status]}>
                            {t(statusLabels[assignment.status] || { en: assignment.status, ar: assignment.status })}
                          </Badge>
                          <h4 className="font-medium mt-1">
                            {t({ 
                              en: assignment.expert_panel?.name_en || 'Assignment', 
                              ar: assignment.expert_panel?.name_ar || 'مهمة' 
                            })}
                          </h4>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-red-500" />
                {t({ en: 'Upcoming Deadlines', ar: 'المواعيد القادمة' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t({ en: 'No upcoming deadlines', ar: 'لا توجد مواعيد قادمة' })}
                </p>
              ) : (
                upcomingDeadlines.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.assignment_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                {t({ en: 'Performance', ar: 'الأداء' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t({ en: 'Completion Rate', ar: 'معدل الإنجاز' })}</span>
                  <span className="font-medium">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t({ en: 'Total Evaluations', ar: 'إجمالي التقييمات' })}</span>
                  <span className="font-medium">{completedEvaluations.length}</span>
                </div>
              </div>
              <Link to={createPageUrl('ExpertPerformanceDashboard')}>
                <Button variant="outline" size="sm" className="w-full">
                  {t({ en: 'View Full Report', ar: 'عرض التقرير الكامل' })}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                {t({ en: 'Quick Actions', ar: 'إجراءات سريعة' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to={createPageUrl('ExpertAssignmentQueue')} className="block">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  {t({ en: 'View Assignment Queue', ar: 'عرض قائمة المهام' })}
                </Button>
              </Link>
              <Link to={createPageUrl('PilotEvaluations')} className="block">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  {t({ en: 'Pilot Evaluations', ar: 'تقييمات التجارب' })}
                </Button>
              </Link>
              <Link to={createPageUrl('ExpertMatchingEngine')} className="block">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  {t({ en: 'Expert Network', ar: 'شبكة الخبراء' })}
                </Button>
              </Link>
              <Link to={createPageUrl('Knowledge')} className="block">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  {t({ en: 'Knowledge Hub', ar: 'مركز المعرفة' })}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProtectedPage(ExpertDashboard, { requiredPermissions: [] });
