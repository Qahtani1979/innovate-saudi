import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Users, CheckCircle2, FileText, Calendar, Mail, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EngagementReadinessGate({ application, onComplete }) {
  const { language, isRTL, t } = useLanguage();
  const [checklist, setChecklist] = useState({
    municipality_notified: false,
    meeting_scheduled: false,
    materials_prepared: false,
    nda_signed: false,
    contact_verified: false
  });
  const [notes, setNotes] = useState('');

  const checklistItems = [
    { key: 'municipality_notified', label: { en: 'Municipality notified of match', ar: 'تم إبلاغ البلدية بالمطابقة' }, icon: Mail },
    { key: 'meeting_scheduled', label: { en: 'Initial meeting scheduled', ar: 'تم جدولة الاجتماع الأولي' }, icon: Calendar },
    { key: 'materials_prepared', label: { en: 'Presentation materials ready', ar: 'مواد العرض جاهزة' }, icon: FileText },
    { key: 'nda_signed', label: { en: 'NDA/MOU signed', ar: 'تم توقيع اتفاقية السرية' }, icon: FileText },
    { key: 'contact_verified', label: { en: 'Contact information verified', ar: 'تم التحقق من معلومات الاتصال' }, icon: Building2 }
  ];

  const allChecked = Object.values(checklist).every(v => v === true);

  return (
    <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Engagement Readiness Gate', ar: 'بوابة جاهزية المشاركة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-700">
          {t({ en: 'Validate readiness before municipal engagement', ar: 'التحقق من الجاهزية قبل التواصل مع البلدية' })}
        </p>

        <div className="space-y-3">
          {checklistItems.map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50">
              <Checkbox
                checked={checklist[key]}
                onCheckedChange={(checked) => setChecklist({...checklist, [key]: checked})}
              />
              <Icon className="h-4 w-4 text-indigo-600" />
              <span className="text-sm flex-1">{label[language]}</span>
            </div>
          ))}
        </div>

        <Textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t({ en: 'Engagement plan notes...', ar: 'ملاحظات خطة المشاركة...' })}
        />

        <div className="p-4 bg-white border-2 rounded-lg" style={{
          borderColor: allChecked ? '#16a34a' : '#dc2626'
        }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t({ en: 'Readiness Status:', ar: 'حالة الجاهزية:' })}</span>
            <Badge className={allChecked ? 'bg-green-600' : 'bg-red-600'}>
              {Object.values(checklist).filter(v => v).length}/{checklistItems.length}
            </Badge>
          </div>
        </div>

        <Button
          onClick={() => onComplete({ ...checklist, notes, passed: allChecked })}
          disabled={!allChecked}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {t({ en: 'Approve for Engagement', ar: 'الموافقة للمشاركة' })}
        </Button>
      </CardContent>
    </Card>
  );
}