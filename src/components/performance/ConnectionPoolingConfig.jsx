import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Database, AlertCircle } from 'lucide-react';

export default function ConnectionPoolingConfig() {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          {t({ en: 'Connection Pooling', ar: 'تجميع الاتصالات' })}
          <Badge className="ml-auto bg-amber-600">Not Optimized</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-amber-800">
              <p className="font-medium">Database Connection Inefficiency</p>
              <p>Creating new connections for each request</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 border rounded-lg">
            <p className="text-sm font-medium mb-2">Current Configuration</p>
            <div className="space-y-1 text-xs text-slate-600">
              <p>Min Pool Size: Default</p>
              <p>Max Pool Size: Default</p>
              <p>Connection Timeout: Default</p>
              <p>Idle Timeout: Default</p>
            </div>
          </div>

          <div className="p-3 border rounded-lg bg-green-50">
            <p className="text-sm font-medium mb-2 text-green-900">Recommended Configuration</p>
            <div className="space-y-1 text-xs text-green-800">
              <p>Min Pool Size: 10</p>
              <p>Max Pool Size: 50</p>
              <p>Connection Timeout: 10s</p>
              <p>Idle Timeout: 30s</p>
              <p>Statement Timeout: 60s</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Expected improvements:</p>
          <ul className="space-y-1 ml-4">
            <li>• 40-60% faster response times</li>
            <li>• Reduced database load</li>
            <li>• Better concurrent user handling</li>
            <li>• Lower connection overhead</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
