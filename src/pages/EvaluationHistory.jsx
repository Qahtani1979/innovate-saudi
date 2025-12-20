import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { Calendar, User, FileText, Download, Filter, History, Search, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import ProtectedPage from '../components/permissions/ProtectedPage';

function EvaluationHistoryPage() {
  const { language, isRTL, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const entityType = searchParams.get('entity_type') || 'all';
  const entityId = searchParams.get('entity_id');
  
  const [filterEntityType, setFilterEntityType] = useState(entityType);
  const [filterEvaluator, setFilterEvaluator] = useState('all');
  const [filterRecommendation, setFilterRecommendation] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: evaluations = [], isLoading } = useQuery({
    queryKey: ['all-evaluations-history', filterEntityType, entityId],
    queryFn: async () => {
      let query = supabase
        .from('expert_evaluations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filterEntityType && filterEntityType !== 'all') {
        query = query.eq('entity_type', filterEntityType);
      }
      
      if (entityId) {
        query = query.eq('entity_id', entityId);
      }

      const { data, error } = await query.limit(200);
      if (error) throw error;
      return data || [];
    }
  });

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'Entity Type', 'Entity ID', 'Expert', 'Score', 'Recommendation', 'Status'].join(','),
      ...filtered.map(e => [
        format(new Date(e.created_at), 'yyyy-MM-dd'),
        e.entity_type,
        e.entity_id,
        e.evaluator_email,
        e.overall_score,
        e.recommendation?.replace(/_/g, ' '),
        e.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-history-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const entityTypes = ['all', ...new Set(evaluations.map(e => e.entity_type).filter(Boolean))];
  const evaluators = [...new Set(evaluations.map(e => e.evaluator_email).filter(Boolean))];
  const recommendations = [...new Set(evaluations.map(e => e.recommendation).filter(Boolean))];

  const filtered = evaluations.filter(e => {
    const evaluatorMatch = filterEvaluator === 'all' || e.evaluator_email === filterEvaluator;
    const recMatch = filterRecommendation === 'all' || e.recommendation === filterRecommendation;
    const searchMatch = !searchQuery || 
      e.feedback_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.evaluator_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.entity_type?.toLowerCase().includes(searchQuery.toLowerCase());
    return evaluatorMatch && recMatch && searchMatch;
  });

  const getRecommendationColor = (rec) => {
    if (rec?.includes('approve')) return 'bg-green-100 text-green-700';
    if (rec?.includes('reject')) return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  const getEntityTypeColor = (type) => {
    const colors = {
      challenge: 'bg-amber-100 text-amber-700',
      pilot: 'bg-blue-100 text-blue-700',
      solution: 'bg-green-100 text-green-700',
      rd_proposal: 'bg-purple-100 text-purple-700',
      rd_project: 'bg-indigo-100 text-indigo-700',
      program: 'bg-cyan-100 text-cyan-700',
      matchmaker_application: 'bg-pink-100 text-pink-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  // Stats
  const stats = {
    total: evaluations.length,
    approved: evaluations.filter(e => e.recommendation?.includes('approve')).length,
    rejected: evaluations.filter(e => e.recommendation?.includes('reject')).length,
    pending: evaluations.filter(e => e.status === 'pending' || e.status === 'draft').length,
    avgScore: evaluations.length > 0 
      ? Math.round(evaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / evaluations.length)
      : 0
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <History className="h-8 w-8 text-blue-600" />
            {t({ en: 'Evaluation History', ar: 'سجل التقييمات' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Complete history of all expert evaluations across all entities', ar: 'السجل الكامل لجميع تقييمات الخبراء عبر جميع الكيانات' })}
          </p>
        </div>
        <Button onClick={exportHistory} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          {t({ en: 'Export CSV', ar: 'تصدير CSV' })}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">{t({ en: 'Total', ar: 'الإجمالي' })}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-muted-foreground">{t({ en: 'Approved', ar: 'موافق عليها' })}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-muted-foreground">{t({ en: 'Rejected', ar: 'مرفوضة' })}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">{t({ en: 'Pending', ar: 'معلقة' })}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.avgScore}</div>
              <div className="text-sm text-muted-foreground">{t({ en: 'Avg Score', ar: 'متوسط الدرجة' })}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t({ en: 'Search evaluations...', ar: 'بحث في التقييمات...' })}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterEntityType} onValueChange={setFilterEntityType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t({ en: 'Entity Type', ar: 'نوع الكيان' })} />
              </SelectTrigger>
              <SelectContent>
                {entityTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? t({ en: 'All Types', ar: 'كل الأنواع' }) : type.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterEvaluator} onValueChange={setFilterEvaluator}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t({ en: 'Evaluator', ar: 'المقيم' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Evaluators', ar: 'كل المقيمين' })}</SelectItem>
                {evaluators.map(email => (
                  <SelectItem key={email} value={email}>{email?.split('@')[0]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterRecommendation} onValueChange={setFilterRecommendation}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t({ en: 'Recommendation', ar: 'التوصية' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All', ar: 'الكل' })}</SelectItem>
                {recommendations.map(rec => (
                  <SelectItem key={rec} value={rec}>{rec?.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Evaluations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t({ en: 'Evaluations', ar: 'التقييمات' })} ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">
              {t({ en: 'Loading evaluations...', ar: 'جاري تحميل التقييمات...' })}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-slate-300" />
              <p>{t({ en: 'No evaluations found', ar: 'لا توجد تقييمات' })}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((evaluation) => (
                <div key={evaluation.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className={getEntityTypeColor(evaluation.entity_type)}>
                        {evaluation.entity_type?.replace(/_/g, ' ')}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">
                          {evaluation.evaluator_email?.split('@')[0]}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getRecommendationColor(evaluation.recommendation)}>
                        {evaluation.recommendation?.replace(/_/g, ' ') || 'Pending'}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(evaluation.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-xs text-slate-500">Overall Score</p>
                      <p className="text-xl font-bold text-blue-600">{evaluation.overall_score || '-'}/100</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-xs text-slate-500">Feasibility</p>
                      <p className="text-lg font-semibold text-green-600">{evaluation.feasibility_score || evaluation.criteria_scores?.feasibility || '-'}</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-xs text-slate-500">Impact</p>
                      <p className="text-lg font-semibold text-amber-600">{evaluation.impact_score || evaluation.criteria_scores?.impact || '-'}</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-xs text-slate-500">Innovation</p>
                      <p className="text-lg font-semibold text-purple-600">{evaluation.innovation_score || evaluation.criteria_scores?.innovation || '-'}</p>
                    </div>
                  </div>

                  {evaluation.feedback_text && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs font-semibold text-slate-700 mb-1">
                        {t({ en: 'Feedback', ar: 'الملاحظات' })}
                      </p>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {evaluation.feedback_text}
                      </p>
                    </div>
                  )}

                  {(evaluation.strengths?.length > 0 || evaluation.weaknesses?.length > 0) && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {evaluation.strengths?.length > 0 && (
                        <div className="p-2 bg-green-50 rounded border border-green-200">
                          <p className="text-xs font-semibold text-green-900 mb-1">
                            {t({ en: 'Strengths', ar: 'نقاط القوة' })}
                          </p>
                          <ul className="space-y-1">
                            {evaluation.strengths.slice(0, 2).map((s, i) => (
                              <li key={i} className="text-xs text-green-700">• {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {evaluation.weaknesses?.length > 0 && (
                        <div className="p-2 bg-red-50 rounded border border-red-200">
                          <p className="text-xs font-semibold text-red-900 mb-1">
                            {t({ en: 'Weaknesses', ar: 'نقاط الضعف' })}
                          </p>
                          <ul className="space-y-1">
                            {evaluation.weaknesses.slice(0, 2).map((w, i) => (
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
    </div>
  );
}

export default function EvaluationHistory() {
  return (
    <ProtectedPage requiredPermission="expert_evaluate">
      <EvaluationHistoryPage />
    </ProtectedPage>
  );
}
