import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../LanguageContext';
import { Lock, AlertCircle } from 'lucide-react';

export default function DataEncryptionConfig() {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-red-600" />
          {t({ en: 'Data Encryption', ar: 'تشفير البيانات' })}
          <Badge className="ml-auto bg-red-600">Critical Gap</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">Encryption at Rest Not Configured</p>
              <p>Sensitive data should be encrypted in database</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Database Encryption</p>
              <p className="text-xs text-slate-500">AES-256 for sensitive fields</p>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">File Encryption</p>
              <p className="text-xs text-slate-500">Encrypt uploaded files</p>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Backup Encryption</p>
              <p className="text-xs text-slate-500">Encrypt backup archives</p>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Key Management Service</p>
              <p className="text-xs text-slate-500">AWS KMS or similar</p>
            </div>
            <Switch disabled />
          </div>
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Encryption scope:</p>
          <ul className="space-y-1 ml-4">
            <li>• Contact information (emails, phones)</li>
            <li>• Financial data (budgets, costs)</li>
            <li>• Strategic information</li>
            <li>• Personal identifiable information (PII)</li>
            <li>• Session tokens & API keys</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}