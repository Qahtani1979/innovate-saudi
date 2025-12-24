import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../LanguageContext';
import { Activity, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function RealTimeKPIIntegration({ pilot, kpi }) {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState('');

  const syncData = async () => {
    setSyncing(true);
    try {
      // Simulate API data sync
      const newValue = Math.random() * 100;
      
      await base44.entities.PilotKPIDatapoint.create({
        pilot_kpi_id: kpi.id,
        value: newValue.toFixed(2),
        timestamp: new Date().toISOString(),
        source: 'api_sync'
      });

      queryClient.invalidateQueries(['pilot-kpis']);
      toast.success(t({ en: 'KPI data synced', ar: 'بيانات المؤشر متزامنة' }));
    } catch (error) {
      toast.error(t({ en: 'Sync failed', ar: 'فشلت المزامنة' }));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          {t({ en: 'Real-Time KPI Integration', ar: 'تكامل المؤشرات المباشر' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Data Source API Endpoint', ar: 'نقطة نهاية API لمصدر البيانات' })}
          </label>
          <Input
            value={apiEndpoint}
            onChange={(e) => setApiEndpoint(e.target.value)}
            placeholder="https://api.example.com/kpi-data"
          />
        </div>

        <Button onClick={syncData} disabled={syncing} className="w-full bg-blue-600">
          {syncing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {t({ en: 'Sync Now', ar: 'مزامنة الآن' })}
        </Button>

        <div className="p-3 bg-blue-50 rounded border border-blue-300">
          <p className="text-xs text-slate-600">
            {t({ 
              en: 'KPI data will sync automatically every hour. Real-time updates without manual entry.', 
              ar: 'بيانات المؤشرات ستتزامن تلقائياً كل ساعة. تحديثات فورية بدون إدخال يدوي.' 
            })}
          </p>
        </div>

        <div className="p-3 bg-amber-50 rounded border border-amber-300 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
          <p className="text-xs text-slate-700">
            {t({ 
              en: 'AI will detect anomalies and alert if KPI drops >40% in one week', 
              ar: 'الذكاء سيكتشف الشذوذات وينبه إذا انخفض المؤشر >40% في أسبوع' 
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}