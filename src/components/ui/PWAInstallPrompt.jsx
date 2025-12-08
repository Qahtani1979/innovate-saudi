import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, X } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function PWAInstallPrompt() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <Card className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 border-2 border-blue-300 shadow-xl">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Download className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 mb-1">
              {t({ en: 'Install App', ar: 'تثبيت التطبيق' })}
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              {t({ en: 'Install for quick access and offline use', ar: 'ثبت للوصول السريع والاستخدام دون اتصال' })}
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleInstall} className="bg-blue-600">
                {t({ en: 'Install', ar: 'تثبيت' })}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowPrompt(false)}>
                {t({ en: 'Later', ar: 'لاحقاً' })}
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
            onClick={() => setShowPrompt(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}