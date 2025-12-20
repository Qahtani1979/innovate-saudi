import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';

function BudgetVarianceReport() {
  const { t } = useLanguage();

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets-variance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('status', 'active')
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const budgetsWithVariance = budgets.map(b => {
    const allocated = b.total_amount || b.allocated_amount || 0;
    const spent = b.spent_amount || 0;
    return {
      ...b,
      variance: allocated > 0 ? ((spent - allocated) / allocated * 100) : 0,
      utilization: allocated > 0 ? (spent / allocated * 100) : 0
    };
  });

  const highVariance = budgetsWithVariance.filter(b => Math.abs(b.variance) > 10);
  const overBudget = budgetsWithVariance.filter(b => b.variance > 0);
  const underUtilized = budgetsWithVariance.filter(b => b.utilization < 50);

  const chartData = budgetsWithVariance.slice(0, 10).map(b => ({
    name: b.budget_code || b.name_en,
    variance: b.variance,
    allocated: b.total_amount || b.allocated_amount || 0,
    spent: b.spent_amount || 0
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Budget Variance Report', ar: 'تقرير تباين الميزانية' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Analysis of budget performance and variances', ar: 'تحليل أداء الميزانية والتباينات' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <DollarSign className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{budgets.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active Budgets', ar: 'ميزانيات نشطة' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-300 bg-amber-50">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-10 w-10 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{highVariance.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'High Variance (>10%)', ar: 'تباين عالي (>10%)' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-10 w-10 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{overBudget.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Over Budget', ar: 'تجاوز الميزانية' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-300">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{underUtilized.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Under-Utilized (<50%)', ar: 'غير مستغل (<50%)' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Budget Variance Analysis', ar: 'تحليل تباين الميزانية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="variance" name={t({ en: 'Variance %', ar: 'التباين %' })}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.variance > 0 ? '#ef4444' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'High Variance Budgets', ar: 'ميزانيات عالية التباين' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {highVariance.map(budget => (
                <div key={budget.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{budget.budget_code || budget.name_en}</p>
                    <p className="text-xs text-slate-600">{budget.entity_type}</p>
                  </div>
                  <Badge className={budget.variance > 0 ? 'bg-red-600' : 'bg-green-600'}>
                    {budget.variance > 0 ? '+' : ''}{budget.variance.toFixed(1)}%
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-slate-600">{t({ en: 'Allocated', ar: 'مخصص' })}</p>
                    <p className="font-medium">{(budget.total_amount || budget.allocated_amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">{t({ en: 'Spent', ar: 'مصروف' })}</p>
                    <p className="font-medium">{(budget.spent_amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">{t({ en: 'Difference', ar: 'الفرق' })}</p>
                    <p className={`font-medium ${budget.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {((budget.spent_amount || 0) - (budget.total_amount || budget.allocated_amount || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(BudgetVarianceReport, { requireAdmin: true });