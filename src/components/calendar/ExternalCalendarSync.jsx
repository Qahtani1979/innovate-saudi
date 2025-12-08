import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../LanguageContext';
import { Calendar, RefreshCw, AlertCircle } from 'lucide-react';

export default function ExternalCalendarSync() {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          {t({ en: 'External Calendar Sync', ar: 'مزامنة التقويم الخارجي' })}
          <Badge className="ml-auto bg-amber-600">
            {t({ en: 'Not Implemented', ar: 'غير منفذ' })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-medium mb-1">OAuth Integration Required</p>
              <p>Google Calendar and Outlook integration pending OAuth connector activation</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-medium">Google Calendar</p>
              </div>
              <Button size="sm" variant="outline" disabled>
                {t({ en: 'Connect', ar: 'ربط' })}
              </Button>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>{t({ en: 'Sync pilot milestones', ar: 'مزامنة معالم التجارب' })}</span>
                <Switch disabled />
              </div>
              <div className="flex items-center justify-between">
                <span>{t({ en: 'Sync program events', ar: 'مزامنة أحداث البرامج' })}</span>
                <Switch disabled />
              </div>
              <div className="flex items-center justify-between">
                <span>{t({ en: 'Sync deadlines', ar: 'مزامنة المواعيد' })}</span>
                <Switch disabled />
              </div>
            </div>
          </div>

          <div className="p-3 border rounded-lg opacity-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-600" />
                <p className="text-sm font-medium">Outlook Calendar</p>
              </div>
              <Button size="sm" variant="outline" disabled>
                {t({ en: 'Connect', ar: 'ربط' })}
              </Button>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Sync capabilities:</p>
          <ul className="space-y-1 ml-4">
            <li>• Auto-create calendar events for pilot milestones</li>
            <li>• Sync program sessions & meetings</li>
            <li>• Add review & approval deadlines</li>
            <li>• Two-way sync for event updates</li>
            <li>• Recurring event support</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}