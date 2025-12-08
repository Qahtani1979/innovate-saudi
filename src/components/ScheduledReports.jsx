import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from './LanguageContext';
import { Calendar, Mail, Plus } from 'lucide-react';

export default function ScheduledReports() {
  const { language, isRTL, t } = useLanguage();
  const [schedules] = useState([
    { id: 1, name: 'Weekly Pilot Summary', frequency: 'Weekly', recipients: 'executives@gdisb.sa', active: true },
    { id: 2, name: 'Monthly MII Report', frequency: 'Monthly', recipients: 'leadership@gdisb.sa', active: true }
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            {t({ en: 'Scheduled Reports', ar: 'التقارير المجدولة' })}
          </div>
          <Button size="sm">
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'New', ar: 'جديد' })}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {schedules.map(schedule => (
          <div key={schedule.id} className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{schedule.name}</span>
              <Switch checked={schedule.active} />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Badge variant="outline">{schedule.frequency}</Badge>
              <Mail className="h-3 w-3" />
              <span>{schedule.recipients}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}