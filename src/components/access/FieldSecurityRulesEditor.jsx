import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../LanguageContext';
import { toast } from 'sonner';
import {
  Shield, Lock, Eye, Edit, Plus, Trash2, AlertCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FieldSecurityRulesEditor() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedEntity, setSelectedEntity] = useState('Challenge');
  const [editingField, setEditingField] = useState(null);

  const entities = [
    'Challenge', 'Pilot', 'Solution', 'RDProject', 'Program', 
    'Municipality', 'Organization', 'User'
  ];

  // Fetch field security rules from platform_config
  const { data: securityRules = {} } = useQuery({
    queryKey: ['field-security', selectedEntity],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_config')
        .select('*')
        .eq('key', `field_security_${selectedEntity}`)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.value || {};
    }
  });

  const updateRulesMutation = useMutation({
    mutationFn: async (rules) => {
      const key = `field_security_${selectedEntity}`;
      
      // Check if exists
      const { data: existing } = await supabase
        .from('platform_config')
        .select('id')
        .eq('key', key)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('platform_config')
          .update({ value: rules })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('platform_config')
          .insert({ key, value: rules });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['field-security']);
      setEditingField(null);
      toast.success(t({ en: 'Field rules updated', ar: 'تم تحديث قواعد الحقل' }));
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const addFieldRule = () => {
    setEditingField({
      field_name: '',
      read_roles: ['admin', 'user'],
      write_roles: ['admin'],
      sensitive: false
    });
  };

  const saveFieldRule = () => {
    if (!editingField.field_name) return;

    const updatedRules = {
      ...securityRules,
      [editingField.field_name]: {
        read_roles: editingField.read_roles,
        write_roles: editingField.write_roles,
        sensitive: editingField.sensitive
      }
    };

    updateRulesMutation.mutate(updatedRules);
  };

  const deleteFieldRule = (fieldName) => {
    const updatedRules = { ...securityRules };
    delete updatedRules[fieldName];
    updateRulesMutation.mutate(updatedRules);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            {t({ en: 'Field-Level Security Rules', ar: 'قواعد أمان المستوى الحقلي' })}
          </h2>
          <Select value={selectedEntity} onValueChange={setSelectedEntity}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {entities.map(entity => (
                <SelectItem key={entity} value={entity}>
                  {entity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={addFieldRule}>
          <Plus className="h-4 w-4 mr-2" />
          {t({ en: 'Add Field Rule', ar: 'إضافة قاعدة حقل' })}
        </Button>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-900">
                {t({ en: 'Field-Level Security', ar: 'أمان مستوى الحقل' })}
              </p>
              <p className="text-amber-700">
                {t({ en: 'Control which roles can read or write specific fields. Changes apply immediately.', ar: 'التحكم في الأدوار التي يمكنها قراءة أو كتابة حقول معينة. يتم تطبيق التغييرات فوراً.' })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {editingField && (
        <Card className="border-2 border-blue-300">
          <CardHeader>
            <CardTitle className="text-base">
              {t({ en: 'Edit Field Rule', ar: 'تعديل قاعدة الحقل' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                {t({ en: 'Field Name', ar: 'اسم الحقل' })}
              </label>
              <Input
                value={editingField.field_name}
                onChange={(e) => setEditingField({
                  ...editingField,
                  field_name: e.target.value
                })}
                placeholder="e.g., budget, financial_data"
              />
            </div>

            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {t({ en: 'Read Roles (comma-separated)', ar: 'أدوار القراءة (مفصولة بفاصلة)' })}
              </label>
              <Input
                value={editingField.read_roles?.join(', ')}
                onChange={(e) => setEditingField({
                  ...editingField,
                  read_roles: e.target.value.split(',').map(r => r.trim())
                })}
                placeholder="admin, user, municipality_admin"
              />
            </div>

            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Edit className="h-4 w-4" />
                {t({ en: 'Write Roles (comma-separated)', ar: 'أدوار الكتابة (مفصولة بفاصلة)' })}
              </label>
              <Input
                value={editingField.write_roles?.join(', ')}
                onChange={(e) => setEditingField({
                  ...editingField,
                  write_roles: e.target.value.split(',').map(r => r.trim())
                })}
                placeholder="admin"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editingField.sensitive}
                onChange={(e) => setEditingField({
                  ...editingField,
                  sensitive: e.target.checked
                })}
                className="rounded"
              />
              <label className="text-sm">
                {t({ en: 'Mark as sensitive (PII/Financial)', ar: 'وضع علامة كحساس (معلومات شخصية/مالية)' })}
              </label>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveFieldRule} disabled={updateRulesMutation.isPending}>
                {t({ en: 'Save Rule', ar: 'حفظ القاعدة' })}
              </Button>
              <Button variant="outline" onClick={() => setEditingField(null)}>
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {Object.keys(securityRules).length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {t({ en: 'No field-level rules defined for this entity.', ar: 'لا توجد قواعد مستوى الحقل محددة لهذا الكيان.' })}
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(securityRules).map(([fieldName, rule]) => (
            <Card key={fieldName}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{fieldName}</span>
                      {rule.sensitive && (
                        <Badge variant="destructive" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Sensitive
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1 flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {t({ en: 'Read:', ar: 'قراءة:' })}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {rule.read_roles?.map((role, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1 flex items-center gap-1">
                          <Edit className="h-3 w-3" />
                          {t({ en: 'Write:', ar: 'كتابة:' })}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {rule.write_roles?.map((role, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingField({ field_name: fieldName, ...rule })}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteFieldRule(fieldName)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
