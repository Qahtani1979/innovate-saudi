import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '@/components/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

const PERSONA_TYPES = [
  { value: 'citizen', label: 'Citizen' },
  { value: 'municipality_staff', label: 'Municipality Staff' },
  { value: 'provider', label: 'Provider' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'expert', label: 'Expert' },
  { value: 'investor', label: 'Investor' },
];

const RULE_TYPES = [
  { value: 'always', label: 'Always (auto-approve all)' },
  { value: 'never', label: 'Never (require approval)' },
  { value: 'email_domain', label: 'Email Domain' },
  { value: 'organization', label: 'Organization' },
  { value: 'institution', label: 'Institution' },
];

const ROLE_OPTIONS = [
  { value: 'citizen', label: 'Citizen' },
  { value: 'viewer', label: 'Viewer' },
  { value: 'municipality_staff', label: 'Municipality Staff' },
  { value: 'provider', label: 'Provider' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'expert', label: 'Expert' },
  { value: 'investor', label: 'Investor' },
  { value: 'admin', label: 'Admin' },
];

export default function AutoApprovalRuleDialog({ 
  open, 
  onOpenChange, 
  rule, 
  municipalities = [],
  onSave, 
  isSaving 
}) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({});
  const isNew = !rule;

  useEffect(() => {
    if (open) {
      setFormData(rule || { is_active: true, priority: 10 });
    }
  }, [open, rule]);

  const handleSubmit = () => {
    onSave(formData);
  };

  const showDomainInput = ['email_domain', 'institution'].includes(formData.rule_type);
  const showMunicipalitySelect = formData.persona_type === 'municipality_staff';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isNew 
              ? t({ en: 'Add Auto-Approval Rule', ar: 'إضافة قاعدة موافقة تلقائية' })
              : t({ en: 'Edit Auto-Approval Rule', ar: 'تعديل قاعدة موافقة تلقائية' })}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Persona Type', ar: 'نوع الشخصية' })} *
            </label>
            <Select 
              value={formData.persona_type || ''} 
              onValueChange={(val) => setFormData({...formData, persona_type: val})}
            >
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Select persona', ar: 'اختر الشخصية' })} />
              </SelectTrigger>
              <SelectContent>
                {PERSONA_TYPES.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Rule Type', ar: 'نوع القاعدة' })} *
            </label>
            <Select 
              value={formData.rule_type || ''} 
              onValueChange={(val) => setFormData({...formData, rule_type: val})}
            >
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Select rule type', ar: 'اختر نوع القاعدة' })} />
              </SelectTrigger>
              <SelectContent>
                {RULE_TYPES.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {showDomainInput && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Domain Value', ar: 'قيمة النطاق' })}
              </label>
              <Input 
                value={formData.rule_value || ''} 
                onChange={(e) => setFormData({...formData, rule_value: e.target.value})}
                placeholder="e.g., gov.sa, ksu.edu.sa"
              />
            </div>
          )}
          
          {showMunicipalitySelect && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Municipality (optional)', ar: 'البلدية (اختياري)' })}
              </label>
              <Select 
                value={formData.municipality_id || 'all'} 
                onValueChange={(val) => setFormData({...formData, municipality_id: val === 'all' ? null : val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'All municipalities', ar: 'جميع البلديات' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All municipalities</SelectItem>
                  {municipalities.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Role to Assign', ar: 'الدور المعين' })} *
            </label>
            <Select 
              value={formData.role_to_assign || ''} 
              onValueChange={(val) => setFormData({...formData, role_to_assign: val})}
            >
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Select role', ar: 'اختر الدور' })} />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Priority', ar: 'الأولوية' })}
            </label>
            <Input 
              type="number" 
              value={formData.priority || 10} 
              onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
              min={1}
              max={100}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t({ en: 'Lower number = higher priority. Rules are evaluated in order.', ar: 'الرقم الأقل = أولوية أعلى. يتم تقييم القواعد بالترتيب.' })}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch 
              checked={formData.is_active !== false} 
              onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
            />
            <label className="text-sm">{t({ en: 'Active', ar: 'نشط' })}</label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSaving || !formData.persona_type || !formData.rule_type || !formData.role_to_assign}
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t({ en: 'Save', ar: 'حفظ' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
