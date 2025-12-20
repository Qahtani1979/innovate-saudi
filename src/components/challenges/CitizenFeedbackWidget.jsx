import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { MessageSquare, ThumbsUp, TrendingUp, ThumbsDown, Meh } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { 
  buildFeedbackSentimentPrompt, 
  FEEDBACK_SENTIMENT_SYSTEM_PROMPT, 
  FEEDBACK_SENTIMENT_SCHEMA 
} from '@/lib/ai/prompts/citizen/feedbackSentiment';

export default function CitizenFeedbackWidget({ challengeId, pilotId }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [newFeedback, setNewFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('complaint');
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['citizen-feedback', challengeId || pilotId],
    queryFn: async () => {
      let query = supabase.from('citizen_feedback').select('*').order('created_at', { ascending: false });
      if (challengeId) query = query.eq('entity_id', challengeId).eq('entity_type', 'challenge');
      else if (pilotId) query = query.eq('entity_id', pilotId).eq('entity_type', 'pilot');
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const addFeedbackMutation = useMutation({
    mutationFn: async (data) => {
      const sentimentResult = await invokeAI({
        system_prompt: FEEDBACK_SENTIMENT_SYSTEM_PROMPT,
        prompt: buildFeedbackSentimentPrompt({ content: data.content }),
        response_json_schema: FEEDBACK_SENTIMENT_SCHEMA
      });

      const sentiment = sentimentResult.success ? sentimentResult.data : { sentiment: 'neutral', score: 0 };

      const { error } = await supabase.from('citizen_feedback').insert({
        entity_id: data.challenge_id || data.pilot_id,
        entity_type: data.challenge_id ? 'challenge' : 'pilot',
        feedback_text: data.content,
        feedback_type: data.feedback_type,
        is_anonymous: data.is_anonymous,
        status: sentiment.sentiment,
        rating: sentiment.score
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizen-feedback'] });
      setNewFeedback('');
    }
  });

  const handleSubmit = () => {
    if (!newFeedback.trim()) return;
    
    addFeedbackMutation.mutate({
      challenge_id: challengeId,
      pilot_id: pilotId,
      content: newFeedback,
      feedback_type: feedbackType,
      is_anonymous: true
    });
  };

  const sentimentCounts = {
    positive: feedbacks.filter(f => f.sentiment === 'positive').length,
    neutral: feedbacks.filter(f => f.sentiment === 'neutral').length,
    negative: feedbacks.filter(f => f.sentiment === 'negative').length
  };

  const trendData = feedbacks.slice(0, 10).reverse().map((f, idx) => ({
    index: idx + 1,
    score: f.sentiment_score || 0
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t({ en: 'Citizen Feedback', ar: 'ملاحظات المواطنين' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
          
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-green-50 rounded-lg text-center border border-green-200">
              <ThumbsUp className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-600">{sentimentCounts.positive}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Positive', ar: 'إيجابي' })}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-200">
              <Meh className="h-6 w-6 text-slate-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-slate-600">{sentimentCounts.neutral}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Neutral', ar: 'محايد' })}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-center border border-red-200">
              <ThumbsDown className="h-6 w-6 text-red-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-red-600">{sentimentCounts.negative}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Negative', ar: 'سلبي' })}</p>
            </div>
          </div>

          {trendData.length > 3 && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">
                {t({ en: 'Sentiment Trend', ar: 'اتجاه المشاعر' })}
              </h4>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" />
                  <YAxis domain={[-1, 1]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-slate-700 mb-3">
              {t({ en: 'Submit Feedback', ar: 'إرسال ملاحظات' })}
            </h4>
            <div className="space-y-3">
              <div className="flex gap-2">
                {['complaint', 'suggestion', 'support'].map(type => (
                  <Button
                    key={type}
                    variant={feedbackType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFeedbackType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
              <Textarea
                value={newFeedback}
                onChange={(e) => setNewFeedback(e.target.value)}
                rows={3}
                placeholder={t({ en: 'Share your feedback...', ar: 'شارك ملاحظاتك...' })}
              />
              <Button onClick={handleSubmit} disabled={!newFeedback.trim() || isLoading || !isAvailable} className="w-full">
                {t({ en: 'Submit Feedback', ar: 'إرسال' })}
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {feedbacks.slice(0, 10).map((feedback) => (
              <div key={feedback.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <Badge className={
                    feedback.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                    feedback.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }>
                    {feedback.sentiment}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {new Date(feedback.created_date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{feedback.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
