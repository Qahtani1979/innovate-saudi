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
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';

export const PilotDeleteDialog = ({ 
  open, 
  onOpenChange, 
  onConfirm, 
  pilotTitle,
  isLoading = false,
  isBulk = false,
  count = 1
}) => {
  const { t, language } = useLanguage();
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isBulk 
              ? (language === 'ar' ? `حذف ${count} تجربة` : `Delete ${count} Pilots`)
              : (language === 'ar' ? 'حذف التجربة' : 'Delete Pilot')
            }
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isBulk 
              ? (language === 'ar' 
                  ? `هل أنت متأكد من حذف ${count} تجربة؟ لا يمكن التراجع عن هذا الإجراء.`
                  : `Are you sure you want to delete ${count} pilots? This action cannot be undone.`)
              : (language === 'ar'
                  ? `هل أنت متأكد من حذف "${pilotTitle}"؟ لا يمكن التراجع عن هذا الإجراء.`
                  : `Are you sure you want to delete "${pilotTitle}"? This action cannot be undone.`)
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="bg-destructive hover:bg-destructive/90"
            disabled={isLoading}
          >
            {isLoading 
              ? (language === 'ar' ? 'جاري الحذف...' : 'Deleting...')
              : (language === 'ar' ? 'حذف' : 'Delete')
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PilotDeleteDialog;
