import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Copy, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { 
  buildDuplicateDetectorPrompt, 
  DUPLICATE_DETECTOR_SYSTEM_PROMPT, 
  DUPLICATE_DETECTOR_SCHEMA 
} from '@/lib/ai/prompts/data/duplicateDetector';

export default function DuplicateRecordDetector({ entityType }) {
  const { language, t } = useLanguage();
  const [duplicates, setDuplicates] = useState([]);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const scanForDuplicates = async () => {
    const entities = await base44.entities[entityType].list();
    
    const response = await invokeAI({
      system_prompt: DUPLICATE_DETECTOR_SYSTEM_PROMPT,
      prompt: buildDuplicateDetectorPrompt({ entities }),
      response_json_schema: DUPLICATE_DETECTOR_SCHEMA
    });

    if (response.success && response.data?.duplicate_groups) {
      const enrichedDuplicates = response.data.duplicate_groups.map(group => ({
        ...group,
        records: group.record_ids.map(id => entities.find(e => e.id === id)).filter(Boolean)
      }));
      setDuplicates(enrichedDuplicates);
    }
  };

  return (
    <Card className="border-2 border-orange-300">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-orange-600" />
            {t({ en: 'Duplicate Detector', ar: 'كاشف التكرار' })}
          </CardTitle>
          <Button onClick={scanForDuplicates} disabled={isLoading || !isAvailable} size="sm" className="bg-orange-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Scan', ar: 'مسح' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />
        
        {!duplicates.length && !isLoading && (
          <div className="text-center py-8">
            <Copy className="h-12 w-12 text-orange-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI detects duplicate and similar records for cleanup', ar: 'الذكاء يكتشف السجلات المكررة والمشابهة للتنظيف' })}
            </p>
          </div>
        )}

        {duplicates.length > 0 && (
          <div className="space-y-4">
            {duplicates.map((group, idx) => (
              <div key={idx} className="p-4 border-2 border-orange-200 rounded-lg bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Badge className="bg-orange-100 text-orange-700 mb-2">
                      {group.similarity}% {t({ en: 'Similar', ar: 'مشابه' })}
                    </Badge>
                    <p className="text-sm text-slate-700 mb-2">{group.reason}</p>
                    <p className="text-xs font-semibold text-blue-900">
                      {t({ en: 'Recommendation:', ar: 'التوصية:' })} {group.recommendation}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {group.records?.map((record, i) => (
                    <div key={record.id} className="p-3 bg-slate-50 rounded border text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant="outline" className="text-xs font-mono mb-1">{record.code || record.id}</Badge>
                          <p className="font-medium text-slate-900">{record.title_en || record.name_en || record.title}</p>
                        </div>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
