import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from '../components/LanguageContext';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { Link } from 'react-router-dom';
import { 
  Target, ChevronDown, ChevronRight, TrendingUp, Beaker, Shield, 
  Users, Zap, CheckCircle2, AlertCircle, Layers
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';

function StrategyDrillDown() {
  const { language, isRTL, t } = useLanguage();
  const { activePlanId, activePlan } = useActivePlan();
  const [expandedSections, setExpandedSections] = useState({
    programs: true,
    challenges: true,
    sandboxes: false,
    livingLabs: false,
    partnerships: false,
    pilots: false
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs-drill'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-drill'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: sandboxes = [] } = useQuery({
    queryKey: ['sandboxes-drill'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sandboxes')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: livingLabs = [] } = useQuery({
    queryKey: ['living-labs-drill'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('living_labs')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: partnerships = [] } = useQuery({
    queryKey: ['partnerships-drill'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partnerships')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-drill'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pilots')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  // Filter entities by active plan from context
  const filteredData = activePlanId ? {
    programs: programs.filter(p => p.strategic_plan_ids?.includes(activePlanId)),
    challenges: challenges.filter(c => c.strategic_plan_ids?.includes(activePlanId)),
    sandboxes: sandboxes.filter(s => s.strategic_plan_ids?.includes(activePlanId)),
    livingLabs: livingLabs.filter(l => l.strategic_plan_ids?.includes(activePlanId)),
    partnerships: partnerships.filter(p => p.strategic_plan_ids?.includes(activePlanId)),
    pilots: pilots.filter(p => {
      const linkedChallenge = challenges.find(c => c.id === p.challenge_id);
      return linkedChallenge?.strategic_plan_ids?.includes(activePlanId) || p.strategic_plan_ids?.includes(activePlanId);
    })
  } : {
    programs: [],
    challenges: [],
    sandboxes: [],
    livingLabs: [],
    partnerships: [],
    pilots: []
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const entitySections = [
    { 
      key: 'programs', 
      label: { en: 'Programs', ar: 'البرامج' },
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      data: filteredData.programs,
      linkPath: '/program-detail'
    },
    { 
      key: 'challenges', 
      label: { en: 'Challenges', ar: 'التحديات' },
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      data: filteredData.challenges,
      linkPath: '/challenge-detail'
    },
    { 
      key: 'sandboxes', 
      label: { en: 'Sandboxes', ar: 'مناطق الاختبار' },
      icon: Shield,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      data: filteredData.sandboxes,
      linkPath: '/sandbox-detail'
    },
    { 
      key: 'livingLabs', 
      label: { en: 'Living Labs', ar: 'المختبرات الحية' },
      icon: Beaker,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      data: filteredData.livingLabs,
      linkPath: '/living-lab-detail'
    },
    { 
      key: 'partnerships', 
      label: { en: 'Partnerships', ar: 'الشراكات' },
      icon: Users,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      data: filteredData.partnerships,
      linkPath: '/partnership-detail'
    },
    { 
      key: 'pilots', 
      label: { en: 'Pilots', ar: 'التجارب' },
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      data: filteredData.pilots,
      linkPath: '/pilot-detail'
    }
  ];

  const totalLinked = Object.values(filteredData).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-6 container mx-auto py-6 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <ActivePlanBanner />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t({ en: 'Strategy Drill-Down', ar: 'التفصيل الاستراتيجي' })}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t({ en: 'View all entities linked to the active strategic plan', ar: 'عرض جميع الكيانات المرتبطة بالخطة الاستراتيجية النشطة' })}
          </p>
        </div>
        {activePlanId && (
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {totalLinked} {t({ en: 'entities linked', ar: 'كيان مرتبط' })}
          </Badge>
        )}
      </div>

      {/* Plan Details */}
      {activePlan && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {language === 'ar' && activePlan.name_ar ? activePlan.name_ar : activePlan.name_en}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{activePlan.start_year}</p>
                <p className="text-xs text-muted-foreground">{t({ en: 'Start Year', ar: 'سنة البداية' })}</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{activePlan.end_year}</p>
                <p className="text-xs text-muted-foreground">{t({ en: 'End Year', ar: 'سنة النهاية' })}</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{activePlan.objectives?.length || 0}</p>
                <p className="text-xs text-muted-foreground">{t({ en: 'Objectives', ar: 'الأهداف' })}</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <Badge className={activePlan.status === 'active' ? 'bg-green-600' : 'bg-blue-600'}>
                  {activePlan.status}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">{t({ en: 'Status', ar: 'الحالة' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entity Sections */}
      {activePlanId && (
        <div className="space-y-4">
          {entitySections.map(({ key, label, icon: Icon, color, bgColor, data, linkPath }) => (
            <Card key={key}>
              <Collapsible open={expandedSections[key]} onOpenChange={() => toggleSection(key)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted transition-colors">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${bgColor}`}>
                          <Icon className={`h-5 w-5 ${color}`} />
                        </div>
                        <span>{t(label)}</span>
                        <Badge variant="secondary">{data.length}</Badge>
                      </div>
                      {expandedSections[key] ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {data.length > 0 ? (
                      <div className="space-y-2">
                        {data.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <div>
                                <p className="font-medium">
                                  {language === 'ar' && item.name_ar ? item.name_ar : (item.name_en || item.title_en || item.name || 'Untitled')}
                                </p>
                                {item.status && (
                                  <Badge variant="outline" className="text-xs mt-1">{item.status}</Badge>
                                )}
                              </div>
                            </div>
                            <Link to={`${linkPath}?id=${item.id}`}>
                              <Button variant="ghost" size="sm">
                                {t({ en: 'View', ar: 'عرض' })}
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>{t({ en: 'No entities linked', ar: 'لا توجد كيانات مرتبطة' })}</p>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}

      {!activePlanId && (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center">
            <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg text-muted-foreground">
              {t({ en: 'Select a strategic plan above to view linked entities', ar: 'اختر خطة استراتيجية أعلاه لعرض الكيانات المرتبطة' })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(StrategyDrillDown, { requiredPermissions: ['strategy_view'] });
