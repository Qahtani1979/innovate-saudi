import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { useAuthMutations } from '@/hooks/useAuthMutations';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, CheckCircle, Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const isRTL = language === 'ar';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const { checkSession, updatePassword } = usePasswordReset();

  // Check for valid session/token on mount
  useEffect(() => {
    const checkSession = async () => {
      const session = await checkSession();

      // Check URL for recovery token
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      if (type === 'recovery' && accessToken) {
        // Valid recovery link
        return;
      }

      if (!session) {
        toast({
          title: t({ en: 'Invalid or Expired Link', ar: 'رابط غير صالح أو منتهي الصلاحية' }),
          description: t({
            en: 'Please request a new password reset link.',
            ar: 'يرجى طلب رابط إعادة تعيين كلمة مرور جديد.'
          }),
          variant: 'destructive',
        });
        navigate('/auth');
      }
    };

    checkSession();
  }, [navigate, toast, t]);

  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
      return t({ en: 'Password must be at least 8 characters', ar: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' });
    }
    if (!/[A-Z]/.test(pwd)) {
      return t({ en: 'Password must contain an uppercase letter', ar: 'يجب أن تحتوي كلمة المرور على حرف كبير' });
    }
    if (!/[a-z]/.test(pwd)) {
      return t({ en: 'Password must contain a lowercase letter', ar: 'يجب أن تحتوي كلمة المرور على حرف صغير' });
    }
    if (!/[0-9]/.test(pwd)) {
      return t({ en: 'Password must contain a number', ar: 'يجب أن تحتوي كلمة المرور على رقم' });
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (password !== confirmPassword) {
      setError(t({ en: 'Passwords do not match', ar: 'كلمات المرور غير متطابقة' }));
      return;
    }

    setIsLoading(true);

    // Call the mutation
    updatePassword.mutate(password, {
      onSuccess: () => {
        setIsSuccess(true);
        // toast is handled in the hook, but we can do extra logic here
      },
      onError: (err) => {
        setError(err.message || t({ en: 'Failed to reset password', ar: 'فشل إعادة تعيين كلمة المرور' }));
      },
      onSettled: () => {
        setIsLoading(false);
      }
    });

    if (updatePassword.isSuccess) {
      // This block might not be reachable immediately due to async nature, 
      // reliant on onSuccess callback above.
    } else if (updatePassword.isError) {
      // reliant on onError callback
    }
  };



  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t({ en: 'Password Reset Successful!', ar: 'تم إعادة تعيين كلمة المرور بنجاح!' })}
              </h2>
              <p className="text-muted-foreground mb-4">
                {t({
                  en: 'You will be redirected to the login page shortly.',
                  ar: 'سيتم إعادة توجيهك إلى صفحة تسجيل الدخول قريبًا.'
                })}
              </p>
              <Button onClick={() => navigate('/auth')} className="w-full">
                {t({ en: 'Go to Login', ar: 'الذهاب لتسجيل الدخول' })}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {t({ en: 'Reset Your Password', ar: 'إعادة تعيين كلمة المرور' })}
            </CardTitle>
            <CardDescription>
              {t({
                en: 'Enter your new password below',
                ar: 'أدخل كلمة المرور الجديدة أدناه'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">
                  {t({ en: 'New Password', ar: 'كلمة المرور الجديدة' })}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t({ en: 'Enter new password', ar: 'أدخل كلمة المرور الجديدة' })}
                    className="pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${isRTL ? 'left-3' : 'right-3'}`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t({
                    en: 'Must be at least 8 characters with uppercase, lowercase, and number',
                    ar: 'يجب أن تكون 8 أحرف على الأقل مع حرف كبير وصغير ورقم'
                  })}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t({ en: 'Confirm Password', ar: 'تأكيد كلمة المرور' })}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t({ en: 'Confirm new password', ar: 'تأكيد كلمة المرور الجديدة' })}
                    className="pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${isRTL ? 'left-3' : 'right-3'}`}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t({ en: 'Resetting...', ar: 'جارٍ إعادة التعيين...' })}
                  </>
                ) : (
                  t({ en: 'Reset Password', ar: 'إعادة تعيين كلمة المرور' })
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/auth')}
              >
                <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
                {t({ en: 'Back to Login', ar: 'العودة لتسجيل الدخول' })}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
