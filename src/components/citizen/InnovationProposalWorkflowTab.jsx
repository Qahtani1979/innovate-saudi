import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, Clock, Sparkles, Eye, Users, ArrowRight } from 'lucide-react';

export default function InnovationProposalWorkflowTab({ proposal }) {
  const { language, t } = useLanguage();

  const stages = [
    {
      key: 'screening',
      name: { en: 'AI Pre-Screening', ar: 'الفحص الذكي المسبق' },
      icon: Sparkles,
      status: proposal.ai_pre_screening ? 'completed' : 'pending',
      data: proposal.ai_pre_screening
    },
    {
      key: 'expert_review',
      name: { en: 'Expert Review', ar: 'المراجعة الخبيرة' },
      icon: Eye,
      status: ['under_evaluation', 'approved', 'rejected'].includes(proposal.status) ? 
              (proposal.status === 'under_evaluation' ? 'in_progress' : 'completed') : 'pending',
      data: proposal.evaluation_ids
    },
    {
      key: 'stakeholder_alignment',
      name: { en: 'Stakeholder Alignment', ar: 'توافق الأطراف' },
      icon: Users,
      status: proposal.stakeholder_alignment_gate?.passed ? 'completed' : 
              proposal.stakeholder_alignment_gate?.decision === 'pending' ? 'in_progress' : 'pending',
      data: proposal.stakeholder_alignment_gate
    },
    {
      key: 'conversion',
      name: { en: 'Conversion Decision', ar: 'قرار التحويل' },
      icon: ArrowRight,
      status: proposal.converted_entity_id ? 'completed' : 
              proposal.status === 'approved' ? 'in_progress' : 'pending',
      data: { converted_entity_type: proposal.converted_entity_type, converted_entity_id: proposal.converted_entity_id }
    }
  ];

  const statusColors = {
    completed: 'bg-green-100 text-green-700 border-green-300',
    in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    pending: 'bg-slate-100 text-slate-500 border-slate-300'
  };

  return (
    <div className="space-y-4">
      {stages.map((stage) => {
        const StageIcon = stage.icon;
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
                    <StageIcon className="h-6 w-6" />
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
                        <p>• {t({ en: 'AI:', ar: 'الذكاء:' })} {stage.data.auto_recommendation.replace(/_/g, ' ')}</p>
                      )}
                      {stage.key === 'expert_review' && stage.data && (
                        <p>• {t({ en: 'Evaluations:', ar: 'التقييمات:' })} {Array.isArray(stage.data) ? stage.data.length : 0}</p>
                      )}
                      {stage.key === 'stakeholder_alignment' && stage.data.decision && (
                        <p>• {t({ en: 'Decision:', ar: 'القرار:' })} {stage.data.decision}</p>
                      )}
                      {stage.key === 'conversion' && stage.data.converted_entity_type && (
                        <p>• {t({ en: 'Converted to:', ar: 'تحويل إلى:' })} {stage.data.converted_entity_type}</p>
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