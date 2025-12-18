import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import SandboxPolicyFeedbackWorkflow from '../components/sandbox/SandboxPolicyFeedbackWorkflow';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  Shield, MapPin, TestTube, CheckCircle2, AlertCircle, Sparkles, 
  Activity, Building2, Wifi, Database, Zap, Users, Phone, Mail,
  Clock, DollarSign, FileText, Image, Video, Globe, Calendar,
  BarChart3, TrendingUp, Award, Loader2, X
} from 'lucide-react';
import SandboxCapacityManager from '../components/SandboxCapacityManager';
import SandboxApplicationWizard from '../components/SandboxApplicationWizard';
import SandboxApplicationsList from '../components/SandboxApplicationsList';
import SandboxMonitoringDashboard from '../components/SandboxMonitoringDashboard';
import IncidentReportForm from '../components/IncidentReportForm';
import AICapacityPredictor from '../components/AICapacityPredictor';
import SandboxCollaboratorManager from '../components/SandboxCollaboratorManager';
import SandboxLaunchChecklist from '../components/SandboxLaunchChecklist';
import SandboxProjectExitWizard from '../components/SandboxProjectExitWizard';
import SandboxInfrastructureReadinessGate from '../components/SandboxInfrastructureReadinessGate';
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import { usePrompt } from '@/hooks/usePrompt';
import { SANDBOX_DETAIL_PROMPT_TEMPLATE } from '@/lib/ai/prompts/sandbox/sandboxDetail';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function SandboxDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const sandboxId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [showLaunchChecklist, setShowLaunchChecklist] = useState(false);
  const [showExitWizard, setShowExitWizard] = useState(false);
  const [showInfrastructureGate, setShowInfrastructureGate] = useState(false);
  const [selectedPilotForExit, setSelectedPilotForExit] = useState(null);
  
  const { invoke: invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = usePrompt(null);

  const { data: sandbox, isLoading } = useQuery({
    queryKey: ['sandbox', sandboxId],
    queryFn: async () => {
      const sandboxes = await base44.entities.Sandbox.list();
      return sandboxes.find(s => s.id === sandboxId);
    },
    enabled: !!sandboxId
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['sandbox-pilots', sandboxId],
    queryFn: async () => {
      const allPilots = await base44.entities.Pilot.list();
      return allPilots.filter(p => p.sandbox_zone === sandbox?.name_en || p.living_lab_id === sandbox?.living_lab_id);
    },
    enabled: !!sandbox
  });

  const { data: livingLab } = useQuery({
    queryKey: ['living-lab', sandbox?.living_lab_id],
    queryFn: async () => {
      if (!sandbox?.living_lab_id) return null;
      const labs = await base44.entities.LivingLab.list();
      return labs.find(l => l.id === sandbox.living_lab_id);
    },
    enabled: !!sandbox?.living_lab_id
  });

  if (isLoading || !sandbox) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const statusConfig = {
    planning: { color: 'bg-slate-100 text-slate-700', icon: Clock },
    active: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    inactive: { color: 'bg-slate-100 text-slate-700', icon: AlertCircle },
    full: { color: 'bg-red-100 text-red-700', icon: AlertCircle },
    suspended: { color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
    maintenance: { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle }
  };

  const statusInfo = statusConfig[sandbox.status] || statusConfig.active;
  const StatusIcon = statusInfo.icon;
  const utilizationPercent = ((sandbox.current_pilots || 0) / (sandbox.capacity || 1)) * 100;

  const handleAIInsights = async () => {
    setShowAIInsights(true);
    try {
      // Use centralized prompt template
      const promptConfig = SANDBOX_DETAIL_PROMPT_TEMPLATE(sandbox);
      
      const result = await invokeAI({
        prompt: promptConfig.prompt,
        system_prompt: promptConfig.system,
        response_json_schema: promptConfig.schema
      });
      if (result.success && result.data) {
        setAiInsights(result.data);
      }
    } catch (error) {
      toast.error(t({ en: 'Failed to generate AI insights', ar: 'فشل توليد الرؤى الذكية' }));
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Workflow Modals */}
      {showLaunchChecklist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <SandboxLaunchChecklist sandbox={sandbox} onClose={() => setShowLaunchChecklist(false)} />
          </div>
        </div>
      )}
      {showExitWizard && selectedPilotForExit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <SandboxProjectExitWizard 
              pilot={selectedPilotForExit} 
              sandbox={sandbox} 
              onClose={() => {
                setShowExitWizard(false);
                setSelectedPilotForExit(null);
              }} 
            />
          </div>
        </div>
      )}
      {showInfrastructureGate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <SandboxInfrastructureReadinessGate 
              sandbox={sandbox} 
              onClose={() => setShowInfrastructureGate(false)}
              onApprove={() => setShowLaunchChecklist(true)}
            />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {sandbox.code && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/40 font-mono">
                    {sandbox.code}
                  </Badge>
                )}
                <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {sandbox.status}
                </Badge>
                <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                  {sandbox.domain?.replace(/_/g, ' ')}
                </Badge>
                {sandbox.is_featured && (
                  <Badge className="bg-amber-500 text-white">
                    <Award className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-5xl font-bold mb-2">
                {language === 'ar' && sandbox.name_ar ? sandbox.name_ar : sandbox.name_en}
              </h1>
              {(sandbox.tagline_en || sandbox.tagline_ar) && (
                <p className="text-xl text-white/90">
                  {language === 'ar' && sandbox.tagline_ar ? sandbox.tagline_ar : sandbox.tagline_en}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm">
                {sandbox.city_id && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{sandbox.city_id}</span>
                  </div>
                )}
                {sandbox.area_sqm && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span>{(sandbox.area_sqm / 1000).toFixed(1)}K sqm</span>
                  </div>
                )}
                {sandbox.launch_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Since {sandbox.launch_date ? new Date(sandbox.launch_date).getFullYear() : 'N/A'}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {sandbox.status === 'planning' && !sandbox.infrastructure_ready && (
                <Button onClick={() => setShowInfrastructureGate(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Shield className="h-4 w-4 mr-2" />
                  {t({ en: 'Infrastructure Check', ar: 'فحص البنية' })}
                </Button>
              )}
              {sandbox.status === 'planning' && sandbox.infrastructure_ready && (
                <Button onClick={() => setShowLaunchChecklist(true)} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t({ en: 'Launch', ar: 'إطلاق' })}
                </Button>
              )}
              <Link to={createPageUrl(`SandboxEdit?id=${sandboxId}`)}>
                <Button variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                  {t({ en: 'Edit', ar: 'تعديل' })}
                </Button>
              </Link>
              <Button className="bg-white text-purple-600 hover:bg-white/90" onClick={handleAIInsights}>
                <Sparkles className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Modal */}
      {showAIInsights && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Strategic Insights', ar: 'الرؤى الاستراتيجية الذكية' })}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAIInsights(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>{t({ en: 'Analyzing sandbox...', ar: 'جاري تحليل منطقة الاختبار...' })}</span>
              </div>
            ) : aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.capacity_optimization?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Capacity Optimization', ar: 'تحسين السعة' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.capacity_optimization.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.regulatory_risks?.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">{t({ en: 'Regulatory Risks', ar: 'المخاطر التنظيمية' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.regulatory_risks.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.success_factors?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Success Factors', ar: 'عوامل النجاح' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.success_factors.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.pilot_opportunities?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Pilot Opportunities', ar: 'فرص التجريب' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.pilot_opportunities.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.resource_allocation?.length > 0 && (
                  <div className="p-4 bg-teal-50 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-teal-700 mb-2">{t({ en: 'Resource Allocation', ar: 'تخصيص الموارد' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.resource_allocation.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Capacity', ar: 'السعة' })}</p>
                <p className="text-3xl font-bold text-blue-600">{sandbox.capacity || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
                <p className="text-3xl font-bold text-purple-600">{sandbox.current_pilots || 0}</p>
              </div>
              <TestTube className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Available', ar: 'متاح' })}</p>
                <p className="text-3xl font-bold text-green-600">
                  {Math.max(0, (sandbox.capacity || 0) - (sandbox.current_pilots || 0))}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Utilization', ar: 'الاستخدام' })}</p>
                <p className="text-3xl font-bold text-amber-600">{utilizationPercent.toFixed(0)}%</p>
              </div>
              <Activity className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Success Rate', ar: 'معدل النجاح' })}</p>
                <p className="text-3xl font-bold text-teal-600">{sandbox.success_rate || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Progress */}
      {sandbox.capacity && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-700">
                {t({ en: 'Capacity Utilization', ar: 'استخدام السعة' })}
              </p>
              <span className="text-sm text-slate-600">
                {sandbox.current_pilots} / {sandbox.capacity} {t({ en: 'projects', ar: 'مشاريع' })}
              </span>
            </div>
            <Progress value={utilizationPercent} className="h-3" />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="workflow" className="space-y-6">
        <TabsList className="grid w-full grid-cols-12 h-auto">
          <TabsTrigger value="workflow" className="flex flex-col gap-1 py-3">
            <Activity className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Workflow', ar: 'سير العمل' })}</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex flex-col gap-1 py-3">
            <FileText className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Overview', ar: 'نظرة عامة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="infrastructure" className="flex flex-col gap-1 py-3">
            <Building2 className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Infrastructure', ar: 'البنية التحتية' })}</span>
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex flex-col gap-1 py-3">
            <Users className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Applications', ar: 'الطلبات' })}</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex flex-col gap-1 py-3">
            <Activity className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Monitoring', ar: 'المراقبة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="capacity" className="flex flex-col gap-1 py-3">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Capacity', ar: 'السعة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="apply" className="flex flex-col gap-1 py-3">
            <Shield className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Apply', ar: 'تقديم' })}</span>
          </TabsTrigger>
          <TabsTrigger value="collaborators" className="flex flex-col gap-1 py-3">
            <Users className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Team', ar: 'الفريق' })}</span>
          </TabsTrigger>
          <TabsTrigger value="incidents" className="flex flex-col gap-1 py-3">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Incidents', ar: 'الحوادث' })}</span>
          </TabsTrigger>
          <TabsTrigger value="pilots" className="flex flex-col gap-1 py-3">
            <TestTube className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Pilots', ar: 'تجارب' })}</span>
          </TabsTrigger>
          <TabsTrigger value="regulatory" className="flex flex-col gap-1 py-3">
            <Shield className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Regulatory', ar: 'تنظيمي' })}</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="flex flex-col gap-1 py-3">
            <Image className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Media', ar: 'وسائط' })}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-6">
          <SandboxWorkflowTab sandbox={sandbox} />
          <UnifiedWorkflowApprovalTab
            entityType="Sandbox"
            entityId={sandboxId}
            currentStage={
              sandbox.status === 'planning' ? 'design' :
              sandbox.status === 'approval_pending' ? 'approval' :
              sandbox.status === 'active' ? 'active' : 'design'
            }
          />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'About', ar: 'حول' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {sandbox.description_en || 'No description provided'}
                  </p>
                  {sandbox.description_ar && (
                    <div className="pt-4 border-t" dir="rtl">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {sandbox.description_ar}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {(sandbox.objectives_en || sandbox.objectives_ar) && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Objectives', ar: 'الأهداف' })}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {sandbox.objectives_en}
                    </p>
                    {sandbox.objectives_ar && (
                      <div className="pt-4 border-t" dir="rtl">
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {sandbox.objectives_ar}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {sandbox.success_stories && sandbox.success_stories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-600" />
                      {t({ en: 'Success Stories', ar: 'قصص النجاح' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sandbox.success_stories.map((story, idx) => (
                        <div key={idx} className="p-4 border-l-4 border-amber-500 bg-amber-50 rounded-r-lg">
                          <h4 className="font-semibold text-slate-900 mb-1">{story.title}</h4>
                          <p className="text-sm text-slate-700 mb-2">{story.description}</p>
                          <p className="text-sm text-amber-900 font-medium">{story.outcome}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-600" />
                    {t({ en: 'Contact', ar: 'التواصل' })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sandbox.manager_name && (
                    <div>
                      <p className="text-xs text-slate-500">{t({ en: 'Manager', ar: 'المدير' })}</p>
                      <p className="text-sm font-medium text-slate-900">{sandbox.manager_name}</p>
                    </div>
                  )}
                  {sandbox.manager_email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${sandbox.manager_email}`} className="hover:text-blue-600">
                        {sandbox.manager_email}
                      </a>
                    </div>
                  )}
                  {sandbox.manager_phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="h-4 w-4" />
                      <span>{sandbox.manager_phone}</span>
                    </div>
                  )}
                  {sandbox.website_url && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Globe className="h-4 w-4" />
                      <a href={sandbox.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                        {t({ en: 'Website', ar: 'الموقع' })}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {sandbox.operational_hours && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-slate-600" />
                      {t({ en: 'Hours', ar: 'الساعات' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700">{sandbox.operational_hours}</p>
                  </CardContent>
                </Card>
              )}

              {(sandbox.usage_fees?.daily_rate || sandbox.usage_fees?.monthly_rate) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      {t({ en: 'Pricing', ar: 'التسعير' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {sandbox.usage_fees.daily_rate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">{t({ en: 'Daily Rate', ar: 'سعر اليوم' })}</span>
                        <span className="font-medium">{sandbox.usage_fees.daily_rate} SAR</span>
                      </div>
                    )}
                    {sandbox.usage_fees.monthly_rate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">{t({ en: 'Monthly Rate', ar: 'سعر الشهر' })}</span>
                        <span className="font-medium">{sandbox.usage_fees.monthly_rate} SAR</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {livingLab && (
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-900">
                      <Building2 className="h-5 w-5" />
                      {t({ en: 'Living Lab', ar: 'المختبر الحي' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link to={createPageUrl(`LivingLabDetail?id=${livingLab.id}`)}>
                      <p className="text-sm font-medium text-purple-900 hover:text-purple-700">
                        {livingLab.name_en}
                      </p>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-6">
          {sandbox.connectivity && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-blue-600" />
                  {t({ en: 'Connectivity', ar: 'الاتصال' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sandbox.connectivity.g5_available && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>5G Network</span>
                    </div>
                  )}
                  {sandbox.connectivity.iot_network && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>IoT Network</span>
                    </div>
                  )}
                  {sandbox.connectivity.edge_computing && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Edge Computing</span>
                    </div>
                  )}
                  {sandbox.connectivity.fiber_speed_mbps && (
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-amber-600" />
                      <span>{sandbox.connectivity.fiber_speed_mbps} Mbps Fiber</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {sandbox.facilities && sandbox.facilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  {t({ en: 'Facilities', ar: 'المرافق' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sandbox.facilities.map((facility, idx) => (
                    <div key={idx} className="p-4 border rounded-lg hover:border-purple-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">{facility.name}</h4>
                        {facility.available && (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            {t({ en: 'Available', ar: 'متاح' })}
                          </Badge>
                        )}
                      </div>
                      {facility.type && (
                        <p className="text-xs text-slate-500 mb-1">{facility.type}</p>
                      )}
                      {facility.description && (
                        <p className="text-sm text-slate-600 mb-2">{facility.description}</p>
                      )}
                      {facility.capacity && (
                        <p className="text-xs text-slate-500">Capacity: {facility.capacity}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {sandbox.equipment && sandbox.equipment.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-600" />
                  {t({ en: 'Equipment', ar: 'المعدات' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sandbox.equipment.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.name}</p>
                        {item.category && (
                          <p className="text-xs text-slate-500">{item.category}</p>
                        )}
                        {item.specifications && (
                          <p className="text-xs text-slate-600 mt-1">{item.specifications}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge className={
                          item.availability === 'available' ? 'bg-green-100 text-green-700' :
                          item.availability === 'reserved' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {item.availability}
                        </Badge>
                        {item.cost_per_hour && (
                          <p className="text-xs text-slate-600 mt-1">{item.cost_per_hour} SAR/hr</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {sandbox.data_infrastructure && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-teal-600" />
                  {t({ en: 'Data Infrastructure', ar: 'البنية البيانية' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sandbox.data_infrastructure.data_lake_access && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Data Lake Access</span>
                    </div>
                  )}
                  {sandbox.data_infrastructure.real_time_apis && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Real-time APIs</span>
                    </div>
                  )}
                  {sandbox.data_infrastructure.data_types_available && sandbox.data_infrastructure.data_types_available.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Available Data Types:</p>
                      <div className="flex flex-wrap gap-2">
                        {sandbox.data_infrastructure.data_types_available.map((type, idx) => (
                          <Badge key={idx} variant="outline">{type}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="applications">
          <SandboxApplicationsList sandbox={sandbox} />
        </TabsContent>

        <TabsContent value="monitoring">
          <SandboxMonitoringDashboard sandbox={sandbox} />
        </TabsContent>

        <TabsContent value="capacity">
          <div className="space-y-6">
            <AICapacityPredictor sandbox={sandbox} />
            <SandboxCapacityManager sandbox={sandbox} />
          </div>
        </TabsContent>

        <TabsContent value="apply">
          <SandboxApplicationWizard sandbox={sandbox} />
        </TabsContent>

        <TabsContent value="collaborators">
          <SandboxCollaboratorManager sandbox={sandbox} />
        </TabsContent>

        <TabsContent value="incidents">
          <IncidentReportForm sandbox={sandbox} />
        </TabsContent>

        <TabsContent value="pilots">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Active Pilots', ar: 'التجارب النشطة' })} ({pilots.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {pilots.length > 0 ? (
                <div className="space-y-3">
                  {pilots.map((pilot) => (
                    <div key={pilot.id} className="p-4 border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all">
                      <div className="flex items-center justify-between">
                        <Link to={createPageUrl(`PilotDetail?id=${pilot.id}`)} className="flex-1">
                          <p className="font-medium text-slate-900">{pilot.title_en}</p>
                          <p className="text-sm text-slate-600">{pilot.sector?.replace(/_/g, ' ')}</p>
                        </Link>
                        <div className="flex items-center gap-2">
                          <Badge>{pilot.stage?.replace(/_/g, ' ')}</Badge>
                          {pilot.stage === 'active' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedPilotForExit(pilot);
                                setShowExitWizard(true);
                              }}
                            >
                              {t({ en: 'Exit', ar: 'خروج' })}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">
                  {t({ en: 'No active pilots', ar: 'لا توجد تجارب نشطة' })}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regulatory" className="space-y-6">
          <SandboxPolicyFeedbackWorkflow sandbox={sandbox} />
          
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Regulatory Framework', ar: 'الإطار التنظيمي' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sandbox.regulatory_framework && (
                <p className="text-sm text-slate-700 leading-relaxed">
                  {sandbox.regulatory_framework}
                </p>
              )}
              {sandbox.regulatory_framework_document_url && (
                <Button variant="outline" asChild>
                  <a href={sandbox.regulatory_framework_document_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4 mr-2" />
                    {t({ en: 'Download Framework Document', ar: 'تحميل وثيقة الإطار' })}
                  </a>
                </Button>
              )}
              {sandbox.available_exemptions && sandbox.available_exemptions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-3">
                    {t({ en: 'Available Exemptions', ar: 'الإعفاءات المتاحة' })}
                  </p>
                  <div className="space-y-2">
                    {sandbox.available_exemptions.map((exemption, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{exemption}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          {sandbox.image_url && (
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Main Image', ar: 'الصورة الرئيسية' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <img src={sandbox.image_url} alt={sandbox.name_en} className="w-full rounded-lg" />
              </CardContent>
            </Card>
          )}

          {sandbox.gallery_urls && sandbox.gallery_urls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Gallery', ar: 'المعرض' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {sandbox.gallery_urls.map((url, idx) => (
                    <img key={idx} src={url} alt={`Gallery ${idx + 1}`} className="w-full rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {sandbox.video_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-red-600" />
                  {t({ en: 'Video', ar: 'فيديو' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                  <p className="text-slate-500">Video Player</p>
                </div>
              </CardContent>
            </Card>
          )}

          {sandbox.brochure_url && (
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Brochure', ar: 'النشرة' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <a href={sandbox.brochure_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4 mr-2" />
                    {t({ en: 'Download Brochure', ar: 'تحميل النشرة' })}
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}