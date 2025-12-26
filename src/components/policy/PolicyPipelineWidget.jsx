
// cleaned up imports
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Shield, ArrowRight, Loader2, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

import { usePoliciesList } from '@/hooks/usePolicies';

export default function PolicyPipelineWidget() {
  const { language, isRTL, t } = useLanguage();

  const { data: policies = [], isLoading } = usePoliciesList({ limit: 50 });

  const pipeline = {
    pending_legal: policies.filter(p => (p.workflow_stage || p.status) === 'legal_review').length,
    pending_consultation: policies.filter(p => (p.workflow_stage || p.status) === 'public_consultation').length,
    pending_council: policies.filter(p => (p.workflow_stage || p.status) === 'council_approval').length,
    pending_ministry: policies.filter(p => (p.workflow_stage || p.status) === 'ministry_approval').length,
    ready_publish: policies.filter(p => (p.workflow_stage || p.status) === 'council_approval' &&
      p.approvals?.some(a => a.stage === 'council_approval' && a.status === 'approved')).length
  };

  const urgentPolicies = policies
    .filter(p => p.priority_level === 'critical' &&
      (p.workflow_stage || p.status) !== 'published' &&
      (p.workflow_stage || p.status) !== 'active')
    .slice(0, 3);

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
            {t({ en: 'Policy Pipeline', ar: 'خط السياسات' })}
          </CardTitle>
          <Link to={createPageUrl('PolicyHub')}>
            <Button size="sm" variant="ghost">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pipeline Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-xs text-yellow-900 font-semibold">
                {t({ en: 'Legal Review', ar: 'مراجعة قانونية' })}
              </span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{pipeline.pending_legal}</p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-900 font-semibold">
                {t({ en: 'Consultation', ar: 'استشارة' })}
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{pipeline.pending_consultation}</p>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-xs text-purple-900 font-semibold">
                {t({ en: 'Council', ar: 'المجلس' })}
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{pipeline.pending_council}</p>
          </div>

          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-900 font-semibold">
                {t({ en: 'Ministry', ar: 'الوزارة' })}
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600">{pipeline.pending_ministry}</p>
          </div>
        </div>

        {/* Urgent Policies */}
        {urgentPolicies.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-xs font-semibold text-red-900">
                {t({ en: 'Critical Policies Pending', ar: 'سياسات حرجة معلقة' })}
              </p>
            </div>
            {urgentPolicies.map(p => (
              <Link key={p.id} to={createPageUrl(`PolicyDetail?id=${p.id}`)}>
                <div className="p-2 bg-red-50 rounded border border-red-200 hover:bg-red-100 transition-colors">
                  <p className="text-xs font-medium text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' && p.title_ar ? p.title_ar : p.title_en}
                  </p>
                  <Badge className="mt-1 text-xs bg-red-600 text-white">
                    {(p.workflow_stage || p.status)?.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}