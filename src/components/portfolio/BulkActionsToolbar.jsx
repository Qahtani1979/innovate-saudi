import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { CheckSquare, Move, UserPlus, Tag, Archive, Undo, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function BulkActionsToolbar({ selectedItems, onComplete, onClear }) {
  const { language, isRTL, t } = useLanguage();
  const [showDialog, setShowDialog] = useState(false);
  const [action, setAction] = useState(null);
  const [actionData, setActionData] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  const actions = [
    { id: 'move', label: { en: 'Move to Stage', ar: 'نقل للمرحلة' }, icon: Move },
    { id: 'assign', label: { en: 'Assign Owner', ar: 'تعيين مالك' }, icon: UserPlus },
    { id: 'status', label: { en: 'Update Status', ar: 'تحديث الحالة' }, icon: CheckSquare },
    { id: 'tag', label: { en: 'Add Tags', ar: 'إضافة وسوم' }, icon: Tag },
    { id: 'archive', label: { en: 'Archive', ar: 'أرشفة' }, icon: Archive }
  ];

  const handleAction = async () => {
    setLoading(true);
    try {
      const updates = selectedItems.map(item => {
        const updateData = {};
        if (action === 'move') updateData.track = actionData.stage;
        if (action === 'assign') updateData.challenge_owner = actionData.owner;
        if (action === 'status') updateData.status = actionData.status;
        if (action === 'tag') updateData.tags = [...(item.tags || []), actionData.tag];
        if (action === 'archive') updateData.is_archived = true;
        return { id: item.id, data: updateData };
      });

      for (const update of updates) {
        await base44.entities.Challenge.update(update.id, update.data);
      }

      setLastAction({ action, items: selectedItems, data: actionData, timestamp: Date.now() });
      toast.success(t({ en: `${selectedItems.length} items updated`, ar: `تم تحديث ${selectedItems.length} عنصر` }));
      setShowDialog(false);
      onComplete();
    } catch (error) {
      toast.error(t({ en: 'Bulk action failed', ar: 'فشل الإجراء الجماعي' }));
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    if (!lastAction || Date.now() - lastAction.timestamp > 300000) return;
    
    setLoading(true);
    try {
      for (const item of lastAction.items) {
        const revertData = {};
        if (lastAction.action === 'archive') revertData.is_archived = false;
        await base44.entities.Challenge.update(item.id, revertData);
      }
      toast.success(t({ en: 'Action undone', ar: 'تم التراجع' }));
      setLastAction(null);
      onComplete();
    } catch (error) {
      toast.error(t({ en: 'Undo failed', ar: 'فشل التراجع' }));
    } finally {
      setLoading(false);
    }
  };

  if (selectedItems.length === 0) return null;

  return (
    <>
      <div className="sticky top-20 z-40 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge className="bg-white text-blue-600 text-lg px-3 py-1">
              {selectedItems.length} {t({ en: 'selected', ar: 'محدد' })}
            </Badge>
            <div className="flex gap-2">
              {actions.map(act => {
                const Icon = act.icon;
                return (
                  <Button
                    key={act.id}
                    size="sm"
                    variant="secondary"
                    onClick={() => { setAction(act.id); setShowDialog(true); }}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {act.label[language]}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastAction && Date.now() - lastAction.timestamp < 300000 && (
              <Button size="sm" variant="outline" onClick={handleUndo} className="bg-white/20 border-white/40">
                <Undo className="h-4 w-4 mr-2" />
                {t({ en: 'Undo', ar: 'تراجع' })}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onClear} className="text-white hover:bg-white/20">
              {t({ en: 'Clear', ar: 'إلغاء' })}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actions.find(a => a.id === action)?.label[language]}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              {t({ en: `This will affect ${selectedItems.length} items`, ar: `سيؤثر هذا على ${selectedItems.length} عنصر` })}
            </p>
            
            {action === 'move' && (
              <Select onValueChange={(v) => setActionData({ stage: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select stage', ar: 'اختر المرحلة' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pilot">{t({ en: 'Pilot Track', ar: 'مسار التجريب' })}</SelectItem>
                  <SelectItem value="r_and_d">{t({ en: 'R&D Track', ar: 'مسار البحث' })}</SelectItem>
                  <SelectItem value="program">{t({ en: 'Program Track', ar: 'مسار البرنامج' })}</SelectItem>
                </SelectContent>
              </Select>
            )}

            {action === 'status' && (
              <Select onValueChange={(v) => setActionData({ status: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select status', ar: 'اختر الحالة' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">{t({ en: 'Approved', ar: 'موافق' })}</SelectItem>
                  <SelectItem value="in_treatment">{t({ en: 'In Treatment', ar: 'قيد المعالجة' })}</SelectItem>
                  <SelectItem value="resolved">{t({ en: 'Resolved', ar: 'محلول' })}</SelectItem>
                </SelectContent>
              </Select>
            )}

            {action === 'assign' && (
              <Input
                placeholder={t({ en: 'Owner email', ar: 'بريد المالك' })}
                onChange={(e) => setActionData({ owner: e.target.value })}
              />
            )}

            {action === 'tag' && (
              <Input
                placeholder={t({ en: 'Tag name', ar: 'اسم الوسم' })}
                onChange={(e) => setActionData({ tag: e.target.value })}
              />
            )}

            {action === 'archive' && (
              <p className="text-sm text-red-600">
                {t({ en: 'Items will be archived and hidden from active views', ar: 'سيتم أرشفة العناصر وإخفاؤها من العروض النشطة' })}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button onClick={handleAction} disabled={loading} className="bg-blue-600">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t({ en: 'Apply', ar: 'تطبيق' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}