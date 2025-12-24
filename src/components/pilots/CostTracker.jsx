import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { DollarSign, TrendingDown, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useExpenseMutations } from '@/hooks/useExpenseMutations';

export default function CostTracker({ pilotId, budget }) {
  const { language, isRTL, t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: 'operations',
    amount: 0,
    description: ''
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['pilot-expenses', pilotId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pilot_expenses')
        .select('*')
        .eq('pilot_id', pilotId)
        .order('expense_date', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { createExpense, isCreating } = useExpenseMutations(pilotId);

  const handleAddExpense = () => {
    createExpense.mutate({
      pilot_id: pilotId,
      expense_date: new Date().toISOString().split('T')[0],
      ...newExpense
    }, {
      onSuccess: () => {
        setShowForm(false);
        setNewExpense({ category: 'operations', amount: 0, description: '' });
      }
    });
  };

  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const variance = ((totalSpent - budget) / budget) * 100;
  const burnRate = expenses.length > 0
    ? totalSpent / Math.max(1, Math.floor((new Date() - new Date(expenses[expenses.length - 1]?.expense_date)) / (1000 * 60 * 60 * 24 * 7)))
    : 0;
  const weeksToExhaustion = burnRate > 0 ? (budget - totalSpent) / burnRate : Infinity;

  const categoryBreakdown = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const chartData = Object.entries(categoryBreakdown).map(([cat, amt]) => ({
    category: cat,
    amount: amt
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t({ en: 'Cost Tracking & Budget Monitor', ar: 'تتبع التكاليف ومراقبة الميزانية' })}
            </CardTitle>
            <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-blue-600">
              <Plus className="h-4 w-4 mr-1" />
              {t({ en: 'Add Expense', ar: 'إضافة نفقة' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
              <p className="text-xs text-slate-600 mb-1">{t({ en: 'Budget', ar: 'الميزانية' })}</p>
              <p className="text-xl font-bold text-blue-600">{(budget / 1000).toFixed(0)}K</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <p className="text-xs text-slate-600 mb-1">{t({ en: 'Spent', ar: 'المنفق' })}</p>
              <p className="text-xl font-bold text-slate-900">{(totalSpent / 1000).toFixed(0)}K</p>
            </div>
            <div className={`p-3 rounded-lg border text-center ${variance > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <p className="text-xs text-slate-600 mb-1">{t({ en: 'Variance', ar: 'التباين' })}</p>
              <p className={`text-xl font-bold flex items-center justify-center gap-1 ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {variance > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(variance).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
              <p className="text-xs text-slate-600 mb-1">{t({ en: 'Burn Rate', ar: 'معدل الحرق' })}</p>
              <p className="text-xl font-bold text-yellow-600">{(burnRate / 1000).toFixed(1)}K/wk</p>
            </div>
          </div>

          {variance > 15 && (
            <div className="p-4 bg-red-50 rounded-lg border-2 border-red-300">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 mb-1">
                    {t({ en: 'Budget Alert', ar: 'تنبيه الميزانية' })}
                  </p>
                  <p className="text-sm text-slate-700">
                    {weeksToExhaustion < 10 && weeksToExhaustion > 0
                      ? t({ en: `At current burn rate, budget will be exhausted in ${Math.floor(weeksToExhaustion)} weeks`, ar: `بالمعدل الحالي، ستستنفد الميزانية في ${Math.floor(weeksToExhaustion)} أسابيع` })
                      : t({ en: 'Budget overrun detected. Review spending immediately.', ar: 'تجاوز الميزانية محدد. راجع الإنفاق فوراً.' })
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {showForm && (
            <div className="p-4 bg-slate-50 rounded-lg border space-y-3">
              <h4 className="font-semibold text-sm">{t({ en: 'New Expense', ar: 'نفقة جديدة' })}</h4>
              <div className="grid grid-cols-2 gap-3">
                <Select value={newExpense.category} onValueChange={(v) => setNewExpense({ ...newExpense, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personnel">Personnel</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                  placeholder="Amount (SAR)"
                />
              </div>
              <Input
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder={t({ en: 'Description', ar: 'الوصف' })}
              />
              <div className="flex gap-2">
                <Button onClick={() => setShowForm(false)} variant="outline" size="sm" className="flex-1">
                  {t({ en: 'Cancel', ar: 'إلغاء' })}
                </Button>
                <Button
                  onClick={() => addExpenseMutation.mutate({
                    pilot_id: pilotId,
                    expense_date: new Date().toISOString().split('T')[0],
                    ...newExpense
                  })}
                  size="sm"
                  className="flex-1 bg-green-600"
                >
                  {t({ en: 'Add', ar: 'إضافة' })}
                </Button>
              </div>
            </div>
          )}

          {chartData.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">
                {t({ en: 'Spending by Category', ar: 'الإنفاق حسب الفئة' })}
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}