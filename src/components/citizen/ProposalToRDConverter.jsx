import { useState } from 'react';
import { useInnovationMutations } from '@/hooks/useInnovationMutations';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Microscope, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildProposalToRDPrompt, PROPOSAL_TO_RD_SCHEMA } from '@/lib/ai/prompts/citizen';

export default function ProposalToRDConverter({ proposal, onClose, onSuccess }) {
  const { language, isRTL, t } = useLanguage();
  const { invokeAI, status, isLoading: generating, rateLimitInfo, isAvailable } = useAIWithFallback();
  const [rdData, setRdData] = useState({
    title_en: '',
    title_ar: '',
    abstract_en: '',
    abstract_ar: '',
    methodology_en: '',
    methodology_ar: '',
    expected_outputs: [],
    research_themes: []
  });

  const { createRDProject: createRDMutation } = useInnovationMutations();

  /*
  const createRDMutation = useMutation({
    // ... replaced logic ...
  });
  */

  // Actually, I need to look at the handleSubmit code to see how it calls mutation. 
  // It calls createRDMutation.mutate({...}). 
  // useInnovationMutations returns { createRDProject }. 
  // createRDProject IS the mutation object (useMutation result).
  // So I can just map it.

  // NOTE: The previous code block includes imports which must be at top level. 
  // I cannot replace a block in the middle with imports. 

  // I will split this into two replacements.
  // 1. Add import.
  // 2. Replace mutation definition.


  const generateWithAI = async () => {
    if (!isAvailable) return;

    const response = await invokeAI({
      prompt: buildProposalToRDPrompt(proposal),
      response_json_schema: PROPOSAL_TO_RD_SCHEMA
    });

    if (response.success && response.data) {
      setRdData(response.data);
      toast.success(t({ en: 'AI generated R&D structure', ar: 'تم توليد هيكل البحث' }));
    }
  };

  const handleSubmit = () => {
    if (!rdData.title_en) {
      toast.error(t({ en: 'Please generate proposal first', ar: 'يرجى توليد المقترح أولاً' }));
      return;
    }

    createRDMutation.mutate({
      ...rdData,
      institution_en: proposal.submitter_organization || 'Independent',
      institution_type: 'research_center',
      research_area_en: proposal.sector || 'Municipal Innovation',
      challenge_ids: proposal.challenge_alignment_id ? [proposal.challenge_alignment_id] : [],
      budget: proposal.budget_estimate * 1.3,
      duration_months: Math.ceil(proposal.duration_weeks / 4),
      status: 'proposal',
      principal_investigator: {
        name_en: proposal.submitter_name,
        email: proposal.submitter_email
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Microscope className="h-6 w-6" />
            {t({ en: 'Convert to R&D Research Project', ar: 'تحويل إلى مشروع بحث' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

          <Button
            onClick={generateWithAI}
            disabled={generating || !isAvailable}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {t({ en: 'Generating R&D Structure...', ar: 'توليد هيكل البحث...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                {t({ en: 'Generate R&D Project with AI', ar: 'توليد مشروع البحث بالذكاء' })}
              </>
            )}
          </Button>

          {rdData.title_en && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="font-semibold text-purple-900 mb-2">{rdData.title_en}</p>
                <p className="text-sm text-slate-700">{rdData.abstract_en?.slice(0, 300)}...</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  {t({ en: 'Methodology (English)', ar: 'المنهجية (إنجليزي)' })}
                </label>
                <Textarea
                  value={rdData.methodology_en}
                  onChange={(e) => setRdData({ ...rdData, methodology_en: e.target.value })}
                  rows={6}
                />
              </div>

              {rdData.expected_outputs?.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-semibold text-green-900 mb-2">
                    {t({ en: 'Expected Outputs:', ar: 'المخرجات المتوقعة:' })}
                  </p>
                  {rdData.expected_outputs.map((output, i) => (
                    <div key={i} className="text-xs text-slate-700">• {output.output_en}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createRDMutation.isPending || !rdData.title_en}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600"
            >
              {createRDMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Create R&D Project', ar: 'إنشاء مشروع البحث' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

