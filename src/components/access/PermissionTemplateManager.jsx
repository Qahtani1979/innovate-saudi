import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import {
  Copy, Save, Trash2, Plus, Shield, FileText, Users
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function PermissionTemplateManager() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  // Fetch permission templates (stored in PlatformConfig)
  const { data: templates = [] } = useQuery({
    queryKey: ['permission-templates'],
    queryFn: async () => {
      const configs = await base44.entities.PlatformConfig.filter({
        key: { $regex: '^permission_template_' }
      });
      return configs.map(c => ({ id: c.id, ...c.value }));
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (template) => {
      return base44.entities.PlatformConfig.create({
        key: `permission_template_${Date.now()}`,
        value: template
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['permission-templates']);
      setShowDialog(false);
      setEditingTemplate(null);
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, template }) => {
      return base44.entities.PlatformConfig.update(id, {
        value: template
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['permission-templates']);
      setShowDialog(false);
      setEditingTemplate(null);
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.PlatformConfig.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['permission-templates'])
  });

  const handleSave = () => {
    if (editingTemplate.id) {
      updateTemplateMutation.mutate({ 
        id: editingTemplate.id, 
        template: editingTemplate 
      });
    } else {
      createTemplateMutation.mutate(editingTemplate);
    }
  };

  const handleClone = (template) => {
    setEditingTemplate({
      name: `${template.name} (Copy)`,
      description: template.description,
      permissions: [...template.permissions],
      category: template.category
    });
    setShowDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {t({ en: 'Permission Templates', ar: 'قوالب الصلاحيات' })}
        </h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTemplate({ 
              name: '', 
              description: '', 
              permissions: [],
              category: 'custom'
            })}>
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: 'Create Template', ar: 'إنشاء قالب' })}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate?.id ? 
                  t({ en: 'Edit Template', ar: 'تعديل القالب' }) : 
                  t({ en: 'New Template', ar: 'قالب جديد' })}
              </DialogTitle>
            </DialogHeader>
            
            {editingTemplate && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    {t({ en: 'Template Name', ar: 'اسم القالب' })}
                  </label>
                  <Input
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      name: e.target.value
                    })}
                    placeholder={t({ en: 'e.g., Municipality Admin', ar: 'مثال: مسؤول بلدية' })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    {t({ en: 'Description', ar: 'الوصف' })}
                  </label>
                  <Textarea
                    value={editingTemplate.description}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      description: e.target.value
                    })}
                    placeholder={t({ en: 'Describe this permission set...', ar: 'صف مجموعة الصلاحيات...' })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    {t({ en: 'Permissions (one per line)', ar: 'الصلاحيات (واحدة لكل سطر)' })}
                  </label>
                  <Textarea
                    value={editingTemplate.permissions?.join('\n') || ''}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      permissions: e.target.value.split('\n').filter(p => p.trim())
                    })}
                    placeholder="challenge_create&#10;challenge_edit&#10;pilot_view"
                    rows={10}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  {template.name}
                </div>
                <Badge variant="outline">{template.permissions?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">{template.description}</p>
              
              <div className="flex flex-wrap gap-1">
                {template.permissions?.slice(0, 5).map((perm, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {perm}
                  </Badge>
                ))}
                {template.permissions?.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{template.permissions.length - 5} more
                  </Badge>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleClone(template)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {t({ en: 'Clone', ar: 'نسخ' })}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setEditingTemplate(template);
                    setShowDialog(true);
                  }}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  {t({ en: 'Edit', ar: 'تعديل' })}
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => deleteTemplateMutation.mutate(template.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">
              {t({ en: 'No permission templates yet. Create one to get started.', ar: 'لا توجد قوالب صلاحيات بعد. قم بإنشاء واحد للبدء.' })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}