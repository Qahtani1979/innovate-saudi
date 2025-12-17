import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  CheckCircle2, AlertTriangle, Target, Link, Activity, 
  Lightbulb, Calendar, FileText, Save, Loader2, Send,
  Users, Globe, Shield, Megaphone, DollarSign, Download, FileSpreadsheet,
  ChevronDown, ChevronRight, TrendingUp, BarChart3, Clock, Building,
  AlertCircle, Briefcase, PieChart, MessageSquare, RefreshCw, GitBranch,
  Eye, List, Sparkles, Award, Gauge, CheckCircle, XCircle, Flag,
  ArrowRight, Zap, BookOpen, Settings, Layers, Network, Info
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { useTaxonomy } from '@/contexts/TaxonomyContext';
import { useWorkflowAI } from '@/hooks/strategy/useWorkflowAI';
import { useStrategyVersions } from '@/hooks/strategy/useStrategyVersions';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart } from '../shared';
import AIStrategicPlanAnalyzer from '../AIStrategicPlanAnalyzer';

// Readiness Level Configuration
const READINESS_LEVELS = [
  { min: 90, label: { en: 'Excellent', ar: 'ممتاز' }, color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50 dark:bg-green-950/30', icon: CheckCircle2 },
  { min: 75, label: { en: 'Good', ar: 'جيد' }, color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50 dark:bg-blue-950/30', icon: CheckCircle },
  { min: 60, label: { en: 'Adequate', ar: 'كافي' }, color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50 dark:bg-yellow-950/30', icon: AlertCircle },
  { min: 40, label: { en: 'Needs Work', ar: 'يحتاج عمل' }, color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50 dark:bg-orange-950/30', icon: AlertTriangle },
  { min: 0, label: { en: 'Critical', ar: 'حرج' }, color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50 dark:bg-red-950/30', icon: XCircle }
];

// Section Configuration with weights for completeness
const SECTION_CONFIG = [
  { key: 'context', icon: FileText, label: { en: 'Context', ar: 'السياق' }, weight: 1, step: 1 },
  { key: 'vision', icon: Target, label: { en: 'Vision & Mission', ar: 'الرؤية والرسالة' }, weight: 1.5, step: 2 },
  { key: 'stakeholders', icon: Users, label: { en: 'Stakeholders', ar: 'أصحاب المصلحة' }, weight: 1, step: 3 },
  { key: 'pestel', icon: Globe, label: { en: 'PESTEL', ar: 'PESTEL' }, weight: 0.8, step: 4 },
  { key: 'swot', icon: BarChart3, label: { en: 'SWOT', ar: 'SWOT' }, weight: 0.8, step: 5 },
  { key: 'scenarios', icon: Lightbulb, label: { en: 'Scenarios', ar: 'السيناريوهات' }, weight: 0.7, step: 6 },
  { key: 'risks', icon: AlertTriangle, label: { en: 'Risks', ar: 'المخاطر' }, weight: 1, step: 7 },
  { key: 'dependencies', icon: Link, label: { en: 'Dependencies', ar: 'التبعيات' }, weight: 0.5, step: 8 },
  { key: 'objectives', icon: Target, label: { en: 'Objectives', ar: 'الأهداف' }, weight: 1.5, step: 9 },
  { key: 'alignments', icon: Building, label: { en: 'National Alignment', ar: 'التوافق الوطني' }, weight: 0.8, step: 10 },
  { key: 'kpis', icon: Activity, label: { en: 'KPIs', ar: 'المؤشرات' }, weight: 1.2, step: 11 },
  { key: 'actions', icon: Briefcase, label: { en: 'Action Plans', ar: 'خطط العمل' }, weight: 1.2, step: 12 },
  { key: 'resources', icon: DollarSign, label: { en: 'Resources', ar: 'الموارد' }, weight: 1, step: 13 },
  { key: 'timeline', icon: Calendar, label: { en: 'Timeline', ar: 'الجدول الزمني' }, weight: 1, step: 14 },
  { key: 'governance', icon: Shield, label: { en: 'Governance', ar: 'الحوكمة' }, weight: 1, step: 15 },
  { key: 'communication', icon: Megaphone, label: { en: 'Communication', ar: 'التواصل' }, weight: 0.8, step: 16 },
  { key: 'change', icon: RefreshCw, label: { en: 'Change Management', ar: 'إدارة التغيير' }, weight: 0.8, step: 17 }
];

// Helper functions
const getCompletenessColor = (pct) => {
  if (pct >= 80) return 'text-green-500';
  if (pct >= 60) return 'text-blue-500';
  if (pct >= 40) return 'text-yellow-500';
  return 'text-red-500';
};

const getProgressBarColor = (pct) => {
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 60) return 'bg-blue-500';
  if (pct >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
};

export default function Step18Review({ 
  data, 
  onSave,
  onSubmitForApproval,
  onUpdatePlan,
  onNavigateToStep,
  isSaving,
  isSubmitting,
  validationErrors = [],
  mode = 'create',
  strategicPlanId = null,
  isReadOnly = false
}) {
  const { language, t, isRTL } = useLanguage();
  const { getSectorName: getTaxonomySectorName, strategicThemes, technologies, visionPrograms } = useTaxonomy();
  
  const { optimizeWorkflow, validatePlan, isLoading: workflowLoading } = useWorkflowAI();
  const { versions, createVersion, isLoading: versionsLoading } = useStrategyVersions(strategicPlanId);
  
  const [isExporting, setIsExporting] = useState(false);
  const [activeView, setActiveView] = useState('summary');
  const [expandedSections, setExpandedSections] = useState({});

  const getText = (enText, arText) => {
    if (language === 'ar') return arText || enText || '';
    return enText || arText || '';
  };

  // Data extraction
  const objectives = data.objectives || [];
  const kpis = data.kpis || [];
  const actionPlans = data.action_plans || [];
  const alignments = data.national_alignments || [];
  const milestones = data.milestones || [];
  const phases = data.phases || [];
  const swot = data.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  const pestel = data.pestel || {};
  const stakeholders = data.stakeholders || [];
  const risks = data.risks || [];
  const governance = data.governance || {};
  const communicationPlan = data.communication_plan || {};
  const changeManagement = data.change_management || {};
  const resourcePlan = data.resource_plan || {};
  const scenarios = data.scenarios || {};
  const dependencies = data.dependencies || [];
  const constraints = data.constraints || [];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculate detailed completeness for all sections
  const sectionCompleteness = useMemo(() => {
    return {
      context: !!(getText(data.name_en, data.name_ar) && getText(data.description_en, data.description_ar)),
      vision: !!(getText(data.vision_en, data.vision_ar) && getText(data.mission_en, data.mission_ar)),
      stakeholders: stakeholders.length >= 3,
      pestel: Object.values(pestel).filter(arr => arr?.length > 0).length >= 3,
      swot: (swot.strengths?.length > 0 && swot.weaknesses?.length > 0 && swot.opportunities?.length > 0 && swot.threats?.length > 0),
      scenarios: !!(scenarios.best_case?.description_en || scenarios.most_likely?.description_en || scenarios.worst_case?.description_en),
      risks: risks.length >= 3,
      dependencies: (dependencies.length > 0 || constraints.length > 0),
      objectives: objectives.length >= 3,
      alignments: alignments.length > 0,
      kpis: kpis.length >= objectives.length && kpis.length > 0,
      actions: actionPlans.length > 0,
      resources: !!(resourcePlan.hr_requirements?.length > 0 || resourcePlan.budget_allocation?.length > 0),
      timeline: (phases.length > 0 || milestones.length > 0),
      governance: !!(governance.committees?.length > 0 || governance.roles?.length > 0),
      communication: !!(communicationPlan.key_messages?.length > 0 || communicationPlan.internal_channels?.length > 0 || communicationPlan.external_channels?.length > 0),
      change: !!(changeManagement.training_plan?.length > 0 || changeManagement.stakeholder_impacts?.length > 0 || changeManagement.readiness_assessment_en?.trim())
    };
  }, [data, stakeholders, pestel, swot, scenarios, risks, dependencies, constraints, objectives, alignments, kpis, actionPlans, resourcePlan, phases, milestones, governance, communicationPlan, changeManagement]);

  // Calculate weighted completeness score
  const completenessMetrics = useMemo(() => {
    let totalWeight = 0;
    let completedWeight = 0;
    const sectionDetails = [];

    SECTION_CONFIG.forEach(section => {
      const isComplete = sectionCompleteness[section.key];
      totalWeight += section.weight;
      if (isComplete) completedWeight += section.weight;
      sectionDetails.push({
        ...section,
        isComplete,
        status: isComplete ? 'complete' : 'incomplete'
      });
    });

    const score = Math.round((completedWeight / totalWeight) * 100);
    const completedCount = Object.values(sectionCompleteness).filter(Boolean).length;
    const totalCount = Object.keys(sectionCompleteness).length;
    const readinessLevel = READINESS_LEVELS.find(level => score >= level.min);

    return { score, completedCount, totalCount, sectionDetails, readinessLevel };
  }, [sectionCompleteness]);

  // Quality metrics
  const qualityMetrics = useMemo(() => {
    const kpiObjectiveCoverage = objectives.length > 0 ? Math.min(100, Math.round((kpis.length / objectives.length) * 100)) : 0;
    const actionPlanCoverage = objectives.length > 0 ? Math.min(100, Math.round((actionPlans.length / objectives.length) * 100)) : 0;
    const riskMitigationRate = risks.length > 0 ? Math.round((risks.filter(r => r.mitigation_en || r.mitigation_ar).length / risks.length) * 100) : 0;
    const stakeholderEngagement = stakeholders.length > 0 ? Math.round((stakeholders.filter(s => s.engagement_strategy || s.engagement_strategy_en).length / stakeholders.length) * 100) : 0;
    const bilingualCoverage = calculateBilingualCoverage();
    
    return {
      kpiObjectiveCoverage,
      actionPlanCoverage,
      riskMitigationRate,
      stakeholderEngagement,
      bilingualCoverage,
      overallQuality: Math.round((kpiObjectiveCoverage + actionPlanCoverage + riskMitigationRate + stakeholderEngagement + bilingualCoverage) / 5)
    };
  }, [objectives, kpis, actionPlans, risks, stakeholders]);

  // Calculate bilingual coverage
  function calculateBilingualCoverage() {
    let fields = 0;
    let bilingual = 0;
    
    // Check main fields
    if (data.name_en) fields++;
    if (data.name_ar) bilingual++;
    if (data.vision_en) fields++;
    if (data.vision_ar) bilingual++;
    if (data.mission_en) fields++;
    if (data.mission_ar) bilingual++;
    
    // Check objectives
    objectives.forEach(obj => {
      if (obj.name_en) fields++;
      if (obj.name_ar) bilingual++;
    });
    
    return fields > 0 ? Math.round((bilingual / fields) * 100) : 0;
  }

  // Validation errors
  const getValidationErrors = () => {
    const errors = [];
    if (!getText(data.name_en, data.name_ar)) errors.push({ type: 'critical', message: t({ en: 'Plan name is required', ar: 'اسم الخطة مطلوب' }), step: 1 });
    if (!getText(data.vision_en, data.vision_ar)) errors.push({ type: 'critical', message: t({ en: 'Vision statement is required', ar: 'بيان الرؤية مطلوب' }), step: 2 });
    if (!getText(data.mission_en, data.mission_ar)) errors.push({ type: 'critical', message: t({ en: 'Mission statement is required', ar: 'بيان الرسالة مطلوب' }), step: 2 });
    if (objectives.length < 1) errors.push({ type: 'critical', message: t({ en: 'At least 1 objective required', ar: 'مطلوب هدف واحد على الأقل' }), step: 9 });
    if (objectives.length < 3) errors.push({ type: 'warning', message: t({ en: 'At least 3 objectives recommended', ar: 'يوصى بـ 3 أهداف على الأقل' }), step: 9 });
    if (kpis.length === 0) errors.push({ type: 'warning', message: t({ en: 'KPIs recommended for tracking', ar: 'يوصى بمؤشرات للمتابعة' }), step: 11 });
    if (risks.length === 0) errors.push({ type: 'warning', message: t({ en: 'Risk assessment recommended', ar: 'يوصى بتقييم المخاطر' }), step: 7 });
    if (stakeholders.length === 0) errors.push({ type: 'warning', message: t({ en: 'Stakeholder mapping recommended', ar: 'يوصى بتحديد أصحاب المصلحة' }), step: 3 });
    return errors;
  };

  const allErrors = [...validationErrors.map(e => ({ type: 'critical', message: e })), ...getValidationErrors()];
  const criticalErrors = allErrors.filter(e => e.type === 'critical');
  const warningErrors = allErrors.filter(e => e.type === 'warning');
  const canSubmit = criticalErrors.length === 0 && completenessMetrics.score >= 40;

  // Navigation handler
  const handleNavigateToStep = (step) => {
    if (onNavigateToStep) onNavigateToStep(step);
  };

  // AI Action Handlers
  const handleApplySuggestion = async (type, item) => {
    if (!onUpdatePlan) {
      toast.info(t({ en: 'Auto-apply not available in this mode', ar: 'التطبيق التلقائي غير متاح في هذا الوضع' }));
      return;
    }

    switch (type) {
      case 'quick_win':
        toast.success(t({ en: 'Quick win noted', ar: 'تم تسجيل المكسب السريع' }));
        break;
      case 'gap_fix':
        toast.info(t({ en: `Review ${item.area} to address this gap`, ar: `راجع ${item.area} لمعالجة هذه الفجوة` }));
        break;
      case 'recommendation':
        const newActionItem = {
          id: `ai-rec-${Date.now()}`,
          title_en: item.title,
          title_ar: item.title,
          description: item.description,
          status: 'pending',
          priority: item.impact,
          source: 'ai_recommendation'
        };
        const updatedActionPlans = [...(data.action_plans || []), newActionItem];
        await onUpdatePlan({ action_plans: updatedActionPlans });
        toast.success(t({ en: 'Recommendation added to action plans', ar: 'تمت إضافة التوصية إلى خطط العمل' }));
        break;
      default:
        toast.info(t({ en: 'Suggestion noted', ar: 'تم تسجيل الاقتراح' }));
    }
  };

  const handleCreateTask = async (taskData) => {
    if (!onUpdatePlan) {
      toast.info(t({ en: 'Task creation not available in this mode', ar: 'إنشاء المهام غير متاح في هذا الوضع' }));
      return;
    }

    const newTask = {
      id: `task-${Date.now()}`,
      title_en: taskData.title,
      title_ar: taskData.title,
      description: taskData.description,
      status: 'not_started',
      priority: taskData.priority || 'medium',
      effort: taskData.effort || 'medium',
      source: taskData.source || 'ai_analysis',
      created_at: new Date().toISOString()
    };

    const currentActionPlans = data.action_plans || [];
    const aiTasksPlan = currentActionPlans.find(p => p.source === 'ai_tasks') || {
      id: 'ai-tasks-plan',
      title_en: 'AI-Generated Tasks',
      title_ar: 'المهام المُولَّدة بالذكاء الاصطناعي',
      source: 'ai_tasks',
      status: 'active',
      action_items: []
    };

    aiTasksPlan.action_items = [...(aiTasksPlan.action_items || []), newTask];
    const updatedPlans = currentActionPlans.filter(p => p.source !== 'ai_tasks');
    updatedPlans.push(aiTasksPlan);
    await onUpdatePlan({ action_plans: updatedPlans });
  };

  // PDF Export
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      doc.setFontSize(20);
      doc.setTextColor(0, 51, 102);
      doc.text(getText(data.name_en, data.name_ar) || t({ en: 'Strategic Plan', ar: 'الخطة الاستراتيجية' }), pageWidth / 2, y, { align: 'center' });
      y += 15;

      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`${data.start_year || ''} - ${data.end_year || ''}`, pageWidth / 2, y, { align: 'center' });
      y += 15;

      // Readiness Score
      doc.setFontSize(12);
      doc.setTextColor(0, 102, 51);
      doc.text(`${t({ en: 'Readiness Score', ar: 'درجة الجاهزية' })}: ${completenessMetrics.score}%`, pageWidth / 2, y, { align: 'center' });
      y += 15;

      // Vision
      const vision = getText(data.vision_en, data.vision_ar);
      if (vision) {
        doc.setFontSize(14);
        doc.setTextColor(0, 51, 102);
        doc.text(t({ en: 'Vision', ar: 'الرؤية' }), 20, y);
        y += 8;
        doc.setFontSize(10);
        doc.setTextColor(50);
        const visionLines = doc.splitTextToSize(vision, pageWidth - 40);
        doc.text(visionLines, 20, y);
        y += visionLines.length * 5 + 10;
      }

      // Mission
      const mission = getText(data.mission_en, data.mission_ar);
      if (mission) {
        doc.setFontSize(14);
        doc.setTextColor(0, 51, 102);
        doc.text(t({ en: 'Mission', ar: 'الرسالة' }), 20, y);
        y += 8;
        doc.setFontSize(10);
        doc.setTextColor(50);
        const missionLines = doc.splitTextToSize(mission, pageWidth - 40);
        doc.text(missionLines, 20, y);
        y += missionLines.length * 5 + 10;
      }

      // Statistics
      doc.setFontSize(14);
      doc.setTextColor(0, 51, 102);
      doc.text(t({ en: 'Plan Statistics', ar: 'إحصائيات الخطة' }), 20, y);
      y += 10;
      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.text(`• ${t({ en: 'Objectives', ar: 'الأهداف' })}: ${objectives.length}`, 25, y); y += 6;
      doc.text(`• ${t({ en: 'KPIs', ar: 'المؤشرات' })}: ${kpis.length}`, 25, y); y += 6;
      doc.text(`• ${t({ en: 'Action Plans', ar: 'خطط العمل' })}: ${actionPlans.length}`, 25, y); y += 6;
      doc.text(`• ${t({ en: 'Risks', ar: 'المخاطر' })}: ${risks.length}`, 25, y); y += 6;
      doc.text(`• ${t({ en: 'Stakeholders', ar: 'أصحاب المصلحة' })}: ${stakeholders.length}`, 25, y); y += 15;

      // Objectives
      if (objectives.length > 0) {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.setTextColor(0, 51, 102);
        doc.text(t({ en: 'Strategic Objectives', ar: 'الأهداف الاستراتيجية' }), 20, y);
        y += 10;
        doc.setFontSize(10);
        doc.setTextColor(50);
        objectives.forEach((obj, i) => {
          if (y > 270) { doc.addPage(); y = 20; }
          const text = `${i + 1}. ${getText(obj.name_en, obj.name_ar) || t({ en: 'Unnamed Objective', ar: 'هدف بدون اسم' })}`;
          const lines = doc.splitTextToSize(text, pageWidth - 45);
          doc.text(lines, 25, y);
          y += lines.length * 5 + 3;
        });
      }

      // KPIs
      if (kpis.length > 0) {
        if (y > 250) { doc.addPage(); y = 20; }
        y += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 51, 102);
        doc.text(t({ en: 'Key Performance Indicators', ar: 'مؤشرات الأداء الرئيسية' }), 20, y);
        y += 10;
        doc.setFontSize(10);
        doc.setTextColor(50);
        kpis.slice(0, 10).forEach((kpi, i) => {
          if (y > 270) { doc.addPage(); y = 20; }
          const text = `${i + 1}. ${getText(kpi.name_en, kpi.name_ar) || 'KPI'} - Target: ${kpi.target_value || '-'}`;
          doc.text(text, 25, y);
          y += 6;
        });
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`${t({ en: 'Page', ar: 'صفحة' })} ${i} / ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
        doc.text(`${t({ en: 'Generated', ar: 'تم الإنشاء' })}: ${new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}`, 20, 290);
      }

      doc.save(`${getText(data.name_en, data.name_ar) || 'strategic-plan'}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(t({ en: 'PDF exported successfully', ar: 'تم تصدير PDF بنجاح' }));
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t({ en: 'Failed to export PDF', ar: 'فشل تصدير PDF' }));
    } finally {
      setIsExporting(false);
    }
  };

  // Excel Export
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const wb = XLSX.utils.book_new();

      // Overview Sheet
      const overviewData = [
        [t({ en: 'Strategic Plan Overview', ar: 'نظرة عامة على الخطة الاستراتيجية' })],
        [''],
        [t({ en: 'Field', ar: 'الحقل' }), t({ en: 'Value', ar: 'القيمة' })],
        [t({ en: 'Name', ar: 'الاسم' }), getText(data.name_en, data.name_ar)],
        [t({ en: 'Vision', ar: 'الرؤية' }), getText(data.vision_en, data.vision_ar)],
        [t({ en: 'Mission', ar: 'الرسالة' }), getText(data.mission_en, data.mission_ar)],
        [t({ en: 'Start Year', ar: 'سنة البداية' }), data.start_year || ''],
        [t({ en: 'End Year', ar: 'سنة النهاية' }), data.end_year || ''],
        [t({ en: 'Completeness Score', ar: 'درجة الاكتمال' }), `${completenessMetrics.score}%`],
        [t({ en: 'Quality Score', ar: 'درجة الجودة' }), `${qualityMetrics.overallQuality}%`],
      ];
      const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(wb, wsOverview, t({ en: 'Overview', ar: 'نظرة عامة' }));

      // Objectives Sheet
      if (objectives.length > 0) {
        const objData = [
          ['#', t({ en: 'Name (EN)', ar: 'الاسم (إنجليزي)' }), t({ en: 'Name (AR)', ar: 'الاسم (عربي)' }), t({ en: 'Description', ar: 'الوصف' }), t({ en: 'Priority', ar: 'الأولوية' })]
        ];
        objectives.forEach((obj, i) => {
          objData.push([i + 1, obj.name_en || '', obj.name_ar || '', getText(obj.description_en, obj.description_ar), obj.priority || '']);
        });
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(objData), t({ en: 'Objectives', ar: 'الأهداف' }));
      }

      // KPIs Sheet
      if (kpis.length > 0) {
        const kpiData = [
          ['#', t({ en: 'Name', ar: 'الاسم' }), t({ en: 'Baseline', ar: 'خط الأساس' }), t({ en: 'Target', ar: 'المستهدف' }), t({ en: 'Unit', ar: 'الوحدة' }), t({ en: 'Frequency', ar: 'التكرار' })]
        ];
        kpis.forEach((kpi, i) => {
          kpiData.push([i + 1, getText(kpi.name_en, kpi.name_ar), kpi.baseline_value || '', kpi.target_value || '', kpi.unit || '', kpi.measurement_frequency || '']);
        });
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kpiData), t({ en: 'KPIs', ar: 'المؤشرات' }));
      }

      // Risks Sheet
      if (risks.length > 0) {
        const riskData = [
          ['#', t({ en: 'Name', ar: 'الاسم' }), t({ en: 'Category', ar: 'الفئة' }), t({ en: 'Probability', ar: 'الاحتمالية' }), t({ en: 'Impact', ar: 'التأثير' }), t({ en: 'Mitigation', ar: 'التخفيف' })]
        ];
        risks.forEach((risk, i) => {
          riskData.push([i + 1, getText(risk.name_en, risk.name_ar), risk.category || '', risk.probability || '', risk.impact || '', getText(risk.mitigation_en, risk.mitigation_ar)]);
        });
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(riskData), t({ en: 'Risks', ar: 'المخاطر' }));
      }

      // Stakeholders Sheet
      if (stakeholders.length > 0) {
        const stData = [
          ['#', t({ en: 'Name', ar: 'الاسم' }), t({ en: 'Type', ar: 'النوع' }), t({ en: 'Interest', ar: 'الاهتمام' }), t({ en: 'Influence', ar: 'التأثير' })]
        ];
        stakeholders.forEach((st, i) => {
          stData.push([i + 1, getText(st.name_en, st.name_ar), st.type || '', st.interest_level || '', st.influence_level || '']);
        });
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(stData), t({ en: 'Stakeholders', ar: 'أصحاب المصلحة' }));
      }

      // Action Plans Sheet
      if (actionPlans.length > 0) {
        const apData = [
          ['#', t({ en: 'Title', ar: 'العنوان' }), t({ en: 'Status', ar: 'الحالة' }), t({ en: 'Budget', ar: 'الميزانية' })]
        ];
        actionPlans.forEach((ap, i) => {
          apData.push([i + 1, getText(ap.title_en, ap.title_ar), ap.status || '', ap.total_budget || '']);
        });
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(apData), t({ en: 'Action Plans', ar: 'خطط العمل' }));
      }

      XLSX.writeFile(wb, `${getText(data.name_en, data.name_ar) || 'strategic-plan'}-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success(t({ en: 'Excel exported successfully', ar: 'تم تصدير Excel بنجاح' }));
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error(t({ en: 'Failed to export Excel', ar: 'فشل تصدير Excel' }));
    } finally {
      setIsExporting(false);
    }
  };

  // Section Header Component
  const SectionHeader = ({ icon: Icon, title, sectionKey, count, isComplete }) => (
    <CollapsibleTrigger asChild>
      <div 
        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors ${isComplete ? 'bg-green-50/50 dark:bg-green-950/20' : ''}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isComplete ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'}`}>
            <Icon className={`h-4 w-4 ${isComplete ? 'text-green-600' : 'text-muted-foreground'}`} />
          </div>
          <span className="font-medium">{title}</span>
          {count !== undefined && <Badge variant="secondary" className="text-xs">{count}</Badge>}
        </div>
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-500" />
          )}
          {expandedSections[sectionKey] ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>
    </CollapsibleTrigger>
  );

  const EmptyState = ({ message, step }) => (
    <div className="text-center py-4">
      <p className="text-muted-foreground text-sm mb-2">{message}</p>
      {step && onNavigateToStep && (
        <Button variant="outline" size="sm" onClick={() => handleNavigateToStep(step)}>
          {t({ en: 'Go to Step', ar: 'انتقل للخطوة' })} {step}
        </Button>
      )}
    </div>
  );

  const ReadinessIcon = completenessMetrics.readinessLevel?.icon || CheckCircle;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Eye className="w-6 h-6 text-primary" />
            {t({ en: 'Review & Submit', ar: 'المراجعة والإرسال' })}
            {isReadOnly && <Badge variant="secondary">{t({ en: 'View Only', ar: 'عرض فقط' })}</Badge>}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t({ en: 'Review your strategic plan and submit for approval', ar: 'راجع خطتك الاستراتيجية وأرسلها للموافقة' })}
          </p>
        </div>
      </div>

      {/* Dashboard Header */}
      <Card className={`bg-gradient-to-br from-background to-muted/30 border-2 ${completenessMetrics.readinessLevel?.color.replace('bg-', 'border-')}/30`}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {/* Readiness Score */}
            <div className={`col-span-2 flex items-center gap-4 p-4 rounded-xl border ${completenessMetrics.readinessLevel?.bgLight}`}>
              <div className={`w-16 h-16 rounded-full ${completenessMetrics.readinessLevel?.color} flex items-center justify-center`}>
                <span className="text-2xl font-bold text-white">{completenessMetrics.score}%</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Readiness Score', ar: 'درجة الجاهزية' })}</p>
                <p className={`text-lg font-semibold ${completenessMetrics.readinessLevel?.textColor}`}>
                  {getText(completenessMetrics.readinessLevel?.label.en, completenessMetrics.readinessLevel?.label.ar)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {completenessMetrics.completedCount}/{completenessMetrics.totalCount} {t({ en: 'sections', ar: 'أقسام' })}
                </p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="p-4 bg-background/80 rounded-xl border text-center">
              <Target className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">{objectives.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Objectives', ar: 'الأهداف' })}</p>
            </div>
            <div className="p-4 bg-background/80 rounded-xl border text-center">
              <Activity className="h-5 w-5 mx-auto text-blue-500 mb-1" />
              <p className="text-2xl font-bold">{kpis.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'KPIs', ar: 'المؤشرات' })}</p>
            </div>
            <div className="p-4 bg-background/80 rounded-xl border text-center">
              <Briefcase className="h-5 w-5 mx-auto text-purple-500 mb-1" />
              <p className="text-2xl font-bold">{actionPlans.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Actions', ar: 'الإجراءات' })}</p>
            </div>
            <div className="p-4 bg-background/80 rounded-xl border text-center">
              <AlertTriangle className="h-5 w-5 mx-auto text-amber-500 mb-1" />
              <p className="text-2xl font-bold">{risks.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Risks', ar: 'المخاطر' })}</p>
            </div>
            <div className="p-4 bg-background/80 rounded-xl border text-center">
              <Users className="h-5 w-5 mx-auto text-teal-500 mb-1" />
              <p className="text-2xl font-bold">{stakeholders.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Stakeholders', ar: 'الأطراف' })}</p>
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{t({ en: 'KPI Coverage', ar: 'تغطية المؤشرات' })}</span>
                <span className={`text-xs font-medium ${getCompletenessColor(qualityMetrics.kpiObjectiveCoverage)}`}>{qualityMetrics.kpiObjectiveCoverage}%</span>
              </div>
              <Progress value={qualityMetrics.kpiObjectiveCoverage} className="h-1.5" />
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{t({ en: 'Action Coverage', ar: 'تغطية الإجراءات' })}</span>
                <span className={`text-xs font-medium ${getCompletenessColor(qualityMetrics.actionPlanCoverage)}`}>{qualityMetrics.actionPlanCoverage}%</span>
              </div>
              <Progress value={qualityMetrics.actionPlanCoverage} className="h-1.5" />
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{t({ en: 'Risk Mitigation', ar: 'تخفيف المخاطر' })}</span>
                <span className={`text-xs font-medium ${getCompletenessColor(qualityMetrics.riskMitigationRate)}`}>{qualityMetrics.riskMitigationRate}%</span>
              </div>
              <Progress value={qualityMetrics.riskMitigationRate} className="h-1.5" />
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{t({ en: 'Engagement', ar: 'المشاركة' })}</span>
                <span className={`text-xs font-medium ${getCompletenessColor(qualityMetrics.stakeholderEngagement)}`}>{qualityMetrics.stakeholderEngagement}%</span>
              </div>
              <Progress value={qualityMetrics.stakeholderEngagement} className="h-1.5" />
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{t({ en: 'Bilingual', ar: 'ثنائي اللغة' })}</span>
                <span className={`text-xs font-medium ${getCompletenessColor(qualityMetrics.bilingualCoverage)}`}>{qualityMetrics.bilingualCoverage}%</span>
              </div>
              <Progress value={qualityMetrics.bilingualCoverage} className="h-1.5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Alerts */}
      {criticalErrors.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>{t({ en: 'Critical Issues', ar: 'مشاكل حرجة' })}</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {criticalErrors.map((err, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span>{err.message}</span>
                  {err.step && onNavigateToStep && (
                    <Button variant="ghost" size="sm" onClick={() => handleNavigateToStep(err.step)}>
                      {t({ en: 'Fix', ar: 'إصلاح' })}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {warningErrors.length > 0 && criticalErrors.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t({ en: 'Recommendations', ar: 'توصيات' })}</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {warningErrors.map((err, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span>{err.message}</span>
                  {err.step && onNavigateToStep && (
                    <Button variant="ghost" size="sm" onClick={() => handleNavigateToStep(err.step)}>
                      {t({ en: 'Improve', ar: 'تحسين' })}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* View Mode Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">{t({ en: 'Summary', ar: 'ملخص' })}</span>
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">{t({ en: 'Sections', ar: 'الأقسام' })}</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">{t({ en: 'AI Analysis', ar: 'تحليل AI' })}</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{t({ en: 'Export', ar: 'تصدير' })}</span>
          </TabsTrigger>
        </TabsList>

        {/* Summary View */}
        <TabsContent value="summary" className="space-y-4">
          {/* Section Completeness Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                {t({ en: 'Section Completeness', ar: 'اكتمال الأقسام' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2">
                {completenessMetrics.sectionDetails.map(section => {
                  const Icon = section.icon;
                  return (
                    <div 
                      key={section.key}
                      onClick={() => onNavigateToStep && handleNavigateToStep(section.step)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                        section.isComplete 
                          ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                          : 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
                      }`}
                    >
                      <Icon className={`h-5 w-5 mx-auto ${section.isComplete ? 'text-green-600' : 'text-amber-600'}`} />
                      <p className="text-xs text-center mt-1 font-medium truncate">
                        {getText(section.label.en, section.label.ar)}
                      </p>
                      {section.isComplete ? (
                        <CheckCircle className="h-3 w-3 mx-auto mt-1 text-green-600" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mx-auto mt-1 text-amber-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Executive Summary', ar: 'الملخص التنفيذي' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t({ en: 'Plan Name', ar: 'اسم الخطة' })}</p>
                  <p className="font-semibold">{getText(data.name_en, data.name_ar) || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t({ en: 'Duration', ar: 'المدة' })}</p>
                  <p className="font-semibold">{data.start_year} - {data.end_year}</p>
                </div>
              </div>
              
              {getText(data.vision_en, data.vision_ar) && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t({ en: 'Vision', ar: 'الرؤية' })}</p>
                  <p className="text-sm bg-primary/5 p-3 rounded-lg border-l-4 border-primary">
                    {getText(data.vision_en, data.vision_ar)}
                  </p>
                </div>
              )}
              
              {getText(data.mission_en, data.mission_ar) && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t({ en: 'Mission', ar: 'الرسالة' })}</p>
                  <p className="text-sm bg-secondary/5 p-3 rounded-lg border-l-4 border-secondary">
                    {getText(data.mission_en, data.mission_ar)}
                  </p>
                </div>
              )}

              {/* Key Objectives Preview */}
              {objectives.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t({ en: 'Strategic Objectives', ar: 'الأهداف الاستراتيجية' })}</p>
                  <div className="space-y-2">
                    {objectives.slice(0, 5).map((obj, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                        <Badge variant="outline" className="text-xs">{i + 1}</Badge>
                        <span className="text-sm">{getText(obj.name_en, obj.name_ar)}</span>
                        {obj.priority && <Badge variant="secondary" className="text-xs ml-auto">{obj.priority}</Badge>}
                      </div>
                    ))}
                    {objectives.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{objectives.length - 5} {t({ en: 'more objectives', ar: 'أهداف أخرى' })}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections View */}
        <TabsContent value="sections" className="space-y-3">
          {SECTION_CONFIG.map(section => {
            const Icon = section.icon;
            const sectionKey = section.key;
            const isComplete = sectionCompleteness[sectionKey];
            
            return (
              <Card key={sectionKey}>
                <Collapsible open={expandedSections[sectionKey]} onOpenChange={() => toggleSection(sectionKey)}>
                  <SectionHeader 
                    icon={Icon} 
                    title={getText(section.label.en, section.label.ar)} 
                    sectionKey={sectionKey}
                    isComplete={isComplete}
                    count={
                      sectionKey === 'objectives' ? objectives.length :
                      sectionKey === 'kpis' ? kpis.length :
                      sectionKey === 'actions' ? actionPlans.length :
                      sectionKey === 'risks' ? risks.length :
                      sectionKey === 'stakeholders' ? stakeholders.length :
                      sectionKey === 'alignments' ? alignments.length :
                      sectionKey === 'timeline' ? (phases.length + milestones.length) :
                      undefined
                    }
                  />
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {/* Context Section */}
                      {sectionKey === 'context' && (
                        <div className="space-y-2">
                          <p><strong>{t({ en: 'Name', ar: 'الاسم' })}:</strong> {getText(data.name_en, data.name_ar) || '-'}</p>
                          <p><strong>{t({ en: 'Description', ar: 'الوصف' })}:</strong> {getText(data.description_en, data.description_ar) || '-'}</p>
                        </div>
                      )}
                      
                      {/* Vision Section */}
                      {sectionKey === 'vision' && (
                        <div className="space-y-2">
                          <p><strong>{t({ en: 'Vision', ar: 'الرؤية' })}:</strong> {getText(data.vision_en, data.vision_ar) || '-'}</p>
                          <p><strong>{t({ en: 'Mission', ar: 'الرسالة' })}:</strong> {getText(data.mission_en, data.mission_ar) || '-'}</p>
                        </div>
                      )}
                      
                      {/* Objectives Section */}
                      {sectionKey === 'objectives' && (
                        objectives.length > 0 ? (
                          <div className="space-y-2">
                            {objectives.map((obj, i) => (
                              <div key={i} className="p-2 border rounded flex items-center justify-between">
                                <span>{getText(obj.name_en, obj.name_ar)}</span>
                                {obj.priority && <Badge variant="outline">{obj.priority}</Badge>}
                              </div>
                            ))}
                          </div>
                        ) : <EmptyState message={t({ en: 'No objectives defined', ar: 'لا توجد أهداف' })} step={section.step} />
                      )}
                      
                      {/* KPIs Section */}
                      {sectionKey === 'kpis' && (
                        kpis.length > 0 ? (
                          <div className="space-y-2">
                            {kpis.map((kpi, i) => (
                              <div key={i} className="p-2 border rounded">
                                <p className="font-medium">{getText(kpi.name_en, kpi.name_ar)}</p>
                                <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                                  <span>{t({ en: 'Target', ar: 'المستهدف' })}: {kpi.target_value || '-'}</span>
                                  <span>{t({ en: 'Baseline', ar: 'خط الأساس' })}: {kpi.baseline_value || '-'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : <EmptyState message={t({ en: 'No KPIs defined', ar: 'لا توجد مؤشرات' })} step={section.step} />
                      )}
                      
                      {/* Risks Section */}
                      {sectionKey === 'risks' && (
                        risks.length > 0 ? (
                          <div className="space-y-2">
                            {risks.map((risk, i) => (
                              <div key={i} className="p-2 border rounded">
                                <p className="font-medium">{getText(risk.name_en, risk.name_ar)}</p>
                                <div className="flex gap-2 mt-1">
                                  {risk.probability && <Badge variant="outline">{risk.probability}</Badge>}
                                  {risk.impact && <Badge variant="secondary">{risk.impact}</Badge>}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : <EmptyState message={t({ en: 'No risks identified', ar: 'لا توجد مخاطر' })} step={section.step} />
                      )}
                      
                      {/* Stakeholders Section */}
                      {sectionKey === 'stakeholders' && (
                        stakeholders.length > 0 ? (
                          <div className="space-y-2">
                            {stakeholders.map((st, i) => (
                              <div key={i} className="p-2 border rounded flex items-center justify-between">
                                <span>{getText(st.name_en, st.name_ar)}</span>
                                {st.type && <Badge variant="outline">{st.type}</Badge>}
                              </div>
                            ))}
                          </div>
                        ) : <EmptyState message={t({ en: 'No stakeholders defined', ar: 'لا يوجد أصحاب مصلحة' })} step={section.step} />
                      )}
                      
                      {/* Actions Section */}
                      {sectionKey === 'actions' && (
                        actionPlans.length > 0 ? (
                          <div className="space-y-2">
                            {actionPlans.map((ap, i) => (
                              <div key={i} className="p-2 border rounded">
                                <p className="font-medium">{getText(ap.title_en, ap.title_ar)}</p>
                                {ap.status && <Badge variant="secondary" className="mt-1">{ap.status}</Badge>}
                              </div>
                            ))}
                          </div>
                        ) : <EmptyState message={t({ en: 'No action plans defined', ar: 'لا توجد خطط عمل' })} step={section.step} />
                      )}
                      
                      {/* Generic section handler */}
                      {!['context', 'vision', 'objectives', 'kpis', 'risks', 'stakeholders', 'actions'].includes(sectionKey) && (
                        <div className="text-sm text-muted-foreground">
                          {isComplete 
                            ? t({ en: 'Section complete.', ar: 'القسم مكتمل.' })
                            : t({ en: 'Section incomplete.', ar: 'القسم غير مكتمل.' })
                          }
                          <Button variant="link" size="sm" onClick={() => handleNavigateToStep(section.step)}>
                            {t({ en: 'Go to Step', ar: 'انتقل للخطوة' })} {section.step}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </TabsContent>

        {/* AI Analysis View */}
        <TabsContent value="ai" className="space-y-4">
          <AIStrategicPlanAnalyzer 
            planData={data} 
            onNavigateToStep={handleNavigateToStep}
            onApplySuggestion={handleApplySuggestion}
            onCreateTask={handleCreateTask}
          />
        </TabsContent>

        {/* Export View */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                {t({ en: 'Export Strategic Plan', ar: 'تصدير الخطة الاستراتيجية' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'Download your strategic plan in different formats', ar: 'تحميل خطتك الاستراتيجية بصيغ مختلفة' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={handleExportPDF}>
                  <CardContent className="pt-6 text-center">
                    <FileText className="h-12 w-12 mx-auto text-red-500 mb-3" />
                    <h3 className="font-semibold">{t({ en: 'PDF Document', ar: 'مستند PDF' })}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t({ en: 'Formatted document for printing and sharing', ar: 'مستند منسق للطباعة والمشاركة' })}
                    </p>
                    <Button className="mt-4" disabled={isExporting || !getText(data.name_en, data.name_ar)}>
                      {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                      {t({ en: 'Export PDF', ar: 'تصدير PDF' })}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={handleExportExcel}>
                  <CardContent className="pt-6 text-center">
                    <FileSpreadsheet className="h-12 w-12 mx-auto text-green-600 mb-3" />
                    <h3 className="font-semibold">{t({ en: 'Excel Spreadsheet', ar: 'جدول Excel' })}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t({ en: 'Structured data for analysis and reporting', ar: 'بيانات منظمة للتحليل والتقارير' })}
                    </p>
                    <Button className="mt-4" variant="outline" disabled={isExporting || !getText(data.name_en, data.name_ar)}>
                      {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                      {t({ en: 'Export Excel', ar: 'تصدير Excel' })}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Version Info */}
          {mode === 'edit' && data.version_number && (
            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-blue-600" />
                    <Badge variant="outline">v{data.version_number}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {t({ en: 'Current version', ar: 'النسخة الحالية' })}
                    </span>
                  </div>
                  {data.version_notes && (
                    <span className="text-xs text-muted-foreground">{data.version_notes}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      {mode !== 'review' && !isReadOnly && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                variant="outline"
                onClick={onSave} 
                disabled={isSaving || !getText(data.name_en, data.name_ar)}
                className="min-w-[200px]"
              >
                {isSaving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
                {t({ en: 'Save as Draft', ar: 'حفظ كمسودة' })}
              </Button>
              
              <Button 
                size="lg"
                onClick={onSubmitForApproval} 
                disabled={isSubmitting || !canSubmit}
                className="bg-green-600 hover:bg-green-700 min-w-[200px]"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Send className="h-5 w-5 mr-2" />}
                {t({ en: 'Submit for Approval', ar: 'إرسال للموافقة' })}
              </Button>
            </div>
            
            {!canSubmit && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                {criticalErrors.length > 0 
                  ? t({ en: 'Fix critical errors before submitting', ar: 'أصلح الأخطاء الحرجة قبل الإرسال' })
                  : t({ en: 'Complete at least 40% of the plan to submit', ar: 'أكمل 40% على الأقل من الخطة للإرسال' })
                }
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
