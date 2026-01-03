import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/components/LanguageContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function ChallengeTypesConfig() {
  const { language, isRTL, t } = useLanguage();
  const [types, setTypes] = useState([
    { id: 1, name_en: 'Service Quality', name_ar: 'جودة الخدمة', color: '#3b82f6', count: 45 },
    { id: 2, name_en: 'Infrastructure', name_ar: 'بنية تحتية', color: '#8b5cf6', count: 32 },
    { id: 3, name_en: 'Innovation', name_ar: 'ابتكار', color: '#10b981', count: 28 }
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {t({ en: 'Challenge Types', ar: 'أنواع التحديات' })}
          <Button size="sm">
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Add Type', ar: 'إضافة نوع' })}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {types.map(type => (
          <div key={type.id} className="p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded" style={{ backgroundColor: type.color }} />
                <div>
                  <p className="font-medium text-sm">{language === 'ar' ? type.name_ar : type.name_en}</p>
                  <p className="text-xs text-slate-500">{type.count} challenges</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost"><Trash2 className="h-4 w-4 text-red-600" /></Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}