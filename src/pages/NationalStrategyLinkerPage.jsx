import { useMemo } from 'react';
import NationalStrategyLinker from '@/components/strategy/creation/NationalStrategyLinker';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const NationalStrategyLinkerPage = () => {
  const { t } = useLanguage();
  const { activePlanId, activePlan, strategicPlans, setActivePlanId, isLoading } = useActivePlan();
  
  // Extract objectives from active plan's JSONB objectives field
  const objectives = useMemo(() => {
    if (!activePlan?.objectives) return [];
    
    // Handle both array format and object format
    const objArray = Array.isArray(activePlan.objectives) 
      ? activePlan.objectives 
      : Object.values(activePlan.objectives);
    
    return objArray.map((obj, index) => ({
      id: obj.id || `obj-${index}`,
      title_en: obj.name_en || obj.title_en || obj.title || `Objective ${index + 1}`,
      title_ar: obj.name_ar || obj.title_ar || obj.title || `الهدف ${index + 1}`,
      description_en: obj.description_en || obj.description || '',
      description_ar: obj.description_ar || '',
      sector_code: obj.sector_code || null
    }));
  }, [activePlan]);

  const handleSave = (data) => {
    console.log('Alignments saved:', data);
  };

  // Show plan selector if no plans exist or no plan selected
  const showPlanSelector = !isLoading && (strategicPlans.length === 0 || !activePlanId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ActivePlanBanner />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t({ en: 'National Strategy Alignment', ar: 'مواءمة الاستراتيجية الوطنية' })}</h1>
          <p className="text-muted-foreground mt-1">
            {t({ en: 'Link your strategic plan objectives to national strategies', ar: 'ربط أهداف خطتك الاستراتيجية بالاستراتيجيات الوطنية' })}
          </p>
        </div>
        
        {strategicPlans.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t({ en: 'Active Plan:', ar: 'الخطة النشطة:' })}
            </span>
            <Select value={activePlanId || ''} onValueChange={setActivePlanId}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder={t({ en: 'Select a plan', ar: 'اختر خطة' })} />
              </SelectTrigger>
              <SelectContent>
                {strategicPlans.map(plan => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name_en || plan.name_ar || 'Unnamed Plan'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Show warning if no plans exist */}
      {!isLoading && strategicPlans.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800">
                  {t({ en: 'No Strategic Plans Found', ar: 'لم يتم العثور على خطط استراتيجية' })}
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  {t({ 
                    en: 'Create a strategic plan first to link objectives to national strategies.', 
                    ar: 'قم بإنشاء خطة استراتيجية أولاً لربط الأهداف بالاستراتيجيات الوطنية.' 
                  })}
                </p>
              </div>
              <Button asChild>
                <Link to="/strategic-plan-builder">
                  <Plus className="h-4 w-4 mr-2" />
                  {t({ en: 'Create Plan', ar: 'إنشاء خطة' })}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show warning if plan has no objectives */}
      {activePlan && objectives.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800">
                  {t({ en: 'No Objectives in This Plan', ar: 'لا توجد أهداف في هذه الخطة' })}
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  {t({ 
                    en: 'The selected strategic plan has no objectives. Add objectives to link them to national strategies.', 
                    ar: 'الخطة الاستراتيجية المحددة لا تحتوي على أهداف. أضف أهدافًا لربطها بالاستراتيجيات الوطنية.' 
                  })}
                </p>
              </div>
              <Button asChild variant="outline">
                <Link to="/strategic-plan-builder">
                  {t({ en: 'Edit Plan', ar: 'تعديل الخطة' })}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Show linker component when we have a plan with objectives */}
      {activePlan && objectives.length > 0 && (
        <NationalStrategyLinker 
          strategicPlanId={activePlanId}
          strategicPlan={activePlan}
          objectives={objectives}
          onSave={handleSave} 
        />
      )}
    </div>
  );
};

export default ProtectedPage(NationalStrategyLinkerPage, { requiredPermissions: ['strategy_manage'] });
