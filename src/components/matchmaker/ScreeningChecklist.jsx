import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ScreeningChecklist({ application, onComplete }) {
  const { language, isRTL, t } = useLanguage();
  const [checks, setChecks] = React.useState({
    completeness_check: false,
    file_validation: false,
    duplicate_check: false,
    notes: ''
  });

  const allPassed = checks.completeness_check && checks.file_validation && checks.duplicate_check;

  const handleSubmit = () => {
    onComplete({
      ...checks,
      passed: allPassed
    });
    toast.success(t({ en: 'Screening saved', ar: 'تم حفظ الفحص' }));
  };

  const screeningItems = [
    {
      key: 'completeness_check',
      label_en: 'Application Completeness',
      label_ar: 'اكتمال الطلب',
      description_en: 'All required fields filled, contact info valid',
      description_ar: 'جميع الحقول الإلزامية معبأة ومعلومات الاتصال صحيحة'
    },
    {
      key: 'file_validation',
      label_en: 'Files & Links Validation',
      label_ar: 'التحقق من الملفات والروابط',
      description_en: 'Portfolio PDF accessible, website URL working',
      description_ar: 'ملف PDF قابل للفتح ورابط الموقع يعمل'
    },
    {
      key: 'duplicate_check',
      label_en: 'Duplicate Detection',
      label_ar: 'الكشف عن التكرار',
      description_en: 'No duplicate applications from same organization',
      description_ar: 'لا توجد طلبات مكررة من نفس المنظمة'
    }
  ];

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          {t({ en: 'Initial Screening Checklist', ar: 'قائمة الفحص الأولي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {screeningItems.map((item) => (
            <div key={item.key} className="p-4 border rounded-lg bg-slate-50">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={checks[item.key]}
                  onCheckedChange={(checked) => setChecks({...checks, [item.key]: checked})}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{language === 'ar' ? item.label_ar : item.label_en}</p>
                  <p className="text-xs text-slate-600 mt-1">{language === 'ar' ? item.description_ar : item.description_en}</p>
                </div>
                {checks[item.key] && <CheckCircle2 className="h-5 w-5 text-green-600" />}
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="text-sm font-medium">{t({ en: 'Screening Notes', ar: 'ملاحظات الفحص' })}</label>
          <Textarea
            rows={3}
            value={checks.notes}
            onChange={(e) => setChecks({...checks, notes: e.target.value})}
            placeholder={t({ en: 'Add any observations...', ar: 'أضف أي ملاحظات...' })}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg" style={{
          backgroundColor: allPassed ? '#dcfce7' : '#fef3c7'
        }}>
          <div className="flex items-center gap-2">
            {allPassed ? (
              <><CheckCircle2 className="h-5 w-5 text-green-600" /><span className="font-medium text-green-900">{t({ en: 'All checks passed', ar: 'نجح في جميع الفحوصات' })}</span></>
            ) : (
              <><XCircle className="h-5 w-5 text-amber-600" /><span className="font-medium text-amber-900">{t({ en: 'Incomplete', ar: 'غير مكتمل' })}</span></>
            )}
          </div>
          <Button onClick={handleSubmit} variant={allPassed ? 'default' : 'outline'}>
            {t({ en: 'Save Screening', ar: 'حفظ الفحص' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}