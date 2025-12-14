import React from 'react';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { useLanguage } from '@/components/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Target, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function ActivePlanBanner({ 
  showDetails = true, 
  compact = false,
  className = "" 
}) {
  const { activePlanId, activePlan, setActivePlanId, strategicPlans, isLoading } = useActivePlan();
  const { t, language } = useLanguage();

  if (isLoading) {
    return (
      <div className={`animate-pulse h-12 bg-muted rounded-lg ${className}`} />
    );
  }

  if (strategicPlans.length === 0) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg ${className}`}>
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <span className="text-sm text-amber-700">
          {t({ en: 'No strategic plans available. Create one to get started.', ar: 'لا توجد خطط استراتيجية. أنشئ واحدة للبدء.' })}
        </span>
      </div>
    );
  }

  const planName = activePlan 
    ? (language === 'ar' && activePlan.name_ar ? activePlan.name_ar : activePlan.name_en)
    : '';

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Target className="h-4 w-4 text-indigo-600" />
        <Select value={activePlanId || ''} onValueChange={setActivePlanId}>
          <SelectTrigger className="w-64 h-9">
            <SelectValue placeholder={t({ en: 'Select Active Plan', ar: 'اختر الخطة النشطة' })} />
          </SelectTrigger>
          <SelectContent>
            {strategicPlans.map(plan => (
              <SelectItem key={plan.id} value={plan.id}>
                <div className="flex items-center gap-2">
                  {language === 'ar' && plan.name_ar ? plan.name_ar : plan.name_en}
                  {plan.status === 'active' && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      {t({ en: 'Active', ar: 'نشط' })}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Target className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
              {t({ en: 'Active Strategic Plan', ar: 'الخطة الاستراتيجية النشطة' })}
            </p>
            <h3 className="font-semibold text-indigo-900">{planName || t({ en: 'No plan selected', ar: 'لم يتم اختيار خطة' })}</h3>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {showDetails && activePlan && (
            <div className="hidden md:flex items-center gap-4 text-sm text-indigo-700">
              {activePlan.status && (
                <Badge 
                  variant="outline" 
                  className={`
                    ${activePlan.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                    ${activePlan.status === 'draft' ? 'bg-slate-50 text-slate-700 border-slate-200' : ''}
                    ${activePlan.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                  `}
                >
                  {activePlan.status}
                </Badge>
              )}
              {activePlan.start_date && activePlan.end_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(activePlan.start_date), 'MMM yyyy')} - {format(new Date(activePlan.end_date), 'MMM yyyy')}
                  </span>
                </div>
              )}
            </div>
          )}
          
          <Select value={activePlanId || ''} onValueChange={setActivePlanId}>
            <SelectTrigger className="w-64 bg-white">
              <SelectValue placeholder={t({ en: 'Select Plan', ar: 'اختر الخطة' })} />
            </SelectTrigger>
            <SelectContent>
              {strategicPlans.map(plan => (
                <SelectItem key={plan.id} value={plan.id}>
                  <div className="flex items-center gap-2">
                    {language === 'ar' && plan.name_ar ? plan.name_ar : plan.name_en}
                    {plan.status === 'active' && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        {t({ en: 'Active', ar: 'نشط' })}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
