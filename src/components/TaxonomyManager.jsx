import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from './LanguageContext';
import { Tags, Plus, Trash2, Save, X } from 'lucide-react';
import { useSectors } from '@/hooks/useSectors';
import { useTags } from '@/hooks/useTags';
import { useKPIReferences, useKPIReferenceMutations } from '@/hooks/useKPIReferences';
import { useTaxonomyMutations } from '@/hooks/useTaxonomyMutations';

function TaxonomyManager() {
  const { language, isRTL, t } = useLanguage();
  const [editingItem, setEditingItem] = useState(null);
  const [newSector, setNewSector] = useState(null);
  const [newTag, setNewTag] = useState(null);
  const [newKpi, setNewKpi] = useState(null);

  const { data: sectors = [] } = useSectors();
  const { data: tags = [] } = useTags();
  const { data: kpiRefs = [] } = useKPIReferences();

  const { createSector, deleteSector, createTag, deleteTag } = useTaxonomyMutations();
  const { createKPIReference, deleteKPIReference } = useKPIReferenceMutations();

  // Wrappers to match legacy state handling if needed, or direct usage
  const handleCreateSector = () => {
    createSector.mutate(newSector, {
      onSuccess: () => setNewSector(null)
    });
  };

  const handleCreateTag = () => {
    createTag.mutate(newTag, {
      onSuccess: () => setNewTag(null)
    });
  };

  const handleCreateKpi = () => {
    createKPIReference.mutate(newKpi, {
      onSuccess: () => setNewKpi(null)
    });
  };

  const renderSectorManager = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-600">
          {t({ en: 'Manage sector taxonomy used across the platform', ar: 'إدارة تصنيف القطاعات المستخدم عبر المنصة' })}
        </p>
        <Button onClick={() => setNewSector({ name_en: '', name_ar: '', code: '' })} size="sm">
          <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Add Sector', ar: 'إضافة قطاع' })}
        </Button>
      </div>

      {newSector && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Input
                placeholder="English name"
                value={newSector.name_en}
                onChange={(e) => setNewSector({ ...newSector, name_en: e.target.value })}
              />
              <Input
                placeholder="Arabic name"
                value={newSector.name_ar}
                onChange={(e) => setNewSector({ ...newSector, name_ar: e.target.value })}
                dir="rtl"
              />
              <Input
                placeholder="Code (e.g., UD)"
                value={newSector.code}
                onChange={(e) => setNewSector({ ...newSector, code: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateSector} disabled={!newSector.name_en || !newSector.code}>
                <Save className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setNewSector(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {sectors.map(sector => (
          <div key={sector.id} className="p-4 border rounded-lg hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-100 text-blue-700">
                  {sector.code}
                </Badge>
                <div>
                  <p className="font-medium text-slate-900">{language === 'ar' ? sector.name_ar : sector.name_en}</p>
                  <p className="text-sm text-slate-600">{language === 'ar' ? sector.name_en : sector.name_ar}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => deleteSector.mutate(sector.id)}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTagManager = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-600">
          {t({ en: 'Manage tags for categorization and filtering', ar: 'إدارة الوسوم للتصنيف والتصفية' })}
        </p>
        <Button onClick={() => setNewTag({ name_en: '', name_ar: '', type: 'general', color: '#3b82f6' })} size="sm">
          <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Add Tag', ar: 'إضافة وسم' })}
        </Button>
      </div>

      {newTag && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="English name"
                value={newTag.name_en}
                onChange={(e) => setNewTag({ ...newTag, name_en: e.target.value })}
              />
              <Input
                placeholder="Arabic name"
                value={newTag.name_ar}
                onChange={(e) => setNewTag({ ...newTag, name_ar: e.target.value })}
                dir="rtl"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateTag} disabled={!newTag.name_en}>
                <Save className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setNewTag(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tags.map(tag => (
          <div key={tag.id} className="p-4 border rounded-lg hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <Badge style={{ backgroundColor: tag.color || '#3b82f6', color: 'white' }}>
                {language === 'ar' ? tag.name_ar : tag.name_en}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => deleteTag.mutate(tag.id)}>
                <Trash2 className="h-3 w-3 text-red-600" />
              </Button>
            </div>
            <p className="text-xs text-slate-600">Type: {tag.tag_type}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderKPIManager = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-600">
          {t({ en: 'Manage KPI templates for pilots and challenges', ar: 'إدارة قوالب مؤشرات الأداء للتجارب والتحديات' })}
        </p>
        <Button onClick={() => setNewKpi({ code: '', name_en: '', name_ar: '', category: 'service_quality', unit: '' })} size="sm">
          <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Add KPI Template', ar: 'إضافة قالب مؤشر' })}
        </Button>
      </div>

      {newKpi && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Code (e.g., GLI_001)"
                value={newKpi.code}
                onChange={(e) => setNewKpi({ ...newKpi, code: e.target.value })}
              />
              <Input
                placeholder="Unit (e.g., %, hours)"
                value={newKpi.unit}
                onChange={(e) => setNewKpi({ ...newKpi, unit: e.target.value })}
              />
              <Input
                placeholder="English name"
                value={newKpi.name_en}
                onChange={(e) => setNewKpi({ ...newKpi, name_en: e.target.value })}
              />
              <Input
                placeholder="Arabic name"
                value={newKpi.name_ar}
                onChange={(e) => setNewKpi({ ...newKpi, name_ar: e.target.value })}
                dir="rtl"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateKpi} disabled={!newKpi.code || !newKpi.name_en}>
                <Save className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setNewKpi(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {kpiRefs.map(kpi => (
          <div key={kpi.id} className="p-4 border rounded-lg hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-medium text-slate-900">{language === 'ar' ? kpi.name_ar : kpi.name_en}</p>
                  <Badge variant="outline">{kpi.unit}</Badge>
                  <Badge className="bg-purple-100 text-purple-700">{kpi.category}</Badge>
                </div>
                <p className="text-sm text-slate-600">{kpi.code}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => deleteKPIReference.mutate(kpi.id)}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tags className="h-5 w-5 text-blue-600" />
          {t({ en: 'Taxonomy Management', ar: 'إدارة التصنيف' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sectors">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sectors">
              {t({ en: 'Sectors', ar: 'القطاعات' })} ({sectors.length})
            </TabsTrigger>
            <TabsTrigger value="tags">
              {t({ en: 'Tags', ar: 'الوسوم' })} ({tags.length})
            </TabsTrigger>
            <TabsTrigger value="kpis">
              {t({ en: 'KPI Templates', ar: 'قوالب المؤشرات' })} ({kpiRefs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sectors" className="mt-6">
            {renderSectorManager()}
          </TabsContent>

          <TabsContent value="tags" className="mt-6">
            {renderTagManager()}
          </TabsContent>

          <TabsContent value="kpis" className="mt-6">
            {renderKPIManager()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default TaxonomyManager;