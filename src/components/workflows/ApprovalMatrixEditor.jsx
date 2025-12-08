import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../LanguageContext';
import { Users, Save } from 'lucide-react';

export default function ApprovalMatrixEditor() {
  const { language, isRTL, t } = useLanguage();
  const [matrix, setMatrix] = useState([
    { role: 'Municipality Admin', threshold: 100000, sequential: false },
    { role: 'Program Director', threshold: 500000, sequential: true },
    { role: 'Executive', threshold: 1000000, sequential: true }
  ]);

  return (
    <Card className="border-2 border-cyan-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-cyan-600" />
          {t({ en: 'Approval Matrix Editor', ar: 'محرر مصفوفة الموافقات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {matrix.map((rule, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-lg border-2">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">{t({ en: 'Role', ar: 'الدور' })}</label>
                  <Select value={rule.role} onValueChange={(v) => {
                    const newMatrix = [...matrix];
                    newMatrix[i].role = v;
                    setMatrix(newMatrix);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Municipality Admin">Municipality Admin</SelectItem>
                      <SelectItem value="Program Director">Program Director</SelectItem>
                      <SelectItem value="Executive">Executive</SelectItem>
                      <SelectItem value="Finance Manager">Finance Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">{t({ en: 'Budget Threshold (SAR)', ar: 'حد الميزانية (ريال)' })}</label>
                  <Select value={rule.threshold.toString()} onValueChange={(v) => {
                    const newMatrix = [...matrix];
                    newMatrix[i].threshold = parseInt(v);
                    setMatrix(newMatrix);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100000">100K</SelectItem>
                      <SelectItem value="500000">500K</SelectItem>
                      <SelectItem value="1000000">1M</SelectItem>
                      <SelectItem value="5000000">5M</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border w-full">
                    <span className="text-xs">{t({ en: 'Sequential', ar: 'تسلسلي' })}</span>
                    <Switch
                      checked={rule.sequential}
                      onCheckedChange={(v) => {
                        const newMatrix = [...matrix];
                        newMatrix[i].sequential = v;
                        setMatrix(newMatrix);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button className="w-full bg-cyan-600">
          <Save className="h-4 w-4 mr-2" />
          {t({ en: 'Save Approval Matrix', ar: 'حفظ مصفوفة الموافقات' })}
        </Button>
      </CardContent>
    </Card>
  );
}