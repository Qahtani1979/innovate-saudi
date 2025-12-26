import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { GitBranch, Plus, Trash2 } from 'lucide-react';

export default function ConditionalAccessRules({ entityType, onSave }) {
  const { language, isRTL, t } = useLanguage();
  const [rules, setRules] = useState([
    { condition: 'ip_location', operator: 'equals', value: 'Saudi Arabia', action: 'allow' },
    { condition: 'time_of_day', operator: 'between', value: '08:00-18:00', action: 'allow' }
  ]);

  const addRule = () => {
    setRules([...rules, { condition: '', operator: '', value: '', action: 'allow' }]);
  };

  const removeRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-purple-600" />
          {t({ en: 'Conditional Access Rules', ar: 'قواعد الوصول المشروط' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-900">
            {t({ en: `Rules for: ${entityType || 'All Entities'}`, ar: `القواعد لـ: ${entityType || 'كل الكيانات'}` })}
          </p>
        </div>

        <div className="space-y-3">
          {rules.map((rule, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <Select value={rule.condition} onValueChange={(v) => {
                  const newRules = [...rules];
                  newRules[i].condition = v;
                  setRules(newRules);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ip_location">IP Location</SelectItem>
                    <SelectItem value="time_of_day">Time of Day</SelectItem>
                    <SelectItem value="user_role">User Role</SelectItem>
                    <SelectItem value="device_type">Device Type</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={rule.operator} onValueChange={(v) => {
                  const newRules = [...rules];
                  newRules[i].operator = v;
                  setRules(newRules);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="not_equals">Not Equals</SelectItem>
                    <SelectItem value="between">Between</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Value"
                  value={rule.value}
                  onChange={(e) => {
                    const newRules = [...rules];
                    newRules[i].value = e.target.value;
                    setRules(newRules);
                  }}
                />

                <div className="flex gap-2">
                  <Select value={rule.action} onValueChange={(v) => {
                    const newRules = [...rules];
                    newRules[i].action = v;
                    setRules(newRules);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allow">Allow</SelectItem>
                      <SelectItem value="deny">Deny</SelectItem>
                      <SelectItem value="require_mfa">Require MFA</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" onClick={() => removeRule(i)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={addRule} variant="outline" className="flex-1">
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Add Rule', ar: 'إضافة قاعدة' })}
          </Button>
          <Button onClick={() => onSave?.(rules)} className="flex-1 bg-purple-600">
            {t({ en: 'Save Rules', ar: 'حفظ القواعد' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
