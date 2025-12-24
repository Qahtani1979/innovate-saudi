import { useState } from 'react';

import { useServiceQuality } from '@/hooks/useServiceQuality';
import { useMatchingEntities } from '@/hooks/useMatchingEntities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import {
  Target, TrendingUp, TrendingDown, AlertCircle, Star, Users, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { toast } from 'sonner';

function ServiceQualityDashboard() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState(null);
  const [ratingData, setRatingData] = useState({ rating: 5, comment: '' });

  const { useServices, useServicePerformance, useCitizenFeedback, useSubmitRating } = useServiceQuality();
  const { useChallenges } = useMatchingEntities();

  const { data: services = [] } = useServices();
  const { data: servicePerformance = [] } = useServicePerformance();
  const { data: challenges = [] } = useChallenges({ limit: 2000 });
  const { data: citizenFeedback = [] } = useCitizenFeedback();

  const submitRatingMutation = useSubmitRating();

  const handleSubmitRating = (data) => {
    submitRatingMutation.mutate({
      serviceId: selectedService.id,
      rating: data.rating,
      comment: data.comment,
      municipalityId: selectedService.municipality_id
    }, {
      onSuccess: () => {
        setSelectedService(null);
        setRatingData({ rating: 5, comment: '' });
      }
    });
  };

  // Calculate service metrics
  const serviceMetrics = services.map(service => {
    const performance = servicePerformance.filter(p => p.service_id === service.id);
    const serviceChallenges = challenges.filter(c =>
      c.service_id === service.id || c.affected_services?.includes(service.id)
    );
    const feedback = citizenFeedback.filter(f => f.service_id === service.id);

    const avgSatisfaction = feedback.length > 0
      ? feedback.reduce((sum, f) => sum + (f.satisfaction_score || 0), 0) / feedback.length
      : service.satisfaction_score || 0;

    const latestPerformance = performance.sort((a, b) =>
      new Date(b.period_end) - new Date(a.period_end)
    )[0];

    const openChallenges = serviceChallenges.filter(c => !['resolved', 'archived'].includes(c.status)).length;
    const resolvedChallenges = serviceChallenges.filter(c => c.status === 'resolved').length;

    return {
      ...service,
      avgSatisfaction: Math.round(avgSatisfaction),
      totalFeedback: feedback.length,
      openChallenges,
      resolvedChallenges,
      totalChallenges: serviceChallenges.length,
      resolutionRate: serviceChallenges.length > 0
        ? Math.round((resolvedChallenges / serviceChallenges.length) * 100)
        : 0,
      slaCompliance: latestPerformance?.sla_compliance_rate || 0,
      qualityScore: latestPerformance?.quality_score ||
        Math.round((avgSatisfaction / 5 * 100 * 0.6) + ((latestPerformance?.sla_compliance_rate || 50) * 0.4)),
      trend: latestPerformance?.trend || 'stable'
    };
  });

  const overallStats = {
    avgSatisfaction: Math.round(serviceMetrics.reduce((sum, s) => sum + s.avgSatisfaction, 0) / Math.max(serviceMetrics.length, 1)),
    avgQuality: Math.round(serviceMetrics.reduce((sum, s) => sum + s.qualityScore, 0) / Math.max(serviceMetrics.length, 1)),
    totalFeedback: citizenFeedback.length,
    servicesWithIssues: serviceMetrics.filter(s => s.openChallenges > 0).length,
    improving: serviceMetrics.filter(s => s.trend === 'improving').length,
    declining: serviceMetrics.filter(s => s.trend === 'declining').length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
          {t({ en: '📊 Service Quality Dashboard', ar: '📊 لوحة جودة الخدمات' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Monitor service quality, citizen satisfaction, and SLA compliance', ar: 'مراقبة جودة الخدمات ورضا المواطنين والامتثال لاتفاقية مستوى الخدمة' })}
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{services.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Services', ar: 'خدمات' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Star className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{overallStats.avgSatisfaction}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg Satisfaction', ar: 'متوسط الرضا' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{overallStats.avgQuality}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg Quality', ar: 'متوسط الجودة' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{overallStats.totalFeedback}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Ratings', ar: 'تقييمات' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{overallStats.improving}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Improving', ar: 'يتحسن' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{overallStats.servicesWithIssues}</p>
            <p className="text-xs text-slate-600">{t({ en: 'With Issues', ar: 'بها مشاكل' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Service Quality Metrics', ar: 'مقاييس جودة الخدمات' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {serviceMetrics.sort((a, b) => a.qualityScore - b.qualityScore).map((service) => (
              <div key={service.id} className="p-4 border-2 rounded-lg hover:border-blue-300 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-slate-900">{language === 'ar' && service.name_ar ? service.name_ar : service.name_en}</h3>
                      <Badge className={
                        service.qualityScore >= 80 ? 'bg-green-600' :
                          service.qualityScore >= 60 ? 'bg-blue-600' :
                            service.qualityScore >= 40 ? 'bg-amber-600' : 'bg-red-600'
                      }>
                        {service.qualityScore}% Quality
                      </Badge>
                      {service.trend === 'improving' && <TrendingUp className="h-4 w-4 text-green-600" />}
                      {service.trend === 'declining' && <TrendingDown className="h-4 w-4 text-red-600" />}
                    </div>
                    <p className="text-sm text-slate-600">{service.description_en || service.description_ar}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedService(service)}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {t({ en: 'Rate', ar: 'تقييم' })}
                  </Button>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-amber-50 rounded">
                    <p className="text-2xl font-bold text-amber-600">{service.avgSatisfaction}%</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Satisfaction', ar: 'الرضا' })}</p>
                    <p className="text-xs text-slate-500 mt-1">{service.totalFeedback} {t({ en: 'ratings', ar: 'تقييم' })}</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <p className="text-2xl font-bold text-blue-600">{service.slaCompliance}%</p>
                    <p className="text-xs text-slate-600">{t({ en: 'SLA', ar: 'مستوى الخدمة' })}</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded">
                    <p className="text-2xl font-bold text-orange-600">{service.openChallenges}</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Open Issues', ar: 'مشاكل مفتوحة' })}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <p className="text-2xl font-bold text-green-600">{service.resolvedChallenges}</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Resolved', ar: 'محلولة' })}</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded">
                    <p className="text-2xl font-bold text-purple-600">{service.resolutionRate}%</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Resolution', ar: 'الحل' })}</p>
                  </div>
                </div>

                {service.openChallenges > 0 && (
                  <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                    <p className="text-sm font-semibold text-red-900 mb-2">
                      {t({ en: 'Active Issues:', ar: 'المشاكل النشطة:' })}
                    </p>
                    <div className="space-y-1">
                      {challenges
                        .filter(c => (c.service_id === service.id || c.affected_services?.includes(service.id)) && !['resolved', 'archived'].includes(c.status))
                        .slice(0, 3)
                        .map(c => (
                          <Link key={c.id} to={createPageUrl(`ChallengeDetail?id=${c.id}`)}>
                            <div className="text-xs text-red-700 hover:text-red-900 cursor-pointer">
                              • {c.code}: {language === 'ar' && c.title_ar ? c.title_ar : c.title_en}
                            </div>
                          </Link>
                        ))
                      }
                    </div>
                  </div>
                )}

                <Progress value={service.qualityScore} className="mt-3 h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rating Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedService(null)}>
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-600" />
                {t({ en: 'Rate Service', ar: 'تقييم الخدمة' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  {language === 'ar' && selectedService.name_ar ? selectedService.name_ar : selectedService.name_en}
                </h3>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-2">{t({ en: 'Your Rating', ar: 'تقييمك' })}</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setRatingData(prev => ({ ...prev, rating }))}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${ratingData.rating >= rating
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 hover:border-amber-300'
                        }`}
                    >
                      <Star className={`h-6 w-6 mx-auto ${ratingData.rating >= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                      <p className="text-xs text-slate-600 mt-1">{rating}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-2">{t({ en: 'Comment (Optional)', ar: 'تعليق (اختياري)' })}</p>
                <Input
                  placeholder={t({ en: 'Share your experience...', ar: 'شارك تجربتك...' })}
                  value={ratingData.comment}
                  onChange={(e) => setRatingData(prev => ({ ...prev, comment: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleSubmitRating(ratingData)}
                  disabled={submitRatingMutation.isPending}
                  className="flex-1 bg-blue-600"
                >
                  {t({ en: 'Submit Rating', ar: 'إرسال التقييم' })}
                </Button>
                <Button
                  onClick={() => setSelectedService(null)}
                  variant="outline"
                  className="flex-1"
                >
                  {t({ en: 'Cancel', ar: 'إلغاء' })}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ProtectedPage(ServiceQualityDashboard, { requiredPermissions: ['challenge_view_all'] });