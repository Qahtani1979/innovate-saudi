import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Shield, AlertCircle, Clock, CheckCircle2, TrendingUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function MunicipalPolicyTracker({ municipalityId }) {
  const { language, isRTL, t } = useLanguage();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['municipal-policies', municipalityId],
    queryFn: async () => {
      const all = await base44.entities.PolicyRecommendation.list();
      // Filter policies that affect this municipality
      return all.filter(p => {
        // Adopted by this municipality
        if (p.implementation_progress?.municipalities_adopted?.includes(municipalityId)) return true;
        // Platform-wide policies affect all
        if (p.entity_type === 'platform') return true;
        // Challenge from this municipality
        if (p.challenge_id) {
          const challenge = challenges.find(c => c.id === p.challenge_id);
          if (challenge?.municipality_id === municipalityId) return true;
        }
        return false;
      });
    },
    enabled: !!municipalityId && challenges.length > 0
  });

  const adoptedPolicies = policies.filter(p => 
    p.implementation_progress?.municipalities_adopted?.includes(municipalityId)
  );
  
  const pendingPolicies = policies.filter(p => 
    !p.implementation_progress?.municipalities_adopted?.includes(municipalityId) &&
    ['published', 'active'].includes(p.workflow_stage || p.status)
  );

  const adoptionRate = policies.length > 0 
    ? (adoptedPolicies.length / policies.length * 100).toFixed(0)
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-600" />
          {t({ en: 'Policy Tracker', ar: 'متتبع السياسات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Adoption Progress */}
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">
              {t({ en: 'Policy Adoption Rate', ar: 'معدل تبني السياسات' })}
            </span>
            <span className="text-2xl font-bold text-purple-600">{adoptionRate}%</span>
          </div>
          <Progress value={adoptionRate} className="h-2" />
          <p className="text-xs text-slate-600 mt-2">
            {adoptedPolicies.length} of {policies.length} {t({ en: 'policies adopted', ar: 'سياسات متبناة' })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-600">{adoptedPolicies.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Adopted', ar: 'متبنى' })}</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-yellow-600">{pendingPolicies.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Pending', ar: 'معلق' })}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-600">{policies.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
          </div>
        </div>

        {/* Adopted Policies */}
        {adoptedPolicies.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-green-900 mb-3">
              {t({ en: '✓ Adopted Policies', ar: '✓ السياسات المتبناة' })}
            </p>
            <div className="space-y-2">
              {adoptedPolicies.map(policy => (
                <Link key={policy.id} to={createPageUrl(`PolicyDetail?id=${policy.id}`)}>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                       <p className="text-sm font-medium text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                         {language === 'ar' && policy.title_ar ? policy.title_ar : policy.title_en}
                       </p>
                        <div className="flex gap-2 mt-1">
                          <Badge className="text-xs bg-green-600 text-white">
                            {t({ en: 'Active', ar: 'فعال' })}
                          </Badge>
                          {policy.priority_level && (
                            <Badge variant="outline" className="text-xs">{policy.priority_level}</Badge>
                          )}
                        </div>
                      </div>
                      {policy.implementation_progress?.overall_percentage && (
                        <div className="text-right ml-3">
                          <div className="text-lg font-bold text-green-600">
                            {policy.implementation_progress.overall_percentage}%
                          </div>
                          <div className="text-xs text-slate-500">{t({ en: 'Progress', ar: 'تقدم' })}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Pending Policies */}
        {pendingPolicies.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-yellow-900 mb-3">
              {t({ en: '⏱ Pending Adoption', ar: '⏱ في انتظار التبني' })}
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pendingPolicies.map(policy => (
                <Link key={policy.id} to={createPageUrl(`PolicyDetail?id=${policy.id}`)}>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
                    <p className="text-sm font-medium text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {language === 'ar' && policy.title_ar ? policy.title_ar : policy.title_en}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <Badge className="text-xs">
                        {(policy.workflow_stage || policy.status)?.replace(/_/g, ' ')}
                      </Badge>
                      {policy.regulatory_change_needed && (
                        <Badge className="text-xs bg-orange-100 text-orange-700">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {t({ en: 'Reg. Change', ar: 'تغيير تنظيمي' })}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {policies.length === 0 && (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              {t({ en: 'No policies affecting this municipality yet', ar: 'لا توجد سياسات تؤثر على هذه البلدية بعد' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}