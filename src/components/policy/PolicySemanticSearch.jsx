import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { toast } from 'sonner';

import { usePolicySemanticSearch } from '@/hooks/usePolicies';

export default function PolicySemanticSearch({ onResultsFound }) {
  const { language, isRTL, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const searchMutation = usePolicySemanticSearch();

  // Wrap the mutation call to handle success/error here or in hook?
  // Hook returns `useMutation` result basically.
  // But `onSuccess` logic is specific to component.
  // `usePolicySemanticSearch` definition in `usePolicies.js` defined `mutationFn` but not `onSuccess`.
  // So searchMutation is the mutation object. I can use .mutate(variables, { onSuccess, onError }).

  const handleSearch = () => {
    if (!query.trim()) {
      toast.error(t({ en: 'Enter a search query', ar: 'أدخل استعلام بحث' }));
      return;
    }
    searchMutation.mutate(query, {
      onSuccess: (data) => {
        setResults(data.results || []);
        if (onResultsFound) {
          onResultsFound(data.results || []);
        }
        if (!data.results || data.results.length === 0) {
          toast.info(t({ en: 'No similar policies found', ar: 'لم يتم العثور على سياسات مشابهة' }));
        }
      },
      onError: () => {
        toast.error(t({ en: 'Search failed', ar: 'فشل البحث' }));
      }
    });
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          {t({ en: 'AI Semantic Search', ar: 'البحث الدلالي الذكي' })}
        </CardTitle>
        <p className="text-xs text-slate-600 mt-1">
          {t({
            en: 'Find policies by meaning, not just keywords',
            ar: 'ابحث عن السياسات بالمعنى، وليس فقط الكلمات المفتاحية'
          })}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t({
              en: 'e.g., "policies requiring inter-agency coordination"',
              ar: 'مثال: "سياسات تتطلب تنسيق بين الجهات"'
            })}
            className="flex-1"
          />
          <Button
            onClick={handleSearch}
            disabled={searchMutation.isPending}
            className="gap-2 bg-purple-600"
          >
            {searchMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {t({ en: 'Search', ar: 'بحث' })}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-purple-900">
              {results.length} {t({ en: 'similar policies found', ar: 'سياسات مشابهة' })}
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, idx) => (
                <Link key={idx} to={createPageUrl(`PolicyDetail?id=${result.id}`)}>
                  <div className="p-3 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {result.code && (
                            <Badge variant="outline" className="text-xs font-mono">{result.code}</Badge>
                          )}
                          <Badge className="text-xs bg-purple-600 text-white">
                            {Math.round(result.similarity * 100)}% match
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-slate-900">
                          {language === 'ar' && result.title_ar ? result.title_ar : result.title_en}
                        </p>
                      </div>
                      {result.impact_score && (
                        <div className="text-right ml-3">
                          <div className="text-lg font-bold text-purple-600">{result.impact_score}</div>
                          <div className="text-xs text-slate-500">{t({ en: 'Impact', ar: 'تأثير' })}</div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {language === 'ar' && result.recommendation_text_ar
                        ? result.recommendation_text_ar
                        : result.recommendation_text_en}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
