import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, AlertTriangle, Target, Link, Activity, 
  Lightbulb, Calendar, FileText, Save, Loader2, Send,
  Users, Globe, Shield, Megaphone, DollarSign, Download, FileSpreadsheet
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { MOMAH_SECTORS, STRATEGIC_THEMES, VISION_2030_PROGRAMS, EMERGING_TECHNOLOGIES, WIZARD_STEPS } from '../StrategyWizardSteps';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default function Step8Review({ 
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

  // Data extraction - define early for use in export functions
  const objectives = data.objectives || [];
  const kpis = data.kpis || [];
  const actionPlans = data.action_plans || [];
  const alignments = data.national_alignments || [];
  const milestones = data.milestones || [];
  const phases = data.phases || [];
  const swot = data.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  const stakeholders = data.stakeholders || [];
  const risks = data.risks || [];
  const governance = data.governance || {};

  const getSectorName = (code) => {
    const sector = MOMAH_SECTORS.find(s => s.code === code);
    return sector ? (language === 'ar' ? sector.name_ar : sector.name_en) : code;
  };

  const getThemeName = (code) => {
    const theme = STRATEGIC_THEMES.find(t => t.code === code);
    return theme ? (language === 'ar' ? theme.name_ar : theme.name_en) : code;
  };

  const getTechName = (code) => {
    const tech = EMERGING_TECHNOLOGIES.find(t => t.code === code);
    return tech ? (language === 'ar' ? tech.name_ar : tech.name_en) : code;
  };

  // PDF Export Function
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      // Title
      doc.setFontSize(20);
      doc.setTextColor(0, 51, 102);
      doc.text(data.name_en || 'Strategic Plan', pageWidth / 2, y, { align: 'center' });
      y += 15;

      // Duration
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`${data.start_year || ''} - ${data.end_year || ''}`, pageWidth / 2, y, { align: 'center' });
      y += 15;

      // Vision
      if (data.vision_en) {
        doc.setFontSize(14);
        doc.setTextColor(0, 51, 102);
        doc.text('Vision', 20, y);
        y += 8;
        doc.setFontSize(10);
        doc.setTextColor(50);
        const visionLines = doc.splitTextToSize(data.vision_en, pageWidth - 40);
        doc.text(visionLines, 20, y);
        y += visionLines.length * 5 + 10;
      }

      // Mission
      if (data.mission_en) {
        doc.setFontSize(14);
        doc.setTextColor(0, 51, 102);
        doc.text('Mission', 20, y);
        y += 8;
        doc.setFontSize(10);
        doc.setTextColor(50);
        const missionLines = doc.splitTextToSize(data.mission_en, pageWidth - 40);
        doc.text(missionLines, 20, y);
        y += missionLines.length * 5 + 10;
      }

      // Statistics
      doc.setFontSize(14);
      doc.setTextColor(0, 51, 102);
      doc.text('Plan Statistics', 20, y);
      y += 10;
      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.text(`• Objectives: ${objectives.length}`, 25, y); y += 6;
      doc.text(`• KPIs: ${kpis.length}`, 25, y); y += 6;
      doc.text(`• Action Plans: ${actionPlans.length}`, 25, y); y += 6;
      doc.text(`• Risks: ${risks.length}`, 25, y); y += 6;
      doc.text(`• Stakeholders: ${stakeholders.length}`, 25, y); y += 15;

      // Objectives
      if (objectives.length > 0) {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.setTextColor(0, 51, 102);
        doc.text('Strategic Objectives', 20, y);
        y += 10;
        doc.setFontSize(10);
        doc.setTextColor(50);
        objectives.forEach((obj, i) => {
          if (y > 270) { doc.addPage(); y = 20; }
          const text = `${i + 1}. ${obj.name_en || 'Unnamed Objective'}`;
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
        doc.text('Key Performance Indicators', 20, y);
        y += 10;
        doc.setFontSize(10);
        doc.setTextColor(50);
        kpis.forEach((kpi, i) => {
          if (y > 270) { doc.addPage(); y = 20; }
          const text = `${i + 1}. ${kpi.name_en || 'Unnamed KPI'} - Target: ${kpi.target_value || 'N/A'}`;
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
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 290);
      }

      doc.save(`${data.name_en || 'strategic-plan'}-${new Date().toISOString().split('T')[0]}.pdf`);
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

      // Overview Sheet
      const overviewData = [
        ['Strategic Plan Overview'],
        [''],
        ['Field', 'Value (English)', 'Value (Arabic)'],
        ['Name', data.name_en || '', data.name_ar || ''],
        ['Description', data.description_en || '', data.description_ar || ''],
        ['Vision', data.vision_en || '', data.vision_ar || ''],
        ['Mission', data.mission_en || '', data.mission_ar || ''],
        ['Start Year', data.start_year || '', ''],
        ['End Year', data.end_year || '', ''],
        ['Budget Range', data.budget_range || '', ''],
        [''],
        ['Statistics'],
        ['Objectives', objectives.length],
        ['KPIs', kpis.length],
        ['Action Plans', actionPlans.length],
        ['Risks', risks.length],
        ['Stakeholders', stakeholders.length],
        ['Alignments', alignments.length],
      ];
      const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');

      // Objectives Sheet
      if (objectives.length > 0) {
        const objData = [
          ['#', 'Name (EN)', 'Name (AR)', 'Description (EN)', 'Description (AR)', 'Sector', 'Priority', 'Weight']
        ];
        objectives.forEach((obj, i) => {
          objData.push([
            i + 1,
            obj.name_en || '',
            obj.name_ar || '',
            obj.description_en || '',
            obj.description_ar || '',
            obj.sector_code || '',
            obj.priority || '',
            obj.weight || ''
          ]);
        });
        const wsObj = XLSX.utils.aoa_to_sheet(objData);
        XLSX.utils.book_append_sheet(wb, wsObj, 'Objectives');
      }

      // KPIs Sheet
      if (kpis.length > 0) {
        const kpiData = [
          ['#', 'Name (EN)', 'Name (AR)', 'Baseline', 'Target', 'Unit', 'Frequency', 'Owner']
        ];
        kpis.forEach((kpi, i) => {
          kpiData.push([
            i + 1,
            kpi.name_en || '',
            kpi.name_ar || '',
            kpi.baseline_value || '',
            kpi.target_value || '',
            kpi.unit || '',
            kpi.measurement_frequency || '',
            kpi.owner_email || ''
          ]);
        });
        const wsKpi = XLSX.utils.aoa_to_sheet(kpiData);
        XLSX.utils.book_append_sheet(wb, wsKpi, 'KPIs');
      }

      // Risks Sheet
      if (risks.length > 0) {
        const riskData = [
          ['#', 'Name (EN)', 'Name (AR)', 'Category', 'Probability', 'Impact', 'Mitigation (EN)', 'Mitigation (AR)']
        ];
        risks.forEach((risk, i) => {
          riskData.push([
            i + 1,
            risk.name_en || '',
            risk.name_ar || '',
            risk.category || '',
            risk.probability || '',
            risk.impact || '',
            risk.mitigation_en || '',
            risk.mitigation_ar || ''
          ]);
        });
        const wsRisk = XLSX.utils.aoa_to_sheet(riskData);
        XLSX.utils.book_append_sheet(wb, wsRisk, 'Risks');
      }

      // Stakeholders Sheet
      if (stakeholders.length > 0) {
        const stData = [
          ['#', 'Name (EN)', 'Name (AR)', 'Type', 'Influence', 'Interest', 'Engagement Strategy']
        ];
        stakeholders.forEach((st, i) => {
          stData.push([
            i + 1,
            st.name_en || '',
            st.name_ar || '',
            st.type || '',
            st.influence || '',
            st.interest || '',
            st.engagement_strategy || ''
          ]);
        });
        const wsSt = XLSX.utils.aoa_to_sheet(stData);
        XLSX.utils.book_append_sheet(wb, wsSt, 'Stakeholders');
      }

      // Action Plans Sheet
      if (actionPlans.length > 0) {
        const apData = [
          ['#', 'Title (EN)', 'Title (AR)', 'Description (EN)', 'Owner', 'Start Date', 'End Date', 'Budget', 'Status']
        ];
        actionPlans.forEach((ap, i) => {
          apData.push([
            i + 1,
            ap.title_en || '',
            ap.title_ar || '',
            ap.description_en || '',
            ap.owner_email || '',
            ap.start_date || '',
            ap.end_date || '',
            ap.budget || '',
            ap.status || ''
          ]);
        });
        const wsAp = XLSX.utils.aoa_to_sheet(apData);
        XLSX.utils.book_append_sheet(wb, wsAp, 'Action Plans');
      }

      XLSX.writeFile(wb, `${data.name_en || 'strategic-plan'}-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success(t({ en: 'Excel exported successfully', ar: 'تم تصدير Excel بنجاح' }));
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error(t({ en: 'Failed to export Excel', ar: 'فشل تصدير Excel' }));
    } finally {
      setIsExporting(false);
    }
  };


  // Calculate completeness for all 18 steps
  const completeness = {
    context: !!(data.name_en && data.description_en),
    vision: !!(data.vision_en && data.mission_en),
    stakeholders: stakeholders.length > 0,
    pestel: Object.values(data.pestel || {}).some(arr => arr?.length > 0),
    swot: (swot.strengths?.length > 0 || swot.opportunities?.length > 0),
    scenarios: !!(data.scenarios?.best_case?.description_en || data.scenarios?.best_case?.description_ar || data.scenarios?.most_likely?.description_en || data.scenarios?.most_likely?.description_ar),
    risks: risks.length > 0,
    dependencies: (data.dependencies?.length > 0 || data.constraints?.length > 0),
    objectives: objectives.length >= 3,
    national: alignments.length > 0,
    kpis: kpis.length > 0,
    actions: actionPlans.length > 0,
    resources: !!(data.resource_plan?.hr_requirements?.length || data.resource_plan?.budget_allocation?.length),
    timeline: (phases.length > 0 || milestones.length > 0),
    governance: !!(governance.committees?.length > 0 || governance.reporting_frequency),
    communication: !!(data.communication_plan?.internal_channels?.length || data.communication_plan?.key_messages?.length),
    change: !!(data.change_management?.readiness_assessment_en || data.change_management?.readiness_assessment_ar || data.change_management?.change_approach_en || data.change_management?.change_approach_ar)
  };

  const completenessScore = Object.values(completeness).filter(Boolean).length;
  const totalSteps = Object.keys(completeness).length;
  const completionPercentage = Math.round((completenessScore / totalSteps) * 100);

  // Validation
  const getValidationErrors = () => {
    const errors = [];
    if (!data.name_en) errors.push(t({ en: 'Plan name is required', ar: 'اسم الخطة مطلوب' }));
    if (!data.vision_en) errors.push(t({ en: 'Vision statement is required', ar: 'بيان الرؤية مطلوب' }));
    if (objectives.length < 3) errors.push(t({ en: 'At least 3 objectives required', ar: 'مطلوب 3 أهداف على الأقل' }));
    if (kpis.length === 0) errors.push(t({ en: 'At least 1 KPI required', ar: 'مطلوب مؤشر أداء واحد على الأقل' }));
    return errors;
  };

  const errors = [...validationErrors, ...getValidationErrors()];
  const canSubmit = errors.length === 0 && completionPercentage >= 60;

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
              { key: 'context', icon: FileText, label: { en: 'Context', ar: 'السياق' } },
              { key: 'vision', icon: Target, label: { en: 'Vision', ar: 'الرؤية' } },
              { key: 'stakeholders', icon: Users, label: { en: 'Stakeholders', ar: 'أصحاب المصلحة' } },
              { key: 'pestel', icon: Globe, label: { en: 'PESTEL', ar: 'PESTEL' } },
              { key: 'swot', icon: Target, label: { en: 'SWOT', ar: 'SWOT' } },
              { key: 'scenarios', icon: Lightbulb, label: { en: 'Scenarios', ar: 'السيناريوهات' } },
              { key: 'risks', icon: AlertTriangle, label: { en: 'Risks', ar: 'المخاطر' } },
              { key: 'dependencies', icon: Link, label: { en: 'Dependencies', ar: 'التبعيات' } },
              { key: 'objectives', icon: Target, label: { en: 'Objectives', ar: 'الأهداف' } },
              { key: 'national', icon: Link, label: { en: 'National', ar: 'وطني' } },
              { key: 'kpis', icon: Activity, label: { en: 'KPIs', ar: 'المؤشرات' } },
              { key: 'actions', icon: Lightbulb, label: { en: 'Actions', ar: 'الإجراءات' } },
              { key: 'resources', icon: DollarSign, label: { en: 'Resources', ar: 'الموارد' } },
              { key: 'timeline', icon: Calendar, label: { en: 'Timeline', ar: 'الجدول' } },
              { key: 'governance', icon: Shield, label: { en: 'Governance', ar: 'الحوكمة' } },
              { key: 'communication', icon: Megaphone, label: { en: 'Comms', ar: 'التواصل' } },
              { key: 'change', icon: Lightbulb, label: { en: 'Change', ar: 'التغيير' } }
            ].map(item => {
              const Icon = item.icon;
              const isComplete = completeness[item.key];
              return (
                <div 
                  key={item.key} 
                  className={`p-2 rounded-lg border text-center ${isComplete ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}
                >
                  <Icon className={`h-4 w-4 mx-auto ${isComplete ? 'text-green-600' : 'text-amber-600'}`} />
                  <span className="text-xs font-medium block mt-1">{item.label[language]}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Plan Overview', ar: 'نظرة عامة على الخطة' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t({ en: 'Title', ar: 'العنوان' })}</p>
              <p className="font-medium">{language === 'ar' ? (data.name_ar || data.name_en) : data.name_en}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t({ en: 'Duration', ar: 'المدة' })}</p>
              <p className="font-medium">{data.start_year} - {data.end_year}</p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t({ en: 'Vision', ar: 'الرؤية' })}</p>
            <p className="text-sm">{language === 'ar' ? (data.vision_ar || data.vision_en) : data.vision_en}</p>
          </div>

          {data.mission_en && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t({ en: 'Mission', ar: 'الرسالة' })}</p>
              <p className="text-sm">{language === 'ar' ? (data.mission_ar || data.mission_en) : data.mission_en}</p>
            </div>
          )}

          {(data.target_sectors?.length > 0) && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t({ en: 'Target Sectors', ar: 'القطاعات المستهدفة' })}</p>
                <div className="flex flex-wrap gap-1">
                  {data.target_sectors.map(code => (
                    <Badge key={code} variant="outline" className="text-xs">{getSectorName(code)}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {(data.focus_technologies?.length > 0) && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t({ en: 'Focus Technologies', ar: 'التقنيات المركزة' })}</p>
                <div className="flex flex-wrap gap-1">
                  {data.focus_technologies.map(code => (
                    <Badge key={code} variant="secondary" className="text-xs">{getTechName(code)}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
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

      {/* Objectives List */}
      {objectives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t({ en: 'Strategic Objectives', ar: 'الأهداف الاستراتيجية' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {objectives.map((obj, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 border rounded-lg">
                    <Badge variant="outline">#{i + 1}</Badge>
                    {obj.sector_code && <Badge className="text-xs bg-primary/10 text-primary">{getSectorName(obj.sector_code)}</Badge>}
                    <span className="text-sm flex-1 line-clamp-1">
                      {language === 'ar' ? (obj.name_ar || obj.name_en) : obj.name_en}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Version Info (Edit Mode) */}
      {mode === 'edit' && data.version_number && (
        <Card className="border-blue-200 bg-blue-50/50">
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
              disabled={isExporting || !data.name_en}
            >
              {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              {t({ en: 'Export PDF', ar: 'تصدير PDF' })}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportExcel}
              disabled={isExporting || !data.name_en}
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
            disabled={isSaving || !data.name_en}
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
