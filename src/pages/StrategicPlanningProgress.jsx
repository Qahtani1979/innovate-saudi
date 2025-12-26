import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function StrategicPlanningProgress() {
  const { language, isRTL, t } = useLanguage();

  const progress = {
    phase1: {
      name: { en: 'Phase 1: Critical Fixes & New Tools', ar: 'المرحلة 1: إصلاحات حرجة وأدوات جديدة' },
      tasks: [
        { 
          name: { en: 'Service Entity Created', ar: 'تم إنشاء كيان الخدمات' }, 
          status: 'complete', 
          details: '3rd level taxonomy with KPIs, quality benchmarks, challenge linkage'
        },
        { 
          name: { en: 'StrategicPlan Entity Created', ar: 'تم إنشاء كيان الخطة الاستراتيجية' }, 
          status: 'complete', 
          details: 'Strategic plan entity with approval gate integration'
        },
        { 
          name: { en: 'ServiceCatalog Page', ar: 'صفحة كتالوج الخدمات' }, 
          status: 'complete', 
          details: 'Municipal services registry with search/filters'
        },
        { 
          name: { en: 'TechnologyRoadmap Page', ar: 'صفحة خارطة التقنية' }, 
          status: 'complete', 
          details: 'AI tech adoption roadmap (emerging→maturing→mainstream)'
        },
        { 
          name: { en: 'RiskPortfolio Page', ar: 'صفحة محفظة المخاطر' }, 
          status: 'complete', 
          details: 'Risk heatmaps, trends, mitigation priorities'
        },
        { 
          name: { en: 'SandboxLabCapacityPlanner', ar: 'مخطط سعة المختبرات' }, 
          status: 'complete', 
          details: 'Infrastructure capacity analysis with AI'
        },
        { 
          name: { en: 'MultiYearRoadmap', ar: 'خارطة متعددة السنوات' }, 
          status: 'complete', 
          details: '5-year timeline view of initiatives'
        },
        { 
          name: { en: 'TaxonomyBuilder - Complete Rebuild', ar: 'إعادة بناء أداة التصنيف' }, 
          status: 'complete', 
          details: 'Services UI + Visualization + AI gap detector + Wizard'
        },
        { 
          name: { en: 'TaxonomyVisualization Component', ar: 'مكون تصور التصنيف' }, 
          status: 'complete', 
          details: 'Tree view, statistics, charts'
        },
        { 
          name: { en: 'ServiceManager Component', ar: 'مكون إدارة الخدمات' }, 
          status: 'complete', 
          details: 'Add/edit/delete services under subsectors'
        },
        { 
          name: { en: 'TaxonomyGapDetector Component', ar: 'مكون كشف فجوات التصنيف' }, 
          status: 'complete', 
          details: 'AI-powered gap detection for taxonomy'
        },
        { 
          name: { en: 'TaxonomyWizard Component', ar: 'معالج التصنيف' }, 
          status: 'complete', 
          details: '5-step wizard for building complete taxonomy'
        },
        { 
          name: { en: 'StrategicPlanBuilder - AI Fix', ar: 'إصلاح ذكاء بناء الخطة' }, 
          status: 'complete', 
          details: 'Now uses real platform data (challenges, pilots, solutions, MII, R&D)'
        },
        { 
          name: { en: 'GapAnalysisTool - Expansion', ar: 'توسيع أداة تحليل الفجوات' }, 
          status: 'complete', 
          details: 'Added 6 new gap types + use case scenarios'
        },
        { 
          name: { en: 'StrategyCockpit - Pipeline Coverage', ar: 'تغطية خط الابتكار' }, 
          status: 'complete', 
          details: 'Full pipeline: Discover→Validate→Experiment→Pilot→Scale→Institutionalize'
        },
        { 
          name: { en: 'Portfolio - Enhanced Filters', ar: 'مرشحات محسنة للمحفظة' }, 
          status: 'complete', 
          details: 'Added sector filter, view modes improved'
        },
        { 
          name: { en: 'PortfolioRebalancing - AI Enhanced', ar: 'تحسين ذكاء إعادة التوازن' }, 
          status: 'complete', 
          details: 'Actionable reallocations, quick wins, what-if scenarios'
        },
        { 
          name: { en: 'RDPortfolioPlanner - Data-Driven', ar: 'مخطط البحث المعتمد على البيانات' }, 
          status: 'complete', 
          details: 'Uses real challenge data for R&D call suggestions'
        },
        { 
          name: { en: 'ProgramPortfolioPlanner - Enhanced', ar: 'مخطط البرامج المحسن' }, 
          status: 'complete', 
          details: 'Cohort strategy, timeline recommendations'
        },
        { 
          name: { en: 'CampaignPlanner - 4-Step Wizard', ar: 'معالج الحملات 4 خطوات' }, 
          status: 'complete', 
          details: 'Improved wizard with strategic alignment'
        },
        { 
          name: { en: 'BudgetAllocationTool - Sector Breakdown', ar: 'توزيع الميزانية بالقطاعات' }, 
          status: 'complete', 
          details: 'Added sector-level budget suggestions'
        },
        { 
          name: { en: 'StrategicKPITracker - AI Helpers', ar: 'مساعدات ذكية للمؤشرات' }, 
          status: 'complete', 
          details: 'Anomaly detection, forecasting, correlations, interventions'
        },
        { 
          name: { en: 'Decision Gates (4) Created', ar: 'تم إنشاء البوابات (4)' }, 
          status: 'complete', 
          details: 'StrategicPlanApproval, BudgetApproval, InitiativeLaunch, PortfolioReview'
        },
        { 
          name: { en: 'Menu Updated - All Tools Added', ar: 'تحديث القائمة - جميع الأدوات' }, 
          status: 'complete', 
          details: 'All new pages + decision gates added to Management section'
        }
      ],
      coverage: 100
    },
    phase2: {
      name: { en: 'Phase 2: Remaining Enhancements', ar: 'المرحلة 2: التحسينات المتبقية' },
      tasks: [
        { 
          name: { en: 'Portfolio - Bulk Actions', ar: 'إجراءات جماعية للمحفظة' }, 
          status: 'complete', 
          details: 'Multi-select, bulk move/assign/status/tag, undo within 5min'
        },
        { 
          name: { en: 'Portfolio - Export/Timeline Views', ar: 'عرض التصدير والجدول الزمني' }, 
          status: 'complete', 
          details: 'PDF/Excel export, Gantt timeline view'
        },
        { 
          name: { en: 'StrategyCockpit - Resource Allocation View', ar: 'عرض تخصيص الموارد' }, 
          status: 'complete', 
          details: 'Team capacity, lab utilization, sandbox occupancy, budget deployment'
        },
        { 
          name: { en: 'StrategyCockpit - Partnership Network', ar: 'شبكة الشراكات' }, 
          status: 'complete', 
          details: 'Collaboration network + AI partnership suggester'
        },
        { 
          name: { en: 'StrategyCockpit - Bottleneck Detector', ar: 'كاشف الاختناقات' }, 
          status: 'complete', 
          details: 'AI pipeline bottleneck detection with root cause + recommendations'
        },
        { 
          name: { en: 'Decision Gates - Full Workflows', ar: 'البوابات - سير عمل كامل' }, 
          status: 'complete', 
          details: '4 backend functions + frontend integration with email notifications'
        },
        { 
          name: { en: 'StrategicKPITracker - Alert System', ar: 'نظام التنبيهات للمؤشرات' }, 
          status: 'complete', 
          details: 'Alert rules config, threshold/anomaly/forecast alerts'
        },
        { 
          name: { en: 'StrategicKPITracker - Dashboard Builder', ar: 'بناء لوحات المؤشرات' }, 
          status: 'complete', 
          details: 'Drag-drop dashboard builder with multiple widget types'
        }
      ],
      coverage: 100
    },
    phase3: {
      name: { en: 'Phase 3: Polish & Advanced Features', ar: 'المرحلة 3: الصقل والميزات المتقدمة' },
      tasks: [
        { 
          name: { en: 'Interactive What-If Simulator', ar: 'محاكي تفاعلي للسيناريوهات' }, 
          status: 'complete', 
          details: 'Budget rebalancing simulator with AI impact predictions'
        },
        { 
          name: { en: 'Collaboration Mapper', ar: 'خريطة التعاون' }, 
          status: 'complete', 
          details: 'AI partnership suggester based on project description'
        },
        { 
          name: { en: 'Template Libraries', ar: 'مكتبات القوالب' }, 
          status: 'complete', 
          details: 'Templates for strategic plans, R&D calls, campaigns, pilots'
        },
        { 
          name: { en: 'Historical Trend Comparisons', ar: 'مقارنات الاتجاهات التاريخية' }, 
          status: 'complete', 
          details: 'YoY/QoQ comparisons with growth rate charts'
        }
      ],
      coverage: 100
    }
  };

  const allTasks = [...progress.phase1.tasks, ...progress.phase2.tasks, ...progress.phase3.tasks];
  const completeTasks = allTasks.filter(t => t.status === 'complete').length;
  const overallProgress = (completeTasks / allTasks.length) * 100;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '📊 Strategic Planning Implementation Progress', ar: '📊 تقدم تنفيذ التخطيط الاستراتيجي' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Detailed tracking of all strategic planning enhancements', ar: 'تتبع تفصيلي لجميع تحسينات التخطيط الاستراتيجي' })}
        </p>
        <div className="mt-4">
          <Badge variant="outline" className="bg-white/20 text-white border-white/40 text-lg px-4 py-2">
            {completeTasks}/{allTasks.length} tasks complete ({overallProgress.toFixed(0)}%)
          </Badge>
        </div>
      </div>

      {/* Overall Progress */}
      <Card className="border-4 border-green-400">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-600">{t({ en: 'Overall Implementation Progress', ar: 'التقدم الإجمالي للتنفيذ' })}</p>
              <p className="text-4xl font-bold text-green-600">{overallProgress.toFixed(0)}%</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-900">{completeTasks}/{allTasks.length}</p>
              <p className="text-sm text-slate-500">{t({ en: 'tasks', ar: 'مهمة' })}</p>
            </div>
          </div>
          <Progress value={overallProgress} className="h-4" />
        </CardContent>
      </Card>

      {/* Phase 1: Critical (COMPLETE) */}
      <Card className="border-4 border-green-500 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle2 className="h-6 w-6" />
              {progress.phase1.name[language]}
            </CardTitle>
            <Badge className="bg-green-600 text-lg px-4 py-2">100% COMPLETE</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {progress.phase1.tasks.map((task, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-white border-2 border-green-200 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-green-900">{task.name[language]}</p>
                  <p className="text-xs text-slate-600 mt-1">{task.details}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phase 2: Enhancements (PENDING) */}
      <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <Loader2 className="h-6 w-6" />
              {progress.phase2.name[language]}
            </CardTitle>
            <Badge className="bg-yellow-600 text-lg px-4 py-2">PENDING</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {progress.phase2.tasks.map((task, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-white border border-yellow-200 rounded-lg">
                <Circle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{task.name[language]}</p>
                  <p className="text-xs text-slate-600 mt-1">{task.details}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phase 3: Polish (PENDING) */}
      <Card className="border-2 border-slate-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Circle className="h-6 w-6" />
              {progress.phase3.name[language]}
            </CardTitle>
            <Badge className="bg-slate-600 text-lg px-4 py-2">FUTURE</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {progress.phase3.tasks.map((task, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <Circle className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-slate-700">{task.name[language]}</p>
                  <p className="text-xs text-slate-500 mt-1">{task.details}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-4 border-blue-400 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="text-blue-900 text-2xl">
            {t({ en: '✅ Implementation Summary', ar: '✅ ملخص التنفيذ' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-300">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-4xl font-bold text-green-600">{progress.phase1.tasks.length}</p>
              <p className="text-sm text-slate-600 mt-1">{t({ en: 'Phase 1 Complete', ar: 'المرحلة 1 مكتملة' })}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
              <Loader2 className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
              <p className="text-4xl font-bold text-yellow-600">{progress.phase2.tasks.length}</p>
              <p className="text-sm text-slate-600 mt-1">{t({ en: 'Phase 2 Pending', ar: 'المرحلة 2 معلقة' })}</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg border-2 border-slate-300">
              <Circle className="h-12 w-12 text-slate-400 mx-auto mb-2" />
              <p className="text-4xl font-bold text-slate-600">{progress.phase3.tasks.length}</p>
              <p className="text-sm text-slate-600 mt-1">{t({ en: 'Phase 3 Future', ar: 'المرحلة 3 مستقبلية' })}</p>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300">
            <h4 className="font-bold text-green-900 mb-3 text-xl">
              {t({ en: '🎉 PHASE 1 COMPLETE - 24/24 TASKS', ar: '🎉 المرحلة 1 مكتملة - 24/24 مهمة' })}
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <p className="text-green-900">✅ <strong>2 New Entities:</strong> Service, StrategicPlan</p>
                <p className="text-green-900">✅ <strong>5 New Pages:</strong> ServiceCatalog, TechnologyRoadmap, RiskPortfolio, SandboxLabCapacity, MultiYearRoadmap</p>
                <p className="text-green-900">✅ <strong>4 Decision Gates:</strong> All created and added to menu</p>
                <p className="text-green-900">✅ <strong>TaxonomyBuilder:</strong> Complete rebuild with 4 tabs</p>
              </div>
              <div className="space-y-1">
                <p className="text-green-900">✅ <strong>4 New Components:</strong> TaxonomyVisualization, ServiceManager, TaxonomyGapDetector, TaxonomyWizard</p>
                <p className="text-green-900">✅ <strong>StrategicPlanBuilder:</strong> AI now uses real data</p>
                <p className="text-green-900">✅ <strong>GapAnalysis:</strong> Expanded to 10 gap types + use cases</p>
                <p className="text-green-900">✅ <strong>All Portfolio Tools:</strong> Enhanced with better AI</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
            <p className="font-semibold text-yellow-900 mb-2">
              {t({ en: '⏳ NEXT UP: Phase 2 (8 tasks)', ar: '⏳ القادم: المرحلة 2 (8 مهام)' })}
            </p>
            <p className="text-sm text-slate-700">
              {t({ 
                en: 'Portfolio bulk actions, export views, resource allocation tracking, partnership networks, bottleneck detection, full gate workflows, KPI alerts, dashboard builder',
                ar: 'إجراءات جماعية للمحفظة، عروض التصدير، تتبع تخصيص الموارد، شبكات الشراكات، كشف الاختناقات، سير العمل الكامل للبوابات، تنبيهات المؤشرات، بناء اللوحات'
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(StrategicPlanningProgress, { requireAdmin: true });
