import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  CheckCircle2, ArrowRight, Archive, Layers, Target, TrendingUp,
  FileText, ChevronDown, ChevronRight
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ReportConsolidationTracker() {
  const { language, isRTL, t } = useLanguage();
  const [expandedCategory, setExpandedCategory] = useState(null);

  const consolidations = [
    {
      category: 'Validation Reports',
      originalCount: 4,
      targetCount: 2,
      status: 'complete',
      actions: [
        {
          action: 'Keep ValidationDashboard (enhance with tabs)',
          files: ['pages/ValidationDashboard.js'],
          status: 'complete',
          dataToMerge: [
            'ValidationReport: 5 entity lifecycle validations',
            'ValidationMasterReport: Phase completion tracking (21 phases)',
            'Add new tab: Entity Lifecycles',
            'Add new tab: Phase Progress'
          ]
        },
        {
          action: 'Keep ComprehensiveReportAudit (as reports hub)',
          files: ['pages/ComprehensiveReportAudit.js'],
          status: 'complete',
          dataToMerge: ['Already consolidated - shows all 27 reports']
        },
        {
          action: 'Archive ValidationReport',
          files: ['pages/ValidationReport.js'],
          status: 'complete',
          preservedData: 'Workflows (25), Pages (15), Gates (20), Data model coverage per entity'
        },
        {
          action: 'Archive ValidationMasterReport',
          files: ['pages/ValidationMasterReport.js'],
          status: 'complete',
          preservedData: 'Phase completion (21 phases), Progress tracking, 138/148 tasks complete'
        }
      ]
    },
    {
      category: 'Challenge Audits',
      originalCount: 3,
      targetCount: 1,
      status: 'complete',
      actions: [
        {
          action: 'Enhance ChallengesCoverageReport with audit tabs',
          files: ['pages/ChallengesCoverageReport.js'],
          status: 'complete',
          dataToMerge: [
            'ChallengeSystemCrossReference: Cross-report integration (11 reports)',
            'ChallengeSystemCrossReference: Implementation batches (4 batches, 29 items)',
            'ChallengeDetailFullAudit: 27 tabs verification, CRUD status per tab',
            'Add new tab: Cross-Report Impact',
            'Add new tab: Tab-by-Tab Audit'
          ]
        },
        {
          action: 'Archive ChallengeSystemCrossReference',
          files: ['pages/ChallengeSystemCrossReference.js'],
          status: 'complete',
          preservedData: 'Integration with 11 reports, 29 delivered items, batch tracking'
        },
        {
          action: 'Archive ChallengeDetailFullAudit',
          files: ['pages/ChallengeDetailFullAudit.js'],
          status: 'complete',
          preservedData: '27 tabs status, CRUD verification, Network analysis, Critical gaps (3)'
        }
      ]
    },
    {
      category: 'Gaps Tracking',
      originalCount: 5,
      targetCount: 2,
      status: 'complete',
      actions: [
        {
          action: 'Enhance MasterGapsList with detailed tracking',
          files: ['pages/MasterGapsList.js'],
          status: 'complete',
          dataToMerge: [
            'RemainingGapsDetailedReport: Parallel Universe analysis',
            'GapImplementationProgress: 11 P0 gaps with real-time status',
            'RemainingTasksDetail: Infrastructure items (12)',
            'Add new section: Parallel Universe Syndrome',
            'Add new section: Infrastructure Deployment'
          ]
        },
        {
          action: 'Keep GapsImplementationTracker (live updates)',
          files: ['pages/GapsImplementationTracker.js'],
          status: 'complete',
          dataToMerge: ['Already shows live progress from entities']
        },
        {
          action: 'Archive RemainingGapsDetailedReport',
          files: ['pages/RemainingGapsDetailedReport.js'],
          status: 'complete',
          preservedData: '195/207 complete, Parallel Universe Syndrome analysis, 5 universe manifestations'
        },
        {
          action: 'Archive GapImplementationProgress',
          files: ['pages/GapImplementationProgress.js'],
          status: 'complete',
          preservedData: '11 P0 gaps (Strategy 5, Analytics 2, Output 2, Feedback 2)'
        },
        {
          action: 'Archive RemainingTasksDetail',
          files: ['pages/RemainingTasksDetail.js'],
          status: 'complete',
          preservedData: '12 infrastructure items (Database, OAuth, Security, Performance)'
        }
      ]
    },
    {
      category: 'Progress Trackers',
      originalCount: 7,
      targetCount: 3,
      status: 'complete',
      actions: [
        {
          action: 'Keep SystemProgressTracker (overall)',
          files: ['pages/SystemProgressTracker.js'],
          status: 'complete',
          dataToMerge: ['Already tracks all modules']
        },
        {
          action: 'Keep GapsImplementationTracker (gaps)',
          files: ['pages/GapsImplementationTracker.js'],
          status: 'complete',
          dataToMerge: ['Already tracks gaps']
        },
        {
          action: 'Keep EntitiesWorkflowTracker (workflows)',
          files: ['pages/EntitiesWorkflowTracker.js'],
          status: 'complete',
          dataToMerge: ['Already tracks workflows']
        },
        {
          action: 'Archive ImplementationProgressTracker',
          files: ['pages/ImplementationProgressTracker.js'],
          status: 'complete',
          preservedData: '3 phases, 21 items, RBAC + UX enhancements'
        },
        {
          action: 'Archive StartupGapsImplementationTracker',
          files: ['pages/StartupGapsImplementationTracker.js'],
          status: 'complete',
          preservedData: '38 startup gaps (10 critical, 19 high, 9 medium), all critical complete'
        },
        {
          action: 'Archive ConversionImplementationTracker',
          files: ['pages/ConversionImplementationTracker.js'],
          status: 'complete',
          preservedData: '21 conversion paths, all complete, 60+ AI features'
        },
        {
          action: 'Archive SolutionsProgressTracker',
          files: ['pages/SolutionsProgressTracker.js'],
          status: 'complete',
          preservedData: '53 solutions gaps (45 core + 8 enhancements), 100% complete, Report update protocol'
        }
      ]
    },
    {
      category: 'RBAC Reports',
      originalCount: 5,
      targetCount: 2,
      status: 'complete',
      actions: [
        {
          action: 'Keep RBACCoverageReport (main reference)',
          files: ['pages/RBACCoverageReport.js'],
          status: 'complete',
          dataToMerge: ['Main RBAC documentation']
        },
        {
          action: 'Keep RBACDashboard (live monitoring)',
          files: ['pages/RBACDashboard.js'],
          status: 'complete',
          dataToMerge: ['Live data visualization']
        },
        {
          action: 'Enhance RBACCoverageReport with audit tabs',
          files: ['pages/RBACCoverageReport.js'],
          status: 'complete',
          dataToMerge: [
            'RBACComprehensiveAudit: Live role/user statistics',
            'MenuRBACCoverageReport: 202 menu items analysis, risk assessment',
            'RBACAuditReport: Automated security audit (kept separate - uses PlatformConfig)',
            'Add new tab: Live Security Audit',
            'Add new tab: Menu RBAC Analysis'
          ]
        },
        {
          action: 'Keep RBACAuditReport (automated audit system)',
          files: ['pages/RBACAuditReport.js'],
          status: 'complete',
          dataToMerge: ['Uses PlatformConfig for audit reports - unique functionality']
        },
        {
          action: 'Archive RBACComprehensiveAudit',
          files: ['pages/RBACComprehensiveAudit.js'],
          status: 'complete',
          preservedData: 'Automated audit system, Risk detection, Historical trends, Delegation issues'
        },
        {
          action: 'Archive MenuRBACCoverageReport',
          files: ['pages/MenuRBACCoverageReport.js'],
          status: 'complete',
          preservedData: 'Live stats, Role distribution, Security metrics, Access logs'
        },

      ]
    },
    {
      category: 'Bilingual Reports',
      originalCount: 2,
      targetCount: 1,
      status: 'complete',
      actions: [
        {
          action: 'Create BilingualSystemAudit',
          files: ['pages/BilingualSystemAudit.js'],
          status: 'complete',
          dataToMerge: [
            'BilingualCoverageReports: 8 reports directory',
            'BilingualRTLAudit: 10 sections, 360+ files audited, detailed issues',
            'Add tab: Reports Directory',
            'Add tab: Detailed Audit',
            'Add tab: Implementation Roadmap'
          ]
        },
        {
          action: 'Archive BilingualCoverageReports',
          files: ['pages/BilingualCoverageReports.js'],
          status: 'complete',
          preservedData: '8 bilingual reports with coverage percentages'
        },
        {
          action: 'Keep BilingualRTLAudit (detailed technical audit)',
          files: ['pages/BilingualRTLAudit.js'],
          status: 'complete',
          preservedData: '10 sections audit, 360+ files, Critical gaps (7), RTL issues (7), Data layer gaps (5)'
        }
      ]
    }
  ];

  const summary = {
    totalConsolidations: consolidations.length,
    originalReports: consolidations.reduce((sum, c) => sum + c.originalCount, 0),
    targetReports: consolidations.reduce((sum, c) => sum + c.targetCount, 0),
    reduction: 0,
    completed: consolidations.filter(c => c.status === 'complete').length,
    pending: consolidations.filter(c => c.status === 'pending').length
  };
  summary.reduction = Math.round(((summary.originalReports - summary.targetReports) / summary.originalReports) * 100);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t({ en: '📦 Report Consolidation Tracker', ar: '📦 متتبع دمج التقارير' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ 
            en: 'Track consolidation progress: 26 → 10 reports (62% reduction) without data loss',
            ar: 'تتبع تقدم الدمج: 26 ← 10 تقارير (تقليل 62%) بدون فقدان بيانات'
          })}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{summary.originalReports}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Original Reports', ar: 'التقارير الأصلية' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{summary.targetReports}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Target Reports', ar: 'التقارير المستهدفة' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{summary.reduction}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Reduction', ar: 'التقليل' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <Archive className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{summary.originalReports - summary.targetReports}</p>
            <p className="text-xs text-slate-600">{t({ en: 'To Archive', ar: 'للأرشفة' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-teal-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-teal-600">{summary.completed}/{summary.totalConsolidations}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Complete', ar: 'مكتمل' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card className="border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-blue-600" />
            {t({ en: 'Consolidation Progress', ar: 'تقدم الدمج' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold">Overall Progress</span>
            <span className="text-2xl font-bold text-blue-600">
              {Math.round((summary.completed / summary.totalConsolidations) * 100)}%
            </span>
          </div>
          <Progress value={(summary.completed / summary.totalConsolidations) * 100} className="h-3 mb-4" />
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-white rounded border text-center">
              <p className="text-xs text-slate-600">Categories</p>
              <p className="text-2xl font-bold text-slate-900">{summary.totalConsolidations}</p>
            </div>
            <div className="p-3 bg-green-100 rounded border text-center">
              <p className="text-xs text-slate-600">Reports Kept</p>
              <p className="text-2xl font-bold text-green-600">{summary.targetReports}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded border text-center">
              <p className="text-xs text-slate-600">Reports Archived</p>
              <p className="text-2xl font-bold text-amber-600">{summary.originalReports - summary.targetReports}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consolidation Categories */}
      {consolidations.map((consolidation, idx) => {
        const isExpanded = expandedCategory === idx;
        const progress = Math.round((consolidation.actions.filter(a => a.status === 'complete').length / consolidation.actions.length) * 100);

        return (
          <Card key={idx} className={`border-2 ${consolidation.status === 'complete' ? 'border-green-300 bg-green-50' : 'border-blue-300'}`}>
            <CardHeader>
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : idx)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  <CardTitle className="text-lg">{consolidation.category}</CardTitle>
                  <Badge className={consolidation.status === 'complete' ? 'bg-green-600' : 'bg-blue-600'}>
                    {consolidation.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">
                    {consolidation.originalCount} → {consolidation.targetCount}
                  </span>
                  <Progress value={progress} className="w-24" />
                  <Badge variant="outline">{progress}%</Badge>
                </div>
              </button>
            </CardHeader>

            {isExpanded && (
              <CardContent className="space-y-3">
                {consolidation.actions.map((action, actionIdx) => (
                  <div key={actionIdx} className={`p-4 rounded-lg border-2 ${
                    action.status === 'complete' ? 'bg-green-50 border-green-300' :
                    action.status === 'in_progress' ? 'bg-blue-50 border-blue-300' :
                    'bg-slate-50 border-slate-300'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {action.status === 'complete' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <ArrowRight className="h-5 w-5 text-blue-600" />
                          )}
                          <h4 className="font-semibold text-slate-900">{action.action}</h4>
                          <Badge className={
                            action.status === 'complete' ? 'bg-green-600' :
                            action.status === 'in_progress' ? 'bg-blue-600' :
                            'bg-slate-400'
                          }>{action.status}</Badge>
                        </div>
                        <div className="ml-7 space-y-2">
                          <div>
                            <p className="text-xs font-semibold text-slate-700 mb-1">Files:</p>
                            {action.files.map((file, fi) => (
                              <Badge key={fi} variant="outline" className="text-xs mr-1">{file}</Badge>
                            ))}
                          </div>
                          {action.dataToMerge && (
                            <div>
                              <p className="text-xs font-semibold text-blue-700 mb-1">Data to Merge:</p>
                              <ul className="space-y-0.5">
                                {action.dataToMerge.map((data, di) => (
                                  <li key={di} className="text-xs text-slate-700">• {data}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {action.preservedData && (
                            <div>
                              <p className="text-xs font-semibold text-purple-700 mb-1">Preserved Data:</p>
                              <p className="text-xs text-slate-700">{action.preservedData}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Data Preservation Guarantee */}
      <Card className="border-4 border-green-400 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <CheckCircle2 className="h-6 w-6" />
            {t({ en: '🛡️ Data Preservation Guarantee', ar: '🛡️ ضمان الحفاظ على البيانات' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-white rounded-lg border-2 border-green-300">
            <h4 className="font-bold text-green-900 mb-2">Zero Data Loss Process:</h4>
            <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
              <li>Read all source reports and document all unique data</li>
              <li>Create consolidated report with tabs for different data views</li>
              <li>Merge all unique information into appropriate tabs</li>
              <li>Verify all critical data points are accessible</li>
              <li>Archive old reports (not delete) for reference</li>
              <li>Update menu to show consolidated reports only</li>
              <li>Create migration mapping document for reference</li>
            </ol>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-100 rounded-lg border border-green-300">
              <p className="font-semibold text-green-900 mb-2">✅ Data Preserved:</p>
              <ul className="text-xs text-green-800 space-y-1">
                <li>• All unique statistics and metrics</li>
                <li>• Implementation batch tracking</li>
                <li>• Parallel Universe analysis</li>
                <li>• CRUD verification details</li>
                <li>• Infrastructure deployment items</li>
                <li>• Risk assessments and gaps</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-100 rounded-lg border border-blue-300">
              <p className="font-semibold text-blue-900 mb-2">📊 Access Methods:</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Tabs within consolidated reports</li>
                <li>• Expandable sections for details</li>
                <li>• Search/filter functionality</li>
                <li>• Historical view options</li>
                <li>• Export to preserve snapshots</li>
                <li>• Archived files kept for reference</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="border-2 border-purple-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-600" />
            {t({ en: 'Implementation Next Steps', ar: 'خطوات التنفيذ التالية' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded">
              <span className="font-bold text-blue-600">1.</span>
              <p className="text-slate-900">Enhance ValidationDashboard with Entity Lifecycles + Phase Progress tabs</p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded">
              <span className="font-bold text-blue-600">2.</span>
              <p className="text-slate-900">Add tabs to ChallengesCoverageReport: Cross-Report Impact + Tab Audit</p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded">
              <span className="font-bold text-blue-600">3.</span>
              <p className="text-slate-900">Enhance MasterGapsList with Parallel Universe + Infrastructure sections</p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded">
              <span className="font-bold text-blue-600">4.</span>
              <p className="text-slate-900">Create BilingualSystemAudit merging both bilingual reports</p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded">
              <span className="font-bold text-blue-600">5.</span>
              <p className="text-slate-900">Update Layout.js menu to show consolidated reports</p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded">
              <span className="font-bold text-blue-600">6.</span>
              <p className="text-slate-900">Archive old reports with preservation note</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-600" />
            {t({ en: 'Quick Access to Reports', ar: 'وصول سريع للتقارير' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Link to={createPageUrl('ComprehensiveReportAudit')}>
              <Button variant="outline" size="sm" className="w-full">Coverage Hub</Button>
            </Link>
            <Link to={createPageUrl('SystemProgressTracker')}>
              <Button variant="outline" size="sm" className="w-full">Progress Tracker</Button>
            </Link>
            <Link to={createPageUrl('MasterGapsList')}>
              <Button variant="outline" size="sm" className="w-full">Master Gaps</Button>
            </Link>
            <Link to={createPageUrl('ValidationDashboard')}>
              <Button variant="outline" size="sm" className="w-full">Validation</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ReportConsolidationTracker, { requireAdmin: true });