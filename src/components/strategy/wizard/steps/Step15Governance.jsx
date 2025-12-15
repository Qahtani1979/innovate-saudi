import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Building2, Plus, X, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { GOVERNANCE_ROLES } from '../StrategyWizardSteps';

export default function Step15Governance({ data, onChange, onGenerateAI, isGenerating }) {
  const { language, t, isRTL } = useLanguage();

  const committees = data.governance?.committees || [];
  const escalationPath = Array.isArray(data.governance?.escalation_path)
    ? data.governance.escalation_path
    : (typeof data.governance?.escalation_path === 'string'
      ? data.governance.escalation_path.split(/\n|;|,/).map(s => s.trim()).filter(Boolean)
      : []);

  const addCommittee = () => {
    const newCommittee = {
      id: Date.now().toString(),
      name_en: '',
      name_ar: '',
      role: 'STEERING_COMMITTEE',
      members: [],
      meeting_frequency: 'monthly',
      responsibilities_en: '',
      responsibilities_ar: ''
    };

    onChange({
      governance: {
        ...data.governance,
        committees: [...committees, newCommittee]
      }
    });
  };

  const updateCommittee = (index, field, value) => {
    const updated = committees.map((c, i) => (i === index ? { ...c, [field]: value } : c));
    onChange({ governance: { ...data.governance, committees: updated } });
  };

  const removeCommittee = (index) => {
    onChange({ governance: { ...data.governance, committees: committees.filter((_, i) => i !== index) } });
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
          <Select
            value={data.governance?.reporting_frequency || 'monthly'}
            onValueChange={(v) => onChange({ governance: { ...data.governance, reporting_frequency: v } })}
          >
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              {frequencyOptions.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label[language]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-primary" />
            {t({ en: 'Escalation Path', ar: 'مسار التصعيد' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="text-sm">{t({ en: 'Enter escalation steps (one per line)', ar: 'أدخل خطوات التصعيد (كل خطوة في سطر)' })}</Label>
          <Textarea
            className="mt-2"
            value={escalationPath.join('\n')}
            onChange={(e) => onChange({
              governance: {
                ...data.governance,
                escalation_path: e.target.value.split('\n').map(s => s.trim()).filter(Boolean)
              }
            })}
            rows={4}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-primary" />
            {t({ en: 'Governance Committees', ar: 'لجان الحوكمة' })}
            <Badge variant="secondary">{committees.length}</Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addCommittee}>
            <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Committee', ar: 'إضافة لجنة' })}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {committees.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
              {t({ en: 'No committees defined', ar: 'لم يتم تحديد لجان' })}
            </div>
          ) : (
            committees.map((committee, idx) => {
              const members = Array.isArray(committee.members)
                ? committee.members
                : (typeof committee.members === 'string'
                  ? committee.members.split('\n').map(s => s.trim()).filter(Boolean)
                  : []);

              return (
                <div key={committee.id || idx} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <Badge>
                      {GOVERNANCE_ROLES.find(r => r.code === committee.role)?.[`name_${language}`]}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => removeCommittee(idx)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">{t({ en: 'Committee Name (EN)', ar: 'اسم اللجنة (إنجليزي)' })}</Label>
                      <Input
                        placeholder={t({ en: 'Committee Name', ar: 'اسم اللجنة' })}
                        value={committee.name_en || committee.name || ''}
                        onChange={(e) => updateCommittee(idx, 'name_en', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{t({ en: 'Committee Name (AR)', ar: 'اسم اللجنة (عربي)' })}</Label>
                      <Input
                        dir="rtl"
                        placeholder="اسم اللجنة"
                        value={committee.name_ar || ''}
                        onChange={(e) => updateCommittee(idx, 'name_ar', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">{t({ en: 'Role', ar: 'الدور' })}</Label>
                      <Select value={committee.role} onValueChange={(v) => updateCommittee(idx, 'role', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {GOVERNANCE_ROLES.map((r) => (
                            <SelectItem key={r.code} value={r.code}>{r[`name_${language}`]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">{t({ en: 'Meeting Frequency', ar: 'تكرار الاجتماعات' })}</Label>
                      <Select value={committee.meeting_frequency} onValueChange={(v) => updateCommittee(idx, 'meeting_frequency', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {frequencyOptions.map((f) => (
                            <SelectItem key={f.value} value={f.value}>{f.label[language]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm">{t({ en: 'Members (one per line)', ar: 'الأعضاء (كل عضو في سطر)' })}</Label>
                    <Textarea
                      value={members.join('\n')}
                      onChange={(e) => updateCommittee(idx, 'members', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">{t({ en: 'Responsibilities (EN)', ar: 'المسؤوليات (إنجليزي)' })}</Label>
                      <Textarea
                        placeholder={t({ en: 'Responsibilities...', ar: 'المسؤوليات...' })}
                        value={committee.responsibilities_en || committee.responsibilities || ''}
                        onChange={(e) => updateCommittee(idx, 'responsibilities_en', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{t({ en: 'Responsibilities (AR)', ar: 'المسؤوليات (عربي)' })}</Label>
                      <Textarea
                        dir="rtl"
                        placeholder="المسؤوليات..."
                        value={committee.responsibilities_ar || ''}
                        onChange={(e) => updateCommittee(idx, 'responsibilities_ar', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
