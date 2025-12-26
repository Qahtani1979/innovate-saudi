import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Shield, AlertTriangle } from 'lucide-react';

export default function InputValidationMiddleware() {
  const { t } = useLanguage();

  const validationRules = [
    { field: 'Email fields', rule: 'Email format validation', status: 'missing' },
    { field: 'URL fields', rule: 'URL format & whitelist', status: 'missing' },
    { field: 'File uploads', rule: 'File type & size validation', status: 'partial' },
    { field: 'Numeric fields', rule: 'Range & type validation', status: 'missing' },
    { field: 'Text inputs', rule: 'XSS prevention & sanitization', status: 'missing' },
    { field: 'Date fields', rule: 'Date format validation', status: 'partial' },
    { field: 'SQL injection', rule: 'Parameterized queries', status: 'partial' },
    { field: 'Command injection', rule: 'Command sanitization', status: 'missing' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-600" />
          {t({ en: 'Input Validation', ar: 'التحقق من المدخلات' })}
          <Badge className="ml-auto bg-red-600">Critical</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">Comprehensive Input Validation Missing</p>
              <p>All API endpoints need server-side validation</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {validationRules.map((rule, i) => (
            <div key={i} className="flex items-center justify-between p-2 border rounded text-xs">
              <div>
                <p className="font-medium">{rule.field}</p>
                <p className="text-slate-600">{rule.rule}</p>
              </div>
              <Badge variant={rule.status === 'missing' ? 'destructive' : 'outline'}>
                {rule.status}
              </Badge>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Required implementation:</p>
          <ul className="space-y-1 ml-4">
            <li>• Schema validation using Zod/Joi</li>
            <li>• XSS sanitization library</li>
            <li>• Rate limiting per endpoint</li>
            <li>• Request size limits</li>
            <li>• Whitelist validation for enums</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
