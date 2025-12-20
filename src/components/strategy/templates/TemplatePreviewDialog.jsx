import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  Users, 
  Target, 
  BarChart3, 
  CheckCircle2, 
  Calendar,
  FileText,
  Loader2,
  Copy,
  Eye,
  Globe,
  AlertTriangle,
  GitBranch,
  Building2,
  Megaphone,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Shield
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function TemplatePreviewDialog({ 
  template, 
  open, 
  onOpenChange, 
  onApply,
  isApplying 
}) {
  const { t, language, isRTL } = useLanguage();

  if (!template) return null;

  // All content sections mapped to wizard steps
  const contentSections = [
    // Phase 1: Foundation
    { 
      icon: Eye, 
      label: { en: 'Vision & Mission', ar: 'الرؤية والرسالة' },
      phase: 'foundation',
      included: !!(template.vision_en || template.mission_en),
      detail: template.vision_en ? template.vision_en.substring(0, 100) + '...' : null
    },
    { 
      icon: Users, 
      label: { en: 'Stakeholder Analysis', ar: 'تحليل أصحاب المصلحة' },
      phase: 'foundation',
      count: template.stakeholders?.length || 0,
      included: template.stakeholders?.length > 0
    },
    { 
      icon: Globe, 
      label: { en: 'PESTEL Analysis', ar: 'تحليل PESTEL' },
      phase: 'foundation',
      included: !!(template.pestel && Object.values(template.pestel).some(arr => arr?.length > 0))
    },
    // Phase 2: Analysis
    { 
      icon: BarChart3, 
      label: { en: 'SWOT Analysis', ar: 'تحليل SWOT' },
      phase: 'analysis',
      included: !!(template.swot && Object.keys(template.swot).length > 0)
    },
    { 
      icon: TrendingUp, 
      label: { en: 'Scenario Planning', ar: 'تخطيط السيناريوهات' },
      phase: 'analysis',
      included: !!(template.scenarios && Object.keys(template.scenarios).length > 0)
    },
    { 
      icon: AlertTriangle, 
      label: { en: 'Risk Assessment', ar: 'تقييم المخاطر' },
      phase: 'analysis',
      count: template.risks?.length || 0,
      included: template.risks?.length > 0
    },
    { 
      icon: GitBranch, 
      label: { en: 'Dependencies & Constraints', ar: 'التبعيات والقيود' },
      phase: 'analysis',
      included: !!(template.dependencies?.length > 0 || template.constraints?.length > 0)
    },
    // Phase 3: Strategy
    { 
      icon: Target, 
      label: { en: 'Strategic Objectives', ar: 'الأهداف الاستراتيجية' },
      phase: 'strategy',
      count: template.objectives?.length || 0,
      included: template.objectives?.length > 0
    },
    { 
      icon: Globe, 
      label: { en: 'National Alignment', ar: 'التوافق الوطني' },
      phase: 'strategy',
      count: template.national_alignments?.length || 0,
      included: template.national_alignments?.length > 0
    },
    { 
      icon: CheckCircle2, 
      label: { en: 'KPIs & Metrics', ar: 'مؤشرات الأداء' },
      phase: 'strategy',
      count: template.kpis?.length || 0,
      included: template.kpis?.length > 0
    },
    { 
      icon: Calendar, 
      label: { en: 'Action Plans', ar: 'خطط العمل' },
      phase: 'strategy',
      count: template.action_plans?.length || 0,
      included: template.action_plans?.length > 0
    },
    { 
      icon: DollarSign, 
      label: { en: 'Resource Planning', ar: 'تخطيط الموارد' },
      phase: 'strategy',
      included: !!(template.resource_plan && (
        template.resource_plan.hr_requirements?.length > 0 ||
        template.resource_plan.technology_requirements?.length > 0 ||
        template.resource_plan.infrastructure_requirements?.length > 0 ||
        template.resource_plan.budget_allocation?.length > 0
      )),
      count: (template.resource_plan?.hr_requirements?.length || 0) + 
             (template.resource_plan?.technology_requirements?.length || 0)
    },
    // Phase 4: Implementation
    { 
      icon: Calendar, 
      label: { en: 'Timeline & Milestones', ar: 'الجدول الزمني' },
      phase: 'implementation',
      count: (template.milestones?.length || 0) + (template.phases?.length || 0),
      included: !!(template.milestones?.length > 0 || template.phases?.length > 0)
    },
    { 
      icon: Building2, 
      label: { en: 'Governance Structure', ar: 'هيكل الحوكمة' },
      phase: 'implementation',
      included: !!(template.governance && (
        template.governance.structure?.length > 0 ||
        template.governance.committees?.length > 0 ||
        template.governance.escalation_path?.length > 0
      ))
    },
    { 
      icon: Megaphone, 
      label: { en: 'Communication Plan', ar: 'خطة التواصل' },
      phase: 'implementation',
      included: !!(template.communication_plan && (
        template.communication_plan.internal_channels?.length > 0 ||
        template.communication_plan.external_channels?.length > 0 ||
        template.communication_plan.key_messages?.length > 0
      ))
    },
    { 
      icon: RefreshCw, 
      label: { en: 'Change Management', ar: 'إدارة التغيير' },
      phase: 'implementation',
      included: !!(template.change_management && (
        template.change_management.readiness_assessment?.trim?.() ||
        template.change_management.change_approach?.trim?.() ||
        template.change_management.training_plan?.length > 0 ||
        template.change_management.resistance_management?.trim?.()
      ))
    }
  ];

  const phases = [
    { key: 'foundation', label: { en: 'Foundation', ar: 'التأسيس' } },
    { key: 'analysis', label: { en: 'Analysis', ar: 'التحليل' } },
    { key: 'strategy', label: { en: 'Strategy', ar: 'الاستراتيجية' } },
    { key: 'implementation', label: { en: 'Implementation', ar: 'التنفيذ' } }
  ];

  const includedCount = contentSections.filter(s => s.included).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <span>{language === 'ar' ? template.name_ar : template.name_en}</span>
              <div className="flex items-center gap-2 mt-1">
                {template.is_featured && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                    {t({ en: 'Featured', ar: 'مميز' })}
                  </Badge>
                )}
                {template.template_category === 'system' && (
                  <Badge variant="outline" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    {t({ en: 'Official', ar: 'رسمي' })}
                  </Badge>
                )}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            {language === 'ar' ? template.description_ar : template.description_en}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">{t({ en: 'Overview', ar: 'نظرة عامة' })}</TabsTrigger>
            <TabsTrigger value="content">{t({ en: 'Content', ar: 'المحتوى' })}</TabsTrigger>
            <TabsTrigger value="details">{t({ en: 'Details', ar: 'التفاصيل' })}</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[350px] mt-4">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {template.usage_count || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t({ en: 'Uses', ar: 'استخدامات' })}
                  </div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-amber-500 flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-current" />
                    {template.template_rating || '-'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t({ en: 'Rating', ar: 'التقييم' })}
                  </div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {template.objectives?.length || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t({ en: 'Objectives', ar: 'الأهداف' })}
                  </div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {includedCount}/{contentSections.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t({ en: 'Sections', ar: 'أقسام' })}
                  </div>
                </div>
              </div>

              {/* Vision Preview */}
              {template.vision_en && (
                <div className="p-4 bg-primary/5 rounded-lg border">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    {t({ en: 'Vision', ar: 'الرؤية' })}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? template.vision_ar : template.vision_en}
                  </p>
                </div>
              )}

              {/* Objectives Preview */}
              {template.objectives?.length > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    {t({ en: 'Strategic Objectives', ar: 'الأهداف الاستراتيجية' })}
                  </h4>
                  <ul className="space-y-1">
                    {template.objectives.slice(0, 3).map((obj, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary font-medium">{idx + 1}.</span>
                        {language === 'ar' ? obj.title_ar : obj.title_en}
                      </li>
                    ))}
                    {template.objectives.length > 3 && (
                      <li className="text-xs text-muted-foreground">
                        +{template.objectives.length - 3} {t({ en: 'more', ar: 'المزيد' })}
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {template.template_tags?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-sm">
                    {t({ en: 'Tags', ar: 'العلامات' })}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {template.template_tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Content Tab - Shows all wizard sections */}
            <TabsContent value="content" className="space-y-4">
              {phases.map(phase => {
                const phaseSections = contentSections.filter(s => s.phase === phase.key);
                const phaseIncluded = phaseSections.filter(s => s.included).length;
                
                return (
                  <div key={phase.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">
                        {t(phase.label)}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {phaseIncluded}/{phaseSections.length}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {phaseSections.map((section, idx) => {
                        const Icon = section.icon;
                        return (
                          <div 
                            key={idx} 
                            className={`flex items-center justify-between p-2 rounded-lg ${
                              section.included ? 'bg-green-50 dark:bg-green-900/20' : 'bg-muted/30'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${section.included ? 'text-green-600' : 'text-muted-foreground'}`} />
                              <span className={`text-sm ${section.included ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {t(section.label)}
                              </span>
                            </div>
                            {section.included ? (
                              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs">
                                {section.count !== undefined ? `${section.count} items` : '✓'}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              {/* SWOT Preview */}
              {template.swot && Object.keys(template.swot).length > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    {t({ en: 'SWOT Analysis', ar: 'تحليل SWOT' })}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {template.swot.strengths?.length > 0 && (
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded">
                        <span className="font-medium text-green-700">
                          {t({ en: 'Strengths', ar: 'نقاط القوة' })}: {template.swot.strengths.length}
                        </span>
                      </div>
                    )}
                    {template.swot.weaknesses?.length > 0 && (
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded">
                        <span className="font-medium text-red-700">
                          {t({ en: 'Weaknesses', ar: 'نقاط الضعف' })}: {template.swot.weaknesses.length}
                        </span>
                      </div>
                    )}
                    {template.swot.opportunities?.length > 0 && (
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                        <span className="font-medium text-blue-700">
                          {t({ en: 'Opportunities', ar: 'الفرص' })}: {template.swot.opportunities.length}
                        </span>
                      </div>
                    )}
                    {template.swot.threats?.length > 0 && (
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded">
                        <span className="font-medium text-amber-700">
                          {t({ en: 'Threats', ar: 'التهديدات' })}: {template.swot.threats.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* National Alignments Preview */}
              {template.national_alignments?.length > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    {t({ en: 'National Alignment', ar: 'التوافق الوطني' })}
                  </h4>
                  <ul className="space-y-1">
                    {template.national_alignments.slice(0, 3).map((alignment, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {alignment.program_name || alignment.vision_program || 'Vision 2030 Program'}
                      </li>
                    ))}
                    {template.national_alignments.length > 3 && (
                      <li className="text-xs text-muted-foreground">
                        +{template.national_alignments.length - 3} {t({ en: 'more', ar: 'المزيد' })}
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Timeline Preview */}
              {(template.milestones?.length > 0 || template.phases?.length > 0) && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {t({ en: 'Timeline & Milestones', ar: 'الجدول الزمني' })}
                  </h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {template.milestones?.length > 0 && (
                      <p>{template.milestones.length} {t({ en: 'milestones defined', ar: 'معالم محددة' })}</p>
                    )}
                    {template.phases?.length > 0 && (
                      <p>{template.phases.length} {t({ en: 'phases planned', ar: 'مراحل مخططة' })}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Change Management Preview */}
              {template.change_management && Object.keys(template.change_management).length > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-primary" />
                    {t({ en: 'Change Management', ar: 'إدارة التغيير' })}
                  </h4>
                  {template.change_management.change_approach && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">{t({ en: 'Approach', ar: 'النهج' })}:</span> {template.change_management.change_approach}
                    </p>
                  )}
                  {template.change_management.training_plan?.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {template.change_management.training_plan.length} {t({ en: 'training programs defined', ar: 'برامج تدريب محددة' })}
                    </p>
                  )}
                </div>
              )}

              {/* Governance Preview */}
              {template.governance && Object.keys(template.governance).length > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    {t({ en: 'Governance Structure', ar: 'هيكل الحوكمة' })}
                  </h4>
                  {template.governance.structure?.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {template.governance.structure.length} {t({ en: 'roles defined', ar: 'أدوار محددة' })}
                    </p>
                  )}
                  {template.governance.committees?.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {template.governance.committees.length} {t({ en: 'committees', ar: 'لجان' })}
                    </p>
                  )}
                </div>
              )}

              <Separator />

              {/* Creator Info */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {t({ en: 'Created by', ar: 'تم الإنشاء بواسطة' })}: {template.owner_email?.split('@')[0] || 'System'}
                </span>
                <span>
                  {new Date(template.created_at).toLocaleDateString()}
                </span>
              </div>
              
              {template.template_reviews > 0 && (
                <div className="text-xs text-muted-foreground">
                  {template.template_reviews} {t({ en: 'reviews', ar: 'تقييمات' })}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t({ en: 'Close', ar: 'إغلاق' })}
          </Button>
          <Button onClick={onApply} disabled={isApplying}>
            {isApplying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Applying...', ar: 'جاري التطبيق...' })}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                {t({ en: 'Apply Template', ar: 'تطبيق القالب' })}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}