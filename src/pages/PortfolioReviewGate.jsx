import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { CheckCircle2, Clock, Plus, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function PortfolioReviewGate() {
  const { language, isRTL, t } = useLanguage();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [comments, setComments] = useState('');
  const [newReview, setNewReview] = useState({
    quarter: 'Q1',
    year: 2025,
    period: 'Q1 2025'
  });
  const queryClient = useQueryClient();

  const { data: reviews = [] } = useQuery({
    queryKey: ['portfolio-reviews'],
    queryFn: async () => {
      const configs = await base44.entities.PlatformConfig.filter({ category: 'workflow' });
      return configs.filter(c => c.config_key?.startsWith('portfolio_review_'));
    }
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const reviewMutation = useMutation({
    mutationFn: ({ action, review_id, review_data, comments }) => 
      base44.functions.invoke('portfolioReview', { action, review_id, review_data, comments }),
    onSuccess: () => {
      queryClient.invalidateQueries(['portfolio-reviews']);
      setSelectedReview(null);
      setShowCreateForm(false);
      setComments('');
      toast.success(t({ en: 'Review action completed', ar: 'تم إكمال إجراء المراجعة' }));
    }
  });

  const pendingReviews = reviews.filter(r => r.config_value?.status === 'pending');

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '📊 Portfolio Review Gate', ar: '📊 بوابة مراجعة المحفظة' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Quarterly portfolio performance review and strategic decisions', ar: 'مراجعة ربع سنوية للأداء والقرارات الاستراتيجية' })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-10 w-10 text-yellow-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-yellow-600">{pendingReviews.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Pending', ar: 'معلق' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {reviews.filter(r => r.config_value?.status === 'approved').length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <BarChart3 className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{reviews.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Reviews', ar: 'إجمالي المراجعات' })}</p>
          </CardContent>
        </Card>
      </div>

      {!showCreateForm && (
        <Button onClick={() => setShowCreateForm(true)} className="bg-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          {t({ en: 'Create New Review', ar: 'إنشاء مراجعة جديدة' })}
        </Button>
      )}

      {showCreateForm && (
        <Card className="border-2 border-purple-300 bg-purple-50">
          <CardHeader>
            <CardTitle>{t({ en: 'New Portfolio Review', ar: 'مراجعة محفظة جديدة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Quarter', ar: 'الربع' })}</label>
                <Input
                  value={newReview.quarter}
                  onChange={(e) => setNewReview({ ...newReview, quarter: e.target.value, period: `${e.target.value} ${newReview.year}` })}
                  placeholder="Q1"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Year', ar: 'السنة' })}</label>
                <Input
                  type="number"
                  value={newReview.year}
                  onChange={(e) => setNewReview({ ...newReview, year: parseInt(e.target.value), period: `${newReview.quarter} ${e.target.value}` })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => reviewMutation.mutate({ action: 'create', review_data: newReview })}
                className="bg-purple-600"
              >
                {t({ en: 'Create & Notify Reviewers', ar: 'إنشاء وإشعار المراجعين' })}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Pending Reviews', ar: 'المراجعات المعلقة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingReviews.length === 0 ? (
            <p className="text-center text-slate-500 py-8">{t({ en: 'No pending reviews', ar: 'لا توجد مراجعات معلقة' })}</p>
          ) : (
            <div className="space-y-4">
              {pendingReviews.map(review => {
                const reviewData = review.config_value;
                return (
                  <Card key={review.id} className="border-2 border-yellow-200">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{reviewData.review_period}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-xs text-slate-600">{t({ en: 'Challenges', ar: 'تحديات' })}</p>
                              <p className="text-xl font-bold text-blue-600">{reviewData.metrics?.total_challenges || 0}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                              <p className="text-xs text-slate-600">{t({ en: 'Active Pilots', ar: 'تجارب نشطة' })}</p>
                              <p className="text-xl font-bold text-green-600">{reviewData.metrics?.active_pilots || 0}</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                              <p className="text-xs text-slate-600">{t({ en: 'Completed', ar: 'مكتملة' })}</p>
                              <p className="text-xl font-bold text-purple-600">{reviewData.metrics?.completed_pilots || 0}</p>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-lg">
                              <p className="text-xs text-slate-600">{t({ en: 'Active R&D', ar: 'بحوث نشطة' })}</p>
                              <p className="text-xl font-bold text-amber-600">{reviewData.metrics?.active_rd || 0}</p>
                            </div>
                          </div>
                          {selectedReview === review.config_key && (
                            <div className="mt-4 space-y-3">
                              <Textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder={t({ en: 'Review comments and decisions...', ar: 'ملاحظات وقرارات المراجعة...' })}
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => reviewMutation.mutate({ action: 'approve', review_id: review.config_key, comments })}
                                  className="bg-green-600"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  {t({ en: 'Approve Review', ar: 'موافقة المراجعة' })}
                                </Button>
                                <Button
                                  onClick={() => reviewMutation.mutate({ action: 'request_revision', review_id: review.config_key, comments })}
                                  variant="outline"
                                >
                                  {t({ en: 'Request Revision', ar: 'طلب مراجعة' })}
                                </Button>
                                <Button variant="outline" onClick={() => { setSelectedReview(null); setComments(''); }}>
                                  {t({ en: 'Cancel', ar: 'إلغاء' })}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        {!selectedReview && (
                          <Button onClick={() => setSelectedReview(review.config_key)} variant="outline">
                            {t({ en: 'Review', ar: 'مراجعة' })}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}