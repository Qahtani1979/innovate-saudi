import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Search, Sparkles, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { getSystemPrompt } from '@/lib/saudiContext';
import { 
  buildExpertFinderPrompt, 
  getExpertFinderSchema,
  EXPERT_FINDER_SYSTEM_PROMPT 
} from '@/lib/ai/prompts/profiles';

export default function ExpertFinder() {
  const { language, isRTL, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [experts, setExperts] = useState([]);
  const { invokeAI, status, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const handleAISearch = async () => {
    if (!query.trim()) {
      toast.error(t({ en: 'Please enter a search query', ar: 'يرجى إدخال استعلام البحث' }));
      return;
    }

    const result = await invokeAI({
      prompt: buildExpertFinderPrompt(query),
      response_json_schema: getExpertFinderSchema(),
      system_prompt: getSystemPrompt(EXPERT_FINDER_SYSTEM_PROMPT)
    });
    
    if (result.success && result.data?.experts) {
      setExperts(result.data.experts);
      toast.success(t({ en: 'Experts found', ar: 'تم العثور على خبراء' }));
    }
  };

  const getLocalizedField = (item, field) => {
    if (language === 'ar' && item[`${field}_ar`]) {
      return item[`${field}_ar`];
    }
    return item[field];
  };

  const getLocalizedArray = (item, field) => {
    if (language === 'ar' && item[`${field}_ar`]) {
      return item[`${field}_ar`];
    }
    return item[field] || [];
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
            onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
          />
          <Button onClick={handleAISearch} disabled={loading || !isAvailable} className="bg-purple-600">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          </Button>
        </div>

        {!experts.length && !loading && (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-purple-200 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {t({ en: 'Search for experts by skill, topic, or sector', ar: 'ابحث عن الخبراء بالمهارة أو الموضوع أو القطاع' })}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {experts.map((expert, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-lg border hover:border-purple-300 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">
                      {getLocalizedField(expert, 'name')}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {getLocalizedField(expert, 'title')}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {getLocalizedArray(expert, 'expertise').slice(0, 3).map((exp, j) => (
                        <Badge key={j} variant="outline" className="text-xs">{exp}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-slate-700 mt-2">
                      {getLocalizedField(expert, 'relevance')}
                    </p>
                    <p className="text-xs text-purple-600 mt-1 font-medium">
                      {t({ en: 'Collaboration:', ar: 'التعاون:' })} {getLocalizedField(expert, 'collaboration_angle')}
                    </p>
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
