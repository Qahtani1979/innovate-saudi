import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from './LanguageContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  AlertCircle, CheckCircle2,
  Upload, Loader2, RefreshCw, Database
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { usePilotKPIs, usePilotKPIDatapoints, useAddKPIDatapoint } from '@/hooks/useKPIs';

export default function EnhancedKPITracker({ pilot }) {
  const { language, isRTL, t } = useLanguage();
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [manualValue, setManualValue] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');

  const { invokeAI, status, error: aiError, rateLimitInfo, isLoading: aiLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const { data: pilotKPIs = [], isLoading: kpisLoading } = usePilotKPIs(pilot.id);
  const { data: kpiDatapoints = [], isLoading: datapointsLoading } = usePilotKPIDatapoints(pilot.id);
  const addDatapoint = useAddKPIDatapoint();

  const handleManualEntry = () => {
    if (!selectedKPI || !manualValue) return;

    addDatapoint.mutate({
      kpiId: selectedKPI,
      value: manualValue
    }, {
      onSuccess: () => {
        setManualValue('');
        toast.success(t({ en: 'KPI value recorded', ar: 'تم تسجيل قيمة المؤشر' }));
      }
    });
  };

  const handleAutoIngest = async (kpiId) => {
    if (!apiEndpoint) return;

    try {
      const prompt = `Extract KPI value from this data source endpoint: ${apiEndpoint}
      Parse the response and return the numeric KPI value.`;

      const result = await invokeAI({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            value: { type: "number" },
            timestamp: { type: "string" },
            source_notes: { type: "string" }
          },
          required: ["value"]
        }
      });

      if (result.success && result.data) {
        addDatapoint.mutate({
          kpiId,
          value: result.data.value,
          source: 'automated',
          notes: `Auto-ingested from ${apiEndpoint}. ${result.data.source_notes || ''}`,
          timestamp: result.data.timestamp || new Date().toISOString()
        }, {
          onSuccess: () => {
            setApiEndpoint('');
            toast.success(t({ en: 'Data ingested successfully', ar: 'تم استيراد البيانات بنجاح' }));
          }
        });
      }
    } catch (err) {
      console.error('Auto-ingest failed:', err);
    }
  };

  const getKPITrend = (kpiId) => {
    const points = kpiDatapoints
      .filter(d => d.pilot_kpi_id === kpiId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-10);

    return points.map((p, idx) => ({
      index: idx + 1,
      value: p.value,
      date: new Date(p.timestamp).toLocaleDateString()
    }));
  };

  const calculateProgress = (kpi) => {
    if (!kpi.baseline_value || !kpi.target_value || !kpi.current_value) return 0;
    const range = kpi.target_value - kpi.baseline_value;
    if (range === 0) return 100;
    const progress = kpi.current_value - kpi.baseline_value;
    return Math.max(0, Math.min(100, (progress / range) * 100));
  };

  const getKPIStatus = (kpi) => {
    const progress = calculateProgress(kpi);
    if (progress >= 90) return { status: 'on_track', color: 'text-green-600', icon: CheckCircle2 };
    if (progress >= 60) return { status: 'at_risk', color: 'text-yellow-600', icon: AlertCircle };
    return { status: 'off_track', color: 'text-red-600', icon: AlertCircle };
  };

  const isLoading = kpisLoading || datapointsLoading;

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            {t({ en: 'Enhanced KPI Tracking', ar: 'تتبع المؤشرات المحسّن' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <AIStatusIndicator status={status} error={aiError} rateLimitInfo={rateLimitInfo} showDetails />

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : pilotKPIs.length > 0 ? (
            pilotKPIs.map((kpi) => {
              const trend = getKPITrend(kpi.id);
              const kpiStatus = getKPIStatus(kpi);
              const StatusIcon = kpiStatus.icon;
              const progress = calculateProgress(kpi);

              return (
                <div key={kpi.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">
                        {language === 'ar' ? (kpi.custom_name_ar || kpi.custom_name_en) : (kpi.custom_name_en || 'KPI')}
                      </h4>
                      <p className="text-sm text-slate-600 mt-1">{kpi.unit}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={kpiStatus.status === 'on_track' ? 'bg-green-100 text-green-700' :
                        kpiStatus.status === 'at_risk' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'}>
                        {kpiStatus.status.replace(/_/g, ' ')}
                      </Badge>
                      <StatusIcon className={`h-5 w-5 ${kpiStatus.color}`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">{t({ en: 'Baseline:', ar: 'الأساس:' })}</span>
                      <p className="font-semibold text-slate-900">{kpi.baseline_value}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">{t({ en: 'Current:', ar: 'الحالي:' })}</span>
                      <p className="font-semibold text-blue-600">{kpi.current_value || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">{t({ en: 'Target:', ar: 'الهدف:' })}</span>
                      <p className="font-semibold text-green-600">{kpi.target_value}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>{t({ en: 'Progress', ar: 'التقدم' })}</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {trend.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-slate-600 mb-2">
                        {t({ en: 'Trend (Last 10 readings)', ar: 'الاتجاه (آخر 10 قراءات)' })}
                      </p>
                      <ResponsiveContainer width="100%" height={120}>
                        <LineChart data={trend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="index" hide />
                          <YAxis />
                          <Tooltip labelFormatter={(v, n) => n?.[0]?.payload?.date} />
                          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{t({ en: 'Source:', ar: 'المصدر:' })}</span>
                    <Badge variant="outline" className="text-xs">
                      {kpi.data_source || kpi.collection_frequency || 'manual'}
                    </Badge>
                    {kpi.last_updated && (
                      <span>
                        {t({ en: 'Updated:', ar: 'محدث:' })} {new Date(kpi.last_updated).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedKPI(kpi.id);
                            setManualValue('');
                          }}
                        >
                          <Upload className="h-3 w-3 mr-2" />
                          {t({ en: 'Manual Entry', ar: 'إدخال يدوي' })}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t({ en: 'Record KPI Value', ar: 'تسجيل قيمة المؤشر' })}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              {t({ en: 'Value', ar: 'القيمة' })}
                            </label>
                            <Input
                              type="number"
                              value={manualValue}
                              onChange={(e) => setManualValue(e.target.value)}
                              placeholder={`Enter value in ${kpi.unit}`}
                            />
                          </div>
                          <Button
                            onClick={handleManualEntry}
                            disabled={!manualValue || addDatapoint.isPending}
                            className="w-full"
                          >
                            {addDatapoint.isPending ? (
                              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t({ en: 'Saving...', ar: 'جاري الحفظ...' })}</>
                            ) : (
                              <>{t({ en: 'Save Value', ar: 'حفظ القيمة' })}</>
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedKPI(kpi.id);
                            setApiEndpoint('');
                          }}
                          disabled={!isAvailable}
                        >
                          <RefreshCw className="h-3 w-3 mr-2" />
                          {t({ en: 'Auto Ingest', ar: 'استيراد تلقائي' })}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t({ en: 'Configure Auto Data Ingestion', ar: 'تكوين الاستيراد التلقائي' })}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              {t({ en: 'API Endpoint / Data Source', ar: 'نقطة النهاية / مصدر البيانات' })}
                            </label>
                            <Textarea
                              value={apiEndpoint}
                              onChange={(e) => setApiEndpoint(e.target.value)}
                              placeholder="https://api.example.com/kpi-data OR CRM 940 System"
                              rows={3}
                            />
                          </div>
                          <Button
                            onClick={() => handleAutoIngest(kpi.id)}
                            disabled={!apiEndpoint || aiLoading || addDatapoint.isPending}
                            className="w-full bg-blue-600"
                          >
                            {aiLoading || addDatapoint.isPending ? (
                              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t({ en: 'Ingesting...', ar: 'جاري الاستيراد...' })}</>
                            ) : (
                              <>{t({ en: 'Ingest Data', ar: 'استيراد البيانات' })}</>
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-500">
              {t({ en: 'No KPIs defined for this pilot', ar: 'لم يتم تحديد مؤشرات لهذه التجربة' })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}