import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { BookOpen, Award, TrendingUp, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function MyLearning() {
  const { language, isRTL, t } = useLanguage();
  const [recommendations, setRecommendations] = useState(null);
  const { invokeAI, status: aiStatus, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me()
  });

  const { data: knowledgeDocs = [] } = useQuery({
    queryKey: ['knowledge-docs'],
    queryFn: () => base44.entities.KnowledgeDocument.list()
  });

  const { data: myChallenges = [] } = useQuery({
    queryKey: ['my-challenges-learning', user?.email],
    queryFn: async () => {
      const challenges = await base44.entities.Challenge.list();
      return challenges.filter(c => c.created_by === user?.email);
    },
    enabled: !!user
  });

  const { data: myPilots = [] } = useQuery({
    queryKey: ['my-pilots-learning', user?.email],
    queryFn: async () => {
      const pilots = await base44.entities.Pilot.list();
      return pilots.filter(p => p.created_by === user?.email);
    },
    enabled: !!user
  });

  const generateRecommendations = async () => {
    const result = await invokeAI({
      prompt: `Based on this user's activity, recommend learning resources:

Role: ${user?.role}
Challenges created: ${myChallenges.length}
Pilots launched: ${myPilots.length}
Challenge→Pilot conversion: ${myChallenges.length > 0 ? Math.round((myChallenges.filter(c => c.linked_pilot_ids?.length > 0).length / myChallenges.length) * 100) : 0}%

Identify skill gaps and recommend 5 learning topics to improve performance. For each:
1. Topic name
2. Why needed (skill gap identified)
3. Expected improvement
4. Priority (high/medium/low)`,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                topic: { type: 'string' },
                skill_gap: { type: 'string' },
                expected_improvement: { type: 'string' },
                priority: { type: 'string' }
              }
            }
          }
        }
      }
    });
    if (result.success) {
      setRecommendations(result.data.recommendations || []);
    }
  };

  const trainingDocs = knowledgeDocs.filter(doc => doc.doc_type === 'guide' || doc.doc_type === 'tutorial');

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

      <AIStatusIndicator status={aiStatus} rateLimitInfo={rateLimitInfo} />

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
                    <p className="text-xs text-slate-600 mt-1">{doc.doc_type}</p>
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