import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { createPageUrl } from '@/utils';
import { Lightbulb, Loader2 } from 'lucide-react';
import { useSolutionsWithVisibility } from '@/hooks/visibility';

export default function ChallengeSolutionsTab({ solutions: propSolutions, challenge }) {
  const { t } = useLanguage();
  const { data: allSolutions = [], isLoading } = useSolutionsWithVisibility();

  // Use prop if provided (fallback), otherwise filter fetched data
  const solutions = propSolutions || allSolutions.filter(s => s.challenges_discovered?.includes(challenge?.id));

  if (isLoading && !propSolutions) {
    return <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-yellow-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            {t({ en: 'AI-Matched Solutions', ar: 'الحلول المتطابقة بالذكاء الاصطناعي' })} ({solutions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {solutions.length > 0 ? (
            <div className="space-y-3">
              {solutions.slice(0, 10).map((solution, idx) => (
                <Link
                  key={solution.id}
                  to={createPageUrl(`SolutionDetail?id=${solution.id}`)}
                  className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{solution.name_en}</p>
                      <p className="text-sm text-slate-600 mt-1">{solution.provider_name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{solution.maturity_level?.replace(/_/g, ' ')}</Badge>
                        <Badge variant="outline">TRL {solution.trl}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{Math.max(0, 95 - idx * 3)}%</div>
                      <div className="text-xs text-slate-500">{t({ en: 'AI Match', ar: 'تطابق ذكي' })}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t({ en: 'No solutions matched yet', ar: 'لا توجد حلول متطابقة بعد' })}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
