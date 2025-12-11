import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  Microscope, Calendar, TrendingUp, AlertCircle, CheckCircle2, 
  FileText, Users, DollarSign, Clock, Lightbulb, ArrowRight 
} from 'lucide-react';
import { format, addDays, isWithinInterval } from 'date-fns';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useAuth } from '@/lib/AuthContext';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function MyRDProjects() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const { invokeAI, status, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['my-rd-projects', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rd_projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).filter(p => 
        p.principal_investigator?.email === user?.email || 
        p.team_members?.some(m => m.email === user?.email)
      );
    },
    enabled: !!user
  });

  const { data: rdCalls = [] } = useQuery({
    queryKey: ['open-rd-calls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rd_calls')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const queryClient = useQueryClient();

  const generateInsights = useMutation({
    mutationFn: async (project) => {
      const result = await invokeAI({
        prompt: `Analyze this R&D project and provide actionable recommendations:

Project: ${project.title_en}
Current TRL: ${project.trl_current || 'N/A'}
Target TRL: ${project.trl_target || 'N/A'}
Status: ${project.status}
Timeline: ${project.timeline?.start_date} to ${project.timeline?.end_date}
Milestones: ${JSON.stringify(project.timeline?.milestones || [])}

Provide:
1. Next recommended steps (2-3 specific actions)
2. Risk assessment
3. Opportunities for acceleration

Be concise and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            next_steps: { type: "array", items: { type: "string" } },
            risks: { type: "string" },
            opportunities: { type: "string" }
          }
        }
      });
      return result.success ? result.data : null;
    }
  });

  const filteredProjects = projects.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const activeProjects = projects.filter(p => p.status === 'active');
  const upcomingMilestones = activeProjects.flatMap(p => 
    (p.timeline?.milestones || [])
      .filter(m => m.status !== 'completed' && m.date)
      .map(m => ({ ...m, project: p }))
  ).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);

  const nextWeek = addDays(new Date(), 7);
  const criticalMilestones = upcomingMilestones.filter(m => 
    isWithinInterval(new Date(m.date), { start: new Date(), end: nextWeek })
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="text-slate-500">{t({ en: 'Loading...', ar: 'جاري التحميل...' })}</div></div>;
  }

  return (
    <PageLayout>
      <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
      {/* Header */}
      <PageHeader
        title={{ en: 'My R&D Projects', ar: 'مشاريع البحث الخاصة بي' }}
        subtitle={{ en: 'Track your research projects, milestones, and outputs', ar: 'تتبع مشاريع البحث والمعالم والمخرجات' }}
        icon={<Microscope className="h-6 w-6 text-white" />}
        actions={
          <Link to={createPageUrl('RDProjectCreate')}>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              {t({ en: 'New R&D Project', ar: 'مشروع بحث جديد' })}
            </Button>
          </Link>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
          <CardContent className="pt-6 text-center">
            <Microscope className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-indigo-600">{activeProjects.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Active Projects', ar: 'مشاريع نشطة' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-orange-600">{criticalMilestones.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Milestones This Week', ar: 'معالم هذا الأسبوع' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {projects.reduce((sum, p) => sum + (p.publications?.length || 0), 0)}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Publications', ar: 'منشورات' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Lightbulb className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{rdCalls.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Open R&D Calls', ar: 'دعوات بحث مفتوحة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Milestones Alert */}
      {criticalMilestones.length > 0 && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-red-900 mb-2">
                  {t({ en: `${criticalMilestones.length} Critical Milestones This Week`, ar: `${criticalMilestones.length} معلم حرج هذا الأسبوع` })}
                </h3>
                <div className="space-y-2">
                  {criticalMilestones.map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{m.project.title_en || m.project.title_ar}: {m.name_en || m.name_ar}</span>
                      <Badge variant="outline" className="text-red-600">{format(new Date(m.date), 'MMM d')}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'active', 'proposal', 'completed'].map(status => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status)}
            size="sm"
          >
            {t({ 
              en: status.charAt(0).toUpperCase() + status.slice(1), 
              ar: status === 'all' ? 'الكل' : status === 'active' ? 'نشط' : status === 'proposal' ? 'مقترح' : 'مكتمل' 
            })}
          </Button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProjects.map(project => {
          const trlProgress = project.trl_current && project.trl_target ? 
            Math.round((project.trl_current / project.trl_target) * 100) : 0;
          const milestonesComplete = project.timeline?.milestones?.filter(m => m.status === 'completed').length || 0;
          const milestonesTotal = project.timeline?.milestones?.length || 0;

          return (
            <Card key={project.id} className="border-2 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{project.title_en || project.title_ar}</CardTitle>
                      <Badge className={
                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                        project.status === 'proposal' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-slate-100 text-slate-800'
                      }>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{project.abstract_en || project.abstract_ar}</p>
                  </div>
                  <Link to={createPageUrl('RDProjectDetail') + `?id=${project.id}`}>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* TRL Progress */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600">
                      {t({ en: 'TRL Progress', ar: 'تقدم TRL' })}
                    </span>
                    <span className="font-medium">
                      TRL {project.trl_current || 0} / {project.trl_target || 9}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all" 
                      style={{ width: `${trlProgress}%` }}
                    />
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-slate-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-slate-900">{milestonesComplete}/{milestonesTotal}</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Milestones', ar: 'معالم' })}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <FileText className="h-4 w-4 text-slate-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-slate-900">{project.publications?.length || 0}</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Publications', ar: 'منشورات' })}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <DollarSign className="h-4 w-4 text-slate-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-slate-900">{project.budget ? `${(project.budget / 1000000).toFixed(1)}M` : 'N/A'}</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Budget SAR', ar: 'الميزانية ر.س' })}</p>
                  </div>
                </div>

                {/* Next Milestone */}
                {project.timeline?.milestones?.find(m => m.status !== 'completed') && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        {t({ en: 'Next Milestone', ar: 'المعلم التالي' })}
                      </span>
                    </div>
                    {(() => {
                      const nextMilestone = project.timeline.milestones.find(m => m.status !== 'completed');
                      return (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-700">{nextMilestone.name_en || nextMilestone.name_ar}</span>
                          {nextMilestone.date && (
                            <Badge variant="outline">{format(new Date(nextMilestone.date), 'MMM d, yyyy')}</Badge>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* AI Insights */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateInsights.mutate(project)}
                  disabled={generateInsights.isPending}
                  className="w-full"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  {generateInsights.isPending ? 
                    t({ en: 'Generating insights...', ar: 'توليد الرؤى...' }) :
                    t({ en: 'Get AI Recommendations', ar: 'احصل على توصيات الذكاء' })
                  }
                </Button>

                {generateInsights.data && generateInsights.variables?.id === project.id && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-purple-900 mb-1">
                        {t({ en: 'Next Steps:', ar: 'الخطوات التالية:' })}
                      </p>
                      <ul className="text-xs text-slate-700 space-y-1">
                        {generateInsights.data.next_steps?.map((step, i) => (
                          <li key={i} className="flex gap-2">
                            <span>•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {generateInsights.data.risks && (
                      <p className="text-xs text-slate-600">
                        <span className="font-semibold text-red-700">{t({ en: 'Risks:', ar: 'المخاطر:' })}</span> {generateInsights.data.risks}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Microscope className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">
              {t({ en: 'No R&D projects found', ar: 'لم يتم العثور على مشاريع بحث' })}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Open R&D Calls */}
      {rdCalls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-600" />
              {t({ en: 'Open R&D Calls', ar: 'دعوات البحث المفتوحة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rdCalls.slice(0, 3).map(call => (
                <Link key={call.id} to={createPageUrl('RDCallDetail') + `?id=${call.id}`}>
                  <div className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{call.title_en || call.title_ar}</p>
                        <p className="text-sm text-slate-600">
                          {call.timeline?.application_close && 
                            `${t({ en: 'Deadline:', ar: 'الموعد النهائي:' })} ${format(new Date(call.timeline.application_close), 'MMM d, yyyy')}`
                          }
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}

export default ProtectedPage(MyRDProjects, { requiredPermissions: [] });
