import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { calculatePriorityScore } from '@/lib/ai/prompts/citizen';

export default function AIPrioritySorter({ ideas, onSort }) {
  const { t } = useLanguage();

  const sortByPriority = () => {
    const sorted = [...ideas].sort((a, b) => calculatePriorityScore(b) - calculatePriorityScore(a));
    onSort(sorted);
  };

  const sortByVotes = () => {
    const sorted = [...ideas].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
    onSort(sorted);
  };

  const sortByRecent = () => {
    const sorted = [...ideas].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    onSort(sorted);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-600">{t({ en: 'Sort:', ar: 'ترتيب:' })}</span>
      <Button onClick={sortByPriority} size="sm" variant="outline" className="gap-2">
        <Sparkles className="h-4 w-4 text-purple-600" />
        {t({ en: 'AI Priority', ar: 'أولوية ذكية' })}
      </Button>
      <Button onClick={sortByVotes} size="sm" variant="outline" className="gap-2">
        <TrendingUp className="h-4 w-4 text-green-600" />
        {t({ en: 'Most Votes', ar: 'الأكثر تصويتاً' })}
      </Button>
      <Button onClick={sortByRecent} size="sm" variant="outline" className="gap-2">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        {t({ en: 'Recent', ar: 'حديث' })}
      </Button>
    </div>
  );
}