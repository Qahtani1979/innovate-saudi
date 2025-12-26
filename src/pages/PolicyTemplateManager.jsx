import { useState } from 'react';
import { usePolicyTemplates, usePolicyTemplateMutations } from '@/hooks/usePolicyTemplates';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Plus, Edit, Trash2, Save, X, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProtectedPage from '../components/permissions/ProtectedPage';

function PolicyTemplateManagerPage() {
  const { language, isRTL, t } = useLanguage();
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  const { data: templates = [] } = usePolicyTemplates();
  const {
    createTemplate: createMutation,
    updateTemplate: updateMutation,
    deleteTemplate: deleteMutation,
    reorderTemplate: reorderMutation
  } = usePolicyTemplateMutations();

  const handleSave = () => {
    if (editingTemplate.id) {
      updateMutation.mutate({ id: editingTemplate.id, data: editingTemplate });
    } else {
      createMutation.mutate(editingTemplate);
    }
  };

  const moveTemplate = (index, direction) => {
    const newOrder = direction === 'up' ? index - 1 : index + 1;
    if (newOrder < 0 || newOrder >= templates.length) return;

    reorderMutation.mutate({ id: templates[index].id, newOrder });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Policy Template Manager', ar: 'مدير قوالب السياسات' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Manage policy templates for quick creation', ar: 'إدارة قوالب السياسات للإنشاء السريع' })}
          </p>
        </div>
        <Button onClick={() => { setEditingTemplate({ template_id: '', name_en: '', name_ar: '', category: 'regulation', icon: 'FileText', template_data: {}, is_active: true, sort_order: templates.length }); setShowDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          {t({ en: 'New Template', ar: 'قالب جديد' })}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: `${templates.length} Templates`, ar: `${templates.length} قالب` })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {templates.map((template, idx) => (
            <div key={template.id} className="flex items-center gap-3 p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-1">
                <Button size="sm" variant="ghost" onClick={() => moveTemplate(idx, 'up')} disabled={idx === 0}>
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => moveTemplate(idx, 'down')} disabled={idx === templates.length - 1}>
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' && template.name_ar ? template.name_ar : template.name_en}
                  </h3>
                  <Badge variant="outline">{template.category}</Badge>
                  {!template.is_active && <Badge className="bg-red-100 text-red-700">Inactive</Badge>}
                </div>
                <p className="text-sm text-slate-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {language === 'ar' && template.description_ar ? template.description_ar : template.description_en}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {t({ en: 'Used', ar: 'استخدم' })}: {template.usage_count || 0} {t({ en: 'times', ar: 'مرة' })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditingTemplate(template); setShowDialog(true); }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => { if (confirm(t({ en: 'Delete template?', ar: 'حذف القالب؟' }))) deleteMutation.mutate(template.id); }}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate?.id ? t({ en: 'Edit Template', ar: 'تعديل القالب' }) : t({ en: 'New Template', ar: 'قالب جديد' })}
            </DialogTitle>
          </DialogHeader>

          {editingTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Template ID', ar: 'معرف القالب' })}</Label>
                  <Input value={editingTemplate.template_id} onChange={(e) => setEditingTemplate({ ...editingTemplate, template_id: e.target.value })} placeholder="municipal_service_regulation" />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Category', ar: 'الفئة' })}</Label>
                  <Select value={editingTemplate.category} onValueChange={(v) => setEditingTemplate({ ...editingTemplate, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regulation">Regulation</SelectItem>
                      <SelectItem value="amendment">Amendment</SelectItem>
                      <SelectItem value="guideline">Guideline</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="pilot_based">Pilot-Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Name (Arabic)', ar: 'اسم القالب' })}</Label>
                <Input value={editingTemplate.name_ar} onChange={(e) => setEditingTemplate({ ...editingTemplate, name_ar: e.target.value })} dir="rtl" />
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Name (English - Optional)', ar: 'الاسم (إنجليزي - اختياري)' })}</Label>
                <Input value={editingTemplate.name_en} onChange={(e) => setEditingTemplate({ ...editingTemplate, name_en: e.target.value })} placeholder="Auto-translated if left empty" />
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Description (Arabic)', ar: 'وصف القالب' })}</Label>
                <Textarea value={editingTemplate.description_ar} onChange={(e) => setEditingTemplate({ ...editingTemplate, description_ar: e.target.value })} rows={3} dir="rtl" />
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Description (English - Optional)', ar: 'الوصف (إنجليزي - اختياري)' })}</Label>
                <Textarea value={editingTemplate.description_en} onChange={(e) => setEditingTemplate({ ...editingTemplate, description_en: e.target.value })} rows={3} placeholder="Auto-translated if left empty" />
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Template Data (JSON - Arabic fields only)', ar: 'بيانات القالب (JSON - حقول عربية فقط)' })}</Label>
                <p className="text-xs text-blue-600 mb-2">
                  {t({ en: 'Note: Only Arabic fields needed. English auto-generated on use.', ar: 'ملاحظة: الحقول العربية فقط مطلوبة. الإنجليزية تُنشأ تلقائياً.' })}
                </p>
                <Textarea
                  value={JSON.stringify(editingTemplate.template_data || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setEditingTemplate({ ...editingTemplate, template_data: parsed });
                    } catch (err) { }
                  }}
                  rows={12}
                  className="font-mono text-xs"
                  placeholder='{"title_ar": "...", "policy_type": "new_regulation", "implementation_steps": [{"ar": "..."}], ...}'
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={editingTemplate.is_active} onChange={(e) => setEditingTemplate({ ...editingTemplate, is_active: e.target.checked })} />
                  <Label>{t({ en: 'Active', ar: 'نشط' })}</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  <X className="h-4 w-4 mr-2" />
                  {t({ en: 'Cancel', ar: 'إلغاء' })}
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  {t({ en: 'Save', ar: 'حفظ' })}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProtectedPage(PolicyTemplateManagerPage, {
  requiredPermissions: ['policy_manage_templates']
});
