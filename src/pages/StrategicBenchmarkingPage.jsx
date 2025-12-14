import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { 
  Globe, TrendingUp, BarChart3, Target, ArrowUpRight, 
  ArrowDownRight, Building2, RefreshCw
} from 'lucide-react';

function StrategicBenchmarkingPage() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('global');

  const benchmarkData = {
    global: [
      { 
        country: language === 'ar' ? 'سنغافورة' : 'Singapore',
        score: 92,
        rank: 1,
        trend: 'stable',
        strengths: ['Digital Infrastructure', 'Smart City', 'Innovation Ecosystem']
      },
      { 
        country: language === 'ar' ? 'الإمارات' : 'UAE',
        score: 88,
        rank: 2,
        trend: 'up',
        strengths: ['Government Services', 'AI Adoption', 'Future Readiness']
      },
      { 
        country: language === 'ar' ? 'إستونيا' : 'Estonia',
        score: 85,
        rank: 3,
        trend: 'stable',
        strengths: ['E-Governance', 'Digital Identity', 'Startup Ecosystem']
      },
      { 
        country: language === 'ar' ? 'كوريا الجنوبية' : 'South Korea',
        score: 84,
        rank: 4,
        trend: 'up',
        strengths: ['5G Infrastructure', 'R&D Investment', 'Smart Manufacturing']
      },
      { 
        country: language === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia',
        score: 78,
        rank: 8,
        trend: 'up',
        strengths: ['Vision 2030', 'NEOM', 'Digital Transformation']
      }
    ],
    regional: [
      { municipality: language === 'ar' ? 'الرياض' : 'Riyadh', score: 85, rank: 1, trend: 'up' },
      { municipality: language === 'ar' ? 'جدة' : 'Jeddah', score: 78, rank: 2, trend: 'up' },
      { municipality: language === 'ar' ? 'الدمام' : 'Dammam', score: 74, rank: 3, trend: 'stable' },
      { municipality: language === 'ar' ? 'مكة المكرمة' : 'Makkah', score: 72, rank: 4, trend: 'up' },
      { municipality: language === 'ar' ? 'المدينة المنورة' : 'Madinah', score: 70, rank: 5, trend: 'stable' }
    ],
    dimensions: [
      { name: language === 'ar' ? 'البنية التحتية الرقمية' : 'Digital Infrastructure', ourScore: 75, benchmark: 85, gap: -10 },
      { name: language === 'ar' ? 'رأس المال البشري' : 'Human Capital', ourScore: 72, benchmark: 80, gap: -8 },
      { name: language === 'ar' ? 'الابتكار' : 'Innovation', ourScore: 68, benchmark: 82, gap: -14 },
      { name: language === 'ar' ? 'الخدمات الحكومية' : 'Government Services', ourScore: 80, benchmark: 88, gap: -8 },
      { name: language === 'ar' ? 'الاستدامة' : 'Sustainability', ourScore: 65, benchmark: 78, gap: -13 }
    ]
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <span className="h-4 w-4 text-muted-foreground">—</span>;
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            {t({ en: 'Strategic Benchmarking', ar: 'المقارنة المعيارية الاستراتيجية' })}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t({ en: 'Compare performance against global and regional benchmarks', ar: 'مقارنة الأداء مع المعايير العالمية والإقليمية' })}
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t({ en: 'Refresh Data', ar: 'تحديث البيانات' })}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {t({ en: 'Global Comparison', ar: 'المقارنة العالمية' })}
          </TabsTrigger>
          <TabsTrigger value="regional" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {t({ en: 'Regional Comparison', ar: 'المقارنة الإقليمية' })}
          </TabsTrigger>
          <TabsTrigger value="dimensions" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t({ en: 'Dimension Analysis', ar: 'تحليل الأبعاد' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          <div className="grid gap-4">
            {benchmarkData.global.map((item, index) => (
              <Card key={index} className={item.country.includes('Saudi') || item.country.includes('السعودية') ? 'border-primary' : ''}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                        #{item.rank}
                      </div>
                      <div>
                        <p className="font-semibold">{item.country}</p>
                        <div className="flex gap-1 mt-1">
                          {item.strengths.slice(0, 3).map((s, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold">{item.score}</p>
                        <p className="text-xs text-muted-foreground">{t({ en: 'Score', ar: 'النتيجة' })}</p>
                      </div>
                      {getTrendIcon(item.trend)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <div className="grid gap-4">
            {benchmarkData.regional.map((item, index) => (
              <Card key={index}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                        #{item.rank}
                      </div>
                      <p className="font-semibold">{item.municipality}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <Progress value={item.score} className="h-2" />
                      </div>
                      <div className="text-right w-16">
                        <p className="text-xl font-bold">{item.score}</p>
                      </div>
                      {getTrendIcon(item.trend)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dimensions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {t({ en: 'Gap Analysis by Dimension', ar: 'تحليل الفجوات حسب البُعد' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {benchmarkData.dimensions.map((dim, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{dim.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">
                        {t({ en: 'Our Score:', ar: 'نتيجتنا:' })} <span className="font-bold">{dim.ourScore}</span>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {t({ en: 'Benchmark:', ar: 'المعيار:' })} {dim.benchmark}
                      </span>
                      <Badge variant={dim.gap >= 0 ? 'default' : 'secondary'}>
                        {dim.gap > 0 ? '+' : ''}{dim.gap}
                      </Badge>
                    </div>
                  </div>
                  <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="absolute h-full bg-primary/30 rounded-full"
                      style={{ width: `${dim.benchmark}%` }}
                    />
                    <div 
                      className="absolute h-full bg-primary rounded-full"
                      style={{ width: `${dim.ourScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(StrategicBenchmarkingPage, { requiredPermissions: ['strategy_manage'] });
