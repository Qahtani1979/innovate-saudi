import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { Calendar, User, FileText, Download, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function EvaluationHistory({ entityType, entityId }) {
  const { language, isRTL, t } = useLanguage();
  const [filterEvaluator, setFilterEvaluator] = useState('all');
  const [filterRecommendation, setFilterRecommendation] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: evaluations = [], isLoading } = useQuery({
    queryKey: ['evaluation-history', entityType, entityId],
    queryFn: async () => {
      const all = await base44.entities.ExpertEvaluation.list();
      return all.filter(e => 
        e.entity_type === entityType && 
        e.entity_id === entityId &&
        !e.is_deleted
      ).sort((a, b) => new Date(b.evaluation_date) - new Date(a.evaluation_date));
    },
    enabled: !!entityType && !!entityId
  });

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'Expert', 'Score', 'Recommendation', 'Feedback'].join(','),
      ...filtered.map(e => [
        format(new Date(e.evaluation_date), 'yyyy-MM-dd'),
        e.expert_email,
        e.overall_score,
        e.recommendation?.replace(/_/g, ' '),
        `"${(e.feedback_text || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-history-${entityId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const evaluators = [...new Set(evaluations.map(e => e.expert_email))];
  const recommendations = [...new Set(evaluations.map(e => e.recommendation).filter(Boolean))];

  const filtered = evaluations.filter(e => {
    const evaluatorMatch = filterEvaluator === 'all' || e.expert_email === filterEvaluator;
    const recMatch = filterRecommendation === 'all' || e.recommendation === filterRecommendation;
    const searchMatch = !searchQuery || 
      e.feedback_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.expert_email?.toLowerCase().includes(searchQuery.toLowerCase());
    return evaluatorMatch && recMatch && searchMatch;
  });

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading history...</div>;
  }

  const getRecommendationColor = (rec) => {
    if (rec?.includes('approve')) return 'bg-green-100 text-green-700';
    if (rec?.includes('reject')) return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <Card dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {t({ en: 'Evaluation History', ar: 'سجل التقييمات' })} ({evaluations.length})
          </CardTitle>
          <Button onClick={exportHistory} variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            {t({ en: 'Export', ar: 'تصدير' })}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-3">
          <div className="flex-1">
            <Input
              placeholder={t({ en: 'Search feedback...', ar: 'بحث في الملاحظات...' })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm"
            />
          </div>
          <Select value={filterEvaluator} onValueChange={setFilterEvaluator}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t({ en: 'All Evaluators', ar: 'كل المقيمين' })}</SelectItem>
              {evaluators.map(email => (
                <SelectItem key={email} value={email}>{email.split('@')[0]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterRecommendation} onValueChange={setFilterRecommendation}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t({ en: 'All Recommendations', ar: 'كل التوصيات' })}</SelectItem>
              {recommendations.map(rec => (
                <SelectItem key={rec} value={rec}>{rec?.replace(/_/g, ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">{t({ en: 'No evaluations found', ar: 'لا توجد تقييمات' })}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((evaluation, idx) => (
              <div key={evaluation.id || idx} className="p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {evaluation.expert_email?.split('@')[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-500">
                      {format(new Date(evaluation.evaluation_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Overall Score</p>
                    <p className="text-2xl font-bold text-blue-600">{evaluation.overall_score}/100</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Recommendation</p>
                    <Badge className={getRecommendationColor(evaluation.recommendation)}>
                      {evaluation.recommendation?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>

                {evaluation.feedback_text && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-semibold text-slate-700 mb-1">Feedback</p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">
                      {evaluation.feedback_text}
                    </p>
                  </div>
                )}

                {(evaluation.strengths?.length > 0 || evaluation.weaknesses?.length > 0) && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {evaluation.strengths?.length > 0 && (
                      <div className="p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-xs font-semibold text-green-900 mb-1">Strengths</p>
                        <ul className="space-y-1">
                          {evaluation.strengths.map((s, i) => (
                            <li key={i} className="text-xs text-green-700">• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {evaluation.weaknesses?.length > 0 && (
                      <div className="p-2 bg-red-50 rounded border border-red-200">
                        <p className="text-xs font-semibold text-red-900 mb-1">Weaknesses</p>
                        <ul className="space-y-1">
                          {evaluation.weaknesses.map((w, i) => (
                            <li key={i} className="text-xs text-red-700">• {w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}