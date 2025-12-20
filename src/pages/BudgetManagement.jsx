import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { DollarSign, Search, Plus, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { usePermissions } from '../components/permissions/usePermissions';
import { useBudgetsWithVisibility } from '@/hooks/useBudgetsWithVisibility';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function BudgetManagement() {
  const { t } = useLanguage();
  const { hasPermission, isAdmin, isStaffUser } = usePermissions();
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

  // Use visibility-aware hook for budgets
  const { data: budgets = [], isLoading } = useBudgetsWithVisibility({
    limit: 100
  });

  const filteredBudgets = budgets.filter(b => {
    const matchesSearch = !search || 
      b.name_en?.toLowerCase().includes(search.toLowerCase()) ||
      b.budget_code?.toLowerCase().includes(search.toLowerCase());
    const matchesEntity = entityFilter === 'all' || b.entity_type === entityFilter;
    return matchesSearch && matchesEntity;
  });

  const stats = {
    total_allocated: budgets.reduce((sum, b) => sum + (b.total_amount || b.allocated_amount || 0), 0),
    total_spent: budgets.reduce((sum, b) => sum + (b.spent_amount || 0), 0),
    active_budgets: budgets.filter(b => b.status === 'active').length,
    over_budget: budgets.filter(b => (b.spent_amount || 0) > (b.total_amount || 0)).length
  };

  const utilizationRate = stats.total_allocated > 0 
    ? (stats.total_spent / stats.total_allocated) * 100 
    : 0;

  const byEntityType = budgets.reduce((acc, b) => {
    const type = b.entity_type || 'other';
    if (!acc[type]) acc[type] = 0;
    acc[type] += b.total_amount || b.allocated_amount || 0;
    return acc;
  }, {});

  const chartData = Object.entries(byEntityType).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value: value / 1000000
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        icon={DollarSign}
        title={{ en: 'Budget Management', ar: 'إدارة الميزانية' }}
        description={{ en: 'Track budgets across pilots, programs, and R&D projects', ar: 'تتبع الميزانيات عبر التجارب والبرامج ومشاريع البحث' }}
        action={
          <Link to={createPageUrl('BudgetDetail') + '?mode=create'}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: 'New Budget', ar: 'ميزانية جديدة' })}
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-2 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Allocated', ar: 'المخصص' })}</p>
                <p className="text-2xl font-bold text-blue-600">{(stats.total_allocated / 1000000).toFixed(1)}M</p>
              </div>
              <Target className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Spent', ar: 'المصروف' })}</p>
                <p className="text-2xl font-bold text-green-600">{(stats.total_spent / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Utilization', ar: 'الاستخدام' })}</p>
                <p className="text-2xl font-bold text-slate-900">{utilizationRate.toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-slate-400" />
            </div>
            <Progress value={utilizationRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
                <p className="text-2xl font-bold text-slate-900">{stats.active_budgets}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Over Budget', ar: 'تجاوز الميزانية' })}</p>
                <p className="text-2xl font-bold text-red-600">{stats.over_budget}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Budget by Entity Type', ar: 'الميزانية حسب نوع الكيان' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}M`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Budget Utilization', ar: 'استخدام الميزانية' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgets.slice(0, 5).map(budget => {
                const allocated = budget.total_amount || budget.allocated_amount || 0;
                const utilization = allocated > 0 
                  ? ((budget.spent_amount || 0) / allocated) * 100 
                  : 0;
                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{budget.name_en}</span>
                      <span className="text-slate-600">{utilization.toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={utilization} 
                      className={utilization > 100 ? 'bg-red-100' : ''}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budgets Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    {t({ en: 'Budget', ar: 'الميزانية' })}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    {t({ en: 'Entity', ar: 'الكيان' })}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                    {t({ en: 'Allocated', ar: 'المخصص' })}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                    {t({ en: 'Spent', ar: 'المصروف' })}
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                    {t({ en: 'Status', ar: 'الحالة' })}
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                    {t({ en: 'Utilization', ar: 'الاستخدام' })}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBudgets.map(budget => {
                  const allocated = budget.total_amount || budget.allocated_amount || 0;
                  const utilization = allocated > 0 
                    ? ((budget.spent_amount || 0) / allocated) * 100 
                    : 0;
                  return (
                    <tr key={budget.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-900">{budget.name_en}</p>
                          <p className="text-xs text-slate-500">{budget.budget_code}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {budget.entity_type?.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {(allocated / 1000000).toFixed(2)}M
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {((budget.spent_amount || 0) / 1000000).toFixed(2)}M
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={statusColors[budget.status] || 'bg-slate-200'}>
                          {budget.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Progress value={utilization} className="flex-1" />
                          <span className={`text-sm font-medium ${utilization > 100 ? 'text-red-600' : 'text-slate-600'}`}>
                            {utilization.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

const statusColors = {
  draft: 'bg-slate-200 text-slate-700',
  approved: 'bg-blue-200 text-blue-700',
  active: 'bg-green-200 text-green-700',
  closed: 'bg-slate-300 text-slate-700',
  frozen: 'bg-red-200 text-red-700'
};

export default ProtectedPage(BudgetManagement, { 
  requiredPermissions: ['budget_view_all'] 
});