import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Shield, CheckCircle2 } from 'lucide-react';

export default function ChangePasswordDialog({ open, onOpenChange }) {
  const { t, isRTL } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Password strength checks
  const passwordChecks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  };

  const isPasswordStrong = Object.values(passwordChecks).filter(Boolean).length >= 4;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordStrong) {
      setError(t({ en: 'Password does not meet requirements', ar: 'كلمة المرور لا تستوفي المتطلبات' }));
      return;
    }

    if (!passwordsMatch) {
      setError(t({ en: 'Passwords do not match', ar: 'كلمات المرور غير متطابقة' }));
      return;
    }

    setIsLoading(true);

    try {
      // Update password using Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      toast.success(t({ en: 'Password updated successfully', ar: 'تم تحديث كلمة المرور بنجاح' }));
      onOpenChange(false);
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password update error:', err);
      setError(err.message || t({ en: 'Failed to update password', ar: 'فشل في تحديث كلمة المرور' }));
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordStrengthIndicator = () => (
    <div className="space-y-2 mt-2">
      <p className="text-xs font-medium text-muted-foreground">
        {t({ en: 'Password requirements:', ar: 'متطلبات كلمة المرور:' })}
      </p>
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className={`flex items-center gap-1 ${passwordChecks.length ? 'text-green-600' : 'text-muted-foreground'}`}>
          <CheckCircle2 className={`h-3 w-3 ${passwordChecks.length ? 'opacity-100' : 'opacity-30'}`} />
          {t({ en: '8+ characters', ar: '8+ أحرف' })}
        </div>
        <div className={`flex items-center gap-1 ${passwordChecks.uppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
          <CheckCircle2 className={`h-3 w-3 ${passwordChecks.uppercase ? 'opacity-100' : 'opacity-30'}`} />
          {t({ en: 'Uppercase letter', ar: 'حرف كبير' })}
        </div>
        <div className={`flex items-center gap-1 ${passwordChecks.lowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
          <CheckCircle2 className={`h-3 w-3 ${passwordChecks.lowercase ? 'opacity-100' : 'opacity-30'}`} />
          {t({ en: 'Lowercase letter', ar: 'حرف صغير' })}
        </div>
        <div className={`flex items-center gap-1 ${passwordChecks.number ? 'text-green-600' : 'text-muted-foreground'}`}>
          <CheckCircle2 className={`h-3 w-3 ${passwordChecks.number ? 'opacity-100' : 'opacity-30'}`} />
          {t({ en: 'Number', ar: 'رقم' })}
        </div>
        <div className={`flex items-center gap-1 ${passwordChecks.special ? 'text-green-600' : 'text-muted-foreground'}`}>
          <CheckCircle2 className={`h-3 w-3 ${passwordChecks.special ? 'opacity-100' : 'opacity-30'}`} />
          {t({ en: 'Special character', ar: 'رمز خاص' })}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {t({ en: 'Change Password', ar: 'تغيير كلمة المرور' })}
          </DialogTitle>
          <DialogDescription>
            {t({ en: 'Enter your new password below', ar: 'أدخل كلمة المرور الجديدة أدناه' })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive" role="alert">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t({ en: 'Current Password (Optional)', ar: 'كلمة المرور الحالية (اختياري)' })}</Label>
            <div className="relative">
              <Lock className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} h-4 w-4 text-muted-foreground`} />
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
                placeholder="••••••••"
                aria-describedby="currentPasswordHelp"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} text-muted-foreground hover:text-foreground`}
                aria-label={showCurrentPassword ? t({ en: 'Hide password', ar: 'إخفاء كلمة المرور' }) : t({ en: 'Show password', ar: 'إظهار كلمة المرور' })}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p id="currentPasswordHelp" className="text-xs text-muted-foreground">
              {t({ en: 'For extra security, enter your current password', ar: 'لمزيد من الأمان، أدخل كلمة المرور الحالية' })}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">{t({ en: 'New Password', ar: 'كلمة المرور الجديدة' })}</Label>
            <div className="relative">
              <Lock className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} h-4 w-4 text-muted-foreground`} />
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
                placeholder="••••••••"
                required
                aria-describedby="passwordRequirements"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} text-muted-foreground hover:text-foreground`}
                aria-label={showNewPassword ? t({ en: 'Hide password', ar: 'إخفاء كلمة المرور' }) : t({ en: 'Show password', ar: 'إظهار كلمة المرور' })}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrengthIndicator />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t({ en: 'Confirm New Password', ar: 'تأكيد كلمة المرور الجديدة' })}</Label>
            <div className="relative">
              <Lock className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} h-4 w-4 text-muted-foreground`} />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${isRTL ? 'pr-10' : 'pl-10'} ${confirmPassword && !passwordsMatch ? 'border-destructive' : ''}`}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} text-muted-foreground hover:text-foreground`}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-destructive">
                {t({ en: 'Passwords do not match', ar: 'كلمات المرور غير متطابقة' })}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !isPasswordStrong || !passwordsMatch}
              className="bg-primary"
            >
              {isLoading ? t({ en: 'Updating...', ar: 'جاري التحديث...' }) : t({ en: 'Update Password', ar: 'تحديث كلمة المرور' })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
