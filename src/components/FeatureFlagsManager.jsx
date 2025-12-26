import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from './LanguageContext';
import { Flag, AlertCircle } from 'lucide-react';

export default function FeatureFlagsManager() {
  const { language, isRTL, t } = useLanguage();
  const [flags, setFlags] = useState([
    { id: 1, name: 'ai_matching_v2', label: 'AI Matching v2', enabled: false, risk: 'low' },
    { id: 2, name: 'new_dashboard_ui', label: 'New Dashboard UI', enabled: true, risk: 'low' },
    { id: 3, name: 'beta_rd_workflow', label: 'Beta R&D Workflow', enabled: false, risk: 'high' }
  ]);

  const toggleFlag = (id) => {
    setFlags(flags.map(f => f.id === id ? {...f, enabled: !f.enabled} : f));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-purple-600" />
          {t({ en: 'Feature Flags', ar: 'مفاتيح الميزات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {flags.map(flag => (
          <div key={flag.id} className="p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{flag.label}</span>
                  {flag.risk === 'high' && (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <p className="text-xs text-slate-500 font-mono">{flag.name}</p>
              </div>
              <Switch 
                checked={flag.enabled} 
                onCheckedChange={() => toggleFlag(flag.id)}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
