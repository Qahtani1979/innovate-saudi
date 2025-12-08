import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, Target, Award, Users, Zap, CheckCircle2 } from 'lucide-react';

export default function OrganizationPerformanceMetrics({ organizationId, organizationData }) {
  const { language, isRTL, t } = useLanguage();

  // Mock performance data
  const performanceData = {
    overallScore: 85,
    totalProjects: 24,
    activeProjects: 8,
    completedProjects: 16,
    successRate: 92,
    impactMetrics: {
      citiesServed: 12,
      challengesAddressed: 18,
      peopleImpacted: 145000,
      costSavings: 2.4
    },
    kpis: [
      {
        name_en: 'Project Success Rate',
        name_ar: 'معدل نجاح المشاريع',
        value: 92,
        target: 85,
        trend: 'up',
        status: 'excellent'
      },
      {
        name_en: 'Time to Deployment',
        name_ar: 'الوقت حتى النشر',
        value: 45,
        target: 60,
        unit: 'days',
        trend: 'up',
        status: 'excellent'
      },
      {
        name_en: 'Client Satisfaction',
        name_ar: 'رضا العملاء',
        value: 4.7,
        target: 4.5,
        unit: '/5',
        trend: 'up',
        status: 'excellent'
      },
      {
        name_en: 'Innovation Index',
        name_ar: 'مؤشر الابتكار',
        value: 78,
        target: 75,
        trend: 'stable',
        status: 'good'
      }
    ],
    recentMilestones: [
      {
        title_en: 'Reached 10 Cities',
        title_ar: 'الوصول إلى 10 مدن',
        date: '2025-01-15',
        impact_en: 'Expanded service coverage',
        impact_ar: 'توسيع التغطية الخدمية'
      },
      {
        title_en: '5 Pilots Scaled',
        title_ar: 'توسيع 5 تجارب',
        date: '2025-01-10',
        impact_en: 'Successful national deployment',
        impact_ar: 'نشر وطني ناجح'
      }
    ]
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Performance Score Card */}
      <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            {t({ en: 'Overall Performance Score', ar: 'درجة الأداء الإجمالية' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="text-6xl font-bold text-blue-600">{performanceData.overallScore}</div>
              <p className="text-center text-sm text-slate-600 mt-2">{t({ en: 'out of 100', ar: 'من 100' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">{performanceData.totalProjects}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Total Projects', ar: 'إجمالي المشاريع' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">{performanceData.activeProjects}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Active Projects', ar: 'مشاريع نشطة' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">{performanceData.completedProjects}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">{performanceData.successRate}%</p>
              <p className="text-xs text-slate-600">{t({ en: 'Success Rate', ar: 'معدل النجاح' })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Key Performance Indicators', ar: 'مؤشرات الأداء الرئيسية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.kpis.map((kpi, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{language === 'ar' ? kpi.name_ar : kpi.name_en}</p>
                    <Badge className={
                      kpi.status === 'excellent' ? 'bg-green-100 text-green-700' :
                      kpi.status === 'good' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }>
                      {kpi.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-slate-900">{kpi.value}{kpi.unit || ''}</span>
                    <TrendingUp className={`h-4 w-4 ${kpi.trend === 'up' ? 'text-green-600' : 'text-slate-400'}`} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={(kpi.value / kpi.target) * 100} className="h-2 flex-1" />
                  <span className="text-xs text-slate-600">{t({ en: 'Target', ar: 'الهدف' })}: {kpi.target}{kpi.unit || ''}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impact Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t({ en: 'Impact Metrics', ar: 'مقاييس التأثير' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200 text-center">
              <p className="text-3xl font-bold text-blue-600">{performanceData.impactMetrics.citiesServed}</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'Cities Served', ar: 'مدن مخدومة' })}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-200 text-center">
              <p className="text-3xl font-bold text-purple-600">{performanceData.impactMetrics.challengesAddressed}</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'Challenges Addressed', ar: 'تحديات معالجة' })}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-200 text-center">
              <p className="text-3xl font-bold text-green-600">{(performanceData.impactMetrics.peopleImpacted / 1000).toFixed(0)}K</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'People Impacted', ar: 'أشخاص متأثرين' })}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-50 to-white rounded-lg border border-amber-200 text-center">
              <p className="text-3xl font-bold text-amber-600">{performanceData.impactMetrics.costSavings}M</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'Cost Savings (SAR)', ar: 'وفورات التكلفة (ر.س)' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Recent Milestones', ar: 'إنجازات حديثة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {performanceData.recentMilestones.map((milestone, i) => (
              <div key={i} className="p-4 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-green-900">{language === 'ar' ? milestone.title_ar : milestone.title_en}</h4>
                    <p className="text-sm text-slate-600 mt-1">{language === 'ar' ? milestone.impact_ar : milestone.impact_en}</p>
                  </div>
                  <Badge variant="outline">{new Date(milestone.date).toLocaleDateString()}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}