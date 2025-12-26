import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from './LanguageContext';
import { AlertTriangle, Merge, X } from 'lucide-react';

export default function DuplicateDetection() {
  const { language, isRTL, t } = useLanguage();
  const [duplicates] = useState([
    { id: 1, type: 'Challenge', items: ['CH-001', 'CH-045'], similarity: 92, status: 'pending' },
    { id: 2, type: 'Solution', items: ['SOL-012', 'SOL-089'], similarity: 87, status: 'pending' }
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          {t({ en: 'Duplicate Detection', ar: 'كشف التكرارات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {duplicates.map(dup => (
          <div key={dup.id} className="p-4 border rounded-lg bg-orange-50">
            <div className="flex items-center justify-between mb-3">
              <Badge>{dup.type}</Badge>
              <Badge className="bg-orange-100 text-orange-700">{dup.similarity}% match</Badge>
            </div>
            <div className="space-y-2 mb-3">
              {dup.items.map((item, i) => (
                <p key={i} className="text-sm font-mono text-slate-700">{item}</p>
              ))}
            </div>
            <Progress value={dup.similarity} className="h-2 mb-3" />
            <div className="flex items-center gap-2">
              <Button size="sm" className="flex-1">
                <Merge className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Merge', ar: 'دمج' })}
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <X className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Keep Both', ar: 'الاحتفاظ بكليهما' })}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
