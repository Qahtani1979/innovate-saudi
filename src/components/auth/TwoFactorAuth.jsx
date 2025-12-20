import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Smartphone, Check, AlertCircle, Loader2, Copy } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function TwoFactorAuth({ user, onUpdate }) {
  const { t } = useLanguage();
  const [step, setStep] = useState('setup'); // setup, verify, enabled
  const [method, setMethod] = useState('app'); // app or sms
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [factorId, setFactorId] = useState(null);

  // Check current MFA status
  const is2FAEnabled = user?.two_factor_enabled || false;

  useEffect(() => {
    // Check if MFA is already enrolled
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) {
        console.error('Error checking MFA status:', error);
        return;
      }
      
      const totpFactor = data.totp.find(f => f.factor_type === 'totp' && f.status === 'verified');
      if (totpFactor) {
        setStep('enabled');
        setFactorId(totpFactor.id);
      }
    } catch (error) {
      console.error('MFA status check error:', error);
    }
  };

  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      // Enroll TOTP factor
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App'
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStep('verify');
      toast.success(t({ en: 'Scan the QR code with your authenticator app', ar: 'امسح رمز QR بتطبيق المصادقة' }));
    } catch (error) {
      console.error('MFA enroll error:', error);
      toast.error(error.message || t({ en: 'Failed to enable 2FA', ar: 'فشل تفعيل 2FA' }));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast.error(t({ en: 'Please enter a 6-digit code', ar: 'يرجى إدخال رمز من 6 أرقام' }));
      return;
    }

    setLoading(true);
    try {
      // Challenge the factor to verify
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factorId
      });

      if (challengeError) throw challengeError;

      // Verify the code
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: factorId,
        challengeId: challengeData.id,
        code: code
      });

      if (error) throw error;

      // Update user profile to mark 2FA as enabled
      await onUpdate({ two_factor_enabled: true, two_factor_method: 'app' });
      setStep('enabled');
      toast.success(t({ en: '2FA enabled successfully', ar: 'تم تفعيل 2FA بنجاح' }));
    } catch (error) {
      console.error('MFA verify error:', error);
      toast.error(error.message || t({ en: 'Invalid verification code', ar: 'رمز التحقق غير صحيح' }));
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm(t({ en: 'Are you sure you want to disable 2FA?', ar: 'هل أنت متأكد من تعطيل 2FA؟' }))) {
      return;
    }

    setLoading(true);
    try {
      if (factorId) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId });
        if (error) throw error;
      }

      await onUpdate({ two_factor_enabled: false, two_factor_method: null });
      setStep('setup');
      setFactorId(null);
      toast.success(t({ en: '2FA disabled', ar: 'تم تعطيل 2FA' }));
    } catch (error) {
      console.error('MFA unenroll error:', error);
      toast.error(error.message || t({ en: 'Failed to disable 2FA', ar: 'فشل تعطيل 2FA' }));
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      toast.success(t({ en: 'Secret copied to clipboard', ar: 'تم نسخ المفتاح السري' }));
    }
  };

  if (is2FAEnabled || step === 'enabled') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            {t({ en: 'Two-Factor Authentication', ar: 'المصادقة الثنائية' })}
            <Badge className="ml-auto bg-green-600">
              <Check className="h-3 w-3 mr-1" />
              {t({ en: 'Enabled', ar: 'مفعل' })}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950/20 dark:border-green-900">
            <p className="text-sm text-green-900 dark:text-green-100 font-medium">
              {t({ en: 'Your account is protected with 2FA', ar: 'حسابك محمي بـ 2FA' })}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              {t({ 
                en: `Method: ${user?.two_factor_method === 'app' ? 'Authenticator App' : 'SMS'}`, 
                ar: `الطريقة: ${user?.two_factor_method === 'app' ? 'تطبيق المصادقة' : 'رسالة نصية'}` 
              })}
            </p>
          </div>

          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleDisable2FA}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {t({ en: 'Disable 2FA', ar: 'تعطيل 2FA' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-600" />
          {t({ en: 'Two-Factor Authentication', ar: 'المصادقة الثنائية' })}
          <Badge className="ml-auto bg-amber-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            {t({ en: 'Not Enabled', ar: 'غير مفعل' })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'setup' && (
          <>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/20 dark:border-amber-900">
              <p className="text-sm text-amber-900 dark:text-amber-100 font-medium">
                {t({ en: 'Protect your account with 2FA', ar: 'احمِ حسابك بـ 2FA' })}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                {t({ en: 'Add an extra layer of security to your account using an authenticator app', ar: 'أضف طبقة أمان إضافية لحسابك باستخدام تطبيق المصادقة' })}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">
                {t({ en: 'Supported apps:', ar: 'التطبيقات المدعومة:' })}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>Google Authenticator</span>
                <span>•</span>
                <span>Authy</span>
                <span>•</span>
                <span>Microsoft Authenticator</span>
                <span>•</span>
                <span>1Password</span>
              </div>

              <Button 
                onClick={handleEnable2FA} 
                disabled={loading}
                className="w-full bg-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t({ en: 'Setting up...', ar: 'جارٍ الإعداد...' })}
                  </>
                ) : (
                  <>
                    <Smartphone className="h-4 w-4 mr-2" />
                    {t({ en: 'Enable 2FA with Authenticator App', ar: 'تفعيل 2FA بتطبيق المصادقة' })}
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {step === 'verify' && (
          <>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/20 dark:border-blue-900">
              <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-3">
                {t({ en: 'Scan QR code with your authenticator app', ar: 'امسح رمز QR بتطبيق المصادقة' })}
              </p>
              
              {qrCode && (
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <img src={qrCode} alt="QR Code for 2FA" className="h-48 w-48" />
                </div>
              )}

              {secret && (
                <div className="mt-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">
                    {t({ en: 'Or enter this code manually:', ar: 'أو أدخل هذا الرمز يدوياً:' })}
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="bg-white dark:bg-slate-800 px-3 py-1 rounded text-sm font-mono">
                      {secret}
                    </code>
                    <Button variant="ghost" size="icon" onClick={copySecret}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Enter the 6-digit code from your app', ar: 'أدخل الرمز المكون من 6 أرقام من تطبيقك' })}
              </label>
              <Input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <Button 
              onClick={handleVerifyCode} 
              disabled={code.length !== 6 || loading}
              className="w-full bg-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Verifying...', ar: 'جارٍ التحقق...' })}
                </>
              ) : (
                t({ en: 'Verify & Enable', ar: 'تحقق وفعل' })
              )}
            </Button>

            <Button 
              variant="outline"
              onClick={() => {
                setStep('setup');
                setQrCode(null);
                setSecret(null);
                setCode('');
              }}
              className="w-full"
            >
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}