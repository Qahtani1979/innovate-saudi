import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Mic, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function AIChallengeIntakeWizard({ onSubmit, onCancel }) {
  const { language, isRTL, t } = useLanguage();
  const [step, setStep] = useState(1);
  const { invokeAI, status, isLoading: analyzing, rateLimitInfo, isAvailable } = useAIWithFallback();
  const [challengeData, setChallengeData] = useState({
    description: '',
    sector: '',
    keywords: [],
    root_causes: [],
    suggested_kpis: []
  });

  const analyzeDescription = async () => {
    if (!challengeData.description || !isAvailable) return;
    
    const response = await invokeAI({
      prompt: `Analyze this municipal challenge description and extract structured information:

"${challengeData.description}"

Extract:
1. Primary sector (urban_design, transport, environment, digital_services, health, education, safety, economic_development, social_services, other)
2. 5-10 relevant keywords for matching
3. 2-4 potential root causes
4. 3-5 suggested KPIs for measuring success
5. 2-3 intelligent follow-up questions to gather more context`,
      response_json_schema: {
        type: "object",
        properties: {
          sector: { type: "string" },
          keywords: { type: "array", items: { type: "string" } },
          root_causes: { type: "array", items: { type: "string" } },
          suggested_kpis: { 
            type: "array", 
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                baseline: { type: "string" },
                target: { type: "string" }
              }
            }
          },
          follow_up_questions: { type: "array", items: { type: "string" } }
        }
      }
    });

    if (response.success && response.data) {
      setChallengeData({
        ...challengeData,
        sector: response.data.sector,
        keywords: response.data.keywords,
        root_causes: response.data.root_causes,
        suggested_kpis: response.data.suggested_kpis,
        follow_up_questions: response.data.follow_up_questions
      });
      setStep(2);
      toast.success(t({ en: 'AI analysis complete', ar: 'اكتمل تحليل الذكاء الاصطناعي' }));
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setChallengeData({ ...challengeData, description: challengeData.description + ' ' + transcript });
      };
      recognition.start();
    } else {
      toast.error(t({ en: 'Voice input not supported', ar: 'إدخال الصوت غير مدعوم' }));
    }
  };

  const completeness = () => {
    let filled = 0;
    if (challengeData.description) filled += 30;
    if (challengeData.sector) filled += 20;
    if (challengeData.keywords?.length > 0) filled += 20;
    if (challengeData.root_causes?.length > 0) filled += 15;
    if (challengeData.suggested_kpis?.length > 0) filled += 15;
    return filled;
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          {t({ en: 'AI-Powered Challenge Intake', ar: 'إدخال التحدي المدعوم بالذكاء الاصطناعي' })}
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 bg-white/20 rounded-full h-2">
            <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${completeness()}%` }} />
          </div>
          <Badge className="bg-white/20 text-white">{completeness()}%</Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Describe the Challenge', ar: 'وصف التحدي' })}
              </label>
              <div className="relative">
                <Textarea
                  value={challengeData.description}
                  onChange={(e) => setChallengeData({ ...challengeData, description: e.target.value })}
                  rows={6}
                  placeholder={t({ 
                    en: 'Describe the problem, situation, or opportunity in detail...', 
                    ar: 'اوصف المشكلة أو الموقف أو الفرصة بالتفصيل...' 
                  })}
                  className="pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleVoiceInput}
                  className="absolute top-2 right-2"
                  title={t({ en: 'Voice input', ar: 'إدخال صوتي' })}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 font-medium mb-2">
                💡 {t({ en: 'AI Pro Tip', ar: 'نصيحة ذكية' })}
              </p>
              <p className="text-sm text-slate-700">
                {t({ 
                  en: 'Be specific! Include: what the problem is, who is affected, how often it occurs, and what impact it has.', 
                  ar: 'كن محدداً! شمل: ما هي المشكلة، من يتأثر، كم مرة تحدث، وما التأثير.' 
                })}
              </p>
            </div>

            <Button 
              onClick={analyzeDescription} 
              disabled={!challengeData.description || analyzing || !isAvailable}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'AI is analyzing...', ar: 'الذكاء الاصطناعي يحلل...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'Analyze with AI', ar: 'التحليل بالذكاء الاصطناعي' })}
                </>
              )}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* AI Analysis Results */}
            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-900">
                  {t({ en: 'AI Analysis Complete', ar: 'تحليل الذكاء الاصطناعي مكتمل' })}
                </h4>
              </div>

              <div className="space-y-3">
                <div>
                  <Badge className="bg-blue-100 text-blue-700 mb-1">
                    {t({ en: 'Detected Sector', ar: 'القطاع المحدد' })}
                  </Badge>
                  <p className="text-sm font-medium">{challengeData.sector?.replace(/_/g, ' ')}</p>
                </div>

                <div>
                  <Badge className="bg-purple-100 text-purple-700 mb-1">
                    {t({ en: 'Keywords', ar: 'الكلمات الرئيسية' })}
                  </Badge>
                  <div className="flex flex-wrap gap-2">
                    {challengeData.keywords?.map((kw, idx) => (
                      <Badge key={idx} variant="outline">{kw}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Badge className="bg-red-100 text-red-700 mb-1">
                    {t({ en: 'Potential Root Causes', ar: 'الأسباب الجذرية المحتملة' })}
                  </Badge>
                  <ul className="space-y-1">
                    {challengeData.root_causes?.map((cause, idx) => (
                      <li key={idx} className="text-sm text-slate-700">• {cause}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <Badge className="bg-green-100 text-green-700 mb-1">
                    {t({ en: 'Suggested KPIs', ar: 'المؤشرات المقترحة' })}
                  </Badge>
                  <div className="space-y-2">
                    {challengeData.suggested_kpis?.map((kpi, idx) => (
                      <div key={idx} className="text-sm bg-white p-2 rounded border">
                        <strong>{kpi.name}</strong>: {kpi.baseline} → {kpi.target}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Follow-up Questions */}
            {challengeData.follow_up_questions?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">
                  {t({ en: 'AI Follow-up Questions (Optional)', ar: 'أسئلة متابعة الذكاء الاصطناعي (اختياري)' })}
                </h4>
                <div className="space-y-2">
                  {challengeData.follow_up_questions.map((q, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded border">
                      <p className="text-sm text-slate-700 mb-2">💬 {q}</p>
                      <Input 
                        placeholder={t({ en: 'Your answer...', ar: 'إجابتك...' })} 
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                {t({ en: 'Back', ar: 'رجوع' })}
              </Button>
              <Button 
                onClick={() => onSubmit && onSubmit(challengeData)} 
                className="flex-1 bg-green-600"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t({ en: 'Create Challenge', ar: 'إنشاء التحدي' })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}