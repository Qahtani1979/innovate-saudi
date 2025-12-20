import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/components/LanguageContext';
import { useStrategyRecalibration } from '@/hooks/strategy/useStrategyRecalibration';
import {
  Brain, AlertTriangle, CheckCircle2, Lightbulb,
  BarChart3, Users, Cog, FileText, RefreshCw, Target, Layers
} from 'lucide-react';

const CATEGORY_CONFIG = {
  process: { icon: Cog, color: 'blue' },
  technology: { icon: Lightbulb, color: 'purple' },
  people: { icon: Users, color: 'green' },
  policy: { icon: FileText, color: 'amber' }
};

export default function FeedbackAnalysisEngine({ planId }) {
  const { t, language } = useLanguage();
  const { feedbackData, patterns, isLoading } = useStrategyRecalibration(planId);
  const [activeTab, setActiveTab] = useState('overview');

  const categoryStats = useMemo(() => {
    const stats = {};
    Object.entries(patterns.categories || {}).forEach(([cat, lessons]) => {
      stats[cat] = {
        count: lessons.length,
        percentage: Math.round((lessons.length / (feedbackData.lessons?.length || 1)) * 100)
      };
    });
    return stats;
  }, [patterns.categories, feedbackData.lessons]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          {t({ en: 'Feedback Analysis Engine', ar: 'محرك تحليل التغذية الراجعة' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              {t({ en: 'Overview', ar: 'نظرة عامة' })}
            </TabsTrigger>
            <TabsTrigger value="patterns">
              {t({ en: 'Patterns', ar: 'الأنماط' })}
            </TabsTrigger>
            <TabsTrigger value="categories">
              {t({ en: 'Categories', ar: 'الفئات' })}
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              {t({ en: 'Recommendations', ar: 'التوصيات' })}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <Layers className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold">{feedbackData.lessons?.length || 0}</p>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Total Lessons', ar: 'إجمالي الدروس' })}
                </p>
              </div>
              <div className="p-4 bg-blue-100 rounded-lg text-center">
                <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-blue-600">{patterns.patterns?.length || 0}</p>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Patterns Found', ar: 'الأنماط المكتشفة' })}
                </p>
              </div>
              <div className="p-4 bg-green-100 rounded-lg text-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-green-600">{feedbackData.challenges?.length || 0}</p>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Challenges', ar: 'التحديات' })}
                </p>
              </div>
              <div className="p-4 bg-purple-100 rounded-lg text-center">
                <BarChart3 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-purple-600">{feedbackData.pilots?.length || 0}</p>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Pilots', ar: 'المشاريع التجريبية' })}
                </p>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="space-y-3">
              <h3 className="font-medium">{t({ en: 'Lesson Categories', ar: 'فئات الدروس' })}</h3>
              {Object.entries(categoryStats).map(([cat, stats]) => {
                const config = CATEGORY_CONFIG[cat] || { icon: Lightbulb, color: 'gray' };
                const Icon = config.icon;
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 text-${config.color}-600`} />
                    <span className="w-24 text-sm capitalize">{cat}</span>
                    <Progress value={stats.percentage} className="flex-1" />
                    <span className="text-sm font-medium w-12 text-right">{stats.count}</span>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-4 mt-6">
            <p className="text-sm text-muted-foreground mb-4">
              {t({ 
                en: 'Recurring themes identified from lessons learned (appearing 3+ times)', 
                ar: 'المواضيع المتكررة المحددة من الدروس المستفادة (تظهر 3+ مرات)' 
              })}
            </p>
            {patterns.patterns?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patterns.patterns.map((pattern, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="px-3 py-1 text-sm"
                  >
                    {pattern.theme} ({pattern.count})
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {t({ en: 'Not enough data for pattern recognition', ar: 'لا توجد بيانات كافية للتعرف على الأنماط' })}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4 mt-6">
            {Object.entries(patterns.categories || {}).map(([category, lessons]) => {
              const config = CATEGORY_CONFIG[category] || { icon: Lightbulb, color: 'gray' };
              const Icon = config.icon;
              return (
                <div key={category} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`h-5 w-5 text-${config.color}-600`} />
                    <h3 className="font-medium capitalize">{category}</h3>
                    <Badge variant="outline">{lessons.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {lessons.slice(0, 3).map((lesson, idx) => (
                      <div key={idx} className="p-2 bg-muted/50 rounded text-sm">
                        <p className="font-medium">{lesson.lesson}</p>
                        <p className="text-muted-foreground mt-1">
                          {t({ en: 'From:', ar: 'من:' })} {lesson.source_name}
                        </p>
                      </div>
                    ))}
                    {lessons.length > 3 && (
                      <p className="text-sm text-muted-foreground text-center">
                        +{lessons.length - 3} {t({ en: 'more lessons', ar: 'دروس أخرى' })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4 mt-6">
            {patterns.recommendations?.length > 0 ? (
              patterns.recommendations.map((rec, index) => (
                <div 
                  key={index} 
                  className={`p-4 border rounded-lg ${
                    rec.priority === 'high' ? 'border-red-200 bg-red-50' :
                    rec.priority === 'medium' ? 'border-amber-200 bg-amber-50' :
                    'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      rec.priority === 'high' ? 'text-red-600' :
                      rec.priority === 'medium' ? 'text-amber-600' :
                      'text-green-600'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{rec.title}</h4>
                        <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                          {rec.priority}
                        </Badge>
                        <Badge variant="outline">Phase {rec.targetPhase}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {t({ en: 'No critical recommendations at this time', ar: 'لا توجد توصيات حرجة في الوقت الحالي' })}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
