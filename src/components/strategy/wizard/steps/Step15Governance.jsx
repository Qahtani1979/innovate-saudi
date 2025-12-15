import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Building2, Plus, X } from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { GOVERNANCE_ROLES } from '../StrategyWizardSteps';

export default function Step15Governance({ data, onChange, onGenerateAI, isGenerating }) {
  const { language, t, isRTL } = useLanguage();

  const addCommittee = () => {
    const newCommittee = { id: Date.now().toString(), name: '', role: 'STEERING_COMMITTEE', members: [], meeting_frequency: 'monthly', responsibilities: '' };
    onChange({ governance: { ...data.governance, committees: [...(data.governance?.committees || []), newCommittee] } });
  };

  const updateCommittee = (index, field, value) => {
    const updated = [...(data.governance?.committees || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ governance: { ...data.governance, committees: updated } });
  };

  const removeCommittee = (index) => {
    onChange({ governance: { ...data.governance, committees: data.governance.committees.filter((_, i) => i !== index) } });
  };

  const frequencyOptions = [
    { value: 'weekly', label: { en: 'Weekly', ar: 'أسبوعي' } },
    { value: 'biweekly', label: { en: 'Bi-weekly', ar: 'كل أسبوعين' } },
    { value: 'monthly', label: { en: 'Monthly', ar: 'شهري' } },
    { value: 'quarterly', label: { en: 'Quarterly', ar: 'ربع سنوي' } }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onGenerateAI} disabled={isGenerating} className="gap-2">
          <Sparkles className="w-4 h-4" />
          {isGenerating ? t({ en: 'Generating...', ar: 'جاري الإنشاء...' }) : t({ en: 'Generate Governance Structure', ar: 'إنشاء هيكل الحوكمة' })}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t({ en: 'Reporting Frequency', ar: 'تكرار التقارير' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={data.governance?.reporting_frequency || 'monthly'} onValueChange={(v) => onChange({ governance: { ...data.governance, reporting_frequency: v } })}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {frequencyOptions.map(f => <SelectItem key={f.value} value={f.value}>{f.label[language]}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-primary" />
            {t({ en: 'Governance Committees', ar: 'لجان الحوكمة' })}
            <Badge variant="secondary">{(data.governance?.committees || []).length}</Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addCommittee}>
            <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Committee', ar: 'إضافة لجنة' })}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(data.governance?.committees || []).length === 0 ? (
            <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
              {t({ en: 'No committees defined', ar: 'لم يتم تحديد لجان' })}
            </div>
          ) : (
            data.governance.committees.map((committee, idx) => (
              <div key={committee.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between">
                  <Badge>{GOVERNANCE_ROLES.find(r => r.code === committee.role)?.[`name_${language}`]}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => removeCommittee(idx)}><X className="w-4 h-4" /></Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input placeholder={t({ en: 'Committee Name', ar: 'اسم اللجنة' })} value={committee.name} onChange={(e) => updateCommittee(idx, 'name', e.target.value)} />
                  <Select value={committee.role} onValueChange={(v) => updateCommittee(idx, 'role', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GOVERNANCE_ROLES.map(r => <SelectItem key={r.code} value={r.code}>{r[`name_${language}`]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={committee.meeting_frequency} onValueChange={(v) => updateCommittee(idx, 'meeting_frequency', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map(f => <SelectItem key={f.value} value={f.value}>{f.label[language]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea placeholder={t({ en: 'Responsibilities...', ar: 'المسؤوليات...' })} value={committee.responsibilities} onChange={(e) => updateCommittee(idx, 'responsibilities', e.target.value)} rows={2} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
