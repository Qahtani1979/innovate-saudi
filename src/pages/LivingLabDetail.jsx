import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import LabPolicyEvidenceWorkflow from '../components/livinglab/LabPolicyEvidenceWorkflow';
import LivingLabWorkflowTab from '../components/livinglab/LivingLabWorkflowTab';
import UnifiedWorkflowApprovalTab from '../components/approval/UnifiedWorkflowApprovalTab';
import { createPageUrl } from '../utils';
import { 
  Beaker, MapPin, Building2, Wifi, Database, Zap, Users, Phone, Mail,
  Clock, DollarSign, FileText, Image, Video, Globe, Calendar,
  Award, BookOpen, Sparkles, CheckCircle2, TestTube, Microscope,
  GraduationCap, Wrench, Monitor, Activity, TrendingUp, Shield, Rocket
} from 'lucide-react';
import { useState } from 'react';
import LivingLabResourceBooking from '../components/LivingLabResourceBooking';
import LivingLabDashboard from '../components/LivingLabDashboard';
import LivingLabLaunchChecklist from '../components/LivingLabLaunchChecklist';
import LivingLabAccreditationWorkflow from '../components/LivingLabAccreditationWorkflow';
import LivingLabExpertMatching from '../components/LivingLabExpertMatching';
import LivingLabEventManager from '../components/LivingLabEventManager';
import LivingLabResearchMilestoneTracker from '../components/LivingLabResearchMilestoneTracker';
import LivingLabPublicationSubmission from '../components/LivingLabPublicationSubmission';
import LivingLabInfrastructureWizard from '../components/livinglabs/LivingLabInfrastructureWizard';
import AICapacityOptimizer from '../components/livinglabs/AICapacityOptimizer';
import LabSolutionCertificationWorkflow from '../components/livinglab/LabSolutionCertificationWorkflow';
import { usePermissions } from '@/components/permissions/usePermissions';
import { useEntityAccessCheck } from '@/hooks/useEntityAccessCheck';

