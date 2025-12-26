import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import {
  CheckCircle2, XCircle, AlertCircle, Target, FileText, Database, Trash2, ChevronDown, ChevronRight
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ReportRedundancyAnalysis() {
  const { language, isRTL, t } = useLanguage();
  const [expandedReports, setExpandedReports] = useState({});

  const toggleReport = (key) => {
    setExpandedReports(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const reportAnalysis = [
    {
      name: 'ComprehensiveReportAudit',
      file: 'pages/ComprehensiveReportAudit.js',
      exists: true,
      lines: 928,
      purpose: 'Central hub/index of all 26 coverage reports',
      content: {
        primary: [
          'Lists all coverage reports with completion status',
          'Section-by-section coverage matrix',
          'Links to individual detailed reports',
          'Priority filtering (reference, high, critical)',
          'Category breakdown (module vs system reports)'
        ],
        unique: [
          '✅ Acts as central directory/index',
          '✅ Shows which reports are complete vs need sections',
          '✅ Quick navigation to all individual reports',
          '✅ Only place showing ALL reports in one view'
        ]
      },
      redundancy: 'NONE - Unique purpose',
      recommendation: {
        action: '✅ KEEP',
        reason: 'Essential as central index - cannot find this info elsewhere',
        priority: 'Required'
      },
      dataOverlap: {
        with: [],
        percentage: 0
      }
    },
    {
      name: 'ValidationDashboard',
      file: 'pages/ValidationDashboard.js',
      exists: true,
      lines: 443,
      purpose: 'High-level platform validation summary',
      content: {
        primary: [
          'Platform stats (312 files, 175+ pages, 66 entities)',
          'Entity lifecycles for 5 entities',
          'Phase completion progress (148 tasks)',
          'Links to other validation tools'
        ],
        unique: []
      },
      redundancy: 'HIGH - 90% redundant',
      recommendation: {
        action: '🗑️ DELETE',
        reason: 'All data available in ComprehensiveReportAudit + individual coverage reports',
        priority: 'Recommended'
      },
      dataOverlap: {
        with: [
          'ComprehensiveReportAudit (platform-wide stats)',
          'Individual coverage reports (entity lifecycles)',
          'SystemProgressTracker (phase progress)'
        ],
        percentage: 90,
        details: [
          '❌ Platform stats (312 files, etc.) - static info, not actionable',
          '❌ Entity lifecycles - already in each entity\'s coverage report',
          '❌ Phase progress - duplicated in SystemProgressTracker',
          '❌ Just aggregates data from other reports - no unique insights'
        ]
      }
    },
    {
      name: 'ValidationMasterReport',
      file: 'pages/ValidationMasterReport.js',
      exists: false,
      lines: 0,
      purpose: 'Unknown - file not found',
      content: {
        primary: ['File does not exist in codebase'],
        unique: []
      },
      redundancy: 'N/A - Does not exist',
      recommendation: {
        action: '🗑️ REMOVE FROM MENU',
        reason: 'File does not exist - was never created or already deleted',
        priority: 'Required'
      },
      dataOverlap: {
        with: [],
        percentage: 0
      }
    },
    {
      name: 'ValidationReport',
      file: 'pages/ValidationReport.js',
      exists: false,
      lines: 0,
      purpose: 'Unknown - file not found',
      content: {
        primary: ['File does not exist in codebase'],
        unique: []
      },
      redundancy: 'N/A - Does not exist',
      recommendation: {
        action: '🗑️ REMOVE FROM MENU',
        reason: 'File does not exist - was never created or already deleted',
        priority: 'Required'
      },
      dataOverlap: {
        with: [],
        percentage: 0
      }
    },
    {
      name: 'SystemProgressTracker',
      file: 'pages/SystemProgressTracker.js',
      exists: true,
      lines: 931,
      purpose: 'Track implementation progress across development phases',
      content: {
        primary: [
          'Completed systems (8 phases: R&D, Core Pipeline, Portals, etc.)',
          'Remaining infrastructure gaps (12 items)',
          'Timeline of completed phases',
          'Metrics: 120 gaps completed, 0 remaining'
        ],
        unique: []
      },
      redundancy: 'HIGH - 85% redundant',
      recommendation: {
        action: '🗑️ DELETE',
        reason: 'All progress data available in individual coverage reports',
        priority: 'Recommended'
      },
      dataOverlap: {
        with: [
          'RDCoverageReport (R&D system completion)',
          'ProgramsCoverageReport (Programs completion)',
          'SolutionsCoverageReport (Solutions completion)',
          'All module coverage reports (phase-specific progress)',
          'ComprehensiveReportAudit (shows all report statuses)'
        ],
        percentage: 85,
        details: [
          '❌ Completed systems - each coverage report shows its own completion',
          '❌ Gap counts - duplicated in each module\'s coverage report',
          '❌ Phase timeline - historical data, no longer actively changing',
          '❌ Metrics - calculated from individual reports, not unique source',
          '⚠️ Only unique: Aggregated cross-module timeline view (minor value)'
        ]
      }
    }
  ];

  const summary = {
    totalReports: 5,
    existing: 3,
    nonExisting: 2,
    keepRecommended: 1,
    deleteRecommended: 2,
    removeFromMenu: 2,
    redundancyLevel: '60%',
    recommendation: 'Keep ComprehensiveReportAudit as central hub, delete 2 redundant aggregators, remove 2 non-existent from menu'
  };

  const redundancyMatrix = [
    {
      report: 'ComprehensiveReportAudit',
      overlaps: [],
      uniqueValue: 'Central index of all reports',
      verdict: 'KEEP'
    },
    {
      report: 'ValidationDashboard',
      overlaps: ['ComprehensiveReportAudit', 'All coverage reports', 'SystemProgressTracker'],
      uniqueValue: 'None - pure aggregation',
      verdict: 'DELETE'
    },
    {
      report: 'ValidationMasterReport',
      overlaps: ['Does not exist'],
      uniqueValue: 'N/A',
      verdict: 'REMOVE FROM MENU'
    },
    {
      report: 'ValidationReport',
      overlaps: ['Does not exist'],
      uniqueValue: 'N/A',
      verdict: 'REMOVE FROM MENU'
    },
    {
      report: 'SystemProgressTracker',
      overlaps: ['All coverage reports', 'ComprehensiveReportAudit'],
      uniqueValue: 'Historical timeline (minimal)',
      verdict: 'DELETE'
    }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
          {t({ en: '🔍 Validation Reports Redundancy Analysis', ar: '🔍 تحليل تكرار تقارير التحقق' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Deep dive into 5 validation reports: existence check, content analysis, redundancy assessment', ar: 'فحص عميق لـ 5 تقارير التحقق' })}
        </p>
      </div>

      {/* Executive Summary */}
      <Card className="border-4 border-orange-400 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-orange-900">
                {summary.redundancyLevel} Redundancy Detected
              </h2>
              <p className="text-sm text-slate-700">
                {summary.deleteRecommended} reports to delete • {summary.removeFromMenu} to remove from menu • {summary.keepRecommended} to keep
              </p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center p-3 bg-white rounded-lg border-2 border-slate-300">
              <p className="text-3xl font-bold text-slate-900">{summary.totalReports}</p>
              <p className="text-xs text-slate-600">Reports Analyzed</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border-2 border-green-300">
              <p className="text-3xl font-bold text-green-600">{summary.existing}</p>
              <p className="text-xs text-slate-600">Exist</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border-2 border-red-300">
              <p className="text-3xl font-bold text-red-600">{summary.nonExisting}</p>
              <p className="text-xs text-slate-600">Don't Exist</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border-2 border-green-300">
              <p className="text-3xl font-bold text-green-600">{summary.keepRecommended}</p>
              <p className="text-xs text-slate-600">Keep</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border-2 border-red-300">
              <p className="text-3xl font-bold text-red-600">{summary.deleteRecommended + summary.removeFromMenu}</p>
              <p className="text-xs text-slate-600">Remove</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">
          {t({ en: 'Report-by-Report Analysis', ar: 'تحليل تقرير بتقرير' })}
        </h2>
        
        {reportAnalysis.map((report, idx) => (
          <Card key={idx} className={`border-2 ${
            report.recommendation.action.includes('KEEP') ? 'border-green-300 bg-green-50' :
            report.recommendation.action.includes('DELETE') ? 'border-red-300 bg-red-50' :
            'border-orange-300 bg-orange-50'
          }`}>
            <CardHeader>
              <button
                onClick={() => toggleReport(report.name)}
                className="w-full"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                      report.exists ? 'bg-blue-100' : 'bg-red-100'
                    }`}>
                      {report.exists ? (
                        <FileText className="h-6 w-6 text-blue-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    <div className="text-left">
                      <CardTitle className="flex items-center gap-2">
                        {report.name}
                        <Badge className={
                          report.exists ? 'bg-blue-600' : 'bg-red-600'
                        }>
                          {report.exists ? '✅ EXISTS' : '❌ NOT FOUND'}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-slate-600">{report.purpose}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={
                      report.recommendation.action.includes('KEEP') ? 'bg-green-600' :
                      report.recommendation.action.includes('DELETE') ? 'bg-red-600' :
                      'bg-orange-600'
                    }>
                      {report.recommendation.action}
                    </Badge>
                    {expandedReports[report.name] ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </div>
                </div>
              </button>
            </CardHeader>

            {expandedReports[report.name] && (
              <CardContent className="space-y-4">
                {report.exists && (
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-sm text-slate-600 mb-1">
                      <strong>File:</strong> <code className="text-xs bg-slate-100 px-2 py-1 rounded">{report.file}</code>
                    </p>
                    <p className="text-sm text-slate-600">
                      <strong>Size:</strong> {report.lines} lines
                    </p>
                  </div>
                )}

                <div>
                  <p className="font-bold text-slate-900 mb-2">Primary Content:</p>
                  <div className="space-y-1">
                    {report.content.primary.map((item, i) => (
                      <p key={i} className="text-sm text-slate-700">• {item}</p>
                    ))}
                  </div>
                </div>

                {report.content.unique.length > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg border-2 border-green-300">
                    <p className="font-bold text-green-900 mb-2">Unique Value:</p>
                    <div className="space-y-1">
                      {report.content.unique.map((item, i) => (
                        <p key={i} className="text-sm text-green-700">{item}</p>
                      ))}
                    </div>
                  </div>
                )}

                {report.redundancy !== 'NONE - Unique purpose' && (
                  <div className={`p-4 rounded-lg border-2 ${
                    report.redundancy.includes('HIGH') ? 'bg-red-50 border-red-300' :
                    'bg-orange-50 border-orange-300'
                  }`}>
                    <p className="font-bold text-red-900 mb-2">Redundancy Level: {report.redundancy}</p>
                    {report.dataOverlap.details && (
                      <div className="space-y-1">
                        {report.dataOverlap.details.map((detail, i) => (
                          <p key={i} className="text-sm text-red-700">{detail}</p>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-slate-600 mt-2">
                      Overlaps with: {report.dataOverlap.with.join(', ')}
                    </p>
                  </div>
                )}

                <div className={`p-4 rounded-lg border-2 ${
                  report.recommendation.action.includes('KEEP') ? 'bg-green-100 border-green-400' :
                  'bg-red-100 border-red-400'
                }`}>
                  <p className={`font-bold mb-2 ${
                    report.recommendation.action.includes('KEEP') ? 'text-green-900' : 'text-red-900'
                  }`}>
                    Recommendation: {report.recommendation.action}
                  </p>
                  <p className="text-sm text-slate-700">{report.recommendation.reason}</p>
                  <Badge className="mt-2">{report.recommendation.priority}</Badge>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Redundancy Matrix */}
      <Card className="border-2 border-purple-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-600" />
            Data Overlap Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th className="text-left p-2">Report</th>
                  <th className="text-left p-2">Overlaps With</th>
                  <th className="text-left p-2">Unique Value</th>
                  <th className="text-center p-2">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {redundancyMatrix.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="p-2 font-medium">{row.report}</td>
                    <td className="p-2 text-xs">
                      {row.overlaps.map((overlap, i) => (
                        <Badge key={i} variant="outline" className="mr-1 mb-1 text-xs">
                          {overlap}
                        </Badge>
                      ))}
                    </td>
                    <td className="p-2 text-xs text-slate-600">{row.uniqueValue}</td>
                    <td className="p-2 text-center">
                      <Badge className={
                        row.verdict === 'KEEP' ? 'bg-green-600' :
                        row.verdict === 'DELETE' ? 'bg-red-600' :
                        'bg-orange-600'
                      }>
                        {row.verdict}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Final Recommendation */}
      <Card className="border-4 border-blue-400 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 text-2xl">
            <Target className="h-8 w-8" />
            Final Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-100 rounded-lg border-2 border-green-400">
              <p className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                ✅ KEEP (1 report)
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-white rounded border-2 border-green-300">
                  <p className="font-bold text-slate-900">ComprehensiveReportAudit</p>
                  <p className="text-xs text-green-700 mt-1">
                    Unique purpose: Central index/hub for all 26 coverage reports
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-red-100 rounded-lg border-2 border-red-400">
              <p className="font-bold text-red-900 mb-3 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                🗑️ DELETE (4 reports)
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-white rounded border-2 border-red-300">
                  <p className="font-bold text-slate-900">ValidationDashboard</p>
                  <p className="text-xs text-red-700 mt-1">90% redundant - delete file + remove from menu</p>
                </div>
                <div className="p-3 bg-white rounded border-2 border-orange-300">
                  <p className="font-bold text-slate-900">ValidationMasterReport</p>
                  <p className="text-xs text-orange-700 mt-1">File not found - remove from menu</p>
                </div>
                <div className="p-3 bg-white rounded border-2 border-orange-300">
                  <p className="font-bold text-slate-900">ValidationReport</p>
                  <p className="text-xs text-orange-700 mt-1">File not found - remove from menu</p>
                </div>
                <div className="p-3 bg-white rounded border-2 border-red-300">
                  <p className="font-bold text-slate-900">SystemProgressTracker</p>
                  <p className="text-xs text-red-700 mt-1">85% redundant - delete file + remove from menu</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl">
            <div className="flex items-center gap-4">
              <Target className="h-12 w-12" />
              <div>
                <p className="font-bold text-2xl mb-2">
                  {t({ en: 'Recommended Action Plan', ar: 'خطة العمل الموصى بها' })}
                </p>
                <ol className="text-sm space-y-1">
                  <li>1. Delete ValidationDashboard.js (443 lines of redundant aggregation)</li>
                  <li>2. Delete SystemProgressTracker.js (931 lines of duplicate progress data)</li>
                  <li>3. Remove ValidationMasterReport from menu (file doesn't exist)</li>
                  <li>4. Remove ValidationReport from menu (file doesn't exist)</li>
                  <li>5. Keep ComprehensiveReportAudit as central hub for all coverage reports</li>
                </ol>
                <p className="text-xs mt-3 opacity-90">
                  Result: Cleaner codebase, single source of truth (individual coverage reports), central index maintained
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Where Data Lives Instead */}
      <Card className="border-2 border-indigo-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-indigo-600" />
            Alternative Data Sources (Keep These)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-300">
              <p className="font-bold text-indigo-900 mb-2">Instead of ValidationDashboard:</p>
              <ul className="text-sm text-indigo-800 space-y-1">
                <li>• Platform stats → ComprehensiveReportAudit</li>
                <li>• Entity lifecycles → Individual coverage reports (e.g., ChallengesCoverageReport)</li>
                <li>• Phase progress → Each module's coverage report tracks its own progress</li>
                <li>• Workflow status → WorkflowApprovalSystemCoverage</li>
              </ul>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-300">
              <p className="font-bold text-indigo-900 mb-2">Instead of SystemProgressTracker:</p>
              <ul className="text-sm text-indigo-800 space-y-1">
                <li>• System completion → Individual coverage reports (19 reports at 100%)</li>
                <li>• Gap tracking → Each coverage report's "Gaps" section</li>
                <li>• Timeline → ComprehensiveReportAudit shows all report statuses</li>
                <li>• Metrics → Aggregated from coverage reports on demand</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ReportRedundancyAnalysis, { requireAdmin: true });
