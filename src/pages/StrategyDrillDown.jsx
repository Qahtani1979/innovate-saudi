import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  Target, ChevronDown, ChevronRight, TrendingUp, Beaker, Shield, 
  Users, FileText, Zap, CheckCircle2, AlertCircle, Layers
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function StrategyDrillDown() {
  const { language, isRTL, t } = useLanguage();
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    programs: true,
    challenges: true,
    sandboxes: false,
    livingLabs: false,
    partnerships: false,
    pilots: false
  });

  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans-drill'],
    queryFn: () => base44.entities.StrategicPlan.list()
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs-drill'],
    queryFn: () => base44.entities.Program.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-drill'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: sandboxes = [] } = useQuery({
    queryKey: ['sandboxes-drill'],
    queryFn: () => base44.entities.Sandbox.list()
  });

  const { data: livingLabs = [] } = useQuery({
    queryKey: ['living-labs-drill'],
    queryFn: () => base44.entities.LivingLab.list()
  });

  const { data: partnerships = [] } = useQuery({
    queryKey: ['partnerships-drill'],
    queryFn: () => base44.entities.Partnership.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-drill'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const selectedPlan = strategicPlans.find(p => p.id === selectedPlanId);

  // Filter entities by selected plan
  const filteredData = selectedPlanId ? {
    programs: programs.filter(p => p.strategic_plan_ids?.includes(selectedPlanId)),
    challenges: challenges.filter(c => c.strategic_plan_ids?.includes(selectedPlanId)),
    sandboxes: sandboxes.filter(s => s.strategic_plan_ids?.includes(selectedPlanId)),
    livingLabs: livingLabs.filter(l => l.strategic_plan_ids?.includes(selectedPlanId)),
    partnerships: partnerships.filter(p => p.strategic_plan_ids?.includes(selectedPlanId)),
    pilots: pilots.filter(p => {
      const linkedChallenge = challenges.find(c => c.id === p.challenge_id);
      return linkedChallenge?.strategic_plan_ids?.includes(selectedPlanId);
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
      linkPrefix: 'ProgramDetail'
    },
    { 
      key: 'challenges', 
      label: { en: 'Challenges', ar: 'التحديات' },
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      data: filteredData.challenges,
      linkPrefix: 'ChallengeDetail'
    },
    { 
      key: 'sandboxes', 
      label: { en: 'Sandboxes', ar: 'مناطق الاختبار' },
      icon: Shield,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      data: filteredData.sandboxes,
      linkPrefix: 'SandboxDetail'
    },
    { 
      key: 'livingLabs', 
      label: { en: 'Living Labs', ar: 'المختبرات الحية' },
      icon: Beaker,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      data: filteredData.livingLabs,
      linkPrefix: 'LivingLabDetail'
    },
    { 
      key: 'partnerships', 
      label: { en: 'Partnerships', ar: 'الشراكات' },
      icon: Users,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      data: filteredData.partnerships,
      linkPrefix: 'PartnershipDetail'
    },
    { 
      key: 'pilots', 
      label: { en: 'Pilots (via Challenges)', ar: 'التجارب (عبر التحديات)' },
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      data: filteredData.pilots,
      linkPrefix: 'PilotDetail'
    }
  ];

  const totalLinked = Object.values(filteredData).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Strategy Drill-Down', ar: 'التفصيل الاستراتيجي' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'View all entities linked to a strategic plan', ar: 'عرض جميع الكيانات المرتبطة بخطة استراتيجية' })}
          </p>
        </div>
      </div>

      {/* Plan Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Layers className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <Select value={selectedPlanId || ''} onValueChange={setSelectedPlanId}>
                <SelectTrigger className="w-full md:w-96">
                  <SelectValue placeholder={t({ en: 'Select a Strategic Plan', ar: 'اختر خطة استراتيجية' })} />
                </SelectTrigger>
                <SelectContent>
                  {strategicPlans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {language === 'ar' && plan.name_ar ? plan.name_ar : plan.name_en}
                      <span className="text-xs text-slate-500 ml-2">({plan.start_year}-{plan.end_year})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPlanId && (
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {totalLinked} {t({ en: 'entities linked', ar: 'كيان مرتبط' })}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Details */}
      {selectedPlan && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {language === 'ar' && selectedPlan.name_ar ? selectedPlan.name_ar : selectedPlan.name_en}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">{selectedPlan.start_year}</p>
                <p className="text-xs text-slate-500">{t({ en: 'Start Year', ar: 'سنة البداية' })}</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">{selectedPlan.end_year}</p>
                <p className="text-xs text-slate-500">{t({ en: 'End Year', ar: 'سنة النهاية' })}</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">{selectedPlan.objectives?.length || 0}</p>
                <p className="text-xs text-slate-500">{t({ en: 'Objectives', ar: 'الأهداف' })}</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <Badge className={selectedPlan.status === 'active' ? 'bg-green-600' : 'bg-blue-600'}>
                  {selectedPlan.status}
                </Badge>
                <p className="text-xs text-slate-500 mt-1">{t({ en: 'Status', ar: 'الحالة' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entity Sections */}
      {selectedPlanId && (
        <div className="space-y-4">
          {entitySections.map(({ key, label, icon: Icon, color, bgColor, data, linkPrefix }) => (
            <Card key={key}>
              <Collapsible open={expandedSections[key]} onOpenChange={() => toggleSection(key)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${bgColor}`}>
                          <Icon className={`h-5 w-5 ${color}`} />
                        </div>
                        <span>{t(label)}</span>
                        <Badge variant="secondary">{data.length}</Badge>
                      </div>
                      {expandedSections[key] ? (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      )}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {data.length > 0 ? (
                      <div className="space-y-2">
                        {data.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <div>
                                <p className="font-medium text-slate-900">
                                  {language === 'ar' && item.name_ar ? item.name_ar : (item.name_en || item.title_en || item.name || 'Untitled')}
                                </p>
                                {item.status && (
                                  <Badge variant="outline" className="text-xs mt-1">{item.status}</Badge>
                                )}
                              </div>
                            </div>
                            <Link to={createPageUrl(`${linkPrefix}?id=${item.id}`)}>
                              <Button variant="ghost" size="sm">
                                {t({ en: 'View', ar: 'عرض' })}
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-300" />
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

      {!selectedPlanId && (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center">
            <Layers className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg text-slate-500">
              {t({ en: 'Select a strategic plan to view linked entities', ar: 'اختر خطة استراتيجية لعرض الكيانات المرتبطة' })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(StrategyDrillDown, { requiredPermissions: [] });
