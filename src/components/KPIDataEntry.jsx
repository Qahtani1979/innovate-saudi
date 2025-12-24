import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { TrendingUp, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function KPIDataEntry({ pilot }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [values, setValues] = useState({});

  const { data: pilotKPIs = [] } = useQuery({
    queryKey: ['pilot-kpis', pilot.id],
    queryFn: async () => {
      const all = await base44.entities.PilotKPI.list();
      return all.filter(k => k.pilot_id === pilot.id);
    },
    enabled: !!pilot.id
  });

  const { data: datapoints = [] } = useQuery({
    queryKey: ['kpi-datapoints', pilot.id],
    queryFn: async () => {
      const all = await base44.entities.PilotKPIDatapoint.list();
      return all;
    },
    enabled: !!pilot.id
  });

  const saveMutation = useMutation({
    mutationFn: async ({ kpiId, value }) => {
      await base44.entities.PilotKPI.update(kpiId, { 
        current_value: parseFloat(value),
        last_updated: new Date().toISOString()
      });
      
      await base44.entities.PilotKPIDatapoint.create({
        pilot_kpi_id: kpiId,
        value: parseFloat(value),
        timestamp: new Date().toISOString(),
        source: 'manual'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pilot']);
      queryClient.invalidateQueries(['kpi-datapoints']);
      setValues({});
      toast.success(t({ en: 'KPI data saved', ar: 'تم حفظ بيانات المؤشر' }));
    }
  });

  const handleSave = (kpiId) => {
    const value = values[kpiId];
    if (!value) return;
    
    saveMutation.mutate({ kpiId, value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          {t({ en: 'KPI Data Entry', ar: 'إدخال بيانات المؤشرات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pilotKPIs.map((kpi, index) => {
          const recentData = datapoints.filter(d => d.pilot_kpi_id === kpi.id).slice(0, 3);
          
          return (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{kpi.custom_name_en || kpi.custom_name_ar}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs">
                    <span className="text-slate-500">
                      {t({ en: 'Baseline:', ar: 'الأساس:' })} <strong>{kpi.baseline_value} {kpi.unit}</strong>
                    </span>
                    <span className="text-slate-500">
                      {t({ en: 'Target:', ar: 'الهدف:' })} <strong className="text-green-600">{kpi.target_value} {kpi.unit}</strong>
                    </span>
                    <span className="text-slate-500">
                      {t({ en: 'Current:', ar: 'الحالي:' })} <strong className="text-blue-600">{kpi.current_value || '—'} {kpi.unit}</strong>
                    </span>
                  </div>
                </div>
                <Badge className={
                  kpi.status === 'on_track' ? 'bg-green-100 text-green-700' :
                  kpi.status === 'at_risk' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }>
                  {kpi.status || 'pending'}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder={t({ en: 'Enter new value', ar: 'أدخل قيمة جديدة' })}
                  value={values[kpi.id] || ''}
                  onChange={(e) => setValues({ ...values, [kpi.id]: e.target.value })}
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleSave(kpi.id)}
                  disabled={!values[kpi.id] || saveMutation.isPending}
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {t({ en: 'Save', ar: 'حفظ' })}
                </Button>
              </div>

              {recentData.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium text-slate-600 mb-2">
                    {t({ en: 'Recent Entries:', ar: 'الإدخالات الأخيرة:' })}
                  </p>
                  <div className="space-y-1">
                    {recentData.map((d, i) => (
                      <div key={i} className="text-xs text-slate-600 flex justify-between">
                        <span>{new Date(d.recorded_date).toLocaleDateString()}</span>
                        <strong>{d.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {pilotKPIs.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">
            {t({ en: 'No KPIs defined yet', ar: 'لم يتم تحديد مؤشرات بعد' })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}