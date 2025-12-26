import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { BookOpen, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useKnowledgeDocuments } from '@/hooks/useKnowledgeDocuments';

export default function AILearningPathGenerator({ userRole, goal }) {
  const { language, t } = useLanguage();
  const [path, setPath] = useState(null);

  const { useAllDocuments } = useKnowledgeDocuments();
  const { data: docs = [] } = useAllDocuments();

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const generatePath = async () => {
    const response = await invokeAI({
      prompt: `Create a learning path for:
User Role: ${userRole}
Goal: ${goal}

Available Documents: ${docs.slice(0, 20).map(d => `${d.title_en} (${d.category})`).join(', ')}

Create a 5-7 step learning sequence:
1. Step name and description
2. Which doc/resource to use
3. Estimated time
4. Key takeaways

Order by dependency (basics → advanced)`,
      response_json_schema: {
        type: "object",
        properties: {
          path_name: { type: "string" },
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step_number: { type: "number" },
                name: { type: "string" },
                description: { type: "string" },
                resource: { type: "string" },
                time_minutes: { type: "number" },
                key_takeaways: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    if (response.success) {
      setPath(response.data);
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            {t({ en: 'AI Learning Path', ar: 'مسار التعلم الذكي' })}
          </CardTitle>
          {!path && (
            <Button onClick={generatePath} disabled={isLoading || !isAvailable} size="sm" className="bg-purple-600">
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'Generate Path', ar: 'توليد المسار' })}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />

        {!path && !isLoading && (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-purple-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI creates personalized learning sequence based on your goal', ar: 'الذكاء ينشئ تسلسل تعلم مخصص بناءً على هدفك' })}
            </p>
          </div>
        )}

        {path && (
          <div className="space-y-3">
            <div className="p-4 bg-purple-100 rounded-lg border-2 border-purple-300 mb-4">
              <h3 className="font-bold text-purple-900 text-lg">{path.path_name}</h3>
              <p className="text-xs text-purple-700 mt-1">
                {path.steps?.length} {t({ en: 'steps', ar: 'خطوات' })} • {path.steps?.reduce((sum, s) => sum + s.time_minutes, 0)} {t({ en: 'min total', ar: 'دقيقة إجمالي' })}
              </p>
            </div>

            {path.steps?.map((step, i) => (
              <div key={i} className="p-4 bg-white rounded-lg border-2 border-slate-200">
                <div className="flex items-start gap-3 mb-2">
                  <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                    {step.step_number}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{step.name}</h4>
                    <p className="text-xs text-slate-600 mt-1">{step.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{step.time_minutes} min</Badge>
                </div>

                <div className="ml-11 space-y-2">
                  <div className="p-2 bg-blue-50 rounded text-xs">
                    <p className="font-semibold text-blue-900 mb-1">{t({ en: 'Resource:', ar: 'المورد:' })}</p>
                    <p className="text-blue-700">{step.resource}</p>
                  </div>

                  {step.key_takeaways?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-700 mb-1">{t({ en: 'Key Takeaways:', ar: 'النقاط الرئيسية:' })}</p>
                      <ul className="space-y-1">
                        {step.key_takeaways.map((takeaway, j) => (
                          <li key={j} className="text-xs text-slate-600 flex items-start gap-1">
                            <span className="text-green-600">✓</span>
                            <span>{takeaway}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <ArrowRight className="h-3 w-3 mr-2" />
                    {t({ en: 'Start This Step', ar: 'ابدأ هذه الخطوة' })}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
