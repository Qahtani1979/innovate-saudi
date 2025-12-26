import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Clock, AlertTriangle, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { useEscalateChallenge } from '@/hooks/useChallengeMutations';

export default function SLAMonitor() {
  const { language, t } = useLanguage();
  const [escalatingId, setEscalatingId] = React.useState(null);

  // Use standardized hook with high limit to mimic original behavior (no pagination)
  const { data: result = [], isLoading } = useChallengesWithVisibility({
    limit: 1000,
    includeDeleted: false
  });

  // Handle potential union return type (though limit implies array)
  const challenges = Array.isArray(result) ? result : result.data || [];

  const escalateMutation = useEscalateChallenge();

  const calculateSLA = (challenge) => {
    const slaThresholds = {
      draft: 14,
      submitted: 7,
      under_review: 7,
      approved: 30,
      in_treatment: 90
    };

    const updatedTime = new Date(challenge.updated_date).getTime();
    const daysInStage = Math.floor((new Date().getTime() - updatedTime) / (1000 * 60 * 60 * 24));
    const threshold = slaThresholds[challenge.status] || 30;
    const breached = daysInStage > threshold;
    const daysOverdue = breached ? daysInStage - threshold : 0;

    return { daysInStage, threshold, breached, daysOverdue };
  };

  const slaBreaches = challenges
    .map(c => ({ ...c, sla: calculateSLA(c) }))
    .filter(c => c.sla.breached)
    .sort((a, b) => b.sla.daysOverdue - a.sla.daysOverdue);

  const escalationRequired = slaBreaches.filter(c => c.sla.daysOverdue > 7);

  const handleEscalate = async (challenge) => {
    setEscalatingId(challenge.id);
    try {
      await escalateMutation.mutateAsync(challenge);
    } catch (error) {
      console.error('Escalation failed:', error);
    } finally {
      setEscalatingId(null);
    }
  };

  if (isLoading) return <div className="p-6 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  return (
    <Card className="border-2 border-orange-300">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-600" />
          {t({ en: 'SLA Monitor & Auto-Escalation', ar: 'مراقب اتفاقية مستوى الخدمة والتصعيد التلقائي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-center border border-green-200">
            <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-600">
              {challenges.length - slaBreaches.length}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'On Track', ar: 'على المسار' })}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg text-center border border-yellow-200">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-yellow-600">{slaBreaches.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'SLA Breach', ar: 'خرق SLA' })}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-center border border-red-200">
            <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-600">{escalationRequired.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Escalate Now', ar: 'صعّد الآن' })}</p>
          </div>
        </div>

        {escalationRequired.length > 0 && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t({ en: 'Escalation Required', ar: 'التصعيد مطلوب' })}
            </h4>
            <div className="space-y-2">
              {escalationRequired.slice(0, 5).map((challenge) => (
                <div key={challenge.id} className="p-3 bg-white rounded border border-red-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)} className="font-medium text-sm text-slate-900 hover:text-blue-600">
                        {challenge.title_en || challenge.title_ar}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{challenge.status}</Badge>
                        <span className="text-xs text-red-600 font-medium">
                          {challenge.sla.daysOverdue} days overdue (SLA: {challenge.sla.threshold}d)
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleEscalate(challenge)}
                      disabled={escalatingId === challenge.id || escalateMutation.isPending}
                    >
                      {escalatingId === challenge.id ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <ArrowRight className="h-3 w-3 mr-1" />
                      )}
                      {t({ en: 'Escalate', ar: 'صعّد' })}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {slaBreaches.length === 0 && (
          <div className="text-center py-6">
            <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'All challenges within SLA targets', ar: 'جميع التحديات ضمن أهداف SLA' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
