import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Layers, AlertTriangle, ArrowLeft } from 'lucide-react';
import SectorStrategyBuilder from '@/components/strategy/creation/SectorStrategyBuilder';
import { useLanguage } from '@/components/LanguageContext';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';

const SectorStrategyPage = () => {
  const { t, language, isRTL } = useLanguage();
  const { activePlan, activePlanId, isLoading } = useActivePlan();

  const handleSave = (data) => { };

  return (
    <div className="container mx-auto p-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/strategy-hub">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Layers className="h-6 w-6 text-purple-600" />
              {t({ en: 'Sector Strategy Builder', ar: 'منشئ استراتيجية القطاع' })}
            </h1>
            <p className="text-muted-foreground">
              {t({ en: 'Create sector-specific sub-strategies aligned with your strategic plan', ar: 'إنشاء استراتيجيات فرعية خاصة بالقطاع متوافقة مع خطتك الاستراتيجية' })}
            </p>
          </div>
        </div>
      </div>

      {/* Active Plan Banner */}
      <ActivePlanBanner />

      {/* Check if plan is selected */}
      {!activePlanId ? (
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950 dark:to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              {t({ en: 'No Strategic Plan Selected', ar: 'لم يتم اختيار خطة استراتيجية' })}
            </CardTitle>
            <CardDescription>
              {t({
                en: 'Please select a strategic plan from the Strategy Hub to create sector-specific strategies.',
                ar: 'يرجى اختيار خطة استراتيجية من مركز الاستراتيجية لإنشاء استراتيجيات خاصة بالقطاع.'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/strategy-hub">
                {t({ en: 'Go to Strategy Hub', ar: 'الذهاب إلى مركز الاستراتيجية' })}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Current Plan Info */}
          {activePlan && (
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t({ en: 'Creating sector strategies for:', ar: 'إنشاء استراتيجيات القطاع لـ:' })}
                    </p>
                    <h3 className="font-semibold text-lg">
                      {language === 'ar' ? activePlan.title_ar || activePlan.name_ar : activePlan.title_en || activePlan.name_en}
                    </h3>
                  </div>
                  <Badge variant="outline">{activePlan.code || activePlan.id?.slice(0, 8)}</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sector Strategy Builder */}
          <SectorStrategyBuilder parentPlan={activePlan} onSave={handleSave} />
        </>
      )}
    </div>
  );
};

export default ProtectedPage(SectorStrategyPage, { requiredPermissions: ['strategy_manage'] });
