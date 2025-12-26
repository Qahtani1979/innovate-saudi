import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { FileText, Download, Loader2, Calendar, Building2, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

import { usePolicyRecommendations } from '@/hooks/usePolicyRecommendations';
import { useMunicipalities } from '@/hooks/useMunicipalities';

export default function PolicyReportTemplates() {
  const { language, isRTL, t } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: policies = [] } = usePolicyRecommendations();
  const { data: municipalities = [] } = useMunicipalities();

  const reportTemplates = [
    {
      id: 'executive_summary',
      name: { en: 'Executive Policy Summary', ar: 'ملخص السياسات التنفيذي' },
      description: { en: 'High-level overview of all policies', ar: 'نظرة عامة على جميع السياسات' },
      icon: BarChart3
    },
    {
      id: 'implementation_progress',
      name: { en: 'Implementation Progress Report', ar: 'تقرير تقدم التنفيذ' },
      description: { en: 'Track adoption across municipalities', ar: 'تتبع التبني عبر البلديات' },
      icon: Building2
    },
    {
      id: 'quarterly_review',
      name: { en: 'Quarterly Policy Review', ar: 'المراجعة الفصلية للسياسات' },
      description: { en: 'Quarterly progress and impact', ar: 'التقدم والتأثير الفصلي' },
      icon: Calendar
    },
    {
      id: 'regulatory_changes',
      name: { en: 'Regulatory Changes Report', ar: 'تقرير التغييرات التنظيمية' },
      description: { en: 'Policies requiring regulatory amendments', ar: 'السياسات التي تتطلب تعديلات تنظيمية' },
      icon: FileText
    }
  ];

  const generateReport = async () => {
    if (!selectedTemplate) {
      toast.error(t({ en: 'Select a template', ar: 'اختر قالباً' }));
      return;
    }

    setIsGenerating(true);
    try {
      const filteredPolicies = policies.filter(p => {
        const stageMatch = selectedStage === 'all' || (p.workflow_stage || p.status) === selectedStage;
        const priorityMatch = selectedPriority === 'all' || p.priority_level === selectedPriority;
        return stageMatch && priorityMatch;
      });

      let reportContent = '';
      const template = reportTemplates.find(t => t.id === selectedTemplate);

      if (selectedTemplate === 'executive_summary') {
        const byStage = filteredPolicies.reduce((acc, p) => {
          const stage = p.workflow_stage || p.status;
          acc[stage] = (acc[stage] || 0) + 1;
          return acc;
        }, {});

        const highPriority = filteredPolicies.filter(p => p.priority_level === 'high' || p.priority_level === 'critical');
        const avgImpact = filteredPolicies.reduce((sum, p) => sum + (p.impact_score || 0), 0) / filteredPolicies.length;

        reportContent = `
EXECUTIVE POLICY SUMMARY REPORT
Generated: ${new Date().toLocaleDateString()}

OVERVIEW:
- Total Policies: ${filteredPolicies.length}
- Average Impact Score: ${avgImpact.toFixed(1)}
- High Priority: ${highPriority.length}
- Regulatory Changes Needed: ${filteredPolicies.filter(p => p.regulatory_change_needed).length}

POLICIES BY STAGE:
${Object.entries(byStage).map(([stage, count]) => `  ${stage}: ${count}`).join('\n')}

TOP HIGH-PRIORITY POLICIES:
${highPriority.slice(0, 5).map(p => `- ${p.code || p.id}:
  AR: ${p.title_ar || 'N/A'}
  EN: ${p.title_en || 'N/A'}
  Impact: ${p.impact_score || 'N/A'}`).join('\n')}

REGULATORY FRAMEWORK CHANGES:
${filteredPolicies.filter(p => p.regulatory_change_needed).map(p =>
          `- AR: ${p.title_ar || 'N/A'}
  EN: ${p.title_en || 'N/A'}
  Framework: ${p.regulatory_framework || 'Framework TBD'}`
        ).join('\n')}
        `;
      } else if (selectedTemplate === 'implementation_progress') {
        const adoptionStats = filteredPolicies.map(p => {
          const adopted = p.implementation_progress?.municipalities_adopted?.length || 0;
          const total = municipalities.length;
          const rate = total > 0 ? (adopted / total * 100).toFixed(0) : 0;
          return { policy: p, adopted, total, rate };
        }).filter(s => s.adopted > 0);

        reportContent = `
POLICY IMPLEMENTATION PROGRESS REPORT
Generated: ${new Date().toLocaleDateString()}

MUNICIPAL ADOPTION OVERVIEW:
- Total Municipalities: ${municipalities.length}
- Active Policies: ${filteredPolicies.filter(p => ['published', 'active', 'implementation'].includes(p.workflow_stage || p.status)).length}

ADOPTION BY POLICY:
${adoptionStats.map(s => `
${s.policy.code || s.policy.id}:
  AR: ${s.policy.title_ar || 'N/A'}
  EN: ${s.policy.title_en || 'N/A'}
  Adopted: ${s.adopted}/${s.total} municipalities (${s.rate}%)
  Progress: ${s.policy.implementation_progress?.overall_percentage || 0}%
`).join('\n')}

LAGGING MUNICIPALITIES:
${municipalities.filter(m => {
          const adoptedPolicies = filteredPolicies.filter(p =>
            p.implementation_progress?.municipalities_adopted?.includes(m.id)
          );
          return adoptedPolicies.length < filteredPolicies.length * 0.5;
        }).map(m => `- ${m.name_en}: ${filteredPolicies.filter(p => p.implementation_progress?.municipalities_adopted?.includes(m.id)).length
          }/${filteredPolicies.length} policies adopted`).join('\n')}
        `;
      } else if (selectedTemplate === 'quarterly_review') {
        const thisQuarter = filteredPolicies.filter(p => {
          const created = new Date(p.created_date);
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          return created > threeMonthsAgo;
        });

        reportContent = `
QUARTERLY POLICY REVIEW
Quarter: ${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}
Generated: ${new Date().toLocaleDateString()}

NEW POLICIES THIS QUARTER: ${thisQuarter.length}

WORKFLOW PROGRESS:
- Reached Legal Review: ${filteredPolicies.filter(p => p.legal_review?.status === 'approved').length}
- Public Consultation: ${filteredPolicies.filter(p => p.public_consultation?.feedback_count > 0).length}
- Council Approved: ${filteredPolicies.filter(p => p.approvals?.some(a => a.stage === 'council_approval' && a.status === 'approved')).length}
- Published: ${filteredPolicies.filter(p => (p.workflow_stage || p.status) === 'published').length}

KEY POLICIES ADVANCED:
${thisQuarter.slice(0, 10).map(p => `- ${p.code || p.id}:
  AR: ${p.title_ar || 'N/A'}
  EN: ${p.title_en || 'N/A'}
  Stage: ${p.workflow_stage || p.status}`).join('\n')}
        `;
      } else if (selectedTemplate === 'regulatory_changes') {
        const needingChanges = filteredPolicies.filter(p => p.regulatory_change_needed);

        reportContent = `
REGULATORY CHANGES REPORT
Generated: ${new Date().toLocaleDateString()}

POLICIES REQUIRING REGULATORY AMENDMENTS: ${needingChanges.length}

BY FRAMEWORK:
${Object.entries(needingChanges.reduce((acc, p) => {
          const fw = p.regulatory_framework || 'Framework TBD';
          acc[fw] = (acc[fw] || 0) + 1;
          return acc;
        }, {})).map(([fw, count]) => `${fw}: ${count} policies`).join('\n')}

DETAILED LIST:
${needingChanges.map(p => `
${p.code || p.id}:
  AR: ${p.title_ar || 'N/A'}
  EN: ${p.title_en || 'N/A'}
  Framework: ${p.regulatory_framework || 'TBD'}
  Priority: ${p.priority_level || 'N/A'}
  Status: ${p.workflow_stage || p.status}
  Timeline: ${p.timeline_months || 'TBD'} months
`).join('\n')}
        `;
      }

      // Create downloadable file
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success(t({ en: 'Report generated', ar: 'تم إنشاء التقرير' }));
    } catch (error) {
      toast.error(t({ en: 'Failed to generate report', ar: 'فشل إنشاء التقرير' }));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          {t({ en: 'Policy Report Templates', ar: 'قوالب تقارير السياسات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Report Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reportTemplates.map(template => {
            const Icon = template.icon;
            const isSelected = selectedTemplate === template.id;
            return (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-300'
                  }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-slate-600'}`} />
                  <h3 className="font-semibold text-sm text-slate-900">
                    {template.name[language]}
                  </h3>
                </div>
                <p className="text-xs text-slate-600">
                  {template.description[language]}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-lg">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">
              {t({ en: 'Workflow Stage', ar: 'مرحلة سير العمل' })}
            </label>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All', ar: 'الكل' })}</SelectItem>
                <SelectItem value="draft">{t({ en: 'Draft', ar: 'مسودة' })}</SelectItem>
                <SelectItem value="legal_review">{t({ en: 'Legal Review', ar: 'مراجعة قانونية' })}</SelectItem>
                <SelectItem value="public_consultation">{t({ en: 'Consultation', ar: 'استشارة' })}</SelectItem>
                <SelectItem value="council_approval">{t({ en: 'Council', ar: 'مجلس' })}</SelectItem>
                <SelectItem value="published">{t({ en: 'Published', ar: 'منشور' })}</SelectItem>
                <SelectItem value="active">{t({ en: 'Active', ar: 'فعال' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">
              {t({ en: 'Priority', ar: 'الأولوية' })}
            </label>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All', ar: 'الكل' })}</SelectItem>
                <SelectItem value="low">{t({ en: 'Low', ar: 'منخفض' })}</SelectItem>
                <SelectItem value="medium">{t({ en: 'Medium', ar: 'متوسط' })}</SelectItem>
                <SelectItem value="high">{t({ en: 'High', ar: 'عالي' })}</SelectItem>
                <SelectItem value="critical">{t({ en: 'Critical', ar: 'حرج' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateReport}
          disabled={!selectedTemplate || isGenerating}
          className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {t({ en: 'Generate & Download Report', ar: 'إنشاء وتنزيل التقرير' })}
        </Button>

        {/* Preview Stats */}
        {selectedTemplate && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-2">
              {t({ en: 'Report Preview', ar: 'معاينة التقرير' })}
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-600">{t({ en: 'Policies:', ar: 'سياسات:' })}</span>
                <span className="font-bold text-slate-900 ml-1">
                  {policies.filter(p => {
                    const stageMatch = selectedStage === 'all' || (p.workflow_stage || p.status) === selectedStage;
                    const priorityMatch = selectedPriority === 'all' || p.priority_level === selectedPriority;
                    return stageMatch && priorityMatch;
                  }).length}
                </span>
              </div>
              <div>
                <span className="text-slate-600">{t({ en: 'Municipalities:', ar: 'بلديات:' })}</span>
                <span className="font-bold text-slate-900 ml-1">{municipalities.length}</span>
              </div>
              <div>
                <span className="text-slate-600">{t({ en: 'Format:', ar: 'التنسيق:' })}</span>
                <span className="font-bold text-slate-900 ml-1">TXT</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
