import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Users, Beaker, Shield, DollarSign, AlertTriangle } from 'lucide-react';

export default function ResourceAllocationView() {
  const { language, isRTL, t } = useLanguage();

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase.from('teams').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: labs = [] } = useQuery({
    queryKey: ['living-labs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('living_labs').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: sandboxes = [] } = useQuery({
    queryKey: ['sandboxes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sandboxes').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pilots').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const teamCapacity = teams.reduce((sum, t) => sum + (t.member_count || 0), 0);
  const teamUtilization = (pilots.filter(p => p.stage === 'active').length / Math.max(1, teamCapacity)) * 100;
  
  const labUtilization = labs.reduce((sum, l) => sum + (l.current_utilization || 0), 0) / Math.max(1, labs.length);
  const sandboxUtilization = (sandboxes.filter(s => s.status === 'active').length / Math.max(1, sandboxes.length)) * 100;

  const totalBudget = pilots.reduce((sum, p) => sum + (p.budget || 0), 0);
  const spentBudget = pilots.reduce((sum, p) => sum + (p.budget_released || 0), 0);
  const budgetUtilization = (spentBudget / Math.max(1, totalBudget)) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t({ en: 'Team Capacity', ar: 'سعة الفريق' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">{t({ en: 'Total Members', ar: 'إجمالي الأعضاء' })}</span>
            <span className="font-bold text-2xl">{teamCapacity}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">{t({ en: 'Active Projects', ar: 'المشاريع النشطة' })}</span>
            <span className="font-bold text-2xl">{pilots.filter(p => p.stage === 'active').length}</span>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">{t({ en: 'Utilization', ar: 'الاستخدام' })}</span>
              <span className="font-bold">{teamUtilization.toFixed(0)}%</span>
            </div>
            <Progress value={teamUtilization} className="h-3" />
            {teamUtilization > 80 && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 rounded">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <p className="text-xs text-red-700">{t({ en: 'Overallocation risk', ar: 'خطر التخصيص الزائد' })}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            {t({ en: 'Living Labs', ar: 'المختبرات الحية' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">{t({ en: 'Total Labs', ar: 'إجمالي المختبرات' })}</span>
            <span className="font-bold text-2xl">{labs.length}</span>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">{t({ en: 'Avg Utilization', ar: 'متوسط الاستخدام' })}</span>
              <span className="font-bold">{labUtilization.toFixed(0)}%</span>
            </div>
            <Progress value={labUtilization} className="h-3" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {labs.slice(0, 4).map((lab, i) => (
              <div key={i} className="p-2 bg-slate-50 rounded border text-xs">
                <p className="font-medium truncate">{lab.name_en}</p>
                <Badge className="mt-1 text-xs">{lab.current_utilization || 0}%</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t({ en: 'Sandboxes', ar: 'مناطق التجريب' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">{t({ en: 'Total Zones', ar: 'إجمالي المناطق' })}</span>
            <span className="font-bold text-2xl">{sandboxes.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</span>
            <span className="font-bold text-2xl">{sandboxes.filter(s => s.status === 'active').length}</span>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">{t({ en: 'Occupancy', ar: 'الإشغال' })}</span>
              <span className="font-bold">{sandboxUtilization.toFixed(0)}%</span>
            </div>
            <Progress value={sandboxUtilization} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t({ en: 'Budget Deployment', ar: 'نشر الميزانية' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 rounded text-center">
              <p className="text-xs text-slate-600">{t({ en: 'Allocated', ar: 'مخصص' })}</p>
              <p className="text-lg font-bold text-blue-600">{(totalBudget / 1000000).toFixed(1)}M</p>
            </div>
            <div className="p-3 bg-green-50 rounded text-center">
              <p className="text-xs text-slate-600">{t({ en: 'Spent', ar: 'منفق' })}</p>
              <p className="text-lg font-bold text-green-600">{(spentBudget / 1000000).toFixed(1)}M</p>
            </div>
            <div className="p-3 bg-purple-50 rounded text-center">
              <p className="text-xs text-slate-600">{t({ en: 'Remaining', ar: 'متبقي' })}</p>
              <p className="text-lg font-bold text-purple-600">{((totalBudget - spentBudget) / 1000000).toFixed(1)}M</p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">{t({ en: 'Deployment Rate', ar: 'معدل النشر' })}</span>
              <span className="font-bold">{budgetUtilization.toFixed(0)}%</span>
            </div>
            <Progress value={budgetUtilization} className="h-3" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}