export default function LivingLabDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const labId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const [showLaunch, setShowLaunch] = useState(false);
  const [showAccreditation, setShowAccreditation] = useState(false);
  const [showExpertMatch, setShowExpertMatch] = useState(false);
  const [showEventManager, setShowEventManager] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);
  const [showPublication, setShowPublication] = useState(false);
  const [showInfrastructure, setShowInfrastructure] = useState(false);
  const [showCapacityOptimizer, setShowCapacityOptimizer] = useState(false);

  const { data: lab, isLoading } = useQuery({
    queryKey: ['living-lab', labId],
    queryFn: async () => {
      const labs = await base44.entities.LivingLab.list();
      return labs.find(l => l.id === labId);
    },
    enabled: !!labId
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['rd-projects', labId],
    queryFn: async () => {
      const allProjects = await base44.entities.RDProject.list();
      return allProjects.filter(p => p.living_lab_id === labId);
    },
    enabled: !!labId
  });

  const { data: sandboxes = [] } = useQuery({
    queryKey: ['sandboxes-linked', labId],
    queryFn: async () => {
      const all = await base44.entities.Sandbox.list();
      return all.filter(s => s.living_lab_id === labId);
    },
    enabled: !!labId
  });

  const { data: expertEvaluations = [] } = useQuery({
    queryKey: ['lab-expert-evaluations', labId],
    queryFn: async () => {
      const all = await base44.entities.ExpertEvaluation.list();
      return all.filter(e => 
        (e.entity_type === 'livinglab_project' || e.entity_type === 'lab_output' || e.entity_type === 'LivingLab') && 
        e.entity_id === labId
      );
    },
    enabled: !!labId
  });

  if (isLoading || !lab) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const statusConfig = {
    planning: { color: 'bg-slate-100 text-slate-700', icon: Clock },
    construction: { color: 'bg-amber-100 text-amber-700', icon: Building2 },
    active: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    maintenance: { color: 'bg-yellow-100 text-yellow-700', icon: Wrench },
    suspended: { color: 'bg-red-100 text-red-700', icon: Activity }
  };

  const statusInfo = statusConfig[lab.status] || statusConfig.active;
  const StatusIcon = statusInfo.icon;
  const utilizationPercent = ((lab.current_projects || 0) / (lab.capacity || 1)) * 100;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Workflow Modals */}
      {showInfrastructure && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <LivingLabInfrastructureWizard livingLab={lab} onClose={() => setShowInfrastructure(false)} />
          </div>
        </div>
      )}
      {showCapacityOptimizer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <AICapacityOptimizer livingLab={lab} onClose={() => setShowCapacityOptimizer(false)} />
          </div>
        </div>
      )}
      {showLaunch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <LivingLabLaunchChecklist lab={lab} onClose={() => setShowLaunch(false)} />
          </div>
        </div>
      )}
      {showAccreditation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <LivingLabAccreditationWorkflow lab={lab} onClose={() => setShowAccreditation(false)} />
          </div>
        </div>
      )}
      {showExpertMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <LivingLabExpertMatching lab={lab} onClose={() => setShowExpertMatch(false)} />
          </div>
        </div>
      )}
      {showEventManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <LivingLabEventManager lab={lab} onClose={() => setShowEventManager(false)} />
          </div>
        </div>
      )}
      {showMilestones && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <LivingLabResearchMilestoneTracker lab={lab} projectId={lab?.current_projects?.[0]?.id} onClose={() => setShowMilestones(false)} />
          </div>
        </div>
      )}
      {showPublication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <LivingLabPublicationSubmission lab={lab} onClose={() => setShowPublication(false)} />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-teal-600 via-blue-600 to-indigo-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {lab.code && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/40 font-mono">
                    {lab.code}
                  </Badge>
                )}
                <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {lab.status}
                </Badge>
                <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                  {lab.type}
                </Badge>
                {lab.is_featured && (
                  <Badge className="bg-amber-500 text-white">
                    <Award className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-5xl font-bold mb-2">
                {language === 'ar' && lab.name_ar ? lab.name_ar : lab.name_en}
              </h1>
              {(lab.tagline_en || lab.tagline_ar) && (
                <p className="text-xl text-white/90">
                  {language === 'ar' && lab.tagline_ar ? lab.tagline_ar : lab.tagline_en}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm">
                {lab.city_id && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{lab.city_id}</span>
                  </div>
                )}
                {lab.area_sqm && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span>{(lab.area_sqm / 1000).toFixed(1)}K sqm</span>
                  </div>
                )}
                {lab.launch_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Since {lab.launch_date ? new Date(lab.launch_date).getFullYear() : 'N/A'}</span>
                  </div>
                )}
                {lab.university_id && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    <span>University Affiliated</span>
                  </div>
                )}
              </div>
              {lab.focus_areas && lab.focus_areas.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {lab.focus_areas.map((area, idx) => (
                    <Badge key={idx} variant="outline" className="bg-white/10 text-white border-white/30">
                      {area.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Button onClick={() => setShowInfrastructure(true)} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                <Wrench className="h-4 w-4 mr-2" />
                {t({ en: 'Infrastructure', ar: 'بنية تحتية' })}
              </Button>
              <Button onClick={() => setShowCapacityOptimizer(true)} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'Capacity AI', ar: 'سعة ذكية' })}
              </Button>
              {lab.status === 'planning' && (
                <Button onClick={() => setShowLaunch(true)} className="bg-green-600 hover:bg-green-700">
                  <Rocket className="h-4 w-4 mr-2" />
                  {t({ en: 'Launch', ar: 'إطلاق' })}
                </Button>
              )}
              {lab.status === 'active' && (
                <Button onClick={() => setShowAccreditation(true)} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                  <Award className="h-4 w-4 mr-2" />
                  {t({ en: 'Accreditation', ar: 'اعتماد' })}
                </Button>
              )}
              <Link to={createPageUrl(`LivingLabEdit?id=${labId}`)}>
                <Button variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                  {t({ en: 'Edit', ar: 'تعديل' })}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Capacity', ar: 'السعة' })}</p>
                <p className="text-3xl font-bold text-teal-600">{lab.capacity || 0}</p>
              </div>
              <Beaker className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
                <p className="text-3xl font-bold text-blue-600">{lab.current_projects || 0}</p>
              </div>
              <TestTube className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
                <p className="text-3xl font-bold text-purple-600">{lab.total_completed_projects || 0}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Equipment', ar: 'المعدات' })}</p>
                <p className="text-3xl font-bold text-amber-600">{lab.equipment?.length || 0}</p>
              </div>
              <Wrench className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Utilization', ar: 'الاستخدام' })}</p>
                <p className="text-3xl font-bold text-green-600">{utilizationPercent.toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Progress */}
      {lab.capacity && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-700">
                {t({ en: 'Capacity Utilization', ar: 'استخدام السعة' })}
              </p>
              <span className="text-sm text-slate-600">
                {lab.current_projects} / {lab.capacity} {t({ en: 'projects', ar: 'مشاريع' })}
              </span>
            </div>
            <Progress value={utilizationPercent} className="h-3" />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="workflow" className="space-y-6">
        <TabsList className="grid w-full grid-cols-13 h-auto">
          <TabsTrigger value="workflow" className="flex flex-col gap-1 py-3">
            <Activity className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Workflow', ar: 'سير العمل' })}</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex flex-col gap-1 py-3">
            <FileText className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Overview', ar: 'نظرة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="facilities" className="flex flex-col gap-1 py-3">
            <Building2 className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Facilities', ar: 'مرافق' })}</span>
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex flex-col gap-1 py-3">
            <Wrench className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Equipment', ar: 'معدات' })}</span>
          </TabsTrigger>
          <TabsTrigger value="software" className="flex flex-col gap-1 py-3">
            <Monitor className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Software', ar: 'برامج' })}</span>
          </TabsTrigger>
          <TabsTrigger value="connectivity" className="flex flex-col gap-1 py-3">
            <Wifi className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Tech', ar: 'تقنية' })}</span>
          </TabsTrigger>
          <TabsTrigger value="experts" className="flex flex-col gap-1 py-3">
            <Users className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Experts', ar: 'خبراء' })}</span>
          </TabsTrigger>
          <TabsTrigger value="certification" className="flex flex-col gap-1 py-3">
            <Award className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Certify', ar: 'اعتماد' })}</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex flex-col gap-1 py-3">
            <Microscope className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Projects', ar: 'مشاريع' })}</span>
          </TabsTrigger>
          <TabsTrigger value="booking" className="flex flex-col gap-1 py-3">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Book', ar: 'حجز' })}</span>
          </TabsTrigger>
          <TabsTrigger value="sandboxes" className="flex flex-col gap-1 py-3">
            <Shield className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Sandboxes', ar: 'مناطق' })}</span>
          </TabsTrigger>
          <TabsTrigger value="publications" className="flex flex-col gap-1 py-3">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Research', ar: 'بحوث' })}</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex flex-col gap-1 py-3">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Events', ar: 'فعاليات' })}</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="flex flex-col gap-1 py-3">
            <Image className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Media', ar: 'وسائط' })}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-6">
          <LabPolicyEvidenceWorkflow livingLab={lab} />
          <LivingLabWorkflowTab lab={lab} />
          <UnifiedWorkflowApprovalTab
            entityType="LivingLab"
            entityId={labId}
            currentStage={
              lab.status === 'setup' ? 'setup' :
              lab.status === 'accreditation_pending' ? 'accreditation' :
              lab.status === 'operational' ? 'operational' : 'setup'
            }
          />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <LivingLabDashboard lab={lab} projects={projects} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'About', ar: 'حول' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {lab.description_en || 'No description provided'}
                  </p>
                  {lab.description_ar && (
                    <div className="pt-4 border-t" dir="rtl">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {lab.description_ar}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {(lab.objectives_en || lab.objectives_ar) && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Objectives', ar: 'الأهداف' })}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {lab.objectives_en}
                    </p>
                    {lab.objectives_ar && (
                      <div className="pt-4 border-t" dir="rtl">
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {lab.objectives_ar}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {lab.research_themes && lab.research_themes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Microscope className="h-5 w-5 text-blue-600" />
                      {t({ en: 'Research Themes', ar: 'المواضيع البحثية' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {lab.research_themes.map((theme, idx) => (
                        <div key={idx} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                          <h4 className="font-semibold text-slate-900 mb-1">{theme.theme}</h4>
                          <p className="text-sm text-slate-700 mb-2">{theme.description}</p>
                          {theme.active_projects > 0 && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                              {theme.active_projects} active projects
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {lab.success_stories && lab.success_stories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-600" />
                      {t({ en: 'Success Stories', ar: 'قصص النجاح' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {lab.success_stories.map((story, idx) => (
                        <div key={idx} className="p-4 border-l-4 border-amber-500 bg-amber-50 rounded-r-lg">
                          <h4 className="font-semibold text-slate-900 mb-1">{story.title}</h4>
                          <p className="text-sm text-slate-700 mb-2">{story.description}</p>
                          <p className="text-sm text-amber-900 font-medium">{story.outcome}</p>
                          {story.year && (
                            <span className="text-xs text-slate-500 mt-1 block">{story.year}</span>
                          )}
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
                  {lab.director_name && (
                    <div>
                      <p className="text-xs text-slate-500">{t({ en: 'Director', ar: 'المدير' })}</p>
                      <p className="text-sm font-medium text-slate-900">{lab.director_name}</p>
                    </div>
                  )}
                  {(lab.director_email || lab.contact_email) && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${lab.director_email || lab.contact_email}`} className="hover:text-blue-600">
                        {lab.director_email || lab.contact_email}
                      </a>
                    </div>
                  )}
                  {(lab.director_phone || lab.contact_phone) && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="h-4 w-4" />
                      <span>{lab.director_phone || lab.contact_phone}</span>
                    </div>
                  )}
                  {lab.website_url && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Globe className="h-4 w-4" />
                      <a href={lab.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                        {t({ en: 'Website', ar: 'الموقع' })}
                      </a>
                    </div>
                  )}
                  {lab.booking_system_url && (
                    <Button asChild className="w-full">
                      <a href={lab.booking_system_url} target="_blank" rel="noopener noreferrer">
                        <Calendar className="h-4 w-4 mr-2" />
                        {t({ en: 'Book Resources', ar: 'حجز الموارد' })}
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {lab.operational_hours && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-slate-600" />
                      {t({ en: 'Hours', ar: 'الساعات' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700">{lab.operational_hours}</p>
                  </CardContent>
                </Card>
              )}

              {lab.membership_tiers && lab.membership_tiers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      {t({ en: 'Membership', ar: 'العضوية' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {lab.membership_tiers.map((tier, idx) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-sm">{tier.tier}</p>
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            {tier.annual_fee} SAR/year
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600">{tier.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {lab.accreditation && lab.accreditation.length > 0 && (
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-900">
                      <Award className="h-5 w-5" />
                      {t({ en: 'Accreditation', ar: 'الاعتماد' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {lab.accreditation.map((acc, idx) => (
                      <div key={idx} className="text-sm">
                        <p className="font-medium text-purple-900">{acc.certification}</p>
                        <p className="text-xs text-purple-700">{acc.organization}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="facilities">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Facilities', ar: 'المرافق' })}</CardTitle>
            </CardHeader>
            <CardContent>
              {lab.facilities && lab.facilities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lab.facilities.map((facility, idx) => (
                    <div key={idx} className="p-4 border rounded-lg hover:border-teal-300 transition-colors">
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
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        {facility.capacity && <span>Capacity: {facility.capacity}</span>}
                        {facility.hourly_rate && <span>{facility.hourly_rate} SAR/hr</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">
                  {t({ en: 'No facilities listed', ar: 'لا توجد مرافق' })}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Equipment & Tools', ar: 'المعدات والأدوات' })}</CardTitle>
            </CardHeader>
            <CardContent>
              {lab.equipment && lab.equipment.length > 0 ? (
                <div className="space-y-3">
                  {lab.equipment.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.name}</p>
                        {item.category && (
                          <p className="text-xs text-slate-500">{item.category}</p>
                        )}
                        {(item.manufacturer || item.model) && (
                          <p className="text-xs text-slate-600 mt-1">
                            {item.manufacturer} {item.model}
                          </p>
                        )}
                        {item.specifications && (
                          <p className="text-xs text-slate-600 mt-1">{item.specifications}</p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <Badge className={
                          item.availability === 'available' ? 'bg-green-100 text-green-700' :
                          item.availability === 'reserved' ? 'bg-amber-100 text-amber-700' :
                          item.availability === 'maintenance' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {item.availability}
                        </Badge>
                        {item.quantity && (
                          <p className="text-xs text-slate-600 mt-1">Qty: {item.quantity}</p>
                        )}
                        {item.cost_per_hour && (
                          <p className="text-xs text-slate-600 mt-1">{item.cost_per_hour} SAR/hr</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">
                  {t({ en: 'No equipment listed', ar: 'لا توجد معدات' })}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="software">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-purple-600" />
                {t({ en: 'Software Tools', ar: 'الأدوات البرمجية' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lab.software_tools && lab.software_tools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lab.software_tools.map((tool, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-slate-900 mb-1">{tool.name}</h4>
                      {tool.category && (
                        <Badge variant="outline" className="text-xs mb-2">{tool.category}</Badge>
                      )}
                      {tool.description && (
                        <p className="text-sm text-slate-600 mb-2">{tool.description}</p>
                      )}
                      {tool.licenses && (
                        <p className="text-xs text-slate-500">{tool.licenses} licenses available</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">
                  {t({ en: 'No software tools listed', ar: 'لا توجد أدوات برمجية' })}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connectivity">
          <div className="space-y-6">
            {lab.connectivity && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="h-5 w-5 text-blue-600" />
                    {t({ en: 'Connectivity & Infrastructure', ar: 'الاتصال والبنية التحتية' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {lab.connectivity['5g_available'] && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>5G Network</span>
                      </div>
                    )}
                    {lab.connectivity.wifi_speed_mbps && (
                      <div className="flex items-center gap-2 text-sm">
                        <Wifi className="h-4 w-4 text-blue-600" />
                        <span>{lab.connectivity.wifi_speed_mbps} Mbps WiFi</span>
                      </div>
                    )}
                    {lab.connectivity.hpc_access && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>HPC Access</span>
                      </div>
                    )}
                    {lab.connectivity.iot_platform && (
                      <div className="flex items-center gap-2 text-sm">
                        <Database className="h-4 w-4 text-teal-600" />
                        <span>{lab.connectivity.iot_platform}</span>
                      </div>
                    )}
                  </div>
                  {lab.connectivity.cloud_services && lab.connectivity.cloud_services.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-700 mb-2">Cloud Services:</p>
                      <div className="flex flex-wrap gap-2">
                        {lab.connectivity.cloud_services.map((service, idx) => (
                          <Badge key={idx} variant="outline">{service}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {lab.datasets && lab.datasets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-teal-600" />
                    {t({ en: 'Datasets', ar: 'مجموعات البيانات' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lab.datasets.map((dataset, idx) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{dataset.name}</p>
                            {dataset.description && (
                              <p className="text-sm text-slate-600 mt-1">{dataset.description}</p>
                            )}
                            {dataset.size && (
                              <p className="text-xs text-slate-500 mt-1">{dataset.size}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {dataset.access_level}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {lab.technical_capabilities && lab.technical_capabilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Technical Capabilities', ar: 'القدرات التقنية' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {lab.technical_capabilities.map((cap, idx) => (
                      <Badge key={idx} variant="outline" className="text-sm">{cap}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="experts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  {t({ en: 'Expert Evaluations & Network', ar: 'تقييمات الخبراء والشبكة' })}
                </CardTitle>
                <Link to={createPageUrl(`ExpertMatchingEngine?entity_type=livinglab_project&entity_id=${labId}`)} target="_blank">
                  <Button size="sm" className="bg-purple-600">
                    <Users className="h-4 w-4 mr-2" />
                    {t({ en: 'Assign Experts', ar: 'تعيين خبراء' })}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Expert Evaluations */}
              {expertEvaluations.length > 0 && (
                <div>
                  <p className="font-semibold text-purple-900 mb-3">{t({ en: 'Research Evaluations', ar: 'تقييمات البحث' })}</p>
                  <div className="space-y-4">
                    {expertEvaluations.map((evaluation) => (
                      <div key={evaluation.id} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-slate-900">{evaluation.expert_email}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(evaluation.evaluation_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                            </p>
                            <Badge className="mt-1 text-xs" variant="outline">{evaluation.evaluation_stage}</Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-purple-600">{evaluation.overall_score}</div>
                            <Badge className={
                              evaluation.recommendation === 'approve' ? 'bg-green-100 text-green-700' :
                              evaluation.recommendation === 'reject' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }>
                              {evaluation.recommendation?.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                        </div>

                        {evaluation.feedback_text && (
                          <div className="p-3 bg-white rounded border mb-3">
                            <p className="text-sm text-slate-700">{evaluation.feedback_text}</p>
                          </div>
                        )}

                        {evaluation.custom_criteria && Object.keys(evaluation.custom_criteria).length > 0 && (
                          <div className="grid grid-cols-4 gap-2">
                            {Object.entries(evaluation.custom_criteria).map(([key, value]) => (
                              <div key={key} className="text-center p-2 bg-white rounded">
                                <div className="text-sm font-bold text-purple-600">{value}</div>
                                <div className="text-xs text-slate-600">{key.replace(/_/g, ' ')}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expert Network */}
              {lab.expert_network && lab.expert_network.length > 0 && (
                <div>
                  <p className="font-semibold text-purple-900 mb-3">{t({ en: 'Expert Network', ar: 'شبكة الخبراء' })}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lab.expert_network.map((expert, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-slate-900">{expert.name}</p>
                            {expert.affiliation && (
                              <p className="text-xs text-slate-500">{expert.affiliation}</p>
                            )}
                          </div>
                          {expert.available_for_consultation && (
                            <Badge className="bg-green-100 text-green-700 text-xs">Available</Badge>
                          )}
                        </div>
                        {expert.expertise && expert.expertise.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {expert.expertise.map((exp, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{exp}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expertEvaluations.length === 0 && (!lab.expert_network || lab.expert_network.length === 0) && (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-4">{t({ en: 'No expert evaluations yet', ar: 'لا توجد تقييمات' })}</p>
                  <Link to={createPageUrl(`ExpertMatchingEngine?entity_type=livinglab_project&entity_id=${labId}`)} target="_blank">
                    <Button className="bg-purple-600">
                      <Users className="h-4 w-4 mr-2" />
                      {t({ en: 'Assign Research Experts', ar: 'تعيين خبراء البحث' })}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certification">
          <LabSolutionCertificationWorkflow livingLabId={labId} />
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Active Projects', ar: 'المشاريع النشطة' })} ({projects.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      to={createPageUrl(`RDProjectDetail?id=${project.id}`)}
                      className="block p-4 border rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{project.title_en}</p>
                          <p className="text-sm text-slate-600">{project.institution}</p>
                        </div>
                        <Badge>{project.status?.replace(/_/g, ' ')}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">
                  {t({ en: 'No active projects', ar: 'لا توجد مشاريع نشطة' })}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking">
          <LivingLabResourceBooking lab={lab} />
        </TabsContent>

        <TabsContent value="sandboxes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                {t({ en: 'Linked Sandboxes', ar: 'مناطق الاختبار المرتبطة' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sandboxes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sandboxes.map((sandbox) => (
                    <Link
                      key={sandbox.id}
                      to={createPageUrl(`SandboxDetail?id=${sandbox.id}`)}
                      className="block p-4 border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                    >
                      <p className="font-medium text-slate-900">{sandbox.name_en}</p>
                      <p className="text-sm text-slate-600">{sandbox.domain?.replace(/_/g, ' ')}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge>{sandbox.status}</Badge>
                        <span className="text-xs text-slate-500">
                          {sandbox.current_pilots}/{sandbox.capacity} capacity
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">
                  {t({ en: 'No linked sandboxes', ar: 'لا توجد مناطق اختبار مرتبطة' })}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                {t({ en: 'Publications & Research', ar: 'المنشورات والأبحاث' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lab.publications && lab.publications.length > 0 ? (
                <div className="space-y-4">
                  {lab.publications.map((pub, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-slate-900 mb-1">{pub.title}</h4>
                      {pub.authors && pub.authors.length > 0 && (
                        <p className="text-sm text-slate-600 mb-1">
                          {pub.authors.join(', ')}
                        </p>
                      )}
                      <p className="text-sm text-slate-500">
                        {pub.publication} {pub.year && `(${pub.year})`}
                      </p>
                      {pub.url && (
                        <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                          View Publication
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">
                  {t({ en: 'No publications listed', ar: 'لا توجد منشورات' })}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-600" />
                {t({ en: 'Upcoming Events', ar: 'الفعاليات القادمة' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lab.events && lab.events.length > 0 ? (
                <div className="space-y-3">
                  {lab.events.map((event, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-900">{event.name}</h4>
                          {event.date && (
                            <p className="text-sm text-slate-600">{new Date(event.date).toLocaleDateString()}</p>
                          )}
                        </div>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                      {event.capacity && (
                        <p className="text-xs text-slate-500">Capacity: {event.capacity}</p>
                      )}
                      {event.registration_url && (
                        <Button variant="outline" size="sm" className="mt-2" asChild>
                          <a href={event.registration_url} target="_blank" rel="noopener noreferrer">
                            Register
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">
                  {t({ en: 'No upcoming events', ar: 'لا توجد فعاليات قادمة' })}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          {lab.image_url && (
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Main Image', ar: 'الصورة الرئيسية' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <img src={lab.image_url} alt={lab.name_en} className="w-full rounded-lg" />
              </CardContent>
            </Card>
          )}

          {lab.gallery_urls && lab.gallery_urls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Gallery', ar: 'المعرض' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {lab.gallery_urls.map((url, idx) => (
                    <img key={idx} src={url} alt={`Gallery ${idx + 1}`} className="w-full rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {lab.video_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-red-600" />
                  {t({ en: 'Video Tour', ar: 'جولة فيديو' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                  <p className="text-slate-500">Video Player</p>
                </div>
              </CardContent>
            </Card>
          )}

          {lab.virtual_tour_url && (
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Virtual Tour', ar: 'جولة افتراضية' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <a href={lab.virtual_tour_url} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    {t({ en: 'Take Virtual Tour', ar: 'جولة افتراضية' })}
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