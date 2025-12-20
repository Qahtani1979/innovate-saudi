import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { AlertTriangle } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ErrorLogsConsole() {
  const { t } = useLanguage();

  const errors = [
    { level: 'warning', message: 'API response time increased', timestamp: '2 min ago' },
    { level: 'error', message: 'Data validation failed for Challenge CH-089', timestamp: '15 min ago' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <AlertTriangle className="h-8 w-8 text-red-600" />
        {t({ en: 'Error Logs Console', ar: 'وحدة تحكم سجلات الأخطاء' })}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Recent Errors', ar: 'الأخطاء الأخيرة' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {errors.map((error, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 ${error.level === 'error' ? 'text-red-600' : 'text-yellow-600'}`} />
                  <div>
                    <Badge className={error.level === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                      {error.level}
                    </Badge>
                    <p className="text-sm mt-1">{error.message}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500">{error.timestamp}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ErrorLogsConsole, { requireAdmin: true });