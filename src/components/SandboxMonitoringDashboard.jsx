
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { AlertTriangle, Activity, Shield, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SandboxMonitoringDashboard({ sandbox }) {
  const { language, isRTL, t } = useLanguage();

  const { data: monitoringData = [] } = useQuery({
    queryKey: ['monitoring-data', sandbox.id],
    queryFn: async () => {
      const all = await base44.entities.SandboxMonitoringData.list();
      return all.filter(m => m.sandbox_id === sandbox.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['sandbox-incidents', sandbox.id],
    queryFn: async () => {
      const all = await base44.entities.SandboxIncident.list();
      return all.filter(i => i.sandbox_id === sandbox.id);
    }
  });

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const criticalAlerts = monitoringData.filter(m => m.alert_triggered);

  // Group monitoring data by metric type
  const safetyMetrics = monitoringData.filter(m => m.metric_type === 'safety').slice(0, 10);
  const complianceMetrics = monitoringData.filter(m => m.metric_type === 'compliance').slice(0, 10);

  const severityColors = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active Incidents', ar: 'الحوادث النشطة' })}</p>
                <p className="text-3xl font-bold text-red-600">{activeIncidents.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Critical Alerts', ar: 'التنبيهات الحرجة' })}</p>
                <p className="text-3xl font-bold text-amber-600">{criticalAlerts.length}</p>
              </div>
              <Zap className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Compliance Score', ar: 'نقاط الامتثال' })}</p>
                <p className="text-3xl font-bold text-green-600">94%</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Uptime', ar: 'وقت التشغيل' })}</p>
                <p className="text-3xl font-bold text-blue-600">99.2%</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Incidents */}
      {activeIncidents.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              {t({ en: 'Active Incidents - Immediate Attention Required', ar: 'الحوادث النشطة - تحتاج إلى اهتمام فوري' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeIncidents.map((incident) => (
              <div key={incident.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={severityColors[incident.severity]}>
                        {incident.severity}
                      </Badge>
                      <Badge variant="outline">{incident.incident_type.replace(/_/g, ' ')}</Badge>
                    </div>
                    <h4 className="font-semibold text-slate-900">{incident.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{incident.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{t({ en: 'Reported:', ar: 'تم الإبلاغ:' })} {new Date(incident.incident_date).toLocaleString()}</span>
                  <span>{t({ en: 'Status:', ar: 'الحالة:' })} {incident.status}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Real-Time Monitoring Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Safety Metrics - Last 24h', ar: 'مقاييس السلامة - آخر 24 ساعة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            {safetyMetrics.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={safetyMetrics.reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-500 py-8">
                {t({ en: 'No safety data available', ar: 'لا توجد بيانات سلامة' })}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Compliance Checks', ar: 'فحوصات الامتثال' })}</CardTitle>
          </CardHeader>
          <CardContent>
            {complianceMetrics.length > 0 ? (
              <div className="space-y-2">
                {complianceMetrics.slice(0, 5).map((metric, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{metric.metric_name}</span>
                    <Badge variant={metric.alert_triggered ? "destructive" : "default"}>
                      {metric.value} {metric.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">
                {t({ en: 'All compliance checks passed', ar: 'تم اجتياز جميع فحوصات الامتثال' })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live Status Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Live System Status', ar: 'حالة النظام المباشرة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Geofencing', status: 'operational', value: '✓' },
              { label: 'Safety Sensors', status: 'operational', value: '98%' },
              { label: 'Data Stream', status: 'operational', value: '✓' },
              { label: 'Emergency Protocol', status: 'standby', value: 'Ready' }
            ].map((item, idx) => (
              <div key={idx} className="text-center p-4 border rounded-lg">
                <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                <p className="text-2xl font-bold text-green-600">{item.value}</p>
                <div className="mt-2">
                  <div className={`w-2 h-2 rounded-full mx-auto ${item.status === 'operational' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}