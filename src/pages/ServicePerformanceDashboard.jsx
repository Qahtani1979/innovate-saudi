import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { AlertCircle, CheckCircle2,
  Target, Activity, Users, FileText
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ServicePerformanceDashboard() {
  const { language, isRTL, t } = useLanguage();
  const [selectedSector, setSelectedSector] = useState('all');

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-by-service'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-by-service'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: citizenFeedback = [] } = useQuery({
    queryKey: ['citizen-feedback'],
    queryFn: () => base44.entities.CitizenFeedback.list()
  });

  // Calculate service metrics
  const serviceMetrics = services.map(service => {
    const serviceChallenges = challenges.filter(c => 
      c.service_id === service.id || c.affected_services?.includes(service.id)
    );
    const servicePilots = pilots.filter(p => p.service_id === service.id);
    const serviceFeedback = citizenFeedback.filter(f => f.service_id === service.id);

    const openChallenges = serviceChallenges.filter(c => !['resolved', 'archived'].includes(c.status)).length;
    const resolvedChallenges = serviceChallenges.filter(c => c.status === 'resolved').length;
    const activePilots = servicePilots.filter(p => ['active', 'monitoring'].includes(p.stage)).length;

    const avgSatisfaction = serviceFeedback.length > 0
      ? serviceFeedback.reduce((sum, f) => sum + (f.satisfaction_score || 0), 0) / serviceFeedback.length
      : 0;

    const resolutionRate = serviceChallenges.length > 0
      ? (resolvedChallenges / serviceChallenges.length) * 100
      : 0;

    return {
      ...service,
      totalChallenges: serviceChallenges.length,
      openChallenges,
      resolvedChallenges,
      activePilots,
      resolutionRate,
      avgSatisfaction,
      healthScore: Math.round((resolutionRate * 0.6) + (avgSatisfaction * 0.4))
    };
  });

  const filteredServices = selectedSector === 'all' 
    ? serviceMetrics 
    : serviceMetrics.filter(s => s.sector_id === selectedSector);

  const sectors = [...new Set(services.map(s => s.sector_id))];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
          {t({ en: '📊 Service Performance Dashboard', ar: '📊 لوحة أداء الخدمات' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Monitor service quality, challenges, and citizen satisfaction across all municipal services', ar: 'مراقبة جودة الخدمات والتحديات ورضا المواطنين' })}
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{services.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Services', ar: 'إجمالي الخدمات' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-orange-600">
              {serviceMetrics.reduce((sum, s) => sum + s.openChallenges, 0)}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Open Challenges', ar: 'تحديات مفتوحة' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">
              {serviceMetrics.reduce((sum, s) => sum + s.activePilots, 0)}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Active Pilots', ar: 'تجارب نشطة' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {Math.round(serviceMetrics.reduce((sum, s) => sum + s.resolutionRate, 0) / Math.max(serviceMetrics.length, 1))}%
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg Resolution', ar: 'متوسط الحل' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-teal-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-teal-600">
              {citizenFeedback.length > 0
                ? Math.round(citizenFeedback.reduce((sum, f) => sum + (f.satisfaction_score || 0), 0) / citizenFeedback.length)
                : 0}%
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Satisfaction', ar: 'الرضا' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Service List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            {t({ en: 'Service Performance Tracking', ar: 'تتبع أداء الخدمات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredServices.sort((a, b) => a.healthScore - b.healthScore).map((service) => (
              <div key={service.id} className="p-4 border-2 rounded-lg hover:border-blue-300 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{service.name_en || service.name_ar}</h3>
                    <p className="text-xs text-slate-600 mt-1">{service.description_en || service.description_ar}</p>
                  </div>
                  <Badge className={
                    service.healthScore >= 80 ? 'bg-green-600' :
                    service.healthScore >= 60 ? 'bg-blue-600' :
                    service.healthScore >= 40 ? 'bg-amber-600' : 'bg-red-600'
                  }>
                    {service.healthScore}% Health
                  </Badge>
                </div>

                <div className="grid grid-cols-5 gap-4 mb-3">
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <p className="text-xl font-bold text-orange-600">{service.openChallenges}</p>
                    <p className="text-xs text-slate-600">Open Issues</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="text-xl font-bold text-green-600">{service.resolvedChallenges}</p>
                    <p className="text-xs text-slate-600">Resolved</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <p className="text-xl font-bold text-purple-600">{service.activePilots}</p>
                    <p className="text-xs text-slate-600">Pilots</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="text-xl font-bold text-blue-600">{Math.round(service.resolutionRate)}%</p>
                    <p className="text-xs text-slate-600">Resolution</p>
                  </div>
                  <div className="text-center p-2 bg-teal-50 rounded">
                    <p className="text-xl font-bold text-teal-600">{Math.round(service.avgSatisfaction)}%</p>
                    <p className="text-xs text-slate-600">Satisfaction</p>
                  </div>
                </div>

                <Progress value={service.healthScore} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ServicePerformanceDashboard, { requiredPermissions: ['challenge_view_all'] });