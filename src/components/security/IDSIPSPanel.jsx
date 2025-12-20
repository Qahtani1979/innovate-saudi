import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertCircle } from 'lucide-react';

export default function IDSIPSPanel() {
  const threats = [
    { type: 'Port Scanning', severity: 'medium', blocked: 245 },
    { type: 'SQL Injection Attempts', severity: 'critical', blocked: 12 },
    { type: 'XSS Attempts', severity: 'high', blocked: 34 },
    { type: 'Brute Force Login', severity: 'high', blocked: 89 },
    { type: 'DDoS Pattern', severity: 'critical', blocked: 5 }
  ];

  return (
    <Card className="border-2 border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-600" />
          IDS/IPS Configuration
          <Badge variant="outline" className="ml-auto">Infrastructure Required</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Critical Security Gap</p>
              <p>IDS/IPS deployment pending - AWS GuardDuty or Snort integration needed</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Threat Detection (Last 24h - Mock Data)</p>
          {threats.map((threat, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <div>
                <p className="text-sm font-medium">{threat.type}</p>
                <Badge variant={threat.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs mt-1">
                  {threat.severity}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">{threat.blocked}</p>
                <p className="text-xs text-slate-600">blocked</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-blue-50 rounded-lg text-xs">
          <p className="font-medium text-blue-800 mb-2">Recommended Setup:</p>
          <ul className="space-y-1 text-blue-700">
            <li>• AWS GuardDuty for threat detection</li>
            <li>• AWS Shield Standard/Advanced for DDoS</li>
            <li>• VPC Flow Logs for network monitoring</li>
            <li>• CloudWatch Logs for centralized logging</li>
            <li>• AWS WAF for application layer protection</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}