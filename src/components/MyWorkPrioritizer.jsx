import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from './LanguageContext';
import { Sparkles, Clock, Target, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useMyWork } from '@/hooks/useMyWork';

export default function MyWorkPrioritizer() {
  const { language, isRTL, t } = useLanguage();

  // Use the new hook for fetching work items and AI
  const {
    isLoading: loadingWork,
    aiPriorities,
    generatePriorities,
    isAIAnalyzing,
    isAIAvailable,
    aiStatus,
    aiError,
    rateLimitInfo
  } = useMyWork();


  const urgencyColors = {
    high: 'bg-red-100 text-red-700 border-red-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    low: 'bg-blue-100 text-blue-700 border-blue-300'
  };

  const getEntityUrl = (type, id) => {
    const pageMap = {
      challenge: 'ChallengeDetail',
      pilot: 'PilotDetail',
      task: 'TaskManagement'
    };
    return createPageUrl(pageMap[type?.toLowerCase()] || 'Home') + (id ? `?id=${id}` : '');
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {t({ en: '🎯 AI: What Should I Focus On Today?', ar: '🎯 الذكاء الاصطناعي: على ماذا يجب أن أركز اليوم؟' })}
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                {t({ en: 'Smart work prioritization based on your activities', ar: 'ترتيب العمل الذكي بناءً على أنشطتك' })}
              </p>
            </div>
          </div>
          <Button
            onClick={generatePriorities}
            disabled={isAIAnalyzing || !isAIAvailable}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {isAIAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'Generate Priorities', ar: 'توليد الأولويات' })}
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <AIStatusIndicator status={aiStatus} error={aiError} rateLimitInfo={rateLimitInfo} />

        {!aiPriorities && !isAIAnalyzing && (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-purple-300 mx-auto mb-3" />
            <p className="text-slate-600">
              {t({
                en: 'Click "Generate Priorities" to get AI-powered recommendations for your day',
                ar: 'انقر "توليد الأولويات" للحصول على توصيات مدعومة بالذكاء الاصطناعي ليومك'
              })}
            </p>
          </div>
        )}

        {aiPriorities && (
          <div className="space-y-4">
            {aiPriorities.summary && (
              <div className="p-3 bg-purple-100 rounded-lg border border-purple-200">
                <p className="text-sm font-medium text-purple-900">{aiPriorities.summary}</p>
              </div>
            )}

            <div className="space-y-3">
              {aiPriorities.priorities?.map((priority, idx) => (
                <div key={idx} className={`p-4 rounded-lg border-2 ${urgencyColors[priority.urgency] || 'bg-slate-50'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center font-bold text-purple-600 border-2 border-purple-300">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">{priority.title}</h4>
                        <p className="text-sm text-slate-700 mb-2">{priority.reason}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">{priority.action}</span>
                        </div>
                      </div>
                    </div>
                    {priority.entity_id && (
                      <Link to={getEntityUrl(priority.entity_type, priority.entity_id)}>
                        <Button size="sm" variant="outline">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
