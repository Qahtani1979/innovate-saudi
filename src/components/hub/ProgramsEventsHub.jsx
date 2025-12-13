import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, TrendingUp, AlertCircle, Calendar, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { HubStats } from './HubStats';
import { HubTabs } from './HubTabs';
import { QuickActions } from './QuickActions';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { AIProgramEventCorrelator } from '@/components/ai/AIProgramEventCorrelator';

// Lazy imports for tab content
const ProgramsContent = React.lazy(() => import('@/pages/Programs'));
const EventsContent = React.lazy(() => import('@/pages/EventCalendar'));
const CampaignsContent = React.lazy(() => import('@/pages/CampaignPlanner'));
const CalendarContent = React.lazy(() => import('@/pages/CalendarView'));

function ProgramsEventsHub() {
  const { language, isRTL, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('programs');

  // Fetch programs
  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ['hub-programs'],
    queryFn: async () => {
      const data = await base44.entities.Program.list();
      return data.filter(p => !p.is_deleted);
    }
  });

  // Fetch events
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['hub-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_deleted', false)
        .order('start_date', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // Filter campaigns from programs
  const campaigns = programs.filter(p => p.program_type === 'campaign' || p.program_type === 'challenge');

  const isLoading = programsLoading || eventsLoading;

  // AI Insights placeholder data
  const aiInsights = [
    {
      type: 'recommendation',
      icon: TrendingUp,
      title: t({ en: 'Program Optimization', ar: 'تحسين البرامج' }),
      description: t({ 
        en: '3 programs have low engagement. Consider adding events to boost participation.',
        ar: '3 برامج لديها مشاركة منخفضة. فكر في إضافة فعاليات لتعزيز المشاركة.'
      })
    },
    {
      type: 'alert',
      icon: AlertCircle,
      title: t({ en: 'Scheduling Conflict', ar: 'تعارض في الجدولة' }),
      description: t({
        en: '2 events are scheduled on the same day. Review calendar for conflicts.',
        ar: '2 فعاليات مجدولة في نفس اليوم. راجع التقويم للتعارضات.'
      })
    },
    {
      type: 'insight',
      icon: Sparkles,
      title: t({ en: 'Attendance Prediction', ar: 'توقع الحضور' }),
      description: t({
        en: 'Based on trends, workshop events have 40% higher attendance than webinars.',
        ar: 'بناءً على الاتجاهات، فعاليات الورش لديها حضور أعلى بنسبة 40% من الندوات الإلكترونية.'
      })
    }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="h-10 w-10" />
            <Calendar className="h-8 w-8 opacity-70" />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            {t({ en: 'Programs & Events Hub', ar: 'مركز البرامج والفعاليات' })}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">
            {t({ 
              en: 'Manage innovation programs, events, and campaigns from a unified dashboard',
              ar: 'إدارة برامج الابتكار والفعاليات والحملات من لوحة تحكم موحدة'
            })}
          </p>
          <div className="flex gap-2 mt-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {programs.length} {t({ en: 'Programs', ar: 'برنامج' })}
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {events.length} {t({ en: 'Events', ar: 'فعالية' })}
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {campaigns.length} {t({ en: 'Campaigns', ar: 'حملة' })}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <HubStats programs={programs} events={events} campaigns={campaigns} />
      )}

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Tabs */}
      <Card>
        <CardHeader className="pb-2">
          <HubTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            counts={{
              programs: programs.length,
              events: events.length,
              campaigns: campaigns.length
            }}
          />
        </CardHeader>
        <CardContent className="pt-4">
          <React.Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }>
            {activeTab === 'programs' && <ProgramsContent embedded />}
            {activeTab === 'events' && <EventsContent embedded />}
            {activeTab === 'campaigns' && <CampaignsContent embedded />}
            {activeTab === 'calendar' && <CalendarContent embedded />}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-lg">
                    {t({ en: 'AI-Powered Insights', ar: 'رؤى مدعومة بالذكاء الاصطناعي' })}
                  </h3>
                </div>
                
                {/* Quick Insights Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  {aiInsights.map((insight, index) => (
                    <Card key={index} className={`border-l-4 ${
                      insight.type === 'alert' ? 'border-l-amber-500 bg-amber-50' :
                      insight.type === 'recommendation' ? 'border-l-blue-500 bg-blue-50' :
                      'border-l-purple-500 bg-purple-50'
                    }`}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <insight.icon className={`h-5 w-5 mt-0.5 ${
                            insight.type === 'alert' ? 'text-amber-600' :
                            insight.type === 'recommendation' ? 'text-blue-600' :
                            'text-purple-600'
                          }`} />
                          <div>
                            <p className="font-medium text-sm">{insight.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* AI Program-Event Correlator */}
                <AIProgramEventCorrelator 
                  programs={programs} 
                  events={events} 
                />
              </div>
            )}
          </React.Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ProgramsEventsHub, { 
  requiredPermissions: [], 
  requiredRoles: ['Executive Leadership', 'Program Director', 'Municipality Coordinator', 'admin'] 
});
