import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { getSystemPrompt } from '@/lib/saudiContext';
import { 
  buildRFPGeneratorPrompt, 
  rfpGeneratorSchema, 
  RFP_GENERATOR_SYSTEM_PROMPT 
} from '@/lib/ai/prompts/challenges';

export default function ChallengeRFPGenerator({ challenge, onComplete }) {
  const { invokeAI, status, isLoading: isGenerating, rateLimitInfo, isAvailable } = useAIWithFallback();
  const [rfpData, setRfpData] = useState(null);
  const [customRequirements, setCustomRequirements] = useState('');

  const generateRFP = async () => {
    if (!isAvailable) return;
    
    const aiResponse = await invokeAI({
      systemPrompt: getSystemPrompt(RFP_GENERATOR_SYSTEM_PROMPT),
      prompt: buildRFPGeneratorPrompt(challenge, customRequirements),
      response_json_schema: rfpGeneratorSchema
    });

    if (aiResponse.success && aiResponse.data) {
      setRfpData(aiResponse.data);
      toast.success('RFP generated successfully');
    }
  };

  const publishRFP = async () => {
    try {
      const { error } = await supabase
        .from('challenges')
        .update({
          rfp_published: true,
          rfp_data: rfpData,
          rfp_published_date: new Date().toISOString(),
          status: 'rfp_open'
        })
        .eq('id', challenge.id);
      if (error) throw error;

      toast.success('RFP published - providers can now submit proposals');
      onComplete?.();
    } catch (error) {
      toast.error('Publishing failed: ' + error.message);
    }
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          RFP Generator (Procurement Path)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        
        {!rfpData ? (
          <>
            <p className="text-sm text-slate-600">
              Generate a structured Request for Proposal (RFP) to procure solutions from the market.
              This is an alternative to pilot-based experimentation for procurement-ready challenges.
            </p>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Additional Requirements (Optional)
              </label>
              <Textarea
                value={customRequirements}
                onChange={(e) => setCustomRequirements(e.target.value)}
                placeholder="Add specific technical requirements, compliance needs, or evaluation preferences..."
                className="h-24"
              />
            </div>

            <Button 
              onClick={generateRFP} 
              disabled={isGenerating || !isAvailable}
              className="w-full bg-blue-600"
            >
              {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Sparkles className="h-4 w-4 mr-2" />
              Generate RFP with AI
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <Badge className="mb-2">RFP Code: {rfpData.rfp_code}</Badge>
                <h3 className="font-bold text-slate-900 mb-2">Executive Summary</h3>
                <p className="text-sm text-slate-700">{rfpData.executive_summary_en}</p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-2">Evaluation Criteria</h3>
                <div className="space-y-2">
                  {rfpData.evaluation_criteria?.map((crit, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 rounded border">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{crit.criterion}</span>
                        <Badge variant="outline">{crit.weight}%</Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{crit.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-2">Timeline & Budget</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-xs text-slate-600">Timeline</p>
                    <p className="text-lg font-bold text-blue-600">{rfpData.timeline_weeks} weeks</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <p className="text-xs text-slate-600">Budget Range</p>
                    <p className="text-sm font-bold text-green-600">
                      {rfpData.budget_range_min?.toLocaleString()} - {rfpData.budget_range_max?.toLocaleString()} SAR
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={publishRFP} className="flex-1 bg-green-600">
                Publish RFP & Open for Proposals
              </Button>
              <Button onClick={() => setRfpData(null)} variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}