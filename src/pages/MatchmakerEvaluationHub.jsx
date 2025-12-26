import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Users, CheckCircle2, Target } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import UnifiedEvaluationForm from '../components/evaluation/UnifiedEvaluationForm';
import EvaluationConsensusPanel from '../components/evaluation/EvaluationConsensusPanel';
import { useMatchmakerApplications } from '@/hooks/useMatchmakerApplications';
import { useEvaluationCompletion } from '@/hooks/useEvaluationCompletion';

function MatchmakerEvaluationHub() {
  const { language, isRTL, t } = useLanguage();
  const [selectedApp, setSelectedApp] = useState(null);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);

  // Use existing hooks
  const { data: applications = [] } = useMatchmakerApplications();
  const { completeEvaluation } = useEvaluationCompletion();

  const screening = applications.filter(a => a.stage === 'screening');
  const evaluating = applications.filter(a => a.stage === 'evaluating');

  const handleEvaluate = (app) => {
    setSelectedApp(app);
    setShowEvaluationForm(true);
  };

  const handleEvaluationComplete = async () => {
    setShowEvaluationForm(false);

    if (selectedApp) {
      completeEvaluation.mutate({
        entity_type: 'matchmaker_application',
        entity_id: selectedApp.id
      });
    }

    setSelectedApp(null);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Evaluation Form Modal */}
      {showEvaluationForm && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <UnifiedEvaluationForm
              entityType="matchmaker_application"
              entityId={selectedApp.id}
              onComplete={handleEvaluationComplete}
            />
          </div>
        </div>
      )}

      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Matchmaker Evaluation Workspace', ar: 'مساحة تقييم التوفيق' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Screen and evaluate innovation providers', ar: 'فحص وتقييم موفري الابتكار' })}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{screening.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'In Screening', ar: 'في الفحص' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{evaluating.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'In Evaluation', ar: 'في التقييم' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {applications.filter(a => a.stage === 'matched' || a.stage === 'engaged').length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Approved', ar: 'معتمد' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Applications in Screening */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Applications to Review', ar: 'الطلبات للمراجعة' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...screening, ...evaluating].map(app => (
            <Card key={app.id} className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{app.classification}</Badge>
                      <Badge variant="outline">{app.stage}</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900">{app.organization_name_en}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {app.sectors?.slice(0, 3).join(', ')}
                    </p>
                  </div>
                </div>

                <EvaluationConsensusPanel
                  entityType="matchmaker_application"
                  entityId={app.id}
                />

                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="bg-green-600" onClick={() => handleEvaluate(app)}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t({ en: 'Evaluate', ar: 'تقييم' })}
                  </Button>
                  <Link to={createPageUrl(`MatchmakerApplicationDetail?id=${app.id}`)}>
                    <Button size="sm" variant="outline">{t({ en: 'Full Review', ar: 'مراجعة كاملة' })}</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(MatchmakerEvaluationHub, { requiredPermissions: [], requiredRoles: ['Matchmaker Manager', 'Program Evaluator'] });
