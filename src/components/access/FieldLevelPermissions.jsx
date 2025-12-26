import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Lock, Save } from 'lucide-react';

export default function FieldLevelPermissions({ entity, role, permissions, onSave }) {
  const { language, isRTL, t } = useLanguage();
  const [fieldPerms, setFieldPerms] = useState(permissions?.fields || []);

  const entityFields = {
    Challenge: ['title_en', 'title_ar', 'description_en', 'description_ar', 'sector', 'priority', 'status', 'municipality_id', 'budget_estimate'],
    Pilot: ['title_en', 'title_ar', 'objective_en', 'objective_ar', 'budget', 'timeline', 'kpis', 'stage', 'municipality_id'],
    Solution: ['name_en', 'name_ar', 'description_en', 'provider_id', 'pricing_model', 'maturity_level']
  };

  const fields = entityFields[entity] || [];

  const toggleField = (field) => {
    setFieldPerms(prev => 
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-amber-600" />
          {t({ en: 'Field-Level Permissions', ar: 'صلاحيات مستوى الحقول' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            {entity} • {role}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            {t({ en: 'Select which fields this role can view/edit', ar: 'حدد الحقول التي يمكن لهذا الدور عرضها/تعديلها' })}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {fields.map((field) => (
            <div key={field} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg hover:bg-slate-100">
              <Checkbox
                checked={fieldPerms.includes(field)}
                onCheckedChange={() => toggleField(field)}
              />
              <label className="text-sm flex-1 cursor-pointer">
                {field}
              </label>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Badge variant="outline">
            {fieldPerms.length}/{fields.length} {t({ en: 'fields selected', ar: 'حقول محددة' })}
          </Badge>
          <Button onClick={() => onSave?.(fieldPerms)} className="bg-amber-600">
            <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Save', ar: 'حفظ' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
