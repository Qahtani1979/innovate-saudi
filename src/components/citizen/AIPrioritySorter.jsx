import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function AIPrioritySorter({ ideas, onSort }) {
  const { t } = useLanguage();

  const calculatePriorityScore = (idea) => {
    const weights = {
      votes: 0.3,
      ai_priority: 0.25,
      recency: 0.2,
      conversion_potential: 0.15,
      engagement: 0.1
    };

    const voteScore = Math.min((idea.vote_count || 0) / 50 * 100, 100);
    const aiScore = idea.ai_classification?.priority_score || 50;
    const daysSince = (Date.now() - new Date(idea.created_date)) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(100 - daysSince * 2, 0);
    const conversionScore = idea.status === 'approved' ? 80 : idea.status === 'under_review' ? 50 : 20;
    const engagementScore = Math.min((idea.comment_count || 0) * 10, 100);

    return (
      voteScore * weights.votes +
      aiScore * weights.ai_priority +
      recencyScore * weights.recency +
      conversionScore * weights.conversion_potential +
      engagementScore * weights.engagement
    );
  };

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