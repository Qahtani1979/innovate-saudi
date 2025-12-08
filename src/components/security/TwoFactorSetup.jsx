import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Shield, Smartphone, Mail, Key, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function TwoFactorSetup({ userEmail, onComplete }) {
  const { t } = useLanguage();
  const [method, setMethod] = useState(null); // 'app' or 'sms'
  const [qrCode, setQrCode] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState('select'); // select, setup, verify

  const handleSelectMethod = (selectedMethod) => {
    setMethod(selectedMethod);
    setStep('setup');
    
    // In production: call backend to generate QR code or send SMS
    if (selectedMethod === 'app') {
      // Mock QR code generation
      setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/SaudiInnovates:' + userEmail);
    }
  };

  const handleVerify = () => {
    // In production: verify code with backend
    if (verificationCode.length === 6) {
      toast.success(t({ en: '2FA enabled successfully', ar: 'تم تفعيل المصادقة الثنائية' }));
      onComplete?.();
    } else {
      toast.error(t({ en: 'Invalid code', ar: 'رمز غير صحيح' }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          {t({ en: 'Two-Factor Authentication Setup', ar: 'إعداد المصادقة الثنائية' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-amber-800">
              <p className="font-medium mb-1">Backend Implementation Required</p>
              <p className="text-xs">SMS provider integration, recovery codes, and verification logic pending</p>
            </div>
          </div>
        </div>

        {step === 'select' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              {t({ en: 'Choose your 2FA method:', ar: 'اختر طريقة المصادقة:' })}
            </p>
            
            <Button 
              onClick={() => handleSelectMethod('app')}
              variant="outline"
              className="w-full justify-start h-auto py-4"
            >
              <Smartphone className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">{t({ en: 'Authenticator App', ar: 'تطبيق المصادقة' })}</p>
                <p className="text-xs text-slate-500">{t({ en: 'Use Google Authenticator or similar', ar: 'استخدم Google Authenticator' })}</p>
              </div>
            </Button>

            <Button 
              onClick={() => handleSelectMethod('sms')}
              variant="outline"
              className="w-full justify-start h-auto py-4"
            >
              <Mail className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">{t({ en: 'SMS Code', ar: 'رمز SMS' })}</p>
                <p className="text-xs text-slate-500">{t({ en: 'Receive codes via text message', ar: 'استقبل الرموز عبر الرسائل' })}</p>
              </div>
            </Button>
          </div>
        )}

        {step === 'setup' && method === 'app' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              {t({ en: 'Scan this QR code with your authenticator app:', ar: 'امسح هذا الرمز:' })}
            </p>
            <div className="flex justify-center p-4 bg-white rounded-lg border">
              <img src={qrCode} alt="QR Code" className="w-48 h-48" />
            </div>
            <Button onClick={() => setStep('verify')} className="w-full bg-blue-600">
              {t({ en: 'Continue', ar: 'متابعة' })}
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              {t({ en: 'Enter the 6-digit code from your authenticator app:', ar: 'أدخل الرمز المكون من 6 أرقام:' })}
            </p>
            <Input
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />
            <Button onClick={handleVerify} className="w-full bg-green-600">
              <Key className="h-4 w-4 mr-2" />
              {t({ en: 'Verify & Enable', ar: 'تحقق وفعّل' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}