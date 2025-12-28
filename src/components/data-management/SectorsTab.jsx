import { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Layers,
  FolderTree,
  FileText,
  ChevronRight
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSectorManagement } from '@/hooks/useSectorManagement';


export function SectorsTab() {
  const { t, language } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('sector'); // 'sector', 'subsector', 'service'
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const {
    sectors,
    subsectors,
    services,
    deputyships,
    loadingSectors,
    loadingSubsectors,
    loadingServices,
    sectorsError,
    createMutation,
    updateMutation,
    deleteMutation
  } = useSectorManagement();


  const openCreateDialog = (type, parentId = null) => {
    setDialogType(type);
    setEditingItem(null);
    setFormData(parentId ? { sector_id: parentId, subsector_id: parentId } : {});
    setDialogOpen(true);
  };

  const openEditDialog = (type, item) => {
    setDialogType(type);
    setEditingItem(item);
    setFormData(item);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const table = dialogType === 'sector' ? 'sectors' :
      dialogType === 'subsector' ? 'subsectors' : 'services';

    if (editingItem) {
      updateMutation.mutate({ table, id: editingItem.id, data: formData }, {
        onSuccess: () => {
          setDialogOpen(false);
          setFormData({});
          setEditingItem(null);
        }
      });
    } else {
      createMutation.mutate({ table, data: { ...formData, is_active: true } }, {
        onSuccess: () => {
          setDialogOpen(false);
          setFormData({});
        }
      });
    }
  };

  const handleDelete = (type, id) => {
    const table = type === 'sector' ? 'sectors' :
      type === 'subsector' ? 'subsectors' : 'services';

    if (window.confirm(t({ en: 'Are you sure you want to delete this item?', ar: 'هل أنت متأكد من حذف هذا العنصر؟' }))) {
      deleteMutation.mutate({ table, id });
    }
  };

  const isLoading = loadingSectors || loadingSubsectors || loadingServices;

  if (sectorsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {t({ en: 'Failed to load sectors', ar: 'فشل تحميل القطاعات' })}
        </AlertDescription>
      </Alert>
    );
  }

  const getSubsectorsForSector = (sectorId) => subsectors.filter(s => s.sector_id === sectorId);
  const getServicesForSubsector = (subsectorId) => services.filter(s => s.subsector_id === subsectorId);

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <Badge variant="outline" className="px-3 py-1">
            <Layers className="w-4 h-4 mr-2" />
            {sectors.length} {t({ en: 'Sectors', ar: 'قطاعات' })}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <FolderTree className="w-4 h-4 mr-2" />
            {subsectors.length} {t({ en: 'Subsectors', ar: 'قطاعات فرعية' })}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <FileText className="w-4 h-4 mr-2" />
            {services.length} {t({ en: 'Services', ar: 'خدمات' })}
          </Badge>
        </div>
        <Button onClick={() => openCreateDialog('sector')}>
          <Plus className="w-4 h-4 mr-2" />
          {t({ en: 'Add Sector', ar: 'إضافة قطاع' })}
        </Button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sectors Accordion */}
      {!isLoading && (
        <Accordion type="multiple" className="space-y-4">
          {sectors.map(sector => (
            <AccordionItem key={sector.id} value={sector.id} className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{sector.icon || '📂'}</span>
                    <div className="text-left">
                      <p className="font-medium">
                        {language === 'ar' ? sector.name_ar || sector.name_en : sector.name_en}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {sector.code} • {getSubsectorsForSector(sector.id).length} {t({ en: 'subsectors', ar: 'فرعي' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog('sector', sector)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete('sector', sector.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  {/* Sector description */}
                  {sector.description_en && (
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? sector.description_ar || sector.description_en : sector.description_en}
                    </p>
                  )}

                  {/* Add subsector button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openCreateDialog('subsector', sector.id)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t({ en: 'Add Subsector', ar: 'إضافة قطاع فرعي' })}
                  </Button>

                  {/* Subsectors */}
                  <div className="space-y-2 ml-4">
                    {getSubsectorsForSector(sector.id).map(subsector => (
                      <div key={subsector.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {language === 'ar' ? subsector.name_ar || subsector.name_en : subsector.name_en}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {getServicesForSubsector(subsector.id).length} {t({ en: 'services', ar: 'خدمات' })}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog('subsector', subsector)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete('subsector', subsector.id)}>
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openCreateDialog('service', subsector.id)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Services */}
                        {getServicesForSubsector(subsector.id).length > 0 && (
                          <div className="mt-2 ml-6 flex flex-wrap gap-2">
                            {getServicesForSubsector(subsector.id).map(service => (
                              <Badge
                                key={service.id}
                                variant="outline"
                                className="cursor-pointer hover:bg-accent"
                                onClick={() => openEditDialog('service', service)}
                              >
                                {language === 'ar' ? service.name_ar || service.name_en : service.name_en}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? t({ en: 'Edit', ar: 'تعديل' }) : t({ en: 'Create', ar: 'إنشاء' })} {' '}
              {dialogType === 'sector' ? t({ en: 'Sector', ar: 'قطاع' }) :
                dialogType === 'subsector' ? t({ en: 'Subsector', ar: 'قطاع فرعي' }) :
                  t({ en: 'Service', ar: 'خدمة' })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t({ en: 'Name (EN)', ar: 'الاسم (EN)' })}</label>
                <Input
                  value={formData.name_en || ''}
                  onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="English name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t({ en: 'Name (AR)', ar: 'الاسم (AR)' })}</label>
                <Input
                  value={formData.name_ar || ''}
                  onChange={e => setFormData({ ...formData, name_ar: e.target.value })}
                  placeholder="الاسم بالعربية"
                  dir="rtl"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">{t({ en: 'Code', ar: 'الرمز' })}</label>
              <Input
                value={formData.code || ''}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., ENV, TRANS"
              />
            </div>

            {dialogType === 'sector' && (
              <div>
                <label className="text-sm font-medium">{t({ en: 'Deputyship', ar: 'الوكالة' })}</label>
                <Select
                  value={formData.deputyship_id || ''}
                  onValueChange={v => setFormData({ ...formData, deputyship_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t({ en: 'Select deputyship', ar: 'اختر الوكالة' })} />
                  </SelectTrigger>
                  <SelectContent>
                    {deputyships.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {language === 'ar' ? d.name_ar || d.name_en : d.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t({ en: 'Description (EN)', ar: 'الوصف (EN)' })}</label>
                <Textarea
                  value={formData.description_en || ''}
                  onChange={e => setFormData({ ...formData, description_en: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t({ en: 'Description (AR)', ar: 'الوصف (AR)' })}</label>
                <Textarea
                  value={formData.description_ar || ''}
                  onChange={e => setFormData({ ...formData, description_ar: e.target.value })}
                  rows={2}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t({ en: 'Icon (emoji)', ar: 'الأيقونة' })}</label>
                <Input
                  value={formData.icon || ''}
                  onChange={e => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="📂"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t({ en: 'Display Order', ar: 'ترتيب العرض' })}</label>
                <Input
                  type="number"
                  value={formData.display_order || 0}
                  onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingItem ? t({ en: 'Update', ar: 'تحديث' }) : t({ en: 'Create', ar: 'إنشاء' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SectorsTab;
