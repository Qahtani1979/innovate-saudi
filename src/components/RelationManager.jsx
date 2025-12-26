import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { useRelationManagement } from '@/hooks/useRelationManagement';
import { usePolicyRecommendations } from '@/hooks/usePolicyRecommendations';

export default function RelationManager({
  entityType,
  entityId,
  open,
  onClose
}) {
  const { language, t } = useLanguage();
  const [mode, setMode] = useState('list'); // 'list', 'create', 'edit'
  const [selectedRelation, setSelectedRelation] = useState(null);
  const [formData, setFormData] = useState({
    related_entity_type: '',
    related_entity_id: '',
    relation_role: '',
    notes: '',
    strength: 80,
    bidirectional: false
  });

  const {
    useAllRelations,
    useAllChallenges,
    useAllSolutions,
    useAllPilots,
    useAllRDProjects,
    useAllPrograms,
    createMatch,
    reviewRelation, // Not used here directly but available
    deleteRelation
  } = useRelationManagement();

  const { data: allRelations = [] } = useAllRelations();
  const relations = allRelations.filter(r =>
    r.challenge_id === entityId ||
    (r.bidirectional && r.related_entity_id === entityId)
  );

  const { data: challenges = [] } = useAllChallenges();
  const { data: solutions = [] } = useAllSolutions();
  const { data: pilots = [] } = useAllPilots();
  const { data: rdProjects = [] } = useAllRDProjects();
  const { data: programs = [] } = useAllPrograms();
  const { data: policies = [] } = usePolicyRecommendations(); // Assuming hook name, verified next step if fails.

  // Create mutation wrapper
  const handleCreate = async () => {
    try {
      await createMatch.mutateAsync({
        challenge_id: entityId,
        ...formData,
        created_via: 'manual'
      });
      toast.success(t({ en: 'Relation created', ar: 'تم إنشاء العلاقة' }));
      resetForm();
    } catch (error) {
      // Handled by hook
    }
  };

  const handleUpdate = async () => {
    try {
      await updateRelation.mutateAsync({
        id: selectedRelation.id,
        data: formData
      });
      toast.success(t({ en: 'Relation updated', ar: 'تم تحديث العلاقة' }));
      resetForm();
    } catch (error) {
      // Handled by hook
    }
  };

  const resetForm = () => {
    setMode('list');
    setSelectedRelation(null);
    setFormData({
      related_entity_type: '',
      related_entity_id: '',
      relation_role: '',
      notes: '',
      strength: 80,
      bidirectional: false
    });
  };

  const handleEdit = (relation) => {
    setSelectedRelation(relation);
    setFormData({
      related_entity_type: relation.related_entity_type,
      related_entity_id: relation.related_entity_id,
      relation_role: relation.relation_role,
      notes: relation.notes || '',
      strength: relation.strength || 80,
      bidirectional: relation.bidirectional || false
    });
    setMode('edit');
  };

  const getEntityOptions = () => {
    switch (formData.related_entity_type) {
      case 'challenge':
        return challenges.filter(c => c.id !== entityId).map(c => ({ value: c.id, label: c.title_ar || c.title_en || c.code }));
      case 'solution':
        return solutions.map(s => ({ value: s.id, label: s.name_ar || s.name_en || s.code }));
      case 'pilot':
        return pilots.map(p => ({ value: p.id, label: p.title_ar || p.title_en || p.code }));
      case 'rd_project':
        return rdProjects.map(r => ({ value: r.id, label: r.title_ar || r.title_en || r.code }));
      case 'program':
        return programs.map(p => ({ value: p.id, label: p.name_ar || p.name_en || p.code }));
      case 'policy':
        return policies.map(p => ({ value: p.id, label: p.title_ar || p.title_en || p.code }));
      default:
        return [];
    }
  };

  const relationRoles = [
    { value: 'solved_by', label: 'Solved By' },
    { value: 'informed_by', label: 'Informed By' },
    { value: 'derived_from', label: 'Derived From' },
    { value: 'similar_to', label: 'Similar To' },
    { value: 'parent_of', label: 'Parent Of' },
    { value: 'child_of', label: 'Child Of' },
    { value: 'requires_policy', label: 'Requires Policy' },
    { value: 'enabled_by_policy', label: 'Enabled By Policy' },
    { value: 'generates_policy', label: 'Generates Policy' }
  ];

  const entityTypes = [
    { value: 'challenge', label: 'Challenge' },
    { value: 'solution', label: 'Solution' },
    { value: 'pilot', label: 'Pilot' },
    { value: 'rd_project', label: 'R&D Project' },
    { value: 'program', label: 'Program' },
    { value: 'policy', label: 'Policy' }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {t({ en: 'Manage Relations', ar: 'إدارة العلاقات' })}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : mode === 'list' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">
                {relations.length} {t({ en: 'relations found', ar: 'علاقة موجودة' })}
              </p>
              <Button onClick={() => setMode('create')} className="gap-2">
                <Plus className="h-4 w-4" />
                {t({ en: 'Add Relation', ar: 'إضافة علاقة' })}
              </Button>
            </div>

            <div className="space-y-2">
              {relations.map((relation) => {
                const getEntityDisplay = () => {
                  if (relation.related_entity_type === 'challenge') {
                    const c = challenges.find(ch => ch.id === relation.related_entity_id);
                    return { name: c?.title_ar || c?.title_en || c?.code || relation.related_entity_id, code: c?.code };
                  }
                  if (relation.related_entity_type === 'solution') {
                    const s = solutions.find(s => s.id === relation.related_entity_id);
                    return { name: s?.name_ar || s?.name_en || s?.code || relation.related_entity_id, code: s?.code };
                  }
                  if (relation.related_entity_type === 'pilot') {
                    const p = pilots.find(p => p.id === relation.related_entity_id);
                    return { name: p?.title_ar || p?.title_en || p?.code || relation.related_entity_id, code: p?.code };
                  }
                  if (relation.related_entity_type === 'rd_project') {
                    const r = rdProjects.find(r => r.id === relation.related_entity_id);
                    return { name: r?.title_ar || r?.title_en || r?.code || relation.related_entity_id, code: r?.code };
                  }
                  if (relation.related_entity_type === 'program') {
                    const p = programs.find(p => p.id === relation.related_entity_id);
                    return { name: p?.name_ar || p?.name_en || p?.code || relation.related_entity_id, code: p?.code };
                  }
                  if (relation.related_entity_type === 'policy') {
                    const p = policies.find(p => p.id === relation.related_entity_id);
                    return { name: p?.title_ar || p?.title_en || p?.code || relation.related_entity_id, code: p?.code };
                  }
                  return { name: relation.related_entity_id, code: null };
                };

                const entityDisplay = getEntityDisplay();

                return (
                  <div key={relation.id} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {relation.related_entity_type?.replace(/_/g, ' ')}
                          </Badge>
                          <Badge className="text-xs capitalize">
                            {relation.relation_role?.replace(/_/g, ' ')}
                          </Badge>
                          {relation.created_via === 'ai' && (
                            <Badge className="text-xs bg-purple-100 text-purple-700">
                              AI
                            </Badge>
                          )}
                        </div>
                        {entityDisplay.code && (
                          <p className="text-xs text-slate-500 font-mono mb-1">{entityDisplay.code}</p>
                        )}
                        <p className="text-sm font-medium text-slate-900">
                          {entityDisplay.name}
                        </p>
                        {relation.notes && (
                          <p className="text-xs text-slate-600 mt-2">{relation.notes}</p>
                        )}
                        {relation.strength && (
                          <p className="text-xs text-slate-500 mt-1">
                            Strength: {Math.round(typeof relation.strength === 'number' ? relation.strength : relation.strength * 100)}%
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(relation)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteRelation.mutate(relation.id)}
                          disabled={deleteRelation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {relations.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <p>{t({ en: 'No relations yet', ar: 'لا توجد علاقات بعد' })}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {mode === 'create'
                  ? t({ en: 'Create New Relation', ar: 'إنشاء علاقة جديدة' })
                  : t({ en: 'Edit Relation', ar: 'تعديل العلاقة' })
                }
              </h3>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Entity Type', ar: 'نوع الكيان' })}</Label>
                <Select
                  value={formData.related_entity_type}
                  onValueChange={(v) => setFormData({ ...formData, related_entity_type: v, related_entity_id: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.related_entity_type && (
                <div className="space-y-2">
                  <Label>{t({ en: 'Select Entity', ar: 'اختر الكيان' })}</Label>
                  <Select
                    value={formData.related_entity_id}
                    onValueChange={(v) => setFormData({ ...formData, related_entity_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {getEntityOptions().map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t({ en: 'Relation Role', ar: 'دور العلاقة' })}</Label>
                <Select
                  value={formData.relation_role}
                  onValueChange={(v) => setFormData({ ...formData, relation_role: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relation role" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationRoles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Strength (0-100)', ar: 'القوة (0-100)' })}</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Notes', ar: 'ملاحظات' })}</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.bidirectional}
                  onChange={(e) => setFormData({ ...formData, bidirectional: e.target.checked })}
                  className="rounded"
                />
                <Label>{t({ en: 'Bidirectional', ar: 'ثنائي الاتجاه' })}</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={resetForm}>
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              <Button
                onClick={mode === 'create' ? handleCreate : handleUpdate}
                disabled={createMatch.isPending || updateRelation.isPending}
                className="gap-2"
              >
                {(createMatch.isPending || updateRelation.isPending) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {t({ en: 'Save', ar: 'حفظ' })}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
