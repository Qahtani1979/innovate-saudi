import React from 'react';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Target, Link2, Database, FileText, Code, Layers, Network } from 'lucide-react';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

// Cross-reference data for Challenge system
const implementationBatches = [
  {
    batch: 'Batch 1 - Core CRUD',
    items: ['Challenges.jsx', 'ChallengeCreate.jsx', 'ChallengeDetail.jsx', 'ChallengeEdit.jsx', 'ChallengeImport.jsx'],
    status: 'complete',
    coverage: 100
  },
  {
    batch: 'Batch 2 - Workflow & Review',
    items: ['ChallengeReviewQueue.jsx', 'ChallengesHub.jsx', 'ChallengeProposalReview.jsx', 'ChallengeProposalDetail.jsx'],
    status: 'complete',
    coverage: 100
  },
  {
    batch: 'Batch 3 - Matching & R&D',
    items: ['ChallengeSolutionMatching.jsx', 'ChallengeRDCallMatcher.jsx', 'SolutionChallengeMatcher.jsx'],
    status: 'complete',
    coverage: 100
  },
  {
    batch: 'Batch 4 - Analytics & Tracking',
    items: ['ChallengeAnalyticsDashboard.jsx', 'ChallengeResolutionTracker.jsx', 'MyChallengeTracker.jsx', 'MyChallenges.jsx'],
    status: 'complete',
    coverage: 100
  }
];

const databaseAssets = [
  { name: 'challenges', type: 'Table', rls: true, indexes: 8, policies: 5 },
  { name: 'challenge_activities', type: 'Table', rls: true, indexes: 2, policies: 3 },
  { name: 'challenge_attachments', type: 'Table', rls: true, indexes: 2, policies: 4 },
  { name: 'challenge_proposals', type: 'Table', rls: true, indexes: 3, policies: 6 },
  { name: 'challenge_interests', type: 'Table', rls: true, indexes: 2, policies: 2 },
  { name: 'challenge_solution_matches', type: 'Table', rls: true, indexes: 3, policies: 3 },
  { name: 'strategic_plan_challenge_links', type: 'Table', rls: true, indexes: 2, policies: 4 },
];

const hooksAndServices = [
  { name: 'useChallengesWithVisibility', type: 'Hook', location: 'src/hooks', purpose: 'Visibility-aware challenge fetching' },
  { name: 'useAuditLog.logChallengeActivity', type: 'Hook', location: 'src/hooks', purpose: 'Challenge audit logging' },
  { name: 'usePermissions', type: 'Hook', location: 'src/components/permissions', purpose: 'RBAC permission checks' },
  { name: 'useVisibilitySystem', type: 'Hook', location: 'src/hooks/visibility', purpose: 'National/Geographic visibility' },
];

const componentAssets = [
  'AIChallengeIntakeWizard', 'BatchChallengeImport', 'ChallengeActivityLog', 'ChallengeClustering',
  'ChallengeComparisonTool', 'ChallengeFollowButton', 'ChallengeHealthScore', 'ChallengeImpactForecaster',
  'ChallengeMergeWorkflow', 'ChallengeRFPGenerator', 'ChallengeTemplateLibrary', 'ChallengeTimelineView',
  'ChallengeToProgramWorkflow', 'ChallengeToRDWizard', 'ChallengeTrackAssignmentDecision', 'ChallengeVoting',
  'InnovationFramingGenerator', 'ProposalSubmissionForm', 'PublishingWorkflow', 'SLAMonitor',
  'TreatmentPlanCoPilot'
];

function ChallengeSystemCrossReference() {
  const { t, isRTL } = useLanguage();

  const totalPages = implementationBatches.reduce((sum, b) => sum + b.items.length, 0);
  const completePages = implementationBatches.filter(b => b.status === 'complete').reduce((sum, b) => sum + b.items.length, 0);

  return (
    <PageLayout>
      <PageHeader
        icon={Network}
        title={{ en: 'Challenge System Cross-Reference', ar: 'المرجع المتبادل لنظام التحديات' }}
        description={{ en: 'Complete cross-reference of all Challenge system assets', ar: 'المرجع المتبادل الكامل لجميع أصول نظام التحديات' }}
      />

      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-900">{totalPages}</p>
              <p className="text-sm text-blue-600">{t({ en: 'Pages', ar: 'صفحات' })}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-purple-900">{databaseAssets.length}</p>
              <p className="text-sm text-purple-600">{t({ en: 'DB Tables', ar: 'جداول قاعدة البيانات' })}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-900">{componentAssets.length}</p>
              <p className="text-sm text-green-600">{t({ en: 'Components', ar: 'مكونات' })}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-900">{hooksAndServices.length}</p>
              <p className="text-sm text-amber-600">{t({ en: 'Hooks', ar: 'خطافات' })}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-cyan-900">100%</p>
              <p className="text-sm text-cyan-600">{t({ en: 'Coverage', ar: 'التغطية' })}</p>
            </CardContent>
          </Card>
        </div>

        {/* Implementation Batches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              {t({ en: 'Implementation Batches', ar: 'دفعات التنفيذ' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {implementationBatches.map((batch, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="font-medium">{batch.batch}</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">{batch.coverage}%</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {batch.items.map((item, i) => (
                      <Badge key={i} variant="outline">{item}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Database Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              {t({ en: 'Database Assets', ar: 'أصول قاعدة البيانات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">{t({ en: 'Table', ar: 'الجدول' })}</th>
                    <th className="text-center p-3">{t({ en: 'RLS', ar: 'RLS' })}</th>
                    <th className="text-center p-3">{t({ en: 'Indexes', ar: 'الفهارس' })}</th>
                    <th className="text-center p-3">{t({ en: 'Policies', ar: 'السياسات' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {databaseAssets.map((table) => (
                    <tr key={table.name} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-mono text-sm">{table.name}</td>
                      <td className="p-3 text-center">
                        {table.rls ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline">{table.indexes}</Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline">{table.policies}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Hooks & Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              {t({ en: 'Hooks & Services', ar: 'الخطافات والخدمات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hooksAndServices.map((hook, idx) => (
                <div key={idx} className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm font-medium">{hook.name}</p>
                    <p className="text-xs text-muted-foreground">{hook.purpose}</p>
                  </div>
                  <Badge variant="outline">{hook.location}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Components */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t({ en: 'Challenge Components', ar: 'مكونات التحديات' })}
            </CardTitle>
            <CardDescription>{t({ en: 'Located in src/components/challenges/', ar: 'موجودة في src/components/challenges/' })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {componentAssets.map((component, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">{component}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              {t({ en: 'Quick Navigation', ar: 'التنقل السريع' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link to={createPageUrl('ChallengesHub')}>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  ChallengesHub
                </Button>
              </Link>
              <Link to={createPageUrl('Challenges')}>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Challenges List
                </Button>
              </Link>
              <Link to={createPageUrl('ChallengeCreate')}>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Create Challenge
                </Button>
              </Link>
              <Link to={createPageUrl('ChallengeAnalyticsDashboard')}>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(ChallengeSystemCrossReference, { requireAdmin: true });
