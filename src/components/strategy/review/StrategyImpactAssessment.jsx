import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/components/LanguageContext';
import { 
  BarChart3, TrendingUp, TrendingDown, Minus, 
  Download, RefreshCw, Target, Leaf, Building2, Users, Lightbulb
} from 'lucide-react';

export default function StrategyImpactAssessment({ planId }) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  const impactData = {
    overall: {
      score: 72,
      trend: 'up',
      change: '+5%'
    },
    dimensions: [
      {
        id: 'economic',
        name: language === 'ar' ? 'الأثر الاقتصادي' : 'Economic Impact',
        icon: TrendingUp,
        score: 78,
        target: 85,
        trend: 'up',
        metrics: [
          { name: language === 'ar' ? 'خلق فرص العمل' : 'Job Creation', value: 1250, target: 1500, unit: '' },
          { name: language === 'ar' ? 'الاستثمارات المستقطبة' : 'Investments Attracted', value: 45, target: 60, unit: 'M SAR' },
          { name: language === 'ar' ? 'نمو الناتج المحلي' : 'GDP Contribution', value: 2.3, target: 3.0, unit: '%' }
        ]
      },
      {
        id: 'social',
        name: language === 'ar' ? 'الأثر الاجتماعي' : 'Social Impact',
        icon: Users,
        score: 75,
        target: 80,
        trend: 'up',
        metrics: [
          { name: language === 'ar' ? 'رضا المواطنين' : 'Citizen Satisfaction', value: 4.2, target: 4.5, unit: '/5' },
          { name: language === 'ar' ? 'المشاركة المجتمعية' : 'Community Engagement', value: 68, target: 80, unit: '%' },
          { name: language === 'ar' ? 'جودة الخدمات' : 'Service Quality', value: 82, target: 90, unit: '%' }
        ]
      },
      {
        id: 'environmental',
        name: language === 'ar' ? 'الأثر البيئي' : 'Environmental Impact',
        icon: Leaf,
        score: 65,
        target: 75,
        trend: 'stable',
        metrics: [
          { name: language === 'ar' ? 'خفض الانبعاثات' : 'Emission Reduction', value: 12, target: 20, unit: '%' },
          { name: language === 'ar' ? 'كفاءة الطاقة' : 'Energy Efficiency', value: 18, target: 25, unit: '%' },
          { name: language === 'ar' ? 'المبادرات الخضراء' : 'Green Initiatives', value: 15, target: 25, unit: '' }
        ]
      },
      {
        id: 'institutional',
        name: language === 'ar' ? 'الأثر المؤسسي' : 'Institutional Impact',
        icon: Building2,
        score: 70,
        target: 80,
        trend: 'up',
        metrics: [
          { name: language === 'ar' ? 'كفاءة العمليات' : 'Process Efficiency', value: 35, target: 50, unit: '%' },
          { name: language === 'ar' ? 'التحول الرقمي' : 'Digital Adoption', value: 72, target: 90, unit: '%' },
          { name: language === 'ar' ? 'التعاون بين الجهات' : 'Cross-Agency Collaboration', value: 28, target: 40, unit: '' }
        ]
      },
      {
        id: 'innovation',
        name: language === 'ar' ? 'أثر القدرة الابتكارية' : 'Innovation Capacity Impact',
        icon: Lightbulb,
        score: 74,
        target: 85,
        trend: 'up',
        metrics: [
          { name: language === 'ar' ? 'براءات الاختراع' : 'Patents Filed', value: 45, target: 60, unit: '' },
          { name: language === 'ar' ? 'المشاريع التجريبية' : 'Pilots Launched', value: 32, target: 50, unit: '' },
          { name: language === 'ar' ? 'الحلول المبتكرة' : 'Innovative Solutions', value: 78, target: 100, unit: '' }
        ]
      }
    ]
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getScoreColor = (score, target) => {
    const percentage = (score / target) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{t({ en: 'Overall Impact Score', ar: 'نتيجة الأثر الكلي' })}</h2>
                <p className="text-muted-foreground">{t({ en: 'Comprehensive assessment across all dimensions', ar: 'تقييم شامل عبر جميع الأبعاد' })}</p>
              </div>
            </div>
            <div className="text-right flex items-center gap-4">
              <div>
                <span className="text-4xl font-bold text-primary">{impactData.overall.score}</span>
                <span className="text-2xl text-muted-foreground">/100</span>
                <div className="flex items-center justify-end gap-1 mt-1">
                  {getTrendIcon(impactData.overall.trend)}
                  <span className="text-sm text-green-600">{impactData.overall.change}</span>
                </div>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                {t({ en: 'Export Report', ar: 'تصدير التقرير' })}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimensions */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">{t({ en: 'Overview', ar: 'نظرة عامة' })}</TabsTrigger>
          {impactData.dimensions.map(dim => (
            <TabsTrigger key={dim.id} value={dim.id}>
              {dim.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {impactData.dimensions.map(dim => {
              const DimIcon = dim.icon;
              return (
                <Card key={dim.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveTab(dim.id)}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <DimIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{dim.name}</p>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(dim.trend)}
                          <span className="text-xs text-muted-foreground">
                            {t({ en: 'Target:', ar: 'الهدف:' })} {dim.target}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className={`text-3xl font-bold ${getScoreColor(dim.score, dim.target)}`}>
                        {dim.score}
                      </span>
                      <Progress value={(dim.score / dim.target) * 100} className="w-24 h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {impactData.dimensions.map(dim => (
          <TabsContent key={dim.id} value={dim.id} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(dim.icon, { className: 'h-5 w-5 text-primary' })}
                  {dim.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {dim.metrics.map((metric, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">{metric.name}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">{metric.value}</span>
                        <span className="text-muted-foreground">{metric.unit}</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{t({ en: 'Progress', ar: 'التقدم' })}</span>
                          <span>{t({ en: 'Target:', ar: 'الهدف:' })} {metric.target}{metric.unit}</span>
                        </div>
                        <Progress value={(metric.value / metric.target) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
