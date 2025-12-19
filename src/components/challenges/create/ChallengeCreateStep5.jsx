import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/components/LanguageContext';
import { Users, Database, AlertTriangle, Plus, Trash2 } from 'lucide-react';

/**
 * Step 5: Stakeholders, Evidence, and Constraints for Challenge Creation
 */
export default function ChallengeCreateStep5({ 
  formData, 
  updateField
}) {
  const { t } = useLanguage();

  // Stakeholders handlers
  const addStakeholder = () => {
    updateField('stakeholders', [...(formData.stakeholders || []), { name: '', role: '', involvement: '' }]);
  };

  const updateStakeholder = (index, field, value) => {
    const updated = [...(formData.stakeholders || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateField('stakeholders', updated);
  };

  const removeStakeholder = (index) => {
    updateField('stakeholders', (formData.stakeholders || []).filter((_, i) => i !== index));
  };

  // Evidence handlers
  const addEvidence = () => {
    updateField('data_evidence', [...(formData.data_evidence || []), { type: '', source: '', value: '', date: '' }]);
  };

  const updateEvidence = (index, field, value) => {
    const updated = [...(formData.data_evidence || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateField('data_evidence', updated);
  };

  const removeEvidence = (index) => {
    updateField('data_evidence', (formData.data_evidence || []).filter((_, i) => i !== index));
  };

  // Constraints handlers
  const addConstraint = () => {
    updateField('constraints', [...(formData.constraints || []), { type: '', description: '' }]);
  };

  const updateConstraint = (index, field, value) => {
    const updated = [...(formData.constraints || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateField('constraints', updated);
  };

  const removeConstraint = (index) => {
    updateField('constraints', (formData.constraints || []).filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Stakeholders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            {t({ en: 'Stakeholders', ar: 'أصحاب المصلحة' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={addStakeholder}>
              <Plus className="h-4 w-4 mr-1" />
              {t({ en: 'Add Stakeholder', ar: 'إضافة طرف' })}
            </Button>
          </div>
          
          <div className="space-y-3">
            {(formData.stakeholders || []).map((sh, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{t({ en: 'Stakeholder', ar: 'طرف' })} #{index + 1}</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-600"
                    onClick={() => removeStakeholder(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <Input
                    placeholder={t({ en: 'Name', ar: 'الاسم' })}
                    value={sh.name || ''}
                    onChange={(e) => updateStakeholder(index, 'name', e.target.value)}
                  />
                  <Select
                    value={sh.role || ''}
                    onValueChange={(value) => updateStakeholder(index, 'role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Role', ar: 'الدور' })} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">{t({ en: 'Owner', ar: 'مالك' })}</SelectItem>
                      <SelectItem value="sponsor">{t({ en: 'Sponsor', ar: 'راعي' })}</SelectItem>
                      <SelectItem value="beneficiary">{t({ en: 'Beneficiary', ar: 'مستفيد' })}</SelectItem>
                      <SelectItem value="implementer">{t({ en: 'Implementer', ar: 'منفذ' })}</SelectItem>
                      <SelectItem value="expert">{t({ en: 'Expert', ar: 'خبير' })}</SelectItem>
                      <SelectItem value="other">{t({ en: 'Other', ar: 'آخر' })}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={sh.involvement || ''}
                    onValueChange={(value) => updateStakeholder(index, 'involvement', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Involvement', ar: 'المشاركة' })} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">{t({ en: 'High', ar: 'عالية' })}</SelectItem>
                      <SelectItem value="medium">{t({ en: 'Medium', ar: 'متوسطة' })}</SelectItem>
                      <SelectItem value="low">{t({ en: 'Low', ar: 'منخفضة' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Evidence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            {t({ en: 'Data & Evidence', ar: 'البيانات والأدلة' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={addEvidence}>
              <Plus className="h-4 w-4 mr-1" />
              {t({ en: 'Add Evidence', ar: 'إضافة دليل' })}
            </Button>
          </div>
          
          <div className="space-y-3">
            {(formData.data_evidence || []).map((ev, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{t({ en: 'Evidence', ar: 'دليل' })} #{index + 1}</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-600"
                    onClick={() => removeEvidence(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <Select
                    value={ev.type || ''}
                    onValueChange={(value) => updateEvidence(index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Type', ar: 'النوع' })} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="statistic">{t({ en: 'Statistic', ar: 'إحصائية' })}</SelectItem>
                      <SelectItem value="survey">{t({ en: 'Survey', ar: 'استبيان' })}</SelectItem>
                      <SelectItem value="report">{t({ en: 'Report', ar: 'تقرير' })}</SelectItem>
                      <SelectItem value="complaint">{t({ en: 'Complaint', ar: 'شكوى' })}</SelectItem>
                      <SelectItem value="study">{t({ en: 'Study', ar: 'دراسة' })}</SelectItem>
                      <SelectItem value="other">{t({ en: 'Other', ar: 'آخر' })}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={t({ en: 'Source', ar: 'المصدر' })}
                    value={ev.source || ''}
                    onChange={(e) => updateEvidence(index, 'source', e.target.value)}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <Input
                    placeholder={t({ en: 'Value/Finding', ar: 'القيمة/النتيجة' })}
                    value={ev.value || ''}
                    onChange={(e) => updateEvidence(index, 'value', e.target.value)}
                  />
                  <Input
                    type="date"
                    value={ev.date || ''}
                    onChange={(e) => updateEvidence(index, 'date', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Constraints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            {t({ en: 'Constraints', ar: 'القيود' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={addConstraint}>
              <Plus className="h-4 w-4 mr-1" />
              {t({ en: 'Add Constraint', ar: 'إضافة قيد' })}
            </Button>
          </div>
          
          <div className="space-y-3">
            {(formData.constraints || []).map((c, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{t({ en: 'Constraint', ar: 'قيد' })} #{index + 1}</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-600"
                    onClick={() => removeConstraint(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <Select
                    value={c.type || ''}
                    onValueChange={(value) => updateConstraint(index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Type', ar: 'النوع' })} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="budget">{t({ en: 'Budget', ar: 'ميزانية' })}</SelectItem>
                      <SelectItem value="timeline">{t({ en: 'Timeline', ar: 'وقت' })}</SelectItem>
                      <SelectItem value="regulatory">{t({ en: 'Regulatory', ar: 'تنظيمي' })}</SelectItem>
                      <SelectItem value="technical">{t({ en: 'Technical', ar: 'تقني' })}</SelectItem>
                      <SelectItem value="resource">{t({ en: 'Resource', ar: 'موارد' })}</SelectItem>
                      <SelectItem value="other">{t({ en: 'Other', ar: 'آخر' })}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={t({ en: 'Description', ar: 'الوصف' })}
                    value={c.description || ''}
                    onChange={(e) => updateConstraint(index, 'description', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
