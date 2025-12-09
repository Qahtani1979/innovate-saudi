import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { DollarSign, PieChart, Sparkles, TrendingUp, Save, Download, Loader2, Lock, Unlock, RefreshCw } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function BudgetAllocationTool() {
  const { language, isRTL, t } = useLanguage();
  const [totalBudget, setTotalBudget] = useState(50000000);
  const [allocations, setAllocations] = useState({});
  const { invokeAI, status, isLoading: aiLoading, rateLimitInfo, isAvailable } = useAIWithFallback();
  const [lockedCategories, setLockedCategories] = useState({});
  const [lastYearAllocations, setLastYearAllocations] = useState({
    pilots: 30,
    rd: 25,
    programs: 20,
    infrastructure: 10,
    scaling: 10,
    operations: 5
  });

  const { data: sectors = [] } = useQuery({
    queryKey: ['sectors'],
    queryFn: () => base44.entities.Sector.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const categories = [
    { id: 'pilots', name_en: 'Pilot Programs', name_ar: 'برامج التجريب', color: '#3b82f6' },
    { id: 'rd', name_en: 'R&D Initiatives', name_ar: 'مبادرات البحث', color: '#8b5cf6' },
    { id: 'programs', name_en: 'Capacity Programs', name_ar: 'برامج بناء القدرات', color: '#10b981' },
    { id: 'infrastructure', name_en: 'Infrastructure', name_ar: 'البنية التحتية', color: '#f59e0b' },
    { id: 'scaling', name_en: 'Scaling Operations', name_ar: 'عمليات التوسع', color: '#06b6d4' },
    { id: 'operations', name_en: 'Platform Operations', name_ar: 'عمليات المنصة', color: '#ec4899' }
  ];

  const handleAIOptimize = async () => {
    const result = await invokeAI({
      prompt: `Optimize budget allocation for Saudi municipal innovation platform:

Total Budget: ${totalBudget} SAR
Active Challenges: ${challenges.length} (by sector: ${sectors.map(s => `${s.name_en}: ${challenges.filter(c => c.sector === s.code).length}`).join(', ')})
Active Pilots: ${pilots.length}
High Priority Challenges: ${challenges.filter(c => c.priority === 'tier_1').length}

Recommend optimal allocation across:
- Pilot Programs
- R&D Initiatives
- Capacity Building Programs
- Infrastructure (Labs, Sandboxes)
- Scaling Operations
- Platform Operations

Consider:
1. Sector priorities and challenge density
2. ROI potential
3. Strategic impact
4. Risk diversification

Return percentage allocations and brief justification for each.`,
      response_json_schema: {
        type: 'object',
        properties: {
          allocations: {
            type: 'object',
            properties: {
              pilots: { type: 'number' },
              rd: { type: 'number' },
              programs: { type: 'number' },
              infrastructure: { type: 'number' },
              scaling: { type: 'number' },
              operations: { type: 'number' }
            }
          },
          justification: { type: 'string' },
          sector_priorities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                sector: { type: 'string' },
                allocation: { type: 'number' },
                reason: { type: 'string' }
              }
            }
          }
        }
      }
    });

    if (result.success) {
      setAllocations(result.data.allocations || {});
      toast.success(t({ en: 'AI optimized budget allocation', ar: 'تم تحسين توزيع الميزانية بالذكاء الاصطناعي' }));
    }
  };

  const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + (val || 0), 0);
  const remaining = 100 - totalAllocated;

  const pieData = categories.map(cat => ({
    name: language === 'ar' ? cat.name_ar : cat.name_en,
    value: allocations[cat.id] || 0,
    amount: ((allocations[cat.id] || 0) / 100) * totalBudget,
    color: cat.color
  })).filter(d => d.value > 0);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '💰 Budget Allocation Tool', ar: '💰 أداة توزيع الميزانية' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'AI-powered strategic budget planning and optimization', ar: 'تخطيط وتحسين الميزانية الاستراتيجية بالذكاء الاصطناعي' })}
        </p>
        <div className="mt-4">
          <Badge variant="outline" className="bg-white/20 text-white border-white/40 text-lg px-4 py-2">
            {(totalBudget / 1000000).toFixed(1)}M SAR
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <DollarSign className="h-10 w-10 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-slate-600">{t({ en: 'Total Budget', ar: 'الميزانية الإجمالية' })}</p>
              <p className="text-3xl font-bold text-blue-600">{(totalBudget / 1000000).toFixed(0)}M</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <PieChart className="h-10 w-10 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-slate-600">{t({ en: 'Allocated', ar: 'المخصص' })}</p>
              <p className="text-3xl font-bold text-green-600">{totalAllocated.toFixed(0)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${remaining > 0 ? 'from-amber-50' : 'from-red-50'} to-white`}>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className={`h-10 w-10 ${remaining > 0 ? 'text-amber-600' : 'text-red-600'} mx-auto mb-2`} />
              <p className="text-sm text-slate-600">{t({ en: 'Remaining', ar: 'المتبقي' })}</p>
              <p className={`text-3xl font-bold ${remaining > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                {remaining.toFixed(0)}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge className="bg-purple-100 text-purple-700 mb-2">
                {categories.filter(c => allocations[c.id] > 0).length}/{categories.length}
              </Badge>
              <p className="text-sm text-slate-600">{t({ en: 'Categories', ar: 'الفئات' })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Optimization */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900 mb-1">
                {t({ en: 'AI Budget Optimizer', ar: 'محسن الميزانية الذكي' })}
              </p>
              <p className="text-sm text-slate-600">
                {t({ en: 'Let AI suggest optimal allocation based on challenges, priorities, and ROI', ar: 'دع الذكاء الاصطناعي يقترح التوزيع الأمثل بناءً على التحديات والأولويات والعائد' })}
              </p>
            </div>
            <Button onClick={handleAIOptimize} disabled={aiLoading || !isAvailable} className="bg-blue-600">
              {aiLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Optimize', ar: 'تحسين' })}
            </Button>
            <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
          </div>
        </CardContent>
      </Card>

      {/* Budget Input */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Total Budget Configuration', ar: 'تكوين الميزانية الإجمالية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(parseInt(e.target.value) || 0)}
              className="text-2xl font-bold"
            />
            <span className="text-lg text-slate-600">SAR</span>
          </div>
        </CardContent>
      </Card>

      {/* Allocation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allocation Controls */}
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Allocate by Category', ar: 'التخصيص حسب الفئة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.map((category) => {
              const percentage = allocations[category.id] || 0;
              const amount = (percentage / 100) * totalBudget;
              
              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setLockedCategories({...lockedCategories, [category.id]: !lockedCategories[category.id]})}
                        className="h-6 w-6"
                      >
                        {lockedCategories[category.id] ? <Lock className="h-3 w-3 text-amber-600" /> : <Unlock className="h-3 w-3 text-slate-400" />}
                      </Button>
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="font-medium text-slate-900">
                        {language === 'ar' ? category.name_ar : category.name_en}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={percentage}
                        onChange={(e) => setAllocations({ ...allocations, [category.id]: parseFloat(e.target.value) || 0 })}
                        className="w-20 text-right"
                      />
                      <span className="text-sm text-slate-600 w-8">%</span>
                      <span className="text-sm font-medium text-slate-900 w-32 text-right">
                        {(amount / 1000000).toFixed(2)}M
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" style={{ backgroundColor: `${category.color}20` }} />
                </div>
              );
            })}

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
                <span className="font-bold text-slate-900">{t({ en: 'Total', ar: 'الإجمالي' })}</span>
                <div className="flex items-center gap-4">
                  <Badge className={remaining === 0 ? 'bg-green-100 text-green-700' : remaining > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}>
                    {totalAllocated.toFixed(1)}%
                  </Badge>
                  <span className="font-bold text-lg text-slate-900">
                    {(totalBudget / 1000000).toFixed(2)}M SAR
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Budget Distribution', ar: 'توزيع الميزانية' })}</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value.toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                {t({ en: 'No allocations yet', ar: 'لا توجد مخصصات بعد' })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sector Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Allocation by Sector', ar: 'التخصيص حسب القطاع' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sectors.slice(0, 8).map((sector) => {
              const sectorChallenges = challenges.filter(c => c.sector === sector.code);
              const suggestedAllocation = Math.min(20, (sectorChallenges.length / challenges.length) * 100);
              
              return (
                <div key={sector.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-slate-900">{language === 'ar' ? sector.name_ar : sector.name_en}</p>
                      <p className="text-xs text-slate-500">{sectorChallenges.length} challenges</p>
                    </div>
                    <Badge variant="outline">{suggestedAllocation.toFixed(0)}% suggested</Badge>
                  </div>
                  <Progress value={suggestedAllocation} className="h-1" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Year-over-Year Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Year-over-Year Comparison', ar: 'المقارنة سنة بعد سنة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">{cat.name_en}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-600">Last Year: {lastYearAllocations[cat.id] || 0}%</span>
                  <span className="text-slate-600">→</span>
                  <span className="font-bold text-blue-600">This Year: {allocations[cat.id] || 0}%</span>
                  <Badge className={
                    (allocations[cat.id] || 0) > (lastYearAllocations[cat.id] || 0) ? 'bg-green-100 text-green-700' :
                    (allocations[cat.id] || 0) < (lastYearAllocations[cat.id] || 0) ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }>
                    {((allocations[cat.id] || 0) - (lastYearAllocations[cat.id] || 0) > 0 ? '+' : '')}
                    {((allocations[cat.id] || 0) - (lastYearAllocations[cat.id] || 0)).toFixed(0)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button 
          variant="outline"
          onClick={() => {
            const unlocked = categories.filter(c => !lockedCategories[c.id]);
            const lockedTotal = categories.filter(c => lockedCategories[c.id]).reduce((sum, c) => sum + (allocations[c.id] || 0), 0);
            const remaining = 100 - lockedTotal;
            const perUnlocked = remaining / unlocked.length;
            const optimized = {...allocations};
            unlocked.forEach(c => optimized[c.id] = perUnlocked);
            setAllocations(optimized);
            toast.success('Optimized unlocked categories');
          }}
        >
          <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Optimize Remaining', ar: 'تحسين المتبقي' })}
        </Button>
        <Button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600">
          <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Save Budget Plan', ar: 'حفظ خطة الميزانية' })}
        </Button>
        <Button variant="outline">
          <Download className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Export', ar: 'تصدير' })}
        </Button>
      </div>
    </div>
  );
}

export default ProtectedPage(BudgetAllocationTool, { requiredPermissions: [], requiredRoles: ['Executive Leadership', 'GDISB Strategy Lead', 'Financial Controller'] });