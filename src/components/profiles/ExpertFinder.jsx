import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Search, Sparkles, Loader2, User, Award } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function ExpertFinder() {
  const { language, isRTL, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [experts, setExperts] = useState([]);
  const { invokeAI, status, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const handleAISearch = async () => {
    const result = await invokeAI({
      prompt: `Find experts in the platform for: "${query}"
      
Search across user profiles, researchers, and municipal officials. Return top 5 matches with:
- Name, title, expertise match score
- Why they're relevant
- Suggested collaboration angle`,
      response_json_schema: {
        type: 'object',
        properties: {
          experts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                title: { type: 'string' },
                expertise: { type: 'array', items: { type: 'string' } },
                match_score: { type: 'number' },
                relevance: { type: 'string' },
                collaboration_angle: { type: 'string' }
              }
            }
          }
        }
      }
    });
    
    if (result.success) {
      setExperts(result.data?.experts || []);
      toast.success(t({ en: 'Experts found', ar: 'تم العثور على خبراء' }));
    }
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-purple-600" />
          {t({ en: 'Expert Finder', ar: 'مكتشف الخبراء' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t({ en: 'Search by skill, topic, or sector...', ar: 'ابحث بالمهارة أو الموضوع أو القطاع...' })}
          />
          <Button onClick={handleAISearch} disabled={loading || !isAvailable} className="bg-purple-600">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-3">
          {experts.map((expert, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-lg border hover:border-purple-300 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{expert.name}</h4>
                    <p className="text-sm text-slate-600">{expert.title}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {expert.expertise?.slice(0, 3).map((exp, j) => (
                        <Badge key={j} variant="outline" className="text-xs">{exp}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-slate-700 mt-2">{expert.relevance}</p>
                  </div>
                </div>
                <Badge className="bg-purple-600">{expert.match_score}%</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}