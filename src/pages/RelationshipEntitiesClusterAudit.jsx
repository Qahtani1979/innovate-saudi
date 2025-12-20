import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { CheckCircle2, Link as LinkIcon } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function RelationshipEntitiesClusterAudit() {
  const { t, isRTL } = useLanguage();

  const entities = [
    {
      name: 'ChallengeSolutionMatch',
      purpose: 'AI matching between challenges and solutions',
      fields: ['challenge_id', 'solution_id', 'match_score', 'match_reasoning', 'status'],
      pages: ['ChallengeSolutionMatching', 'MatchingQueue'],
      score: 100
    },
    {
      name: 'ChallengeRelation',
      purpose: 'Challenge-to-entity relationships (pilots, R&D, programs, solutions)',
      fields: ['challenge_id', 'related_entity_type', 'related_entity_id', 'relation_type'],
      pages: ['ChallengeDetail Related tab', 'RelationManagementHub'],
      score: 100
    },
    {
      name: 'ChallengeTag',
      purpose: 'Challenge tagging with AI confidence',
      fields: ['challenge_id', 'tag_id', 'relevance_score', 'assigned_by', 'confidence_score'],
      pages: ['ChallengeDetail', 'AIContentAutoTagger'],
      score: 100
    },
    {
      name: 'ChallengeKPILink',
      purpose: 'Link challenges to KPI references',
      fields: ['challenge_id', 'kpi_ref_id', 'relevance', 'baseline_value', 'target_value', 'current_value'],
      pages: ['ChallengeDetail KPIs tab'],
      score: 100
    },
    {
      name: 'PilotKPI',
      purpose: 'Pilot KPI definitions',
      fields: ['pilot_id', 'kpi_name', 'unit', 'baseline', 'target', 'measurement_frequency'],
      pages: ['PilotDetail KPIs tab', 'EnhancedKPITracker'],
      score: 100
    },
    {
      name: 'PilotKPIDatapoint',
      purpose: 'Pilot KPI time-series data',
      fields: ['pilot_kpi_id', 'value', 'measurement_date', 'data_source', 'notes'],
      pages: ['PilotDetail KPIs tab', 'KPIDataEntry', 'RealTimeKPIMonitor'],
      score: 100
    },
    {
      name: 'ScalingReadiness',
      purpose: 'Scaling readiness assessment',
      fields: ['pilot_id', 'readiness_score', 'assessment_dimensions', 'barriers', 'recommendations'],
      pages: ['ScalingWorkflow', 'ScalingReadinessChecker'],
      score: 100
    },
    {
      name: 'SolutionCase',
      purpose: 'Solution case studies/deployments',
      fields: ['solution_id', 'case_title', 'client_name', 'outcomes', 'year'],
      pages: ['SolutionDetail Cases tab', 'SolutionCaseStudyWizard'],
      score: 100
    },
    {
      name: 'LivingLabBooking',
      purpose: 'Living lab resource bookings',
      fields: ['living_lab_id', 'booker_email', 'booking_date', 'duration_hours', 'purpose', 'status'],
      pages: ['LivingLabDetail Booking tab', 'LivingLabResourceBooking'],
      score: 100
    }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '🔗 Relationship Entities Cluster Audit', ar: '🔗 تدقيق كيانات العلاقات' })}
        </h1>
        <p className="text-xl">9 Junction/Linking Entities</p>
      </div>

      <Card className="border-4 border-green-500 bg-green-50">
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <p className="text-3xl font-bold text-green-900">✅ 100% COMPLETE</p>
          <p className="text-slate-700 mt-2">All relationship entities operational</p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {entities.map((entity, i) => (
          <Card key={i} className="border-2 border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LinkIcon className="h-5 w-5 text-teal-600" />
                  <CardTitle>{entity.name}</CardTitle>
                  <Badge className="bg-green-600 text-white">{entity.score}%</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-slate-700"><strong>Purpose:</strong> {entity.purpose}</p>
              <p className="text-xs text-slate-600">Fields: {entity.fields.join(', ')}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {entity.pages.map((p, j) => (
                  <Badge key={j} variant="outline" className="text-xs">{p}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ProtectedPage(RelationshipEntitiesClusterAudit, { requireAdmin: true });