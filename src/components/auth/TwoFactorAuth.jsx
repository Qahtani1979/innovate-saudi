import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Smartphone, Key, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { toast } from 'sonner';

export default function TwoFactorAuth({ user, onUpdate }) {
  const { t } = useLanguage();
  const [step, setStep] = useState('setup'); // setup, verify, enabled
  const [method, setMethod] = useState('app'); // app or sms
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const is2FAEnabled = user?.two_factor_enabled || false;

  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      // Generate QR code or send SMS
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep('verify');
      toast.success(t({ en: 'Verification code sent', ar: 'تم إرسال رمز التحقق' }));
    } catch (error) {
      toast.error(t({ en: 'Failed to enable 2FA', ar: 'فشل تفعيل 2FA' }));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    try {
      // Verify the code
      if (code.length === 6) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await onUpdate({ two_factor_enabled: true, two_factor_method: method });
        setStep('enabled');
        toast.success(t({ en: '2FA enabled successfully', ar: 'تم تفعيل 2FA بنجاح' }));
      } else {
        toast.error(t({ en: 'Invalid code', ar: 'رمز غير صحيح' }));
      }
    } catch (error) {
      toast.error(t({ en: 'Verification failed', ar: 'فشل التحقق' }));
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (confirm(t({ en: 'Are you sure you want to disable 2FA?', ar: 'هل أنت متأكد من تعطيل 2FA؟' }))) {
      await onUpdate({ two_factor_enabled: false });
      toast.success(t({ en: '2FA disabled', ar: 'تم تعطيل 2FA' }));
    }
  };

  if (is2FAEnabled) {
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
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-900 font-medium">
              {t({ en: 'Your account is protected with 2FA', ar: 'حسابك محمي بـ 2FA' })}
            </p>
            <p className="text-xs text-green-700 mt-1">
              {t({ 
                en: `Method: ${user?.two_factor_method === 'app' ? 'Authenticator App' : 'SMS'}`, 
                ar: `الطريقة: ${user?.two_factor_method === 'app' ? 'تطبيق المصادقة' : 'رسالة نصية'}` 
              })}
            </p>
          </div>

          <div className="space-y-2">
            <Button variant="outline" className="w-full">
              <Key className="h-4 w-4 mr-2" />
              {t({ en: 'View Recovery Codes', ar: 'عرض رموز الاسترداد' })}
            </Button>
            <Button variant="outline" className="w-full" onClick={handleDisable2FA}>
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
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900 font-medium">
                {t({ en: 'Protect your account with 2FA', ar: 'احمِ حسابك بـ 2FA' })}
              </p>
              <p className="text-xs text-amber-700 mt-1">
                {t({ en: 'Add an extra layer of security to your account', ar: 'أضف طبقة أمان إضافية لحسابك' })}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">
                {t({ en: 'Choose authentication method:', ar: 'اختر طريقة المصادقة:' })}
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMethod('app')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    method === 'app' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Smartphone className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium">
                    {t({ en: 'Authenticator App', ar: 'تطبيق المصادقة' })}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {t({ en: 'Google Authenticator, Authy', ar: 'Google Authenticator, Authy' })}
                  </p>
                </button>

                <button
                  onClick={() => setMethod('sms')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    method === 'sms' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Key className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium">
                    {t({ en: 'SMS Code', ar: 'رمز نصي' })}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {t({ en: 'Via text message', ar: 'عبر رسالة نصية' })}
                  </p>
                </button>
              </div>

              <Button 
                onClick={handleEnable2FA} 
                disabled={loading}
                className="w-full bg-blue-600"
              >
                {loading ? t({ en: 'Setting up...', ar: 'جارٍ الإعداد...' }) : t({ en: 'Enable 2FA', ar: 'تفعيل 2FA' })}
              </Button>
            </div>
          </>
        )}

        {step === 'verify' && (
          <>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              {method === 'app' ? (
                <>
                  <p className="text-sm text-blue-900 font-medium mb-3">
                    {t({ en: 'Scan QR code with your authenticator app', ar: 'امسح رمز QR بتطبيق المصادقة' })}
                  </p>
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <div className="h-48 w-48 bg-slate-200 flex items-center justify-center">
                      {t({ en: 'QR Code', ar: 'رمز QR' })}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-blue-900">
                  {t({ en: 'Enter the 6-digit code sent to your phone', ar: 'أدخل الرمز المكون من 6 أرقام المرسل لهاتفك' })}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Verification Code', ar: 'رمز التحقق' })}
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
              className="w-full bg-blue-600"
            >
              {loading ? t({ en: 'Verifying...', ar: 'جارٍ التحقق...' }) : t({ en: 'Verify & Enable', ar: 'تحقق وفعل' })}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}