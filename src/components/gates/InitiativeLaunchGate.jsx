import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Rocket, CheckCircle2, XCircle, Shield, Users, DollarSign, Calendar } from 'lucide-react';

export default function InitiativeLaunchGate({ initiative, type, onApprove, onReject, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const [comments, setComments] = useState('');

  const readinessChecks = [
    { category: 'Team', icon: Users, checks: [
      { item: 'Key roles assigned', status: initiative.team?.length >= 3 },
      { item: 'Responsibilities defined', status: initiative.team?.every(m => m.responsibility) },
      { item: 'Contact points confirmed', status: initiative.team?.every(m => m.email) }
    ]},
    { category: 'Budget', icon: DollarSign, checks: [
      { item: 'Budget approved', status: initiative.budget > 0 },
      { item: 'Funding sources confirmed', status: initiative.funding_sources?.every(f => f.confirmed) },
      { item: 'Budget breakdown provided', status: initiative.budget_breakdown?.length > 0 }
    ]},
    { category: 'Timeline', icon: Calendar, checks: [
      { item: 'Start date defined', status: initiative.timeline?.start_date },
      { item: 'Milestones set', status: initiative.milestones?.length >= 3 },
      { item: 'Duration realistic', status: initiative.duration_weeks >= 4 }
    ]},
    { category: 'Compliance', icon: Shield, checks: [
      { item: 'Risk assessment complete', status: initiative.risks?.length > 0 },
      { item: 'Safety protocols defined', status: initiative.safety_protocols?.length > 0 || type !== 'pilot' },
      { item: 'Regulatory requirements met', status: true }
    ]}
  ];

  const allPassed = readinessChecks.every(cat => cat.checks.every(c => c.status));

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-blue-600" />
          {t({ en: 'Initiative Launch Readiness Gate', ar: 'بوابة جاهزية إطلاق المبادرة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Initiative Info */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="font-bold text-blue-900 mb-2">
            {initiative.title_en || initiative.name_en}
          </p>
          <div className="flex items-center gap-3">
            <Badge>{type}</Badge>
            <Badge variant="outline">{initiative.code}</Badge>
          </div>
        </div>

        {/* Readiness Checks */}
        <div className="grid grid-cols-2 gap-4">
          {readinessChecks.map((category, idx) => {
            const Icon = category.icon;
            const allCategoryPassed = category.checks.every(c => c.status);
            
            return (
              <Card key={idx} className={`border-2 ${allCategoryPassed ? 'border-green-200' : 'border-red-200'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-slate-600" />
                      <p className="font-semibold text-sm">{category.category}</p>
                    </div>
                    {allCategoryPassed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.checks.map((check, cidx) => (
                      <div key={cidx} className="flex items-center gap-2 text-sm">
                        {check.status ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className={check.status ? 'text-slate-700' : 'text-red-700'}>
                          {check.item}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Overall Status */}
        <Card className={`border-2 ${allPassed ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {allPassed ? (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
              <div>
                <p className="font-bold text-lg">
                  {allPassed
                    ? t({ en: 'Ready for Launch', ar: 'جاهز للإطلاق' })
                    : t({ en: 'Not Ready - Requirements Missing', ar: 'غير جاهز - متطلبات مفقودة' })}
                </p>
                <p className="text-sm text-slate-600">
                  {readinessChecks.reduce((sum, cat) => sum + cat.checks.filter(c => c.status).length, 0)} / 
                  {readinessChecks.reduce((sum, cat) => sum + cat.checks.length, 0)} {t({ en: 'checks passed', ar: 'فحص تم اجتيازه' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <label className="text-sm font-medium text-slate-900 mb-2 block">{t({ en: 'Comments:', ar: 'التعليقات:' })}</label>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            placeholder={t({ en: 'Launch approval comments...', ar: 'تعليقات الموافقة على الإطلاق...' })}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => onApprove(comments)}
            disabled={!allPassed}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
          >
            <Rocket className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Approve Launch', ar: 'الموافقة على الإطلاق' })}
          </Button>
          <Button onClick={() => onReject(comments)} variant="outline" className="flex-1">
            <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Hold', ar: 'إيقاف' })}
          </Button>
          <Button onClick={onClose} variant="outline">
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}