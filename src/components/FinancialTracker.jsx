import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from './LanguageContext';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function FinancialTracker({ entity, entityType = 'Pilot' }) {
  const { language, isRTL, t } = useLanguage();

  const budget = entity?.budget || 0;
  const spent = budget > 0 ? budget * (Math.random() * 0.6 + 0.2) : 0; // Mock: 20-80% spent
  const committed = budget > 0 ? budget * (Math.random() * 0.2) : 0; // Mock: 0-20% committed
  const remaining = budget > 0 ? budget - spent - committed : 0;
  const percentSpent = budget > 0 ? (spent / budget) * 100 : 0;

  const milestones = entity?.milestones || [
    { name: 'Initial Payment', amount: budget * 0.3, status: 'paid', date: '2025-01-15' },
    { name: 'Mid-term Payment', amount: budget * 0.4, status: 'pending', date: '2025-04-01' },
    { name: 'Final Payment', amount: budget * 0.3, status: 'upcoming', date: '2025-06-30' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            {t({ en: 'Financial Overview', ar: 'نظرة مالية' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">{t({ en: 'Total Budget', ar: 'الميزانية الكلية' })}</p>
              <p className="text-2xl font-bold text-slate-900">{(budget || 0).toLocaleString()}</p>
              <p className="text-xs text-slate-500">{entity?.budget_currency || 'SAR'}</p>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-slate-600">{t({ en: 'Spent', ar: 'المصروف' })}</p>
              <p className="text-2xl font-bold text-red-600">{(spent || 0).toLocaleString()}</p>
              <p className="text-xs text-red-500">{(percentSpent || 0).toFixed(1)}%</p>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-slate-600">{t({ en: 'Committed', ar: 'الملتزم به' })}</p>
              <p className="text-2xl font-bold text-yellow-600">{(committed || 0).toLocaleString()}</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-slate-600">{t({ en: 'Remaining', ar: 'المتبقي' })}</p>
              <p className="text-2xl font-bold text-green-600">{(remaining || 0).toLocaleString()}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t({ en: 'Budget Utilization', ar: 'استخدام الميزانية' })}</span>
              <span className="text-sm text-slate-600">{percentSpent.toFixed(1)}%</span>
            </div>
            <Progress value={percentSpent} className="h-3" />
            {percentSpent > 75 && (
              <div className="flex items-center gap-2 mt-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>{t({ en: 'High budget utilization - review remaining costs', ar: 'استخدام عالٍ للميزانية - راجع التكاليف المتبقية' })}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Payment Milestones', ar: 'معالم الدفع' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {milestones.map((milestone, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {milestone.status === 'paid' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    {milestone.status === 'pending' && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                    {milestone.status === 'upcoming' && <TrendingUp className="h-4 w-4 text-blue-600" />}
                    <span className="font-medium text-sm">{milestone.name}</span>
                  </div>
                  <p className="text-xs text-slate-500">{milestone.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{(milestone.amount || 0).toLocaleString()}</p>
                  <Badge className={getStatusColor(milestone.status)} variant="outline">
                    {milestone.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}