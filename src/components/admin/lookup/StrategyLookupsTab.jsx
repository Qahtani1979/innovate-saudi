import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Plus, Edit2, Trash2, Loader2, Lightbulb, Cpu, Flag, Users, AlertTriangle, Shield
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner';

const LOOKUP_CONFIGS = {
  strategic_themes: {
    table: 'lookup_strategic_themes',
    icon: Lightbulb,
    title: { en: 'Strategic Themes', ar: 'المحاور الاستراتيجية' },
    fields: ['code', 'name_en', 'name_ar', 'description_en', 'description_ar', 'icon', 'display_order', 'is_active']
  },
  technologies: {
    table: 'lookup_technologies',
    icon: Cpu,
    title: { en: 'Technologies', ar: 'التقنيات' },
    fields: ['code', 'name_en', 'name_ar', 'description_en', 'description_ar', 'category', 'icon', 'display_order', 'is_active']
  },
  vision_programs: {
    table: 'lookup_vision_programs',
    icon: Flag,
    title: { en: 'Vision 2030 Programs', ar: 'برامج رؤية 2030' },
    fields: ['code', 'name_en', 'name_ar', 'description_en', 'description_ar', 'official_url', 'icon', 'display_order', 'is_active']
  },
  stakeholder_types: {
    table: 'lookup_stakeholder_types',
    icon: Users,
    title: { en: 'Stakeholder Types', ar: 'أنواع أصحاب المصلحة' },
    fields: ['code', 'name_en', 'name_ar', 'description_en', 'description_ar', 'icon', 'display_order', 'is_active']
  },
  risk_categories: {
    table: 'lookup_risk_categories',
    icon: AlertTriangle,
    title: { en: 'Risk Categories', ar: 'فئات المخاطر' },
    fields: ['code', 'name_en', 'name_ar', 'description_en', 'description_ar', 'icon', 'display_order', 'is_active']
  },
  governance_roles: {
    table: 'lookup_governance_roles',
    icon: Shield,
    title: { en: 'Governance Roles', ar: 'أدوار الحوكمة' },
    fields: ['code', 'name_en', 'name_ar', 'description_en', 'description_ar', 'icon', 'display_order', 'is_active']
  }
};

function LookupTable({ config, lookupKey }) {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const { data: items = [], isLoading } = useQuery({
    queryKey: [config.table],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(config.table)
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingItem) {
        const { error } = await supabase
          .from(config.table)
          .update(data)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(config.table)
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries([config.table]);
      queryClient.invalidateQueries(['taxonomy-global']);
      setDialogOpen(false);
      setEditingItem(null);
      setFormData({});
      toast.success(t({ en: 'Saved successfully', ar: 'تم الحفظ بنجاح' }));
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from(config.table)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([config.table]);
      queryClient.invalidateQueries(['taxonomy-global']);
      toast.success(t({ en: 'Deleted successfully', ar: 'تم الحذف بنجاح' }));
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ is_active: true, display_order: items.length + 1 });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.code || !formData.name_en) {
      toast.error(t({ en: 'Code and English name are required', ar: 'الرمز والاسم بالإنجليزية مطلوبان' }));
      return;
    }
    saveMutation.mutate(formData);
  };

  const Icon = config.icon;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {t(config.title)}
          <Badge variant="secondary">{items.length}</Badge>
        </CardTitle>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1" />
          {t({ en: 'Add', ar: 'إضافة' })}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">{t({ en: 'Order', ar: 'الترتيب' })}</TableHead>
                <TableHead>{t({ en: 'Code', ar: 'الرمز' })}</TableHead>
                <TableHead>{t({ en: 'Name (EN)', ar: 'الاسم (EN)' })}</TableHead>
                <TableHead>{t({ en: 'Name (AR)', ar: 'الاسم (AR)' })}</TableHead>
                <TableHead className="w-20">{t({ en: 'Active', ar: 'نشط' })}</TableHead>
                <TableHead className="w-24">{t({ en: 'Actions', ar: 'إجراءات' })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.display_order}</TableCell>
                  <TableCell className="font-mono text-sm">{item.code}</TableCell>
                  <TableCell>{item.name_en}</TableCell>
                  <TableCell dir="rtl">{item.name_ar}</TableCell>
                  <TableCell>
                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
                      {item.is_active ? '✓' : '✗'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          if (confirm(t({ en: 'Delete this item?', ar: 'حذف هذا العنصر؟' }))) {
                            deleteMutation.mutate(item.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {t({ en: 'No items yet', ar: 'لا توجد عناصر بعد' })}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem 
                ? t({ en: `Edit ${config.title.en}`, ar: `تعديل ${config.title.ar}` })
                : t({ en: `Add ${config.title.en}`, ar: `إضافة ${config.title.ar}` })
              }
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t({ en: 'Code', ar: 'الرمز' })} *</label>
                <Input 
                  value={formData.code || ''} 
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  placeholder="unique_code"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t({ en: 'Display Order', ar: 'ترتيب العرض' })}</label>
                <Input 
                  type="number"
                  value={formData.display_order || ''} 
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t({ en: 'Name (EN)', ar: 'الاسم (EN)' })} *</label>
                <Input 
                  value={formData.name_en || ''} 
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t({ en: 'Name (AR)', ar: 'الاسم (AR)' })}</label>
                <Input 
                  value={formData.name_ar || ''} 
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  dir="rtl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t({ en: 'Description (EN)', ar: 'الوصف (EN)' })}</label>
                <Textarea 
                  value={formData.description_en || ''} 
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t({ en: 'Description (AR)', ar: 'الوصف (AR)' })}</label>
                <Textarea 
                  value={formData.description_ar || ''} 
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  rows={2}
                  dir="rtl"
                />
              </div>
            </div>
            {config.fields.includes('category') && (
              <div>
                <label className="text-sm font-medium mb-1 block">{t({ en: 'Category', ar: 'الفئة' })}</label>
                <Input 
                  value={formData.category || ''} 
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            )}
            {config.fields.includes('official_url') && (
              <div>
                <label className="text-sm font-medium mb-1 block">{t({ en: 'Official URL', ar: 'الرابط الرسمي' })}</label>
                <Input 
                  value={formData.official_url || ''} 
                  onChange={(e) => setFormData({ ...formData, official_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t({ en: 'Icon', ar: 'الأيقونة' })}</label>
                <Input 
                  value={formData.icon || ''} 
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="lucide-icon-name"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch 
                  checked={formData.is_active ?? true}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <label className="text-sm">{t({ en: 'Active', ar: 'نشط' })}</label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t({ en: 'Save', ar: 'حفظ' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default function StrategyLookupsTab() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('strategic_themes');

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          {Object.entries(LOOKUP_CONFIGS).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <TabsTrigger key={key} value={key} className="text-xs">
                <Icon className="h-3 w-3 mr-1" />
                {t(config.title)}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {Object.entries(LOOKUP_CONFIGS).map(([key, config]) => (
          <TabsContent key={key} value={key}>
            <LookupTable config={config} lookupKey={key} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
