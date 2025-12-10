import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function DeleteAccountDialog({ open, onOpenChange }) {
  const { t, isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);

  const expectedText = 'DELETE';
  const canProceed = confirmText === expectedText && understood;

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      // First, soft delete user data in user_profiles
      if (user?.id) {
        await supabase
          .from('user_profiles')
          .update({ 
            is_deleted: true,
            deleted_at: new Date().toISOString(),
            full_name: '[Deleted User]',
            phone_number: null,
            avatar_url: null,
          })
          .eq('user_id', user.id);

        // Delete user roles
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', user.id);
      }

      // Sign out the user
      await logout(false);
      
      toast.success(t({ 
        en: 'Account deleted successfully. You have been logged out.', 
        ar: 'تم حذف الحساب بنجاح. تم تسجيل خروجك.' 
      }));

      // Redirect to home page
      window.location.href = '/';
    } catch (err) {
      console.error('Account deletion error:', err);
      toast.error(t({ 
        en: 'Failed to delete account. Please contact support.', 
        ar: 'فشل في حذف الحساب. يرجى الاتصال بالدعم.' 
      }));
    } finally {
      setIsLoading(false);
      setShowFinalConfirm(false);
      onOpenChange(false);
    }
  };

  const handleProceed = () => {
    setShowFinalConfirm(true);
  };

  const resetForm = () => {
    setConfirmText('');
    setUnderstood(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(newOpen) => {
        if (!newOpen) resetForm();
        onOpenChange(newOpen);
      }}>
        <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {t({ en: 'Delete Account', ar: 'حذف الحساب' })}
            </DialogTitle>
            <DialogDescription>
              {t({ 
                en: 'This action cannot be undone. All your data will be permanently deleted.', 
                ar: 'لا يمكن التراجع عن هذا الإجراء. سيتم حذف جميع بياناتك نهائياً.' 
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-2">
              <p className="text-sm font-medium text-destructive">
                {t({ en: 'You will lose:', ar: 'ستفقد:' })}
              </p>
              <ul className="text-sm text-destructive/80 list-disc list-inside space-y-1">
                <li>{t({ en: 'Your profile and personal information', ar: 'ملفك الشخصي ومعلوماتك الشخصية' })}</li>
                <li>{t({ en: 'All your submissions and contributions', ar: 'جميع مساهماتك ومشاركاتك' })}</li>
                <li>{t({ en: 'Your badges and achievements', ar: 'شاراتك وإنجازاتك' })}</li>
                <li>{t({ en: 'Access to all platform features', ar: 'الوصول إلى جميع ميزات المنصة' })}</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmText">
                {t({ 
                  en: `Type "${expectedText}" to confirm`, 
                  ar: `اكتب "${expectedText}" للتأكيد` 
                })}
              </Label>
              <Input
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder={expectedText}
                className="font-mono"
              />
            </div>

            <div className="flex items-start space-x-2 rtl:space-x-reverse">
              <Checkbox
                id="understood"
                checked={understood}
                onCheckedChange={setUnderstood}
              />
              <Label htmlFor="understood" className="text-sm leading-tight cursor-pointer">
                {t({ 
                  en: 'I understand this action is permanent and cannot be reversed', 
                  ar: 'أفهم أن هذا الإجراء دائم ولا يمكن التراجع عنه' 
                })}
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button 
              variant="destructive"
              onClick={handleProceed}
              disabled={!canProceed || isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t({ en: 'Delete Account', ar: 'حذف الحساب' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showFinalConfirm} onOpenChange={setShowFinalConfirm}>
        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              {t({ en: 'Final Confirmation', ar: 'التأكيد النهائي' })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t({ 
                en: 'Are you absolutely sure you want to delete your account? This is your last chance to cancel.', 
                ar: 'هل أنت متأكد تماماً من رغبتك في حذف حسابك؟ هذه فرصتك الأخيرة للإلغاء.' 
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowFinalConfirm(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading 
                ? t({ en: 'Deleting...', ar: 'جاري الحذف...' }) 
                : t({ en: 'Yes, Delete My Account', ar: 'نعم، احذف حسابي' })
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
