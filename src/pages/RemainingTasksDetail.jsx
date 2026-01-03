import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { ListTodo, Database, Shield, Zap, CheckCircle2 } from 'lucide-react';

export default function RemainingTasksDetail() {
  const { isRTL, t } = useLanguage();

  const infrastructureItems = [
    { name: 'Database Indexing', category: 'Performance', status: 'DBA Deployment', icon: Database },
    { name: 'OAuth Integration', category: 'Security', status: 'In Progress', icon: Shield },
    { name: 'API Rate Limiting', category: 'Performance', status: 'Pending', icon: Zap },
    { name: 'Caching Layer', category: 'Performance', status: 'In Progress', icon: Database },
  ];

  const statusColors = {
    'DBA Deployment': 'bg-purple-100 text-purple-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Pending': 'bg-slate-100 text-slate-700',
    'Complete': 'bg-green-100 text-green-700'
  };

  return (
    <div className="space-y-6 p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-3">
        <ListTodo className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t({ en: 'Remaining Tasks Detail', ar: 'تفاصيل المهام المتبقية' })}
          </h1>
          <p className="text-slate-600">
            {t({ en: 'Infrastructure and deployment items', ar: 'بنود البنية التحتية والنشر' })}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            {t({ en: 'Infrastructure Items', ar: 'عناصر البنية التحتية' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {infrastructureItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.category}</p>
                  </div>
                </div>
                <Badge className={statusColors[item.status] || 'bg-slate-100 text-slate-700'}>
                  {item.status}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}