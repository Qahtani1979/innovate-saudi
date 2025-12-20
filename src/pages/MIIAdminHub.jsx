import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '@/components/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import AutomatedMIICalculator from '@/components/strategy/AutomatedMIICalculator';
import {
  Settings, Calculator, Database, Clock, RefreshCw, TrendingUp, 
  AlertTriangle, CheckCircle, Activity, Layers, Target, BarChart3,
  Zap, Calendar, Shield, FileText
} from 'lucide-react';

function MIIAdminHub() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch MII dimensions
  const { data: dimensions = [] } = useQuery({
    queryKey: ['mii-dimensions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mii_dimensions')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch MII calculation stats
  const { data: calcStats } = useQuery({
    queryKey: ['mii-calc-stats'],
    queryFn: async () => {
      const { data: results, error } = await supabase
        .from('mii_results')
        .select('id, assessment_date, municipality_id, overall_score, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      const uniqueMunicipalities = new Set((results || []).map(r => r.municipality_id)).size;
      const latestCalc = results?.[0]?.created_at;
      const avgScore = results?.length > 0 
        ? (results.reduce((sum, r) => sum + (r.overall_score || 0), 0) / results.length).toFixed(1)
        : 0;
      
      return {
        totalCalculations: results?.length || 0,
        uniqueMunicipalities,
        latestCalculation: latestCalc,
        averageScore: avgScore
      };
    }
  });

  // Fetch municipalities pending recalculation
  const { data: pendingRecalc = [] } = useQuery({
    queryKey: ['mii-pending-recalc'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('municipalities')
        .select('id, name_en, name_ar, mii_recalc_pending, mii_last_calculated_at')
        .eq('mii_recalc_pending', true);
      if (error) throw error;
      return data || [];
    }
  });

  // Recalculate all mutation
  const recalculateAllMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('calculate-mii', {
        body: { calculateAll: true }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success(t({ en: 'MII recalculation started for all municipalities', ar: 'بدأت إعادة حساب MII لجميع البلديات' }));
      queryClient.invalidateQueries({ queryKey: ['mii-calc-stats'] });
      queryClient.invalidateQueries({ queryKey: ['mii-pending-recalc'] });
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Toggle dimension active status
  const toggleDimensionMutation = useMutation({
    mutationFn: async ({ id, isActive }) => {
      const { error } = await supabase
        .from('mii_dimensions')
        .update({ is_active: isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mii-dimensions'] });
      toast.success(t({ en: 'Dimension updated', ar: 'تم تحديث البُعد' }));
    }
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <PageLayout>
      <PageHeader
        title={t({ en: 'MII Administration Hub', ar: 'مركز إدارة مؤشر الابتكار البلدي' })}
        description={t({ en: 'Manage MII dimensions, calculations, and monitoring settings', ar: 'إدارة أبعاد MII والحسابات وإعدادات المراقبة' })}
        icon={<Settings className="h-8 w-8 text-primary" />}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Dimensions', ar: 'الأبعاد' })}</p>
                <p className="text-2xl font-bold">{dimensions.filter(d => d.is_active).length}/{dimensions.length}</p>
              </div>
              <Layers className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Municipalities', ar: 'البلديات' })}</p>
                <p className="text-2xl font-bold">{calcStats?.uniqueMunicipalities || 0}</p>
              </div>
              <Database className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Avg Score', ar: 'متوسط النقاط' })}</p>
                <p className="text-2xl font-bold">{calcStats?.averageScore || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Pending', ar: 'معلق' })}</p>
                <p className="text-2xl font-bold">{pendingRecalc.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            {t({ en: 'Overview', ar: 'نظرة عامة' })}
          </TabsTrigger>
          <TabsTrigger value="dimensions" className="gap-2">
            <Layers className="h-4 w-4" />
            {t({ en: 'Dimensions', ar: 'الأبعاد' })}
          </TabsTrigger>
          <TabsTrigger value="calculator" className="gap-2">
            <Calculator className="h-4 w-4" />
            {t({ en: 'Calculator', ar: 'الحاسبة' })}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2">
            <Calendar className="h-4 w-4" />
            {t({ en: 'Schedule', ar: 'الجدول' })}
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="gap-2">
            <Activity className="h-4 w-4" />
            {t({ en: 'Monitoring', ar: 'المراقبة' })}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  {t({ en: 'Quick Actions', ar: 'الإجراءات السريعة' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => recalculateAllMutation.mutate()}
                  disabled={recalculateAllMutation.isPending}
                  className="w-full gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${recalculateAllMutation.isPending ? 'animate-spin' : ''}`} />
                  {t({ en: 'Recalculate All MII Scores', ar: 'إعادة حساب جميع نقاط MII' })}
                </Button>
                
                <Button variant="outline" className="w-full gap-2" asChild>
                  <a href="/mii">
                    <BarChart3 className="h-4 w-4" />
                    {t({ en: 'View MII Rankings', ar: 'عرض تصنيفات MII' })}
                  </a>
                </Button>
                
                <Button variant="outline" className="w-full gap-2" asChild>
                  <a href="/mii-coverage-report">
                    <FileText className="h-4 w-4" />
                    {t({ en: 'Coverage Report', ar: 'تقرير التغطية' })}
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  {t({ en: 'Calculation Status', ar: 'حالة الحساب' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t({ en: 'Last Calculation', ar: 'آخر حساب' })}</span>
                  <span className="font-medium">{formatDate(calcStats?.latestCalculation)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t({ en: 'Daily Cron Job', ar: 'مهمة يومية' })}</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t({ en: 'Active (2 AM)', ar: 'نشط (2 صباحاً)' })}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t({ en: 'Data Triggers', ar: 'محفزات البيانات' })}</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t({ en: 'Enabled', ar: 'مفعّل' })}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Recalculations */}
          {pendingRecalc.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  {t({ en: 'Municipalities Pending Recalculation', ar: 'البلديات المعلقة لإعادة الحساب' })}
                </CardTitle>
                <CardDescription>
                  {t({ 
                    en: 'These municipalities have data changes and will be recalculated in the next scheduled run', 
                    ar: 'هذه البلديات لديها تغييرات في البيانات وسيتم إعادة حسابها في الجولة المجدولة التالية' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {pendingRecalc.map(m => (
                    <Badge key={m.id} variant="secondary">
                      {m.name_en}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Dimensions Tab */}
        <TabsContent value="dimensions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'MII Dimensions Configuration', ar: 'تكوين أبعاد MII' })}</CardTitle>
              <CardDescription>
                {t({ en: 'Manage dimension weights and active status', ar: 'إدارة أوزان الأبعاد والحالة النشطة' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dimensions.map(dim => (
                  <div key={dim.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${dim.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <p className="font-medium">{dim.name_en}</p>
                        <p className="text-sm text-muted-foreground">{dim.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-lg font-bold text-primary">{(dim.weight * 100).toFixed(0)}%</p>
                        <p className="text-xs text-muted-foreground">{t({ en: 'Weight', ar: 'الوزن' })}</p>
                      </div>
                      <Switch
                        checked={dim.is_active}
                        onCheckedChange={(checked) => toggleDimensionMutation.mutate({ id: dim.id, isActive: checked })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-4">
          <AutomatedMIICalculator />
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                {t({ en: 'Calculation Schedule', ar: 'جدول الحساب' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium">{t({ en: 'Daily Automated Calculation', ar: 'الحساب الآلي اليومي' })}</p>
                    <p className="text-sm text-muted-foreground">
                      {t({ en: 'Runs every day at 2:00 AM server time', ar: 'يعمل كل يوم في الساعة 2:00 صباحاً بتوقيت الخادم' })}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t({ en: 'Active', ar: 'نشط' })}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground font-mono bg-background p-2 rounded">
                  cron.schedule('daily-mii-recalculation', '0 2 * * *', ...)
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium">{t({ en: 'Data Change Triggers', ar: 'محفزات تغيير البيانات' })}</p>
                    <p className="text-sm text-muted-foreground">
                      {t({ en: 'Auto-flags municipalities when challenges, pilots, or partnerships change', ar: 'يضع علامة تلقائياً على البلديات عند تغيير التحديات أو التجارب أو الشراكات' })}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t({ en: 'Enabled', ar: 'مفعّل' })}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="p-2 bg-muted rounded text-center">
                    <Target className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                    challenges
                  </div>
                  <div className="p-2 bg-muted rounded text-center">
                    <Activity className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                    pilots
                  </div>
                  <div className="p-2 bg-muted rounded text-center">
                    <Shield className="h-4 w-4 mx-auto mb-1 text-green-500" />
                    partnerships
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Data Inputs', ar: 'مدخلات البيانات' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { table: 'municipalities', icon: Database, color: 'text-blue-500' },
                    { table: 'challenges', icon: Target, color: 'text-orange-500' },
                    { table: 'pilots', icon: Activity, color: 'text-green-500' },
                    { table: 'partnerships', icon: Shield, color: 'text-purple-500' },
                    { table: 'case_studies', icon: FileText, color: 'text-cyan-500' }
                  ].map(({ table, icon: Icon, color }) => (
                    <div key={table} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${color}`} />
                        <span className="font-mono text-sm">{table}</span>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Output Targets', ar: 'أهداف المخرجات' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <span className="font-mono text-sm">mii_results</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <div className="flex items-center gap-3">
                      <Database className="h-4 w-4 text-blue-500" />
                      <span className="font-mono text-sm">municipalities.mii_score</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Synced
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <span className="font-mono text-sm">municipalities.mii_rank</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Synced
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Refresh Rates Summary', ar: 'ملخص معدلات التحديث' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">{t({ en: 'Trigger Type', ar: 'نوع المحفز' })}</th>
                      <th className="text-left py-2">{t({ en: 'Frequency', ar: 'التكرار' })}</th>
                      <th className="text-left py-2">{t({ en: 'Method', ar: 'الطريقة' })}</th>
                      <th className="text-left py-2">{t({ en: 'Status', ar: 'الحالة' })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">{t({ en: 'Scheduled', ar: 'مجدول' })}</td>
                      <td className="py-2">{t({ en: 'Daily at 2 AM', ar: 'يومياً في 2 صباحاً' })}</td>
                      <td className="py-2 font-mono text-xs">pg_cron</td>
                      <td className="py-2"><Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge></td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">{t({ en: 'On-Demand', ar: 'عند الطلب' })}</td>
                      <td className="py-2">{t({ en: 'Manual trigger', ar: 'تشغيل يدوي' })}</td>
                      <td className="py-2 font-mono text-xs">Edge Function</td>
                      <td className="py-2"><Badge variant="outline" className="bg-green-50 text-green-700">Available</Badge></td>
                    </tr>
                    <tr>
                      <td className="py-2">{t({ en: 'Data-triggered', ar: 'بتحفيز البيانات' })}</td>
                      <td className="py-2">{t({ en: 'On entity change', ar: 'عند تغيير الكيان' })}</td>
                      <td className="py-2 font-mono text-xs">DB Triggers</td>
                      <td className="py-2"><Badge variant="outline" className="bg-green-50 text-green-700">Enabled</Badge></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}

export default ProtectedPage(MIIAdminHub, { requireAdmin: true });
