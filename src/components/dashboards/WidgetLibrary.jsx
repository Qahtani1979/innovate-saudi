import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Layout, BarChart, Map, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

export default function WidgetLibrary() {
  const { t } = useLanguage();

  const widgets = [
    { name: 'KPI Card', icon: BarChart, status: 'available' },
    { name: 'Line Chart', icon: TrendingUp, status: 'available' },
    { name: 'Map Viewer', icon: Map, status: 'available' },
    { name: 'Calendar', icon: Calendar, status: 'available' },
    { name: 'Timeline', icon: Layout, status: 'missing' },
    { name: 'Network Graph', icon: Layout, status: 'missing' },
    { name: 'Heatmap', icon: Layout, status: 'missing' },
    { name: 'Funnel Chart', icon: Layout, status: 'missing' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layout className="h-5 w-5 text-blue-600" />
          {t({ en: 'Dashboard Widget Library', ar: 'مكتبة عناصر لوحة التحكم' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-amber-800">
              <p className="font-medium">More Widget Types Needed</p>
              <p>Timeline, network graph, heatmap, and funnel widgets missing</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {widgets.map((widget, idx) => {
            const Icon = widget.icon;
            return (
              <div key={idx} className="p-3 border rounded-lg text-center">
                <Icon className="h-6 w-6 mx-auto mb-2 text-slate-600" />
                <p className="text-xs font-medium">{widget.name}</p>
                <Badge variant={widget.status === 'available' ? 'default' : 'outline'} className="text-xs mt-1">
                  {widget.status}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}