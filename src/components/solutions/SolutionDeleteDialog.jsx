import React from 'react';
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
import { Loader2, Trash2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

/**
 * Delete confirmation dialog for Solutions
 * Implements lc-5: Confirmation dialogs for destructive actions (delete)
 */
export default function SolutionDeleteDialog({ 
  open, 
  onOpenChange, 
  solution, 
  onConfirm, 
  isDeleting = false 
}) {
  const { t, isRTL } = useLanguage();
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            {t({ en: 'Delete Solution', ar: 'حذف الحل' })}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              {t({ 
                en: 'Are you sure you want to delete this solution? This action cannot be undone.',
                ar: 'هل أنت متأكد من حذف هذا الحل؟ لا يمكن التراجع عن هذا الإجراء.'
              })}
            </p>
            {solution && (
              <div className="bg-muted p-3 rounded-md mt-2">
                <p className="font-medium">{solution.name_en || solution.name_ar}</p>
                {solution.provider_name && (
                  <p className="text-sm text-muted-foreground">
                    {t({ en: 'Provider:', ar: 'المزود:' })} {solution.provider_name}
                  </p>
                )}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
          <AlertDialogCancel disabled={isDeleting}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Deleting...', ar: 'جاري الحذف...' })}
              </>
            ) : (
              <>
                <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Delete', ar: 'حذف' })}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
