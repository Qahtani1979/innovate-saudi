/* @refresh reset */
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { useMediaDependencies } from '@/hooks/useMediaDependencies';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Trash2, AlertTriangle, Loader2, Link2, Archive, 
  FileX, ExternalLink 
} from 'lucide-react';

export default function MediaDeleteDialog({ 
  file, 
  open, 
  onOpenChange, 
  onConfirm,
  onSuccess 
}) {
  const { t } = useLanguage();
  const { checkDependencies, deleteWithCascade, getEntityDisplayName } = useMediaDependencies(t);
  
  const [isChecking, setIsChecking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dependencies, setDependencies] = useState(null);
  const [cascadeAction, setCascadeAction] = useState('nullify');

  useEffect(() => {
    if (open && file?.id) {
      checkFileDependencies();
    } else {
      setDependencies(null);
      setCascadeAction('nullify');
    }
  }, [open, file?.id]);

  const checkFileDependencies = async () => {
    if (!file?.id) return;
    
    setIsChecking(true);
    try {
      const result = await checkDependencies(file.id);
      setDependencies(result);
    } catch (err) {
      console.error('Error checking dependencies:', err);
      setDependencies({ canDelete: true, usageCount: 0, usages: [] });
    } finally {
      setIsChecking(false);
    }
  };

  const handleDelete = async () => {
    if (!file) return;
    
    setIsDeleting(true);
    try {
      if (dependencies?.usageCount > 0) {
        // Use cascade delete
        const result = await deleteWithCascade(file.id, cascadeAction);
        if (result.success) {
          onSuccess?.({
            ...result,
            file,
            cascadeAction
          });
        }
      } else {
        // Simple delete - use provided onConfirm
        onConfirm?.();
      }
    } catch (err) {
      console.error('Error deleting file:', err);
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  const renderDependencyWarning = () => {
    if (!dependencies || dependencies.usageCount === 0) return null;

    return (
      <div className="space-y-4 mt-4">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-medium text-warning">
              {t({ 
                en: `This file is used by ${dependencies.usageCount} entity(s)`,
                ar: `هذا الملف مستخدم في ${dependencies.usageCount} كيان(ات)`
              })}
            </p>
            <div className="flex flex-wrap gap-2">
              {dependencies.usages.slice(0, 5).map((usage, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className="text-xs gap-1"
                >
                  <Link2 className="h-3 w-3" />
                  {getEntityDisplayName(usage.entity_type)}
                  {usage.is_primary && (
                    <span className="text-warning">★</span>
                  )}
                </Badge>
              ))}
              {dependencies.usageCount > 5 && (
                <Badge variant="secondary" className="text-xs">
                  +{dependencies.usageCount - 5} {t({ en: 'more', ar: 'أخرى' })}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">
            {t({ en: 'How should we handle the references?', ar: 'كيف نتعامل مع المراجع؟' })}
          </p>
          <RadioGroup value={cascadeAction} onValueChange={setCascadeAction}>
            <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="nullify" id="nullify" className="mt-1" />
              <Label htmlFor="nullify" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <FileX className="h-4 w-4 text-destructive" />
                  <span className="font-medium">
                    {t({ en: 'Remove references', ar: 'إزالة المراجع' })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {t({ 
                    en: 'Delete file and set all entity references to empty. Entities will show no image/file.',
                    ar: 'حذف الملف وتفريغ جميع المراجع. الكيانات ستظهر بدون صورة/ملف.'
                  })}
                </p>
              </Label>
            </div>
            
            <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="archive" id="archive" className="mt-1" />
              <Label htmlFor="archive" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">
                    {t({ en: 'Archive only', ar: 'أرشفة فقط' })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {t({ 
                    en: 'Hide from library but keep URL working. Entities will continue showing the file.',
                    ar: 'إخفاء من المكتبة مع الحفاظ على عمل الرابط. الكيانات ستستمر في عرض الملف.'
                  })}
                </p>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            {t({ en: 'Delete File?', ar: 'حذف الملف؟' })}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                {t({ 
                  en: `Are you sure you want to delete "${file?.original_filename}"?`,
                  ar: `هل أنت متأكد من حذف "${file?.original_filename}"؟`
                })}
              </p>
              
              {isChecking ? (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">
                    {t({ en: 'Checking dependencies...', ar: 'جاري فحص الارتباطات...' })}
                  </span>
                </div>
              ) : dependencies?.canDelete ? (
                <p className="text-sm text-muted-foreground">
                  {t({ 
                    en: 'This file is not used by any entities and can be safely deleted.',
                    ar: 'هذا الملف غير مستخدم ويمكن حذفه بأمان.'
                  })}
                </p>
              ) : null}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {renderDependencyWarning()}

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={isDeleting}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isChecking || isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {dependencies?.usageCount > 0 
              ? t({ en: 'Delete with cascade', ar: 'حذف مع المراجع' })
              : t({ en: 'Delete', ar: 'حذف' })
            }
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
