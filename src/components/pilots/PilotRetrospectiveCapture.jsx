import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { FileText, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function PilotRetrospectiveCapture({ pilot }) {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [retrospective, setRetrospective] = useState({
    what_worked: '',
    what_didnt_work: '',
    unexpected_outcomes: '',
    recommendations: ''
  });
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const generateReportCard = async () => {
    const result = await invokeAI({
      prompt: `Generate Pilot Report Card:

PILOT: ${pilot.title_en}
WHAT WORKED: ${retrospective.what_worked}
WHAT DIDN'T: ${retrospective.what_didnt_work}
UNEXPECTED: ${retrospective.unexpected_outcomes}
RECOMMENDATIONS: ${retrospective.recommendations}

KPIs: ${pilot.kpis?.map(k => `${k.name}: ${k.current}/${k.target}`).join(', ') || 'N/A'}

Create comprehensive report card:
1. Executive summary (3 sentences)
2. Success factors (3-5 bullets)
3. Challenges faced (3-5 bullets)
4. Key learnings (3-5 bullets)
5. Recommendations for future pilots (3-5 bullets)`,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          success_factors: { type: "array", items: { type: "string" } },
          challenges_faced: { type: "array", items: { type: "string" } },
          key_learnings: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } }
        }
      }
    });

    if (result.success) {
      await base44.entities.KnowledgeDocument.create({
        title_en: `Pilot Report Card: ${pilot.title_en}`,
        title_ar: `بطاقة تقرير التجربة: ${pilot.title_ar || pilot.title_en}`,
        category: 'pilot_retrospective',
        content_en: JSON.stringify(result.data, null, 2),
        entity_type: 'pilot',
        entity_id: pilot.id,
        tags: [pilot.sector, 'retrospective', 'lessons_learned']
      });

      queryClient.invalidateQueries(['knowledge']);
      toast.success(t({ en: 'Report card created', ar: 'بطاقة التقرير أُنشئت' }));
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          {t({ en: 'Pilot Retrospective', ar: 'المراجعة بأثر رجعي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
        
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'What worked well?', ar: 'ما الذي نجح؟' })}
          </label>
          <Textarea
            value={retrospective.what_worked}
            onChange={(e) => setRetrospective({...retrospective, what_worked: e.target.value})}
            placeholder={t({ en: 'Describe successes...', ar: 'صف النجاحات...' })}
            className="h-20"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: "What didn't work?", ar: 'ما الذي لم ينجح؟' })}
          </label>
          <Textarea
            value={retrospective.what_didnt_work}
            onChange={(e) => setRetrospective({...retrospective, what_didnt_work: e.target.value})}
            placeholder={t({ en: 'Describe challenges...', ar: 'صف التحديات...' })}
            className="h-20"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Unexpected outcomes?', ar: 'نتائج غير متوقعة؟' })}
          </label>
          <Textarea
            value={retrospective.unexpected_outcomes}
            onChange={(e) => setRetrospective({...retrospective, unexpected_outcomes: e.target.value})}
            placeholder={t({ en: 'Describe surprises...', ar: 'صف المفاجآت...' })}
            className="h-20"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Recommendations for future?', ar: 'توصيات للمستقبل؟' })}
          </label>
          <Textarea
            value={retrospective.recommendations}
            onChange={(e) => setRetrospective({...retrospective, recommendations: e.target.value})}
            placeholder={t({ en: 'Your recommendations...', ar: 'توصياتك...' })}
            className="h-20"
          />
        </div>

        <Button 
          onClick={generateReportCard} 
          disabled={isLoading || !isAvailable || !retrospective.what_worked}
          className="w-full bg-purple-600"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {t({ en: 'Generate Report Card', ar: 'إنشاء بطاقة التقرير' })}
        </Button>

        <p className="text-xs text-slate-500 text-center">
          {t({ en: 'AI will create a structured report card and add it to knowledge base', ar: 'الذكاء سينشئ بطاقة تقرير منظمة ويضيفها لقاعدة المعرفة' })}
        </p>
      </CardContent>
    </Card>
  );
}
