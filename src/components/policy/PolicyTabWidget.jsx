
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Shield, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function PolicyTabWidget({ entityType, entityId }) {
  const { language, isRTL, t } = useLanguage();

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['entity-policies', entityType, entityId],
    queryFn: async () => {
      const allPolicies = await base44.entities.PolicyRecommendation.list();
      const fieldMap = {
        pilot: 'pilot_id',
        rd_project: 'rd_project_id',
        program: 'program_id',
        challenge: 'challenge_id'
      };
      const field = fieldMap[entityType];
      return allPolicies.filter(p => p[field] === entityId);
    },
    enabled: !!entityId
  });

  const getCreateUrl = () => {
    const params = new URLSearchParams();
    params.set('entity_type', entityType);
    params.set('entity_id', entityId);
    if (entityType === 'challenge') {
      params.set('challenge_id', entityId);
    }
    return `PolicyCreate?${params.toString()}`;
  };

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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            {t({ en: 'Policy Recommendations', ar: 'التوصيات السياسية' })}
          </CardTitle>
          <Link to={createPageUrl(getCreateUrl())}>
            <Button size="sm" className="gap-2 bg-purple-600">
              <Plus className="h-3 w-3" />
              {t({ en: 'Add Policy', ar: 'إضافة سياسة' })}
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {policies.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm mb-4">
              {t({ 
                en: `No policy recommendations yet for this ${entityType}`, 
                ar: `لا توجد توصيات سياسية بعد لهذا ${entityType}` 
              })}
            </p>
            <Link to={createPageUrl(getCreateUrl())}>
              <Button className="bg-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Create Policy Recommendation', ar: 'إنشاء توصية سياسية' })}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {policies.map(policy => {
              const statusColors = {
                draft: 'bg-slate-100 text-slate-700',
                legal_review: 'bg-yellow-100 text-yellow-700',
                public_consultation: 'bg-blue-100 text-blue-700',
                council_approval: 'bg-purple-100 text-purple-700',
                ministry_approval: 'bg-indigo-100 text-indigo-700',
                published: 'bg-green-100 text-green-700',
                active: 'bg-teal-100 text-teal-700'
              };

              return (
                <Link key={policy.id} to={createPageUrl(`PolicyDetail?id=${policy.id}`)}>
                  <div className="p-3 border rounded-lg hover:bg-blue-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                         {language === 'ar' && policy.title_ar ? policy.title_ar : policy.title_en}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge className={statusColors[(policy.workflow_stage || policy.status)] || 'bg-slate-100'}>
                            {(policy.workflow_stage || policy.status)?.replace(/_/g, ' ')}
                          </Badge>
                          {policy.priority_level && (
                            <Badge variant="outline">{policy.priority_level}</Badge>
                          )}
                          {policy.regulatory_change_needed && (
                            <Badge className="bg-orange-100 text-orange-700">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Reg. Change
                            </Badge>
                          )}
                        </div>
                      </div>
                      {policy.impact_score && (
                        <div className="text-right ml-3">
                          <div className="text-lg font-bold text-purple-600">{policy.impact_score}</div>
                          <div className="text-xs text-slate-500">{t({ en: 'Impact', ar: 'تأثير' })}</div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {language === 'ar' && policy.recommendation_text_ar 
                        ? policy.recommendation_text_ar 
                        : policy.recommendation_text_en}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}