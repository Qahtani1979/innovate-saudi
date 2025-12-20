import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Eye, AlertTriangle } from 'lucide-react';

export default function ThreatDetectionSystem() {
  const { t } = useLanguage();

  const threats = [
    { type: 'SQL Injection Attempts', detected: 0, blocked: 0, status: 'not_monitored' },
    { type: 'XSS Attempts', detected: 0, blocked: 0, status: 'not_monitored' },
    { type: 'Brute Force Login', detected: 0, blocked: 0, status: 'not_monitored' },
    { type: 'DDoS Attempts', detected: 0, blocked: 0, status: 'not_monitored' },
    { type: 'Suspicious API Calls', detected: 0, blocked: 0, status: 'not_monitored' },
    { type: 'Unauthorized Access', detected: 0, blocked: 0, status: 'not_monitored' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-red-600" />
          {t({ en: 'Threat Detection', ar: 'كشف التهديدات' })}
          <Badge className="ml-auto bg-red-600">Inactive</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">No Active Threat Detection</p>
              <p>Security threats may go undetected</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {threats.map((threat, i) => (
            <div key={i} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{threat.type}</span>
                <Badge variant="outline">{threat.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                <div>
                  <p>Detected: {threat.detected}</p>
                </div>
                <div>
                  <p>Blocked: {threat.blocked}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Required capabilities:</p>
          <ul className="space-y-1 ml-4">
            <li>• Web Application Firewall (WAF)</li>
            <li>• Intrusion Detection System (IDS)</li>
            <li>• Behavioral analysis</li>
            <li>• IP reputation checking</li>
            <li>• Real-time threat intelligence</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}