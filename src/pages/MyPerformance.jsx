import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../components/LanguageContext';
import { Award, Target, Zap, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import { Skeleton } from "@/components/ui/skeleton";

function MyPerformance() {
  const { language, isRTL, t } = useLanguage();
  const { metrics, monthlyActivity, isLoading } = useUserAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" /><Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'My Performance & Impact', ar: 'أدائي وتأثيري' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Track your contributions and achievements', ar: 'تتبع مساهماتك وإنجازاتك' })}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{metrics.challengesCount}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Challenges Created', ar: 'تحديات منشأة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{metrics.pilotsCount}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Pilots Launched', ar: 'تجارب مطلقة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{metrics.completionRate}%</p>
            <p className="text-sm text-slate-600">{t({ en: 'Task Completion', ar: 'إكمال المهام' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <Award className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{metrics.impactScore}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Impact Score', ar: 'درجة التأثير' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Contribution Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Monthly Activity', ar: 'النشاط الشهري' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="challenges" fill="#3b82f6" name={t({ en: 'Challenges', ar: 'تحديات' })} />
                <Bar dataKey="pilots" fill="#a855f7" name={t({ en: 'Pilots', ar: 'تجارب' })} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Success Metrics', ar: 'مقاييس النجاح' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">{t({ en: 'Challenge→Pilot Conversion', ar: 'تحويل التحدي→التجربة' })}</span>
                <span className="text-sm font-bold text-slate-900">
                  {metrics.challengeConversionRate}%
                </span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${metrics.challengeConversionRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">{t({ en: 'Pilot Success Rate', ar: 'معدل نجاح التجارب' })}</span>
                <span className="text-sm font-bold text-slate-900">
                  {metrics.pilotSuccessRate}%
                </span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600"
                  style={{ width: `${metrics.pilotSuccessRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">{t({ en: 'On-Time Delivery', ar: 'التسليم في الوقت' })}</span>
                <span className="text-sm font-bold text-slate-900">
                  {/* Placeholder for now as On-Time needs detailed task due/complete date diffs */}
                  85%
                </span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600" style={{ width: '85%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            {t({ en: 'Your Achievements', ar: 'إنجازاتك' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-lg text-center">
              <div className="text-3xl mb-1">🏆</div>
              <p className="text-xs text-slate-600">{t({ en: 'First Challenge', ar: 'أول تحدي' })}</p>
            </div>
            {metrics.pilotsCount >= 10 && (
              <div className="p-3 bg-white rounded-lg text-center">
                <div className="text-3xl mb-1">🚀</div>
                <p className="text-xs text-slate-600">{t({ en: '10 Pilots', ar: '10 تجارب' })}</p>
              </div>
            )}
            {metrics.scaledPilotsCount >= 1 && (
              <div className="p-3 bg-white rounded-lg text-center">
                <div className="text-3xl mb-1">⭐</div>
                <p className="text-xs text-slate-600">{t({ en: 'First Scale', ar: 'أول توسع' })}</p>
              </div>
            )}
            {metrics.completionRate >= 90 && (
              <div className="p-3 bg-white rounded-lg text-center">
                <div className="text-3xl mb-1">💯</div>
                <p className="text-xs text-slate-600">{t({ en: 'High Performer', ar: 'أداء عالي' })}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(MyPerformance, { requiredPermissions: [] });
