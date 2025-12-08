import React from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function PolicyTimelineView({ policies }) {
  const { language, isRTL, t } = useLanguage();

  // Group policies by month
  const policyTimeline = policies.reduce((acc, policy) => {
    const date = new Date(policy.submission_date || policy.created_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(policy);
    return acc;
  }, {});

  const sortedMonths = Object.keys(policyTimeline).sort().reverse();

  const getStageColor = (stage) => {
    const colors = {
      draft: 'bg-slate-100 text-slate-700',
      legal_review: 'bg-yellow-100 text-yellow-700',
      public_consultation: 'bg-blue-100 text-blue-700',
      council_approval: 'bg-purple-100 text-purple-700',
      ministry_approval: 'bg-indigo-100 text-indigo-700',
      published: 'bg-green-100 text-green-700',
      active: 'bg-teal-100 text-teal-700',
      implemented: 'bg-emerald-100 text-emerald-700'
    };
    return colors[stage] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {sortedMonths.map((monthKey, idx) => {
        const [year, month] = monthKey.split('-');
        const monthName = new Date(year, parseInt(month) - 1).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { 
          month: 'long', 
          year: 'numeric' 
        });
        const monthPolicies = policyTimeline[monthKey];

        return (
          <div key={monthKey} className="relative">
            {/* Timeline Line */}
            {idx < sortedMonths.length - 1 && (
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-200" />
            )}

            {/* Month Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">{monthName}</h3>
                <p className="text-sm text-slate-600">
                  {monthPolicies.length} {t({ en: 'policies', ar: 'سياسات' })}
                </p>
              </div>
            </div>

            {/* Policies for this month */}
            <div className="ml-16 space-y-3">
              {monthPolicies.map(policy => (
                <Link key={policy.id} to={createPageUrl(`PolicyDetail?id=${policy.id}`)}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {policy.code && (
                              <Badge variant="outline" className="font-mono text-xs">
                                {policy.code}
                              </Badge>
                            )}
                            <Badge className={getStageColor(policy.workflow_stage || policy.status)}>
                              {(policy.workflow_stage || policy.status)?.replace(/_/g, ' ')}
                            </Badge>
                            {policy.priority_level && (
                              <Badge variant="outline" className="text-xs">
                                {policy.priority_level}
                              </Badge>
                            )}
                            {policy.regulatory_change_needed && (
                              <Badge className="bg-orange-100 text-orange-700 text-xs">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Reg. Change
                              </Badge>
                            )}
                          </div>
                          
                          <h4 className="font-semibold text-slate-900 mb-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {language === 'ar' && policy.title_ar ? policy.title_ar : policy.title_en}
                          </h4>
                          
                          <div className="flex items-center gap-4 text-xs text-slate-600">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(policy.submission_date || policy.created_date).toLocaleDateString()}
                            </span>
                            {policy.timeline_months && (
                              <span>{policy.timeline_months} {t({ en: 'months', ar: 'شهر' })}</span>
                            )}
                            {policy.implementation_progress?.overall_percentage > 0 && (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                {policy.implementation_progress.overall_percentage}% {t({ en: 'implemented', ar: 'منفذ' })}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {policy.impact_score && (
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-purple-600">{policy.impact_score}</div>
                            <div className="text-xs text-slate-500">{t({ en: 'Impact', ar: 'تأثير' })}</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        );
      })}

      {sortedMonths.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">
            {t({ en: 'No policies to display in timeline', ar: 'لا توجد سياسات لعرضها في الجدول الزمني' })}
          </p>
        </div>
      )}
    </div>
  );
}