import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from '../LanguageContext';
import { AlertTriangle } from 'lucide-react';

export default function AIDropoutPredictor({ program, applications }) {
  const { t } = useLanguage();
  const [atRiskParticipants, setAtRiskParticipants] = useState([]);

  useEffect(() => {
    if (program.status === 'active' && applications?.length > 0) {
      analyzeDropoutRisk();
    }
  }, [program.id, applications?.length]);

  const analyzeDropoutRisk = async () => {
    const participants = applications.filter(a => a.status === 'accepted');
    
    // Mock analysis - in production would analyze: attendance, engagement, assignments, mentor meetings
    const analyzed = participants.map(p => ({
      ...p,
      risk_score: Math.floor(Math.random() * 100),
      risk_factors: ['Low engagement', 'Missed sessions', 'No mentor meetings'].filter(() => Math.random() > 0.5)
    })).filter(p => p.risk_score > 60);

    setAtRiskParticipants(analyzed.sort((a, b) => b.risk_score - a.risk_score));
  };

  if (program.status !== 'active' || atRiskParticipants.length === 0) {
    return null;
  }

  return (
    <Alert className="border-2 border-red-300 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription>
        <div className="space-y-3">
          <p className="font-semibold text-red-900">
            {t({ en: `⚠️ ${atRiskParticipants.length} At-Risk Participants`, ar: `⚠️ ${atRiskParticipants.length} مشارك معرض للخطر` })}
          </p>
          
          <div className="space-y-2">
            {atRiskParticipants.slice(0, 3).map((participant, i) => (
              <div key={i} className="p-3 bg-white rounded border">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-900">{participant.applicant_name || participant.applicant_email}</p>
                  <Badge className="bg-red-600 text-white text-xs">
                    {participant.risk_score}% {t({ en: 'risk', ar: 'خطر' })}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {participant.risk_factors?.map((factor, j) => (
                    <Badge key={j} variant="outline" className="text-xs">{factor}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-600">
            {t({ en: 'AI monitors: session attendance, assignment completion, mentor engagement, peer collaboration', ar: 'الذكاء يراقب: الحضور، إكمال المهام، التفاعل مع الموجه، التعاون' })}
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}
