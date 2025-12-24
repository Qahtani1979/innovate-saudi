import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { BookOpen, Award, Sparkles, Loader2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useAuth } from '@/lib/AuthContext';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import { useKnowledgeDocuments } from '@/hooks/useKnowledgeDocuments';

function MyLearning() {
  const { language, isRTL, t } = useLanguage();
  const [recommendations, setRecommendations] = useState(null);
  const { invokeAI, status: aiStatus, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();
  const { user } = useAuth();

  const { metrics, isLoading: analyticsLoading } = useUserAnalytics();
  const { useAllDocuments } = useKnowledgeDocuments();

  const { data: knowledgeDocs = [] } = useAllDocuments();

  const generateRecommendations = async () => {
    const {
      LEARNING_RECOMMENDATIONS_PROMPT_TEMPLATE,
      LEARNING_RECOMMENDATIONS_RESPONSE_SCHEMA
    } = await import('@/lib/ai/prompts/learning/recommendations');

    const result = await invokeAI({
      prompt: LEARNING_RECOMMENDATIONS_PROMPT_TEMPLATE({
        role: user?.role,
        challengesCount: metrics.challengesCount,
        pilotsCount: metrics.pilotsCount,
        conversionRate: metrics.challengeConversionRate
      }),
      response_json_schema: LEARNING_RECOMMENDATIONS_RESPONSE_SCHEMA,
      system_prompt: 'You are an expert learning consultant.'
    });
    if (result.success) {
      setRecommendations(result.data.recommendations || []);
    }
  };

  const trainingDocs = knowledgeDocs.filter(doc => doc.document_type === 'guide' || doc.document_type === 'tutorial');

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {t({ en: 'My Learning & Development', ar: 'تعلمي وتطويري' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Personalized learning path', ar: 'مسار التعلم المخصص' })}
          </p>
        </div>
        <Button onClick={generateRecommendations} disabled={loading || !isAvailable} className="bg-purple-600">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {t({ en: 'Get AI Recommendations', ar: 'الحصول على توصيات الذكاء' })}
        </Button>
      </div>

      <AIStatusIndicator status={aiStatus} rateLimitInfo={rateLimitInfo} error={null} />

      {/* AI Recommendations */}
      {recommendations && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'Recommended Learning Path', ar: 'مسار التعلم الموصى به' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="p-4 bg-white rounded-lg border-2 border-purple-200">
                <div className="flex items-start gap-3">
                  <Badge className={rec.priority === 'high' ? 'bg-red-600' : rec.priority === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'}>
                    {rec.priority}
                  </Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{rec.topic}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      <strong>{t({ en: 'Why:', ar: 'لماذا:' })}</strong> {rec.skill_gap}
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      <strong>{t({ en: 'Benefit:', ar: 'الفائدة:' })}</strong> {rec.expected_improvement}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Available Resources */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Available Learning Resources', ar: 'موارد التعلم المتاحة' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trainingDocs.slice(0, 6).map((doc) => (
            <Link key={doc.id} to={createPageUrl(`KnowledgeDocumentDetail?id=${doc.id}`)}>
              <div className="p-3 border rounded-lg hover:bg-blue-50 transition-colors">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 text-sm">
                      {language === 'ar' && doc.title_ar ? doc.title_ar : doc.title_en}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">{doc.document_type}</p>
                  </div>
                  <Badge variant="outline">{doc.category}</Badge>
                </div>
              </div>
            </Link>
          ))}

          {trainingDocs.length === 0 && (
            <p className="text-center text-slate-500 py-8">
              {t({ en: 'No learning resources available yet', ar: 'لا توجد موارد تعلم متاحة بعد' })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            {t({ en: 'Certification Path', ar: 'مسار الشهادات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900">{t({ en: 'Innovation Manager Level 1', ar: 'مدير الابتكار المستوى 1' })}</h3>
                <Badge className="bg-amber-600">{t({ en: 'In Progress', ar: 'قيد التقدم' })}</Badge>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                {t({ en: 'Complete 3 learning modules + launch 1 successful pilot', ar: 'أكمل 3 وحدات تعلم + أطلق تجربة ناجحة واحدة' })}
              </p>
              <Progress value={45} className="h-2" />
              <p className="text-xs text-slate-500 mt-1">45% complete</p>
            </div>

            <div className="p-4 bg-white rounded-lg border opacity-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900">{t({ en: 'Innovation Manager Level 2', ar: 'مدير الابتكار المستوى 2' })}</h3>
                <Badge variant="outline">{t({ en: 'Locked', ar: 'مقفل' })}</Badge>
              </div>
              <p className="text-sm text-slate-600">
                {t({ en: 'Complete Level 1 first', ar: 'أكمل المستوى 1 أولاً' })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(MyLearning, { requiredPermissions: [] });