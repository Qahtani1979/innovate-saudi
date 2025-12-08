import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from './LanguageContext';
import { Plus, AlertTriangle } from 'lucide-react';

export default function EscalationPathsConfig() {
  const { language, isRTL, t } = useLanguage();
  const [paths, setPaths] = useState([
    { id: 1, entity: 'Challenge', trigger: 'No response > 48h', escalateTo: 'Team Lead', level: 1 },
    { id: 2, entity: 'Pilot', trigger: 'Budget overrun > 20%', escalateTo: 'Director', level: 2 }
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          {t({ en: 'Escalation Paths', ar: 'مسارات التصعيد' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {paths.map(path => (
            <div key={path.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge>{path.entity}</Badge>
                <Badge variant="outline">Level {path.level}</Badge>
              </div>
              <p className="text-sm text-slate-700 mb-1"><strong>Trigger:</strong> {path.trigger}</p>
              <p className="text-sm text-slate-600"><strong>Escalate to:</strong> {path.escalateTo}</p>
            </div>
          ))}
        </div>
        <Button className="w-full" variant="outline">
          <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Add Escalation Path', ar: 'إضافة مسار تصعيد' })}
        </Button>
      </CardContent>
    </Card>
  );
}