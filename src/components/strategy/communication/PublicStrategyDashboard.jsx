import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/components/LanguageContext';
import { 
  BarChart3, Target, TrendingUp, CheckCircle2, Clock, 
  AlertTriangle, Activity, Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

export default function PublicStrategyDashboard() {
  const { t, language } = useLanguage();

  const dashboardData = {
    overallProgress: 62,
    lastUpdated: '2024-01-20',
    kpis: [
      { 
        name: language === 'ar' ? 'معدل الابتكار' : 'Innovation Rate',
        current: 18,
        target: 25,
        unit: '%',
        trend: 'up',
        change: '+3%'
      },
      { 
        name: language === 'ar' ? 'التحول الرقمي' : 'Digital Adoption',
        current: 72,
        target: 100,
        unit: '%',
        trend: 'up',
        change: '+8%'
      },
      { 
        name: language === 'ar' ? 'رضا المواطنين' : 'Citizen Satisfaction',
        current: 4.2,
        target: 4.5,
        unit: '/5',
        trend: 'up',
        change: '+0.3'
      },
      { 
        name: language === 'ar' ? 'كفاءة الإنفاق' : 'Budget Efficiency',
        current: 89,
        target: 95,
        unit: '%',
        trend: 'down',
        change: '-2%'
      }
    ],
    milestones: [
      { name: language === 'ar' ? 'إطلاق البوابة الرقمية' : 'Digital Portal Launch', status: 'completed', date: '2023-06-15' },
      { name: language === 'ar' ? 'برنامج تدريب الموظفين' : 'Staff Training Program', status: 'completed', date: '2023-09-30' },
      { name: language === 'ar' ? 'إطلاق المختبرات الحية' : 'Living Labs Launch', status: 'in_progress', date: '2024-03-01' },
      { name: language === 'ar' ? 'توسيع الشراكات' : 'Partnership Expansion', status: 'upcoming', date: '2024-06-15' },
      { name: language === 'ar' ? 'التقييم السنوي' : 'Annual Review', status: 'upcoming', date: '2024-12-31' }
    ],
    objectives: [
      { name: language === 'ar' ? 'تحسين الخدمات الرقمية' : 'Enhance Digital Services', progress: 72, status: 'on_track' },
      { name: language === 'ar' ? 'تعزيز الشراكات' : 'Strengthen Partnerships', progress: 55, status: 'on_track' },
      { name: language === 'ar' ? 'تطوير القدرات' : 'Capacity Building', progress: 48, status: 'at_risk' },
      { name: language === 'ar' ? 'الابتكار المستدام' : 'Sustainable Innovation', progress: 65, status: 'on_track' }
    ],
    activityFeed: [
      { type: 'milestone', message: language === 'ar' ? 'تم إكمال المرحلة الثانية من التحول الرقمي' : 'Digital Transformation Phase 2 Completed', date: '2024-01-18' },
      { type: 'kpi', message: language === 'ar' ? 'تحسن معدل رضا المواطنين بنسبة 5%' : 'Citizen Satisfaction improved by 5%', date: '2024-01-15' },
      { type: 'partnership', message: language === 'ar' ? 'توقيع شراكة جديدة مع شركة تقنية' : 'New partnership signed with tech company', date: '2024-01-10' }
    ]
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'upcoming': return <Calendar className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  };

  const getObjectiveStatusColor = (status) => {
    switch (status) {
      case 'on_track': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'at_risk': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'off_track': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {t({ en: 'Strategy Progress Dashboard', ar: 'لوحة متابعة تقدم الاستراتيجية' })}
              </h1>
              <p className="opacity-80">
                {t({ en: 'Real-time tracking of strategic objectives and KPIs', ar: 'متابعة حية للأهداف الاستراتيجية ومؤشرات الأداء' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-70">{t({ en: 'Last Updated', ar: 'آخر تحديث' })}</p>
              <p className="font-semibold">{dashboardData.lastUpdated}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl py-8 px-4 space-y-8">
        {/* Overall Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold">{t({ en: 'Overall Strategy Progress', ar: 'تقدم الاستراتيجية الكلي' })}</h2>
              </div>
              <span className="text-3xl font-bold text-primary">{dashboardData.overallProgress}%</span>
            </div>
            <Progress value={dashboardData.overallProgress} className="h-4" />
          </CardContent>
        </Card>

        {/* KPIs Grid */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t({ en: 'Key Performance Indicators', ar: 'مؤشرات الأداء الرئيسية' })}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dashboardData.kpis.map((kpi, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-2">{kpi.name}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-bold">{kpi.current}</span>
                      <span className="text-muted-foreground">{kpi.unit}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {kpi.change}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{t({ en: 'Progress', ar: 'التقدم' })}</span>
                      <span>{t({ en: 'Target:', ar: 'الهدف:' })} {kpi.target}{kpi.unit}</span>
                    </div>
                    <Progress value={(kpi.current / kpi.target) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Objectives Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {t({ en: 'Strategic Objectives', ar: 'الأهداف الاستراتيجية' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.objectives.map((objective, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{objective.name}</span>
                    <Badge className={getObjectiveStatusColor(objective.status)}>
                      {objective.status === 'on_track' 
                        ? t({ en: 'On Track', ar: 'على المسار' })
                        : objective.status === 'at_risk'
                        ? t({ en: 'At Risk', ar: 'في خطر' })
                        : t({ en: 'Off Track', ar: 'خارج المسار' })
                      }
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={objective.progress} className="h-2 flex-1" />
                    <span className="text-sm text-muted-foreground w-10">{objective.progress}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {t({ en: 'Key Milestones', ar: 'المعالم الرئيسية' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {getStatusIcon(milestone.status)}
                    <div className="flex-1">
                      <p className={`font-medium ${milestone.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                        {milestone.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{milestone.date}</p>
                    </div>
                    <Badge variant={milestone.status === 'completed' ? 'secondary' : 'outline'}>
                      {milestone.status === 'completed' 
                        ? t({ en: 'Done', ar: 'مكتمل' })
                        : milestone.status === 'in_progress'
                        ? t({ en: 'Active', ar: 'نشط' })
                        : t({ en: 'Upcoming', ar: 'قادم' })
                      }
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {t({ en: 'Recent Activity', ar: 'النشاط الأخير' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.activityFeed.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p>{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
