import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  CheckCircle2, AlertTriangle, Target, Link, Activity, 
  Lightbulb, Calendar, FileText, Save, Loader2, Send,
  Users, Globe, Shield, Megaphone, DollarSign, Download, FileSpreadsheet,
  ChevronDown, ChevronRight, TrendingUp, BarChart3, Clock, Building,
  AlertCircle, Briefcase, PieChart, MessageSquare, RefreshCw
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { MOMAH_SECTORS, STRATEGIC_THEMES, VISION_2030_PROGRAMS, EMERGING_TECHNOLOGIES } from '../StrategyWizardSteps';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import AIStrategicPlanAnalyzer from '../AIStrategicPlanAnalyzer';

export default function Step18Review({ 
  data, 
  onSave,
  onSubmitForApproval,
  isSaving,
  isSubmitting,
  validationErrors = [],
  mode = 'create'
}) {
  const { language, t, isRTL } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    vision: false,
    stakeholders: false,
    pestel: false,
    swot: false,
    scenarios: false,
    risks: false,
    dependencies: false,
    objectives: false,
    alignments: false,
    kpis: false,
    actions: false,
    resources: false,
    timeline: false,
    governance: false,
    communication: false,
    change: false
  });

  // Helper to get localized text based on user language
  const getText = (enText, arText) => {
    if (language === 'ar') {
      return arText || enText || '';
    }
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

  const getSectorName = (code) => {
    const sector = MOMAH_SECTORS.find(s => s.code === code);
    return sector ? getText(sector.name_en, sector.name_ar) : code;
  };

  const getThemeName = (code) => {
    const theme = STRATEGIC_THEMES.find(t => t.code === code);
    return theme ? getText(theme.name_en, theme.name_ar) : code;
  };

  const getTechName = (code) => {
    const tech = EMERGING_TECHNOLOGIES.find(t => t.code === code);
    return tech ? getText(tech.name_en, tech.name_ar) : code;
  };

  const getProgramName = (code) => {
    const program = VISION_2030_PROGRAMS.find(p => p.code === code);
    return program ? getText(program.name_en, program.name_ar) : code;
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // PDF Export Function
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
        y += 10;
      }

      // KPIs
      if (kpis.length > 0) {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.setTextColor(0, 51, 102);
        doc.text(t({ en: 'Key Performance Indicators', ar: 'مؤشرات الأداء الرئيسية' }), 20, y);
        y += 10;
        doc.setFontSize(10);
        doc.setTextColor(50);
        kpis.forEach((kpi, i) => {
          if (y > 270) { doc.addPage(); y = 20; }
          const text = `${i + 1}. ${getText(kpi.name_en, kpi.name_ar) || t({ en: 'Unnamed KPI', ar: 'مؤشر بدون اسم' })} - ${t({ en: 'Target', ar: 'المستهدف' })}: ${kpi.target_value || 'N/A'}`;
          const lines = doc.splitTextToSize(text, pageWidth - 45);
          doc.text(lines, 25, y);
          y += lines.length * 5 + 3;
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

  // Excel Export Function
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const wb = XLSX.utils.book_new();
      const lang = language;

      // Overview Sheet
      const overviewData = [
        [t({ en: 'Strategic Plan Overview', ar: 'نظرة عامة على الخطة الاستراتيجية' })],
        [''],
        [t({ en: 'Field', ar: 'الحقل' }), t({ en: 'Value', ar: 'القيمة' })],
        [t({ en: 'Name', ar: 'الاسم' }), getText(data.name_en, data.name_ar)],
        [t({ en: 'Description', ar: 'الوصف' }), getText(data.description_en, data.description_ar)],
        [t({ en: 'Vision', ar: 'الرؤية' }), getText(data.vision_en, data.vision_ar)],
        [t({ en: 'Mission', ar: 'الرسالة' }), getText(data.mission_en, data.mission_ar)],
        [t({ en: 'Start Year', ar: 'سنة البداية' }), data.start_year || ''],
        [t({ en: 'End Year', ar: 'سنة النهاية' }), data.end_year || ''],
        [t({ en: 'Budget Range', ar: 'نطاق الميزانية' }), data.budget_range || ''],
        [''],
        [t({ en: 'Statistics', ar: 'الإحصائيات' })],
        [t({ en: 'Objectives', ar: 'الأهداف' }), objectives.length],
        [t({ en: 'KPIs', ar: 'المؤشرات' }), kpis.length],
        [t({ en: 'Action Plans', ar: 'خطط العمل' }), actionPlans.length],
        [t({ en: 'Risks', ar: 'المخاطر' }), risks.length],
        [t({ en: 'Stakeholders', ar: 'أصحاب المصلحة' }), stakeholders.length],
        [t({ en: 'Alignments', ar: 'التوافقات' }), alignments.length],
      ];
      const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(wb, wsOverview, t({ en: 'Overview', ar: 'نظرة عامة' }));

      // Objectives Sheet
      if (objectives.length > 0) {
        const objData = [
          ['#', t({ en: 'Name', ar: 'الاسم' }), t({ en: 'Description', ar: 'الوصف' }), t({ en: 'Sector', ar: 'القطاع' }), t({ en: 'Priority', ar: 'الأولوية' }), t({ en: 'Weight', ar: 'الوزن' })]
        ];
        objectives.forEach((obj, i) => {
          objData.push([
            i + 1,
            getText(obj.name_en, obj.name_ar),
            getText(obj.description_en, obj.description_ar),
            obj.sector_code || '',
            obj.priority || '',
            obj.weight || ''
          ]);
        });
        const wsObj = XLSX.utils.aoa_to_sheet(objData);
        XLSX.utils.book_append_sheet(wb, wsObj, t({ en: 'Objectives', ar: 'الأهداف' }));
      }

      // KPIs Sheet
      if (kpis.length > 0) {
        const kpiData = [
          ['#', t({ en: 'Name', ar: 'الاسم' }), t({ en: 'Baseline', ar: 'خط الأساس' }), t({ en: 'Target', ar: 'المستهدف' }), t({ en: 'Unit', ar: 'الوحدة' }), t({ en: 'Frequency', ar: 'التكرار' }), t({ en: 'Owner', ar: 'المسؤول' })]
        ];
        kpis.forEach((kpi, i) => {
          kpiData.push([
            i + 1,
            getText(kpi.name_en, kpi.name_ar),
            kpi.baseline_value || '',
            kpi.target_value || '',
            kpi.unit || '',
            kpi.measurement_frequency || '',
            kpi.owner_email || ''
          ]);
        });
        const wsKpi = XLSX.utils.aoa_to_sheet(kpiData);
        XLSX.utils.book_append_sheet(wb, wsKpi, t({ en: 'KPIs', ar: 'المؤشرات' }));
      }

      // Risks Sheet
      if (risks.length > 0) {
        const riskData = [
          ['#', t({ en: 'Name', ar: 'الاسم' }), t({ en: 'Category', ar: 'الفئة' }), t({ en: 'Probability', ar: 'الاحتمالية' }), t({ en: 'Impact', ar: 'التأثير' }), t({ en: 'Mitigation', ar: 'التخفيف' })]
        ];
        risks.forEach((risk, i) => {
          riskData.push([
            i + 1,
            getText(risk.name_en, risk.name_ar),
            risk.category || '',
            risk.probability || '',
            risk.impact || '',
            getText(risk.mitigation_en, risk.mitigation_ar)
          ]);
        });
        const wsRisk = XLSX.utils.aoa_to_sheet(riskData);
        XLSX.utils.book_append_sheet(wb, wsRisk, t({ en: 'Risks', ar: 'المخاطر' }));
      }

      // Stakeholders Sheet
      if (stakeholders.length > 0) {
        const stData = [
          ['#', t({ en: 'Name', ar: 'الاسم' }), t({ en: 'Type', ar: 'النوع' }), t({ en: 'Influence', ar: 'التأثير' }), t({ en: 'Interest', ar: 'الاهتمام' }), t({ en: 'Engagement Strategy', ar: 'استراتيجية المشاركة' })]
        ];
        stakeholders.forEach((st, i) => {
          stData.push([
            i + 1,
            getText(st.name_en, st.name_ar),
            st.type || '',
            st.influence || '',
            st.interest || '',
            getText(st.engagement_strategy_en, st.engagement_strategy_ar) || st.engagement_strategy || ''
          ]);
        });
        const wsSt = XLSX.utils.aoa_to_sheet(stData);
        XLSX.utils.book_append_sheet(wb, wsSt, t({ en: 'Stakeholders', ar: 'أصحاب المصلحة' }));
      }

      // Action Plans Sheet
      if (actionPlans.length > 0) {
        const apData = [
          ['#', t({ en: 'Title', ar: 'العنوان' }), t({ en: 'Description', ar: 'الوصف' }), t({ en: 'Owner', ar: 'المسؤول' }), t({ en: 'Start Date', ar: 'تاريخ البدء' }), t({ en: 'End Date', ar: 'تاريخ الانتهاء' }), t({ en: 'Budget', ar: 'الميزانية' }), t({ en: 'Status', ar: 'الحالة' })]
        ];
        actionPlans.forEach((ap, i) => {
          apData.push([
            i + 1,
            getText(ap.title_en, ap.title_ar),
            getText(ap.description_en, ap.description_ar),
            ap.owner_email || '',
            ap.start_date || '',
            ap.end_date || '',
            ap.budget || '',
            ap.status || ''
          ]);
        });
        const wsAp = XLSX.utils.aoa_to_sheet(apData);
        XLSX.utils.book_append_sheet(wb, wsAp, t({ en: 'Action Plans', ar: 'خطط العمل' }));
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

  // Calculate completeness for all 17 steps
  const completeness = {
    context: !!(getText(data.name_en, data.name_ar) && getText(data.description_en, data.description_ar)),
    vision: !!(getText(data.vision_en, data.vision_ar) && getText(data.mission_en, data.mission_ar)),
    stakeholders: stakeholders.length > 0,
    pestel: Object.values(pestel).some(arr => arr?.length > 0),
    swot: (swot.strengths?.length > 0 || swot.opportunities?.length > 0),
    scenarios: !!(getText(scenarios.best_case?.description_en, scenarios.best_case?.description_ar) || getText(scenarios.most_likely?.description_en, scenarios.most_likely?.description_ar)),
    risks: risks.length > 0,
    dependencies: (dependencies.length > 0 || constraints.length > 0),
    objectives: objectives.length >= 3,
    alignments: alignments.length > 0,
    kpis: kpis.length > 0,
    actions: actionPlans.length > 0,
    resources: !!(resourcePlan.hr_requirements?.length || resourcePlan.budget_allocation?.length),
    timeline: (phases.length > 0 || milestones.length > 0),
    governance: !!(governance.committees?.length > 0 || governance.reporting_frequency),
    communication: !!(communicationPlan.internal_channels?.length || communicationPlan.key_messages?.length),
    change: !!(getText(changeManagement.readiness_assessment_en, changeManagement.readiness_assessment_ar) || getText(changeManagement.change_approach_en, changeManagement.change_approach_ar))
  };

  const completenessScore = Object.values(completeness).filter(Boolean).length;
  const totalSteps = Object.keys(completeness).length;
  const completionPercentage = Math.round((completenessScore / totalSteps) * 100);

  // Validation
  const getValidationErrors = () => {
    const errors = [];
    if (!getText(data.name_en, data.name_ar)) errors.push(t({ en: 'Plan name is required', ar: 'اسم الخطة مطلوب' }));
    if (!getText(data.vision_en, data.vision_ar)) errors.push(t({ en: 'Vision statement is required', ar: 'بيان الرؤية مطلوب' }));
    if (objectives.length < 3) errors.push(t({ en: 'At least 3 objectives required', ar: 'مطلوب 3 أهداف على الأقل' }));
    if (kpis.length === 0) errors.push(t({ en: 'At least 1 KPI required', ar: 'مطلوب مؤشر أداء واحد على الأقل' }));
    return errors;
  };

  const errors = [...validationErrors, ...getValidationErrors()];
  const canSubmit = errors.length === 0 && completionPercentage >= 60;

  // Section Header Component
  const SectionHeader = ({ icon: Icon, title, sectionKey, count, color = 'primary' }) => (
    <CollapsibleTrigger asChild>
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
        onClick={() => toggleSection(sectionKey)}
      >
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 text-${color}`} />
          <span className="font-medium">{title}</span>
          {count !== undefined && (
            <Badge variant="secondary" className="text-xs">{count}</Badge>
          )}
        </div>
        {expandedSections[sectionKey] ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </CollapsibleTrigger>
  );

  // Empty State Component
  const EmptyState = ({ message }) => (
    <div className="text-center py-4 text-muted-foreground text-sm">
      {message}
    </div>
  );

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Validation Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc ml-4">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* AI Plan Analyzer */}
      <AIStrategicPlanAnalyzer planData={data} />

      {/* Completeness Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            {t({ en: 'Plan Completeness', ar: 'اكتمال الخطة' })}
          </CardTitle>
          <CardDescription className="flex items-center gap-4">
            <span>{completenessScore}/{totalSteps} {t({ en: 'sections complete', ar: 'أقسام مكتملة' })}</span>
            <Badge variant={completionPercentage >= 80 ? 'default' : completionPercentage >= 60 ? 'secondary' : 'destructive'}>
              {completionPercentage}%
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {[
              { key: 'context', icon: FileText, label: t({ en: 'Context', ar: 'السياق' }) },
              { key: 'vision', icon: Target, label: t({ en: 'Vision', ar: 'الرؤية' }) },
              { key: 'stakeholders', icon: Users, label: t({ en: 'Stakeholders', ar: 'أصحاب المصلحة' }) },
              { key: 'pestel', icon: Globe, label: 'PESTEL' },
              { key: 'swot', icon: BarChart3, label: 'SWOT' },
              { key: 'scenarios', icon: Lightbulb, label: t({ en: 'Scenarios', ar: 'السيناريوهات' }) },
              { key: 'risks', icon: AlertTriangle, label: t({ en: 'Risks', ar: 'المخاطر' }) },
              { key: 'dependencies', icon: Link, label: t({ en: 'Dependencies', ar: 'التبعيات' }) },
              { key: 'objectives', icon: Target, label: t({ en: 'Objectives', ar: 'الأهداف' }) },
              { key: 'alignments', icon: Building, label: t({ en: 'National', ar: 'وطني' }) },
              { key: 'kpis', icon: Activity, label: t({ en: 'KPIs', ar: 'المؤشرات' }) },
              { key: 'actions', icon: Briefcase, label: t({ en: 'Actions', ar: 'الإجراءات' }) },
              { key: 'resources', icon: DollarSign, label: t({ en: 'Resources', ar: 'الموارد' }) },
              { key: 'timeline', icon: Calendar, label: t({ en: 'Timeline', ar: 'الجدول' }) },
              { key: 'governance', icon: Shield, label: t({ en: 'Governance', ar: 'الحوكمة' }) },
              { key: 'communication', icon: Megaphone, label: t({ en: 'Comms', ar: 'التواصل' }) },
              { key: 'change', icon: RefreshCw, label: t({ en: 'Change', ar: 'التغيير' }) }
            ].map(item => {
              const Icon = item.icon;
              const isComplete = completeness[item.key];
              return (
                <div 
                  key={item.key} 
                  className={`p-2 rounded-lg border text-center ${isComplete ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'}`}
                >
                  <Icon className={`h-4 w-4 mx-auto ${isComplete ? 'text-green-600' : 'text-amber-600'}`} />
                  <span className="text-xs font-medium block mt-1">{item.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Plan Overview Section */}
      <Card>
        <Collapsible open={expandedSections.overview} onOpenChange={() => toggleSection('overview')}>
          <SectionHeader 
            icon={FileText} 
            title={t({ en: 'Plan Overview', ar: 'نظرة عامة على الخطة' })} 
            sectionKey="overview" 
          />
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t({ en: 'Title', ar: 'العنوان' })}</p>
                  <p className="font-medium">{getText(data.name_en, data.name_ar) || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t({ en: 'Duration', ar: 'المدة' })}</p>
                  <p className="font-medium">{data.start_year} - {data.end_year}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">{t({ en: 'Description', ar: 'الوصف' })}</p>
                  <p className="text-sm">{getText(data.description_en, data.description_ar) || '-'}</p>
                </div>
              </div>
              
              {(data.target_sectors?.length > 0 || data.focus_technologies?.length > 0) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.target_sectors?.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">{t({ en: 'Target Sectors', ar: 'القطاعات المستهدفة' })}</p>
                        <div className="flex flex-wrap gap-1">
                          {data.target_sectors.map(code => (
                            <Badge key={code} variant="outline" className="text-xs">{getSectorName(code)}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {data.focus_technologies?.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">{t({ en: 'Focus Technologies', ar: 'التقنيات المركزة' })}</p>
                        <div className="flex flex-wrap gap-1">
                          {data.focus_technologies.map(code => (
                            <Badge key={code} variant="secondary" className="text-xs">{getTechName(code)}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Vision & Mission Section */}
      <Card>
        <Collapsible open={expandedSections.vision} onOpenChange={() => toggleSection('vision')}>
          <SectionHeader 
            icon={Target} 
            title={t({ en: 'Vision & Mission', ar: 'الرؤية والرسالة' })} 
            sectionKey="vision" 
          />
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t({ en: 'Vision', ar: 'الرؤية' })}</p>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">{getText(data.vision_en, data.vision_ar) || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t({ en: 'Mission', ar: 'الرسالة' })}</p>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">{getText(data.mission_en, data.mission_ar) || '-'}</p>
              </div>
              {data.core_values?.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t({ en: 'Core Values', ar: 'القيم الأساسية' })}</p>
                  <div className="flex flex-wrap gap-2">
                    {data.core_values.map((val, i) => (
                      <Badge key={i} variant="outline">{getText(val.name_en, val.name_ar) || val}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Stakeholders Section */}
      <Card>
        <Collapsible open={expandedSections.stakeholders} onOpenChange={() => toggleSection('stakeholders')}>
          <SectionHeader 
            icon={Users} 
            title={t({ en: 'Stakeholders', ar: 'أصحاب المصلحة' })} 
            sectionKey="stakeholders" 
            count={stakeholders.length}
          />
          <CollapsibleContent>
            <CardContent className="pt-0">
              {stakeholders.length > 0 ? (
                <div className="space-y-2">
                  {stakeholders.map((st, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{getText(st.name_en, st.name_ar)}</span>
                        <div className="flex gap-2">
                          {st.type && <Badge variant="outline" className="text-xs">{st.type}</Badge>}
                          {st.influence && <Badge className="text-xs">{t({ en: 'Influence', ar: 'التأثير' })}: {st.influence}</Badge>}
                        </div>
                      </div>
                      {(st.engagement_strategy || getText(st.engagement_strategy_en, st.engagement_strategy_ar)) && (
                        <p className="text-xs text-muted-foreground">
                          {getText(st.engagement_strategy_en, st.engagement_strategy_ar) || st.engagement_strategy}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message={t({ en: 'No stakeholders defined', ar: 'لم يتم تحديد أصحاب المصلحة' })} />
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* PESTEL Section */}
      <Card>
        <Collapsible open={expandedSections.pestel} onOpenChange={() => toggleSection('pestel')}>
          <SectionHeader 
            icon={Globe} 
            title="PESTEL" 
            sectionKey="pestel" 
          />
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['political', 'economic', 'social', 'technological', 'environmental', 'legal'].map(factor => {
                  const items = pestel[factor] || [];
                  const labels = {
                    political: t({ en: 'Political', ar: 'سياسي' }),
                    economic: t({ en: 'Economic', ar: 'اقتصادي' }),
                    social: t({ en: 'Social', ar: 'اجتماعي' }),
                    technological: t({ en: 'Technological', ar: 'تكنولوجي' }),
                    environmental: t({ en: 'Environmental', ar: 'بيئي' }),
                    legal: t({ en: 'Legal', ar: 'قانوني' })
                  };
                  return (
                    <div key={factor} className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm mb-2">{labels[factor]}</h4>
                      {items.length > 0 ? (
                        <ul className="text-xs space-y-1 text-muted-foreground">
                          {items.slice(0, 3).map((item, i) => (
                            <li key={i}>• {getText(item.factor_en, item.factor_ar) || item.factor || item}</li>
                          ))}
                          {items.length > 3 && <li className="text-primary">+{items.length - 3} {t({ en: 'more', ar: 'المزيد' })}</li>}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground">{t({ en: 'No factors', ar: 'لا توجد عوامل' })}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* SWOT Section */}
      <Card>
        <Collapsible open={expandedSections.swot} onOpenChange={() => toggleSection('swot')}>
          <SectionHeader 
            icon={BarChart3} 
            title="SWOT" 
            sectionKey="swot" 
          />
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4">
                {['strengths', 'weaknesses', 'opportunities', 'threats'].map(type => {
                  const items = swot[type] || [];
                  const colors = {
                    strengths: 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800',
                    weaknesses: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800',
                    opportunities: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
                    threats: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
                  };
                  const labels = {
                    strengths: t({ en: 'Strengths', ar: 'نقاط القوة' }),
                    weaknesses: t({ en: 'Weaknesses', ar: 'نقاط الضعف' }),
                    opportunities: t({ en: 'Opportunities', ar: 'الفرص' }),
                    threats: t({ en: 'Threats', ar: 'التهديدات' })
                  };
                  return (
                    <div key={type} className={`p-3 border rounded-lg ${colors[type]}`}>
                      <h4 className="font-medium text-sm mb-2">{labels[type]}</h4>
                      {items.length > 0 ? (
                        <ul className="text-xs space-y-1">
                          {items.slice(0, 4).map((item, i) => (
                            <li key={i}>• {getText(item.item_en, item.item_ar) || item.item || item}</li>
                          ))}
                          {items.length > 4 && <li className="text-primary">+{items.length - 4} {t({ en: 'more', ar: 'المزيد' })}</li>}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground">{t({ en: 'None added', ar: 'لم تتم الإضافة' })}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Scenarios Section */}
      <Card>
        <Collapsible open={expandedSections.scenarios} onOpenChange={() => toggleSection('scenarios')}>
          <SectionHeader 
            icon={Lightbulb} 
            title={t({ en: 'Scenarios', ar: 'السيناريوهات' })} 
            sectionKey="scenarios" 
          />
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['best_case', 'most_likely', 'worst_case'].map(type => {
                  const scenario = scenarios[type] || {};
                  const labels = {
                    best_case: t({ en: 'Best Case', ar: 'أفضل سيناريو' }),
                    most_likely: t({ en: 'Most Likely', ar: 'الأكثر احتمالاً' }),
                    worst_case: t({ en: 'Worst Case', ar: 'أسوأ سيناريو' })
                  };
                  const colors = {
                    best_case: 'border-green-200 bg-green-50/50 dark:bg-green-950/20',
                    most_likely: 'border-blue-200 bg-blue-50/50 dark:bg-blue-950/20',
                    worst_case: 'border-red-200 bg-red-50/50 dark:bg-red-950/20'
                  };
                  return (
                    <div key={type} className={`p-3 border rounded-lg ${colors[type]}`}>
                      <h4 className="font-medium text-sm mb-2">{labels[type]}</h4>
                      <p className="text-xs text-muted-foreground">
                        {getText(scenario.description_en, scenario.description_ar) || t({ en: 'Not defined', ar: 'غير محدد' })}
                      </p>
                      {scenario.probability && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {t({ en: 'Probability', ar: 'الاحتمالية' })}: {scenario.probability}%
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Risks Section */}
      <Card>
        <Collapsible open={expandedSections.risks} onOpenChange={() => toggleSection('risks')}>
          <SectionHeader 
            icon={AlertTriangle} 
            title={t({ en: 'Risks', ar: 'المخاطر' })} 
            sectionKey="risks" 
            count={risks.length}
          />
          <CollapsibleContent>
            <CardContent className="pt-0">
              {risks.length > 0 ? (
                <div className="space-y-2">
                  {risks.map((risk, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{getText(risk.name_en, risk.name_ar)}</span>
                        <div className="flex gap-2">
                          {risk.probability && (
                            <Badge variant="outline" className="text-xs">
                              {t({ en: 'P', ar: 'احتمال' })}: {risk.probability}
                            </Badge>
                          )}
                          {risk.impact && (
                            <Badge variant={risk.impact === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                              {t({ en: 'I', ar: 'تأثير' })}: {risk.impact}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {getText(risk.mitigation_en, risk.mitigation_ar) && (
                        <p className="text-xs text-muted-foreground">
                          <strong>{t({ en: 'Mitigation', ar: 'التخفيف' })}:</strong> {getText(risk.mitigation_en, risk.mitigation_ar)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message={t({ en: 'No risks identified', ar: 'لم يتم تحديد مخاطر' })} />
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Dependencies & Constraints Section */}
      <Card>
        <Collapsible open={expandedSections.dependencies} onOpenChange={() => toggleSection('dependencies')}>
          <SectionHeader 
            icon={Link} 
            title={t({ en: 'Dependencies & Constraints', ar: 'التبعيات والقيود' })} 
            sectionKey="dependencies" 
            count={dependencies.length + constraints.length}
          />
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">{t({ en: 'Dependencies', ar: 'التبعيات' })}</h4>
                  {dependencies.length > 0 ? (
                    <ul className="space-y-1">
                      {dependencies.map((dep, i) => (
                        <li key={i} className="text-xs p-2 bg-muted/50 rounded">
                          • {getText(dep.name_en, dep.name_ar) || dep.name || dep}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">{t({ en: 'None defined', ar: 'لم يتم تحديد' })}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">{t({ en: 'Constraints', ar: 'القيود' })}</h4>
                  {constraints.length > 0 ? (
                    <ul className="space-y-1">
                      {constraints.map((con, i) => (
                        <li key={i} className="text-xs p-2 bg-muted/50 rounded">
                          • {getText(con.name_en, con.name_ar) || con.name || con}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">{t({ en: 'None defined', ar: 'لم يتم تحديد' })}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Strategic Objectives Section */}
      <Card>
        <Collapsible open={expandedSections.objectives} onOpenChange={() => toggleSection('objectives')}>
          <SectionHeader 
            icon={Target} 
            title={t({ en: 'Strategic Objectives', ar: 'الأهداف الاستراتيجية' })} 
            sectionKey="objectives" 
            count={objectives.length}
          />
          <CollapsibleContent>
            <CardContent className="pt-0">
              {objectives.length > 0 ? (
                <div className="space-y-2">
                  {objectives.map((obj, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">#{i + 1}</Badge>
                        {obj.sector_code && <Badge className="text-xs bg-primary/10 text-primary">{getSectorName(obj.sector_code)}</Badge>}
                        {obj.priority && <Badge variant="secondary" className="text-xs">{obj.priority}</Badge>}
                      </div>
                      <p className="font-medium text-sm">{getText(obj.name_en, obj.name_ar)}</p>
                      {getText(obj.description_en, obj.description_ar) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {getText(obj.description_en, obj.description_ar)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message={t({ en: 'No objectives defined', ar: 'لم يتم تحديد أهداف' })} />
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* National Alignments Section */}
      <Card>
        <Collapsible open={expandedSections.alignments} onOpenChange={() => toggleSection('alignments')}>
          <SectionHeader 
            icon={Building} 
            title={t({ en: 'National Alignments', ar: 'التوافقات الوطنية' })} 
            sectionKey="alignments" 
            count={alignments.length}
          />
          <CollapsibleContent>
            <CardContent className="pt-0">
              {alignments.length > 0 ? (
                <div className="space-y-2">
                  {alignments.map((align, i) => (
                    <div key={i} className="p-3 border rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {align.program_code && getProgramName(align.program_code)}
                          {align.objective_name && ` - ${getText(align.objective_name_en, align.objective_name_ar) || align.objective_name}`}
                        </p>
                        {align.alignment_description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {getText(align.alignment_description_en, align.alignment_description_ar) || align.alignment_description}
                          </p>
                        )}
                      </div>
                      {align.alignment_strength && (
                        <Badge variant="outline">{align.alignment_strength}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message={t({ en: 'No alignments defined', ar: 'لم يتم تحديد توافقات' })} />
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* KPIs Section */}
      <Card>
        <Collapsible open={expandedSections.kpis} onOpenChange={() => toggleSection('kpis')}>
          <SectionHeader 
            icon={Activity} 
            title={t({ en: 'Key Performance Indicators', ar: 'مؤشرات الأداء الرئيسية' })} 
            sectionKey="kpis" 
            count={kpis.length}
          />
          <CollapsibleContent>
            <CardContent className="pt-0">
              {kpis.length > 0 ? (
                <div className="space-y-2">
                  {kpis.map((kpi, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{getText(kpi.name_en, kpi.name_ar)}</span>
                        <div className="flex gap-2">
                          {kpi.baseline_value !== undefined && (
                            <Badge variant="outline" className="text-xs">
                              {t({ en: 'Baseline', ar: 'خط الأساس' })}: {kpi.baseline_value}
                            </Badge>
                          )}
                          {kpi.target_value !== undefined && (
                            <Badge className="text-xs">
                              {t({ en: 'Target', ar: 'المستهدف' })}: {kpi.target_value}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {kpi.unit && <span>{t({ en: 'Unit', ar: 'الوحدة' })}: {kpi.unit}</span>}
                        {kpi.measurement_frequency && <span>{t({ en: 'Frequency', ar: 'التكرار' })}: {kpi.measurement_frequency}</span>}
                        {kpi.owner_email && <span>{t({ en: 'Owner', ar: 'المسؤول' })}: {kpi.owner_email}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message={t({ en: 'No KPIs defined', ar: 'لم يتم تحديد مؤشرات' })} />
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Action Plans Section */}
      <Card>
        <Collapsible open={expandedSections.actions} onOpenChange={() => toggleSection('actions')}>
          <SectionHeader 
            icon={Briefcase} 
            title={t({ en: 'Action Plans', ar: 'خطط العمل' })} 
            sectionKey="actions" 
            count={actionPlans.length}
          />
          <CollapsibleContent>
            <CardContent className="pt-0">
              {actionPlans.length > 0 ? (
                <div className="space-y-2">
                  {actionPlans.map((ap, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{getText(ap.title_en, ap.title_ar)}</span>
                        {ap.status && <Badge variant="outline" className="text-xs">{ap.status}</Badge>}
                      </div>
                      {getText(ap.description_en, ap.description_ar) && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {getText(ap.description_en, ap.description_ar)}
                        </p>
                      )}
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {ap.owner_email && <span>{t({ en: 'Owner', ar: 'المسؤول' })}: {ap.owner_email}</span>}
                        {ap.start_date && <span>{t({ en: 'Start', ar: 'البدء' })}: {ap.start_date}</span>}
                        {ap.end_date && <span>{t({ en: 'End', ar: 'النهاية' })}: {ap.end_date}</span>}
                        {ap.budget && <span>{t({ en: 'Budget', ar: 'الميزانية' })}: {ap.budget}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message={t({ en: 'No action plans defined', ar: 'لم يتم تحديد خطط عمل' })} />
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Resources Section */}
      <Card>
        <Collapsible open={expandedSections.resources} onOpenChange={() => toggleSection('resources')}>
          <SectionHeader 
            icon={DollarSign} 
            title={t({ en: 'Resources', ar: 'الموارد' })} 
            sectionKey="resources" 
          />
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">{t({ en: 'HR Requirements', ar: 'متطلبات الموارد البشرية' })}</h4>
                  {resourcePlan.hr_requirements?.length > 0 ? (
                    <ul className="space-y-1">
                      {resourcePlan.hr_requirements.map((hr, i) => (
                        <li key={i} className="text-xs p-2 bg-muted/50 rounded">
                          {getText(hr.role_en, hr.role_ar) || hr.role}: {hr.count || 1}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">{t({ en: 'Not defined', ar: 'غير محدد' })}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">{t({ en: 'Budget Allocation', ar: 'توزيع الميزانية' })}</h4>
                  {resourcePlan.budget_allocation?.length > 0 ? (
                    <ul className="space-y-1">
                      {resourcePlan.budget_allocation.map((budget, i) => (
                        <li key={i} className="text-xs p-2 bg-muted/50 rounded flex justify-between">
                          <span>{getText(budget.category_en, budget.category_ar) || budget.category}</span>
                          <span className="font-medium">{budget.amount}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">{t({ en: 'Not defined', ar: 'غير محدد' })}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Timeline Section */}
      <Card>
        <Collapsible open={expandedSections.timeline} onOpenChange={() => toggleSection('timeline')}>
          <SectionHeader 
            icon={Calendar} 
            title={t({ en: 'Timeline', ar: 'الجدول الزمني' })} 
            sectionKey="timeline" 
            count={phases.length + milestones.length}
          />
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">{t({ en: 'Phases', ar: 'المراحل' })}</h4>
                  {phases.length > 0 ? (
                    <div className="space-y-2">
                      {phases.map((phase, i) => (
                        <div key={i} className="p-2 border rounded text-xs">
                          <p className="font-medium">{getText(phase.name_en, phase.name_ar)}</p>
                          <p className="text-muted-foreground">{phase.start_date} - {phase.end_date}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">{t({ en: 'No phases', ar: 'لا توجد مراحل' })}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">{t({ en: 'Milestones', ar: 'المعالم' })}</h4>
                  {milestones.length > 0 ? (
                    <div className="space-y-2">
                      {milestones.map((milestone, i) => (
                        <div key={i} className="p-2 border rounded text-xs">
                          <p className="font-medium">{getText(milestone.name_en, milestone.name_ar)}</p>
                          <p className="text-muted-foreground">{milestone.target_date}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">{t({ en: 'No milestones', ar: 'لا توجد معالم' })}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Governance Section */}
      <Card>
        <Collapsible open={expandedSections.governance} onOpenChange={() => toggleSection('governance')}>
          <SectionHeader 
            icon={Shield} 
            title={t({ en: 'Governance', ar: 'الحوكمة' })} 
            sectionKey="governance" 
          />
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {governance.reporting_frequency && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t({ en: 'Reporting Frequency', ar: 'تكرار التقارير' })}</p>
                    <p className="font-medium">{governance.reporting_frequency}</p>
                  </div>
                )}
                {governance.committees?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">{t({ en: 'Committees', ar: 'اللجان' })}</h4>
                    <div className="space-y-2">
                      {governance.committees.map((committee, i) => (
                        <div key={i} className="p-2 border rounded text-xs">
                          <p className="font-medium">{getText(committee.name_en, committee.name_ar)}</p>
                          {getText(committee.purpose_en, committee.purpose_ar) && (
                            <p className="text-muted-foreground">{getText(committee.purpose_en, committee.purpose_ar)}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!governance.reporting_frequency && (!governance.committees || governance.committees.length === 0) && (
                  <EmptyState message={t({ en: 'No governance structure defined', ar: 'لم يتم تحديد هيكل الحوكمة' })} />
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Communication Section */}
      <Card>
        <Collapsible open={expandedSections.communication} onOpenChange={() => toggleSection('communication')}>
          <SectionHeader 
            icon={Megaphone} 
            title={t({ en: 'Communication Plan', ar: 'خطة التواصل' })} 
            sectionKey="communication" 
          />
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {getText(communicationPlan.master_narrative_en, communicationPlan.master_narrative_ar) && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t({ en: 'Master Narrative', ar: 'السردية الرئيسية' })}</p>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">
                      {getText(communicationPlan.master_narrative_en, communicationPlan.master_narrative_ar)}
                    </p>
                  </div>
                )}
                
                {communicationPlan.key_messages?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">{t({ en: 'Key Messages', ar: 'الرسائل الرئيسية' })}</h4>
                    <ul className="space-y-1">
                      {communicationPlan.key_messages.map((msg, i) => (
                        <li key={i} className="text-xs p-2 bg-muted/50 rounded">
                          • {getText(msg.text_en, msg.text_ar) || msg.message_en || msg.message_ar || msg}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">{t({ en: 'Internal Channels', ar: 'القنوات الداخلية' })}</h4>
                    {communicationPlan.internal_channels?.length > 0 ? (
                      <ul className="space-y-1">
                        {communicationPlan.internal_channels.map((ch, i) => (
                          <li key={i} className="text-xs p-2 bg-muted/50 rounded">
                            {getText(ch.name_en, ch.name_ar) || ch}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">{t({ en: 'None defined', ar: 'غير محدد' })}</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">{t({ en: 'External Channels', ar: 'القنوات الخارجية' })}</h4>
                    {communicationPlan.external_channels?.length > 0 ? (
                      <ul className="space-y-1">
                        {communicationPlan.external_channels.map((ch, i) => (
                          <li key={i} className="text-xs p-2 bg-muted/50 rounded">
                            {getText(ch.name_en, ch.name_ar) || ch}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">{t({ en: 'None defined', ar: 'غير محدد' })}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Change Management Section */}
      <Card>
        <Collapsible open={expandedSections.change} onOpenChange={() => toggleSection('change')}>
          <SectionHeader 
            icon={RefreshCw} 
            title={t({ en: 'Change Management', ar: 'إدارة التغيير' })} 
            sectionKey="change" 
          />
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {getText(changeManagement.readiness_assessment_en, changeManagement.readiness_assessment_ar) && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t({ en: 'Readiness Assessment', ar: 'تقييم الجاهزية' })}</p>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">
                      {getText(changeManagement.readiness_assessment_en, changeManagement.readiness_assessment_ar)}
                    </p>
                  </div>
                )}
                
                {getText(changeManagement.change_approach_en, changeManagement.change_approach_ar) && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t({ en: 'Change Approach', ar: 'نهج التغيير' })}</p>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">
                      {getText(changeManagement.change_approach_en, changeManagement.change_approach_ar)}
                    </p>
                  </div>
                )}
                
                {changeManagement.training_plan?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">{t({ en: 'Training Plan', ar: 'خطة التدريب' })}</h4>
                    <div className="space-y-2">
                      {changeManagement.training_plan.map((training, i) => (
                        <div key={i} className="p-2 border rounded text-xs">
                          <p className="font-medium">{getText(training.topic_en, training.topic_ar)}</p>
                          <div className="flex gap-4 text-muted-foreground mt-1">
                            {getText(training.target_audience_en, training.target_audience_ar) && (
                              <span>{t({ en: 'Audience', ar: 'الجمهور' })}: {getText(training.target_audience_en, training.target_audience_ar)}</span>
                            )}
                            {getText(training.duration_en, training.duration_ar) && (
                              <span>{t({ en: 'Duration', ar: 'المدة' })}: {getText(training.duration_en, training.duration_ar)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {!getText(changeManagement.readiness_assessment_en, changeManagement.readiness_assessment_ar) && 
                 !getText(changeManagement.change_approach_en, changeManagement.change_approach_ar) && 
                 (!changeManagement.training_plan || changeManagement.training_plan.length === 0) && (
                  <EmptyState message={t({ en: 'No change management plan defined', ar: 'لم يتم تحديد خطة إدارة التغيير' })} />
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Statistics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Plan Statistics', ar: 'إحصائيات الخطة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">{objectives.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Objectives', ar: 'الأهداف' })}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-green-600">{alignments.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Alignments', ar: 'التوافقات' })}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{kpis.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'KPIs', ar: 'المؤشرات' })}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{actionPlans.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Actions', ar: 'الإجراءات' })}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{risks.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Risks', ar: 'المخاطر' })}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-cyan-600">{stakeholders.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Stakeholders', ar: 'أصحاب المصلحة' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Version Info (Edit Mode) */}
      {mode === 'edit' && data.version_number && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
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

      {/* Export Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t({ en: 'Export Plan', ar: 'تصدير الخطة' })}</CardTitle>
          <CardDescription>{t({ en: 'Download your strategic plan in different formats', ar: 'تحميل خطتك الاستراتيجية بصيغ مختلفة' })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleExportPDF}
              disabled={isExporting || !getText(data.name_en, data.name_ar)}
            >
              {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              {t({ en: 'Export PDF', ar: 'تصدير PDF' })}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportExcel}
              disabled={isExporting || !getText(data.name_en, data.name_ar)}
            >
              {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 mr-2" />}
              {t({ en: 'Export Excel', ar: 'تصدير Excel' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {mode !== 'review' && (
        <div className="flex justify-center gap-4 pt-4">
          <Button 
            size="lg" 
            variant="outline"
            onClick={onSave} 
            disabled={isSaving || !getText(data.name_en, data.name_ar)}
          >
            {isSaving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
            {t({ en: 'Save as Draft', ar: 'حفظ كمسودة' })}
          </Button>
          
          <Button 
            size="lg"
            onClick={onSubmitForApproval} 
            disabled={isSubmitting || !canSubmit}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Send className="h-5 w-5 mr-2" />}
            {t({ en: 'Submit for Approval', ar: 'إرسال للموافقة' })}
          </Button>
        </div>
      )}

      {!canSubmit && mode !== 'review' && (
        <p className="text-center text-sm text-muted-foreground">
          {t({ en: 'Complete at least 60% of the plan and fix validation errors to submit', ar: 'أكمل 60% على الأقل من الخطة وأصلح أخطاء التحقق للإرسال' })}
        </p>
      )}
    </div>
  );
}
