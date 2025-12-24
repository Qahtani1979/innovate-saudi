import { useState } from 'react';
import { useEvaluationInvalidator } from '@/hooks/useEvaluations';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Clock, CheckCircle2, Search, AlertCircle, FileText
} from 'lucide-react';
import ChallengeReviewWorkflow from '../components/ChallengeReviewWorkflow';
import UnifiedEvaluationForm from '../components/evaluation/UnifiedEvaluationForm';
import EvaluationConsensusPanel from '../components/evaluation/EvaluationConsensusPanel';
import BlindReviewToggle from '../components/challenges/BlindReviewToggle';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { useChallengeMutations } from '@/hooks/useChallengeMutations';

function ChallengeReviewQueue() {
  const { language, isRTL, t } = useLanguage();
  const { invalidateEvaluations } = useEvaluationInvalidator();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [blindMode, setBlindMode] = useState(false);

  const { checkConsensus } = useChallengeMutations();

  const { data: challenges = [], isLoading } = useChallengesWithVisibility({
    status: ['submitted', 'under_review'],
    limit: 1000
  });

  const filteredChallenges = challenges.filter(c =>
    c.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEvaluate = (challenge) => {
    setSelectedChallenge(challenge);
    setShowEvaluationForm(true);
  };

  const handleEvaluationComplete = async () => {
    setShowEvaluationForm(false);

    if (selectedChallenge) {
      await checkConsensus.mutateAsync(selectedChallenge.id);
    }

    setSelectedChallenge(null);
    invalidateEvaluations();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Evaluation Form Modal */}
      {showEvaluationForm && selectedChallenge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <UnifiedEvaluationForm
              entityType="challenge"
              entityId={selectedChallenge.id}
              onComplete={handleEvaluationComplete}
            />
          </div>
        </div>
      )}

      {/* Review Workflow Modal */}
      {selectedChallenge && !showEvaluationForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <ChallengeReviewWorkflow
              challenge={selectedChallenge}
              onClose={() => setSelectedChallenge(null)}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-600 via-orange-600 to-red-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: 'Challenge Review Queue', ar: 'قائمة مراجعة التحديات' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Review and validate submitted challenges', ar: 'مراجعة والتحقق من التحديات المقدمة' })}
        </p>
      </div>

      <BlindReviewToggle blindMode={blindMode} onToggle={() => setBlindMode(!blindMode)} />

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <p className="text-4xl font-bold text-blue-600">
                {challenges.filter(c => c.status === 'submitted').length}
              </p>
              <p className="text-sm text-slate-600 mt-1">{t({ en: 'Pending Review', ar: 'قيد الانتظار' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
              <p className="text-4xl font-bold text-yellow-600">
                {challenges.filter(c => c.status === 'under_review').length}
              </p>
              <p className="text-sm text-slate-600 mt-1">{t({ en: 'Under Review', ar: 'قيد المراجعة' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-4xl font-bold text-green-600">{challenges.length}</p>
              <p className="text-sm text-slate-600 mt-1">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t({ en: 'Search by title or code...', ar: 'البحث بالعنوان أو الرمز...' })}
              className={isRTL ? 'pr-10' : 'pl-10'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Challenges List */}
      <div className="space-y-4">
        {filteredChallenges.map((challenge) => (
          <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="font-mono">{challenge.code}</Badge>
                    <Badge className={
                      challenge.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                    }>
                      {challenge.status}
                    </Badge>
                    <Badge className="bg-red-100 text-red-700">{challenge.priority}</Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{challenge.title_en}</h3>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {challenge.description_en?.substring(0, 150)}...
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{challenge.sector?.replace(/_/g, ' ')}</span>
                    <span>•</span>
                    {!blindMode && <span>{challenge.municipality_id?.substring(0, 20)}</span>}
                    {!blindMode && challenge.submission_date && (
                      <>
                        <span>•</span>
                        <span>{t({ en: 'Submitted:', ar: 'تم التقديم:' })} {new Date(challenge.submission_date).toLocaleDateString()}</span>
                      </>
                    )}
                    {blindMode && <Badge className="bg-purple-100 text-purple-700">Blind Mode Active</Badge>}
                  </div>
                </div>
              </div>

              <EvaluationConsensusPanel
                entityType="challenge"
                entityId={challenge.id}
              />

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => handleEvaluate(challenge)}
                  size="sm"
                  className="bg-blue-600"
                >
                  <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t({ en: 'Evaluate', ar: 'تقييم' })}
                </Button>
                <Button
                  onClick={() => setSelectedChallenge(challenge)}
                  size="sm"
                  variant="outline"
                >
                  {t({ en: 'Admin Review', ar: 'مراجعة إدارية' })}
                </Button>
                <Link to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}>
                  <Button variant="outline" size="sm">
                    <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t({ en: 'Details', ar: 'التفاصيل' })}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredChallenges.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <CheckCircle2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {t({ en: 'No challenges pending review', ar: 'لا توجد تحديات قيد المراجعة' })}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ProtectedPage(ChallengeReviewQueue, { requiredPermissions: ['challenge_approve'] });