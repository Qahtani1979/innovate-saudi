import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from './LanguageContext';
import { Sparkles, CheckCircle2, X, Loader2, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildApplicationScreeningPrompt, APPLICATION_SCREENING_SCHEMA } from '@/lib/ai/prompts/programs/applicationScreening';

import { useProgramApplications } from '@/hooks/useProgramDetails';
import { useProgramMutations } from '@/hooks/useProgramMutations';

export default function ProgramApplicationScreening({ program, onClose }) {
  const { t, isRTL } = useLanguage();
  const [scoredApplications, setScoredApplications] = useState(null);
  const [selectedForAcceptance, setSelectedForAcceptance] = useState([]);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: applications = [] } = useProgramApplications(program?.id);
  const { updateApplicationBatch, isBatchUpdating } = useProgramMutations();

  const handleAIScreening = async () => {
    const prompt = buildApplicationScreeningPrompt(program, applications);

    const result = await invokeAI({
      prompt,
      response_json_schema: APPLICATION_SCREENING_SCHEMA
    });

    if (result.success) {
      // Map back to application IDs
      const mapped = result.data.scored_applications.map(scored => {
        const app = applications.find(a => a.applicant_name === scored.applicant_name);
        return { ...scored, applicationId: app?.id };
      }).filter(s => s.applicationId);

      setScoredApplications(mapped);
      toast.success(t({ en: 'AI screening completed', ar: 'الفرز الذكي مكتمل' }));
    }
  };

  const handleApplyResults = async () => {
    if (!scoredApplications) return;

    const updates = scoredApplications.map(app => ({
      id: app.applicationId,
      data: {
        ai_score: app.total_score,
        ai_scores: app.scores,
        ai_reasoning: app.reasoning,
        ai_recommendation: app.recommendation,
        status: selectedForAcceptance.includes(app.applicationId) ? 'accepted' :
          app.recommendation === 'reject' ? 'rejected' : 'under_review'
      }
    }));

    try {
      await updateApplicationBatch.mutateAsync(updates);
      onClose();
    } catch (error) {
      // toast is handled by hook
    }
  };

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-purple-600" />
          {t({ en: 'AI Application Screening', ar: 'فرز الطلبات بالذكاء الاصطناعي' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm font-medium text-purple-900">{program?.name_en}</p>
          <p className="text-xs text-slate-600 mt-1">
            {applications.length} {t({ en: 'applications to screen', ar: 'طلبات للفرز' })}
          </p>
        </div>

        {!scoredApplications ? (
          <Button
            onClick={handleAIScreening}
            disabled={isLoading || !isAvailable || applications.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'AI analyzing applications...', ar: 'الذكاء يحلل الطلبات...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'Run AI Screening', ar: 'تشغيل الفرز الذكي' })}
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">
                {t({ en: 'Screening Results', ar: 'نتائج الفرز' })}
              </p>
              <Badge className="bg-purple-100 text-purple-700">
                {selectedForAcceptance.length} {t({ en: 'selected', ar: 'محدد' })}
              </Badge>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {scoredApplications
                .sort((a, b) => b.total_score - a.total_score)
                .map((app, i) => (
                  <div key={i} className={`p-4 border rounded-lg ${app.recommendation === 'accept' ? 'border-green-300 bg-green-50' :
                    app.recommendation === 'waitlist' ? 'border-yellow-300 bg-yellow-50' :
                      'border-red-300 bg-red-50'
                    }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={selectedForAcceptance.includes(app.applicationId)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedForAcceptance([...selectedForAcceptance, app.applicationId]);
                            } else {
                              setSelectedForAcceptance(selectedForAcceptance.filter(id => id !== app.applicationId));
                            }
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm text-slate-900">{app.applicant_name}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge className={
                              app.recommendation === 'accept' ? 'bg-green-600 text-white' :
                                app.recommendation === 'waitlist' ? 'bg-yellow-600 text-white' :
                                  'bg-red-600 text-white'
                            }>
                              {app.recommendation}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{app.total_score}</p>
                        <p className="text-xs text-slate-500">Total Score</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-2 mb-2 text-xs">
                      {Object.entries(app.scores).map(([key, val]) => (
                        <div key={key} className="text-center p-2 bg-white rounded">
                          <p className="font-medium">{val}</p>
                          <p className="text-slate-500 capitalize">{key}</p>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-slate-600 italic mt-2">{app.reasoning}</p>
                  </div>
                ))}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleApplyResults}
                disabled={isBatchUpdating}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isBatchUpdating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                {t({ en: 'Apply Screening Results', ar: 'تطبيق نتائج الفرز' })}
              </Button>
              <Button variant="outline" onClick={() => setScoredApplications(null)}>
                {t({ en: 'Reset', ar: 'إعادة' })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
