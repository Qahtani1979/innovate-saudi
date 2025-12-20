import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

const SLA_TARGETS = {
  initial_review: 3, // days
  detailed_evaluation: 7, // days
  conversion_decision: 14 // days
};

export default function SLATracker() {
  const { language, isRTL, t } = useLanguage();

  const { data: ideas = [] } = useQuery({
    queryKey: ['ideas-sla'],
    queryFn: () => base44.entities.CitizenIdea.list()
  });

  const calculateDaysOpen = (idea) => {
    const created = new Date(idea.created_date);
    const now = new Date();
    return Math.floor((now - created) / (1000 * 60 * 60 * 24));
  };

  const getStatus = (idea, daysOpen) => {
    if (idea.status === 'approved' || idea.status === 'rejected' || idea.status === 'converted_to_challenge') {
      return 'complete';
    }
    if (daysOpen > SLA_TARGETS.conversion_decision) return 'overdue';
    if (daysOpen > SLA_TARGETS.detailed_evaluation) return 'warning';
    return 'on_track';
  };

  const ideasByStatus = {
    on_track: ideas.filter(i => getStatus(i, calculateDaysOpen(i)) === 'on_track'),
    warning: ideas.filter(i => getStatus(i, calculateDaysOpen(i)) === 'warning'),
    overdue: ideas.filter(i => getStatus(i, calculateDaysOpen(i)) === 'overdue'),
    complete: ideas.filter(i => getStatus(i, calculateDaysOpen(i)) === 'complete')
  };

  const avgResponseTime = ideas.filter(i => i.review_date).reduce((sum, i) => {
    const days = calculateDaysOpen(i);
    return sum + days;
  }, 0) / Math.max(ideas.filter(i => i.review_date).length, 1);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          {t({ en: 'Idea Review SLA Tracker', ar: 'متتبع SLA لمراجعة الأفكار' })}
        </h2>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Monitor response times and compliance', ar: 'مراقبة أوقات الاستجابة والالتزام' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'On Track', ar: 'في الموعد' })}</p>
                <p className="text-3xl font-bold text-green-600">{ideasByStatus.on_track.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Warning', ar: 'تحذير' })}</p>
                <p className="text-3xl font-bold text-yellow-600">{ideasByStatus.warning.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Overdue', ar: 'متأخر' })}</p>
                <p className="text-3xl font-bold text-red-600">{ideasByStatus.overdue.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Avg Response', ar: 'متوسط الرد' })}</p>
                <p className="text-3xl font-bold text-blue-600">{avgResponseTime.toFixed(1)}</p>
                <p className="text-xs text-slate-500">{t({ en: 'days', ar: 'أيام' })}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Ideas */}
      {ideasByStatus.overdue.length > 0 && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              {t({ en: 'Overdue Ideas Requiring Immediate Action', ar: 'الأفكار المتأخرة التي تتطلب إجراءً فورياً' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ideasByStatus.overdue.map((idea) => {
                const daysOpen = calculateDaysOpen(idea);
                return (
                  <div key={idea.id} className="p-3 bg-white border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{idea.title}</p>
                        <p className="text-xs text-slate-600">{idea.category} • {idea.municipality_id}</p>
                      </div>
                      <Badge className="bg-red-600 text-white">
                        {daysOpen} {t({ en: 'days', ar: 'أيام' })}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}