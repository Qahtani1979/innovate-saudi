import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { Download, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function AuditExporter({ logs = [] }) {
  const { language, isRTL, t } = useLanguage();
  const [format, setFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('30d');

  const handleExport = () => {
    let content;
    
    if (format === 'csv') {
      content = [
        ['User', 'Action', 'Entity', 'Date', 'IP', 'Status'].join(','),
        ...logs.map(l => [
          l.user_email,
          l.action_type,
          l.entity_type || '-',
          new Date(l.created_date).toLocaleString(),
          l.ip_address || '-',
          l.is_suspicious ? 'Suspicious' : 'Normal'
        ].join(','))
      ].join('\n');
    } else {
      content = JSON.stringify(logs, null, 2);
    }

    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${dateRange}.${format}`;
    a.click();
    toast.success(t({ en: 'Audit log exported', ar: 'تم تصدير السجل' }));
  };

  return (
    <Card className="border-2 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-green-600" />
          {t({ en: 'Export Audit Log', ar: 'تصدير سجل التدقيق' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium mb-2 block">{t({ en: 'Format', ar: 'التنسيق' })}</label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block">{t({ en: 'Range', ar: 'النطاق' })}</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleExport} className="w-full bg-green-600">
          <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Export Log', ar: 'تصدير السجل' })}
        </Button>
      </CardContent>
    </Card>
  );
}