import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Tags, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  generateIdeaClassificationPrompt,
  getIdeaClassificationSchema,
  getIdeaClassificationSystemPrompt
} from '@/lib/ai/prompts/citizen';

export default function AIIdeaClassifier({ idea, onClassified }) {
  const { language, t } = useLanguage();
  const [classification, setClassification] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const classifyIdea = async () => {
    const response = await invokeAI({
      prompt: generateIdeaClassificationPrompt(idea),
      response_json_schema: getIdeaClassificationSchema(),
      system_prompt: getIdeaClassificationSystemPrompt()
    });

    if (response.success && response.data) {
      setClassification(response.data);
      if (onClassified) {
        onClassified(response.data);
      }
      toast.success(t({ en: 'Idea classified', ar: 'الفكرة مصنفة' }));
    }
  };

  return (
    <Card className="border-2 border-green-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5 text-green-600" />
            {t({ en: 'AI Classifier', ar: 'المصنف الذكي' })}
          </CardTitle>
          <Button onClick={classifyIdea} disabled={isLoading || !isAvailable} size="sm" className="bg-green-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Classify', ar: 'تصنيف' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />
        
        {!classification && !isLoading && (
          <div className="text-center py-8">
            <Tags className="h-12 w-12 text-green-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI auto-classifies ideas by sector and quality', ar: 'الذكاء يصنف الأفكار تلقائياً حسب القطاع والجودة' })}
            </p>
          </div>
        )}

        {classification && (
          <div className="space-y-3">
            {classification.is_spam && (
              <div className="p-3 bg-red-50 rounded border-2 border-red-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm font-semibold text-red-900">
                    {t({ en: 'Low Quality / Spam Detected', ar: 'جودة منخفضة / رسائل مزعجة مكتشفة' })}
                  </p>
                </div>
              </div>
            )}

            <div className="p-3 bg-blue-50 rounded border border-blue-300">
              <p className="text-xs text-blue-900 mb-2">{t({ en: 'Sector:', ar: 'القطاع:' })}</p>
              <Badge className="bg-blue-600 text-white capitalize">{classification.sector?.replace(/_/g, ' ')}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-purple-50 rounded border">
                <p className="text-xs text-slate-600 mb-1">{t({ en: 'Sentiment', ar: 'المشاعر' })}</p>
                <Badge variant="outline">{classification.sentiment}</Badge>
              </div>
              <div className="p-3 bg-amber-50 rounded border">
                <p className="text-xs text-slate-600 mb-1">{t({ en: 'Priority', ar: 'الأولوية' })}</p>
                <Badge className={
                  classification.priority === 'high' ? 'bg-red-100 text-red-700' :
                  classification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }>{classification.priority?.toUpperCase()}</Badge>
              </div>
            </div>

            {classification.keywords?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-900 mb-2">{t({ en: 'Keywords:', ar: 'الكلمات:' })}</p>
                <div className="flex flex-wrap gap-2">
                  {classification.keywords.map((kw, i) => (
                    <Badge key={i} variant="outline">{kw}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 bg-green-50 rounded border border-green-300 text-center">
              <p className="text-xs text-slate-600 mb-1">{t({ en: 'Quality Score', ar: 'درجة الجودة' })}</p>
              <p className="text-3xl font-bold text-green-600">{classification.quality_score}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}