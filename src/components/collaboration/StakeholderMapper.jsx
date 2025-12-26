import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Network, Sparkles, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function StakeholderMapper({ entity, entityType }) {
  const { language, isRTL, t } = useLanguage();
  const [stakeholderMap, setStakeholderMap] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const generateMap = async () => {
    const response = await invokeAI({
      prompt: `Identify and map all stakeholders for this ${entityType}:

Title: ${entity.title_en || entity.name_en}
Sector: ${entity.sector}
Description: ${entity.description_en || entity.abstract_en || ''}

Provide comprehensive stakeholder mapping:
1. Primary stakeholders (direct involvement)
2. Secondary stakeholders (indirect impact)
3. Influencers (can affect success)
4. Each with: power level (high/medium/low), interest level (high/medium/low), engagement strategy`,
      response_json_schema: {
        type: "object",
        properties: {
          stakeholders: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                type: { type: "string" },
                category: { type: "string" },
                power: { type: "string" },
                interest: { type: "string" },
                strategy: { type: "string" }
              }
            }
          }
        }
      }
    });

    if (response.success && response.data) {
      setStakeholderMap(response.data);
      toast.success(t({ en: 'Stakeholder map generated', ar: 'تم إنشاء خريطة الأطراف' }));
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-blue-600" />
            {t({ en: 'AI Stakeholder Mapper', ar: 'مخطط الأطراف الذكي' })}
          </CardTitle>
          <Button onClick={generateMap} disabled={isLoading || !isAvailable} size="sm" className="bg-blue-600">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {isLoading ? t({ en: 'Mapping...', ar: 'جاري التخطيط...' }) : t({ en: 'Generate Map', ar: 'إنشاء خريطة' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />
        {stakeholderMap ? (
          <div className="space-y-4">
            {['primary', 'secondary', 'influencer'].map(category => {
              const stakeholders = stakeholderMap.stakeholders?.filter(s => s.category === category) || [];
              if (stakeholders.length === 0) return null;

              return (
                <div key={category}>
                  <h4 className="font-semibold text-slate-900 mb-2 capitalize">{category} Stakeholders</h4>
                  <div className="space-y-2">
                    {stakeholders.map((sh, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-lg border">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{sh.name}</p>
                            <Badge variant="outline" className="text-xs mt-1">{sh.type}</Badge>
                          </div>
                          <div className="flex gap-1">
                            <Badge className={`text-xs ${sh.power === 'high' ? 'bg-red-100 text-red-700' : sh.power === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                              {sh.power} power
                            </Badge>
                            <Badge className={`text-xs ${sh.interest === 'high' ? 'bg-blue-100 text-blue-700' : sh.interest === 'medium' ? 'bg-slate-100 text-slate-700' : 'bg-slate-100 text-slate-500'}`}>
                              {sh.interest} interest
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600">💡 <strong>Strategy:</strong> {sh.strategy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-blue-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'Click "Generate Map" to identify stakeholders', ar: 'انقر "إنشاء خريطة" لتحديد الأطراف' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
