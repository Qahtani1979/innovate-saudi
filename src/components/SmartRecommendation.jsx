import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, X, ArrowRight } from 'lucide-react';
import useAIWithFallback, { AI_STATUS } from '@/hooks/useAIWithFallback';
import { buildSmartRecommendationPrompt, smartRecommendationSchema, SMART_RECOMMENDATION_SYSTEM_PROMPT } from '@/lib/ai/prompts/smart';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function SmartRecommendation({ context }) {
  const [recommendations, setRecommendations] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  const { invokeAI, status, isLoading, isAvailable } = useAIWithFallback({
    showToasts: false,
    fallbackData: { recommendations: [] }
  });

  useEffect(() => {
    if (context && !hasLoaded) {
      generateRecommendations();
    }
  }, [context]);

  const generateRecommendations = async () => {
    setHasLoaded(true);
    
    const { success, data } = await invokeAI({
      prompt: buildSmartRecommendationPrompt(context),
      systemPrompt: getSystemPrompt(SMART_RECOMMENDATION_SYSTEM_PROMPT),
      response_json_schema: smartRecommendationSchema
    });

    if (success && data?.recommendations) {
      setRecommendations(data.recommendations);
    }
  };

  const dismiss = (index) => {
    setDismissed([...dismissed, index]);
  };

  const visibleRecommendations = recommendations.filter((_, i) => !dismissed.includes(i));

  if (isLoading || status === AI_STATUS.RATE_LIMITED || visibleRecommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {visibleRecommendations.map((rec, i) => (
        <Card key={i} className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <h4 className="font-semibold text-sm text-purple-900">{rec.title}</h4>
                  <Badge className={rec.priority === 'high' ? 'bg-red-600' : rec.priority === 'medium' ? 'bg-amber-600' : 'bg-blue-600'}>
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-xs text-slate-700 mb-3">{rec.description}</p>
                <Button size="sm" className="bg-purple-600">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  {rec.action}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismiss(i)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
