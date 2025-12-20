import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Database, AlertCircle } from 'lucide-react';

export default function DatabaseIndexing() {
  const { t } = useLanguage();

  const indexes = [
    { entity: 'Challenge', fields: ['municipality_id', 'status', 'sector'], exists: false, impact: 'High' },
    { entity: 'Pilot', fields: ['challenge_id', 'status', 'municipality_id'], exists: false, impact: 'High' },
    { entity: 'Solution', fields: ['provider_id', 'sectors', 'maturity_level'], exists: false, impact: 'High' },
    { entity: 'User', fields: ['email', 'role'], exists: true, impact: 'Medium' },
    { entity: 'Organization', fields: ['org_type', 'is_partner'], exists: false, impact: 'Medium' },
    { entity: 'Notification', fields: ['recipient_email', 'is_read'], exists: false, impact: 'High' }
  ];

  const coverage = indexes.filter(i => i.exists).length / indexes.length * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          {t({ en: 'Database Indexing', ar: 'فهرسة قاعدة البيانات' })}
          <Badge className="ml-auto bg-red-600">{Math.round(coverage)}%</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">Critical Performance Gap</p>
              <p>Most frequent queries lack indexes, causing slow responses</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {indexes.map((idx, i) => (
            <div key={i} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium">{idx.entity}</p>
                  <p className="text-xs text-slate-600">Fields: {idx.fields.join(', ')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={idx.impact === 'High' ? 'bg-red-600' : 'bg-amber-600'}>
                    {idx.impact}
                  </Badge>
                  <Badge variant={idx.exists ? 'default' : 'outline'}>
                    {idx.exists ? 'Created' : 'Missing'}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Expected performance gains:</p>
          <ul className="space-y-1 ml-4">
            <li>• 60-80% faster query response</li>
            <li>• Reduced database load</li>
            <li>• Better scalability</li>
            <li>• Lower infrastructure costs</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}