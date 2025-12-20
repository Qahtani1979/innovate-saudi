import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/LanguageContext';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { AlertCircle, Plus, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Guard component that blocks strategy tools when no strategic plan is selected.
 * Shows a friendly message with options to create or select a plan.
 */
export default function NoPlanGuard({ children, requirePlan = true }) {
  const { t } = useLanguage();
  const { activePlanId, strategicPlans, isLoading } = useActivePlan();

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="py-12">
          <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4" />
          <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  // Day 0: No plans exist at all
  if (strategicPlans.length === 0) {
    return (
      <Card className="border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-2">
            {t({ en: 'Welcome to Strategy Planning!', ar: 'مرحباً بك في التخطيط الاستراتيجي!' })}
          </h3>
          <p className="text-amber-700 dark:text-amber-300 mb-6 max-w-md mx-auto">
            {t({ 
              en: 'You haven\'t created any strategic plans yet. Create your first plan to start using the strategy tools.',
              ar: 'لم تقم بإنشاء أي خطط استراتيجية بعد. أنشئ خطتك الأولى لبدء استخدام أدوات الاستراتيجية.'
            })}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button asChild>
              <Link to="/strategic-plan-builder">
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Create First Strategic Plan', ar: 'إنشاء الخطة الاستراتيجية الأولى' })}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/strategy-templates-page">
                <FileText className="h-4 w-4 mr-2" />
                {t({ en: 'Start from Template', ar: 'البدء من قالب' })}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Plans exist but none selected
  if (requirePlan && !activePlanId) {
    return (
      <Card className="border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
            {t({ en: 'Select a Strategic Plan', ar: 'اختر خطة استراتيجية' })}
          </h3>
          <p className="text-blue-700 dark:text-blue-300 mb-6 max-w-md mx-auto">
            {t({ 
              en: 'Please select an active strategic plan from the dropdown above to use this tool. All data will be linked to the selected plan.',
              ar: 'يرجى اختيار خطة استراتيجية نشطة من القائمة أعلاه لاستخدام هذه الأداة. سيتم ربط جميع البيانات بالخطة المحددة.'
            })}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {t({ 
              en: `You have ${strategicPlans.length} plan(s) available to choose from.`,
              ar: `لديك ${strategicPlans.length} خطة متاحة للاختيار منها.`
            })}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Plan selected - render children
  return <>{children}</>;
}
