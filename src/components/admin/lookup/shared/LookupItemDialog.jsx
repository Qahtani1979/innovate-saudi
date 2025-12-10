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

const SPECIALIZATION_CATEGORIES = [
  { value: 'management', label: 'Management' },
  { value: 'technical', label: 'Technical' },
  { value: 'finance', label: 'Finance' },
  { value: 'operations', label: 'Operations' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'planning', label: 'Planning' },
  { value: 'social', label: 'Social' },
  { value: 'legal', label: 'Legal' },
  { value: 'hr', label: 'HR' },
];

export default function LookupItemDialog({ 
  open, 
  onOpenChange, 
  type, 
  item, 
  onSave, 
  isSaving 
}) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({});
  const isNew = !item;

  useEffect(() => {
    if (open) {
      setFormData(item || { is_active: true, display_order: 0 });
    }
  }, [open, item]);

  const handleSubmit = () => {
    onSave(formData);
  };

  const typeLabel = type === 'department' 
    ? t({ en: 'Department', ar: 'قسم' }) 
    : t({ en: 'Specialization', ar: 'تخصص' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isNew 
              ? t({ en: `Add ${typeLabel}`, ar: `إضافة ${typeLabel}` })
              : t({ en: `Edit ${typeLabel}`, ar: `تعديل ${typeLabel}` })}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Name (EN)', ar: 'الاسم (إنجليزي)' })} *
            </label>
            <Input 
              value={formData.name_en || ''} 
              onChange={(e) => setFormData({...formData, name_en: e.target.value})}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Name (AR)', ar: 'الاسم (عربي)' })}
            </label>
            <Input 
              value={formData.name_ar || ''} 
              onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
              dir="rtl"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Code', ar: 'الرمز' })}
            </label>
            <Input 
              value={formData.code || ''} 
              onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
              placeholder="e.g., URBAN_PLAN"
            />
          </div>
          
          {type === 'specialization' && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Category', ar: 'الفئة' })}
              </label>
              <Select 
                value={formData.category || ''} 
                onValueChange={(val) => setFormData({...formData, category: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select category', ar: 'اختر الفئة' })} />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALIZATION_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Display Order', ar: 'ترتيب العرض' })}
            </label>
            <Input 
              type="number" 
              value={formData.display_order || 0} 
              onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
            />
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
            disabled={isSaving || !formData.name_en}
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t({ en: 'Save', ar: 'حفظ' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
