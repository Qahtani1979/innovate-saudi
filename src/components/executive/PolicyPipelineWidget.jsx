
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

import { usePoliciesWithVisibility } from '@/hooks/usePoliciesWithVisibility';

export default function PolicyPipelineWidget() {
  const { language, t } = useLanguage();

  const { data: policiesData } = usePoliciesWithVisibility();
  const policies = Array.isArray(policiesData) ? policiesData : (policiesData?.data || []);

  const policyStats = {
    draft: policies.filter(p => p.status === 'draft').length,
    in_legal_review: policies.filter(p => p.status === 'legal_review').length,
    in_consultation: policies.filter(p => p.status === 'public_consultation').length,
    council_review: policies.filter(p => p.status === 'council_review').length,
    approved: policies.filter(p => p.status === 'approved').length
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            {t({ en: 'Policy Pipeline', ar: 'خط السياسات' })}
          </CardTitle>
          <Link to={createPageUrl('PolicyHub')}>
            <Button size="sm" className="bg-indigo-600">
              {t({ en: 'View All', ar: 'عرض الكل' })}
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-3 mb-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-700">{policyStats.draft}</div>
            <div className="text-xs text-slate-600">{t({ en: 'Draft', ar: 'مسودة' })}</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-700">{policyStats.in_legal_review}</div>
            <div className="text-xs text-slate-600">{t({ en: 'Legal', ar: 'قانوني' })}</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{policyStats.in_consultation}</div>
            <div className="text-xs text-slate-600">{t({ en: 'Consult', ar: 'استشارة' })}</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">{policyStats.council_review}</div>
            <div className="text-xs text-slate-600">{t({ en: 'Council', ar: 'مجلس' })}</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">{policyStats.approved}</div>
            <div className="text-xs text-slate-600">{t({ en: 'Approved', ar: 'معتمد' })}</div>
          </div>
        </div>

        <div className="space-y-2">
          {policies.filter(p => ['legal_review', 'council_review', 'ministry_review'].includes(p.status)).slice(0, 4).map((policy) => (
            <Link key={policy.id} to={createPageUrl(`PolicyDetail?id=${policy.id}`)}>
              <div className="p-3 border rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs font-mono">{policy.code}</Badge>
                  <Badge className={
                    policy.status === 'approved' ? 'bg-green-100 text-green-700 text-xs' :
                      policy.status === 'council_review' ? 'bg-purple-100 text-purple-700 text-xs' :
                        'bg-yellow-100 text-yellow-700 text-xs'
                  }>{policy.status?.replace(/_/g, ' ')}</Badge>
                </div>
                <p className="text-sm font-medium text-slate-900 truncate">
                  {language === 'ar' && policy.title_ar ? policy.title_ar : policy.title_en}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
