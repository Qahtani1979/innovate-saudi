import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export default function CitizenIdeaWorkflowTab({ idea }) {
  const { language, t } = useLanguage();

  const stages = [
    {
      key: 'screening',
      name: { en: 'AI Screening', ar: 'الفحص الذكي' },
      status: idea.ai_pre_screening ? 'completed' : 'pending',
      data: idea.ai_pre_screening
    },
    {
      key: 'review',
      name: { en: 'Expert Review', ar: 'المراجعة الخبيرة' },
      status: idea.status === 'under_review' ? 'in_progress' : 
              ['approved', 'converted_to_challenge', 'rejected'].includes(idea.status) ? 'completed' : 'pending',
      data: { reviewed_by: idea.reviewed_by, review_date: idea.review_date }
    },
    {
      key: 'decision',
      name: { en: 'Final Decision', ar: 'القرار النهائي' },
      status: ['approved', 'converted_to_challenge', 'rejected'].includes(idea.status) ? 'completed' :
              idea.status === 'under_review' ? 'in_progress' : 'pending',
      data: { status: idea.status, converted_challenge_id: idea.converted_challenge_id }
    }
  ];

  const statusIcons = {
    completed: CheckCircle2,
    in_progress: Clock,
    pending: Circle
  };

  const statusColors = {
    completed: 'bg-green-100 text-green-700 border-green-300',
    in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    pending: 'bg-slate-100 text-slate-500 border-slate-300'
  };

  return (
    <div className="space-y-4">
      {stages.map((stage, idx) => {
        const Icon = statusIcons[stage.status];
        const colorClass = statusColors[stage.status];

        return (
          <Card key={stage.key} className={`border-2 ${colorClass}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full ${colorClass} flex items-center justify-center`}>
                  {stage.status === 'completed' ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : stage.status === 'in_progress' ? (
                    <Clock className="h-6 w-6 animate-pulse" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{t(stage.name)}</h3>
                    <Badge className={colorClass}>
                      {stage.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  {stage.status === 'completed' && stage.data && (
                    <div className="text-xs text-slate-600 space-y-1">
                      {stage.key === 'screening' && stage.data.auto_recommendation && (
                        <p>• {t({ en: 'Recommendation:', ar: 'التوصية:' })} {stage.data.auto_recommendation}</p>
                      )}
                      {stage.key === 'review' && stage.data.reviewed_by && (
                        <p>• {t({ en: 'Reviewed by:', ar: 'راجعه:' })} {stage.data.reviewed_by}</p>
                      )}
                      {stage.key === 'decision' && stage.data.status && (
                        <p>• {t({ en: 'Decision:', ar: 'القرار:' })} {stage.data.status.replace(/_/g, ' ')}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
