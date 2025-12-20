import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { TrendingUp, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout } from '@/components/layout/PersonaPageLayout';

function BudgetDetail() {
  const { t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const budgetId = urlParams.get('id');

  const { data: budget, isLoading } = useQuery({
    queryKey: ['budget', budgetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', budgetId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!budgetId
  });

  if (isLoading || !budget) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const allocated = budget.total_amount || budget.allocated_amount || 0;
  const spent = budget.spent_amount || 0;
  const utilizationRate = allocated > 0 ? (spent / allocated * 100) : 0;
  const variance = allocated > 0 ? ((spent - allocated) / allocated * 100) : 0;

  const lineItemsData = (budget.line_items || []).map(item => ({
    name: item.name || item.category,
    allocated: item.allocated || 0,
    spent: item.spent || 0
  }));

  const statusColors = {
    draft: 'bg-gray-200 text-gray-800',
    submitted: 'bg-blue-200 text-blue-800',
    approved: 'bg-green-200 text-green-800',
    active: 'bg-green-600 text-white',
    closed: 'bg-purple-200 text-purple-800',
    amended: 'bg-amber-200 text-amber-800'
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <PageLayout className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">
              {t({ en: 'Budget Details', ar: 'تفاصيل الميزانية' })}
            </h1>
            <Badge className={statusColors[budget.status] || 'bg-gray-200'}>
              {budget.status}
            </Badge>
          </div>
          <p className="text-slate-600">
            {budget.budget_code} • {t({ en: 'FY', ar: 'السنة المالية' })} {budget.fiscal_year}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <DollarSign className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">
              {allocated.toLocaleString()} {budget.currency || 'SAR'}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Allocated', ar: 'المخصص' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {spent.toLocaleString()} {budget.currency || 'SAR'}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Spent', ar: 'المصروف' })}</p>
          </CardContent>
        </Card>

        <Card className={utilizationRate > 90 ? 'border-2 border-amber-300 bg-amber-50' : ''}>
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className={`h-10 w-10 ${utilizationRate > 90 ? 'text-amber-600' : 'text-purple-600'} mx-auto mb-2`} />
            <p className={`text-2xl font-bold ${utilizationRate > 90 ? 'text-amber-600' : 'text-purple-600'}`}>
              {utilizationRate.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Utilization', ar: 'الاستخدام' })}</p>
          </CardContent>
        </Card>

        <Card className={Math.abs(variance) > 10 ? 'border-2 border-red-300 bg-red-50' : ''}>
          <CardContent className="pt-6 text-center">
            <AlertCircle className={`h-10 w-10 ${Math.abs(variance) > 10 ? 'text-red-600' : 'text-slate-600'} mx-auto mb-2`} />
            <p className={`text-2xl font-bold ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Variance', ar: 'التباين' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Budget Utilization', ar: 'استخدام الميزانية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">{t({ en: 'Overall Progress', ar: 'التقدم الإجمالي' })}</span>
              <span className="text-sm font-medium">{utilizationRate.toFixed(1)}%</span>
            </div>
            <Progress value={utilizationRate} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {lineItemsData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Line Items Breakdown', ar: 'تفاصيل بنود الميزانية' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={lineItemsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="allocated" fill="#3b82f6" name={t({ en: 'Allocated', ar: 'مخصص' })} />
                  <Bar dataKey="spent" fill="#10b981" name={t({ en: 'Spent', ar: 'مصروف' })} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Spending Distribution', ar: 'توزيع الإنفاق' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={lineItemsData}
                    dataKey="spent"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {lineItemsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Line Items', ar: 'البنود' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {lineItemsData.map((item, idx) => {
              const itemUtilization = item.allocated > 0 ? (item.spent / item.allocated * 100) : 0;
              return (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900">{item.name}</span>
                    <span className="text-sm text-slate-600">
                      {item.spent.toLocaleString()} / {item.allocated.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={itemUtilization} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(BudgetDetail, { requiredPermissions: ['budget_view'] });