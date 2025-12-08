import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../LanguageContext';
import { Wifi, Download, Smartphone, AlertCircle } from 'lucide-react';

export default function ServiceWorkerConfig() {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-purple-600" />
          {t({ en: 'PWA & Offline Mode', ar: 'تطبيق الويب التقدمي' })}
          <Badge className="ml-auto bg-red-600">
            {t({ en: 'Not Implemented', ar: 'غير منفذ' })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-xs text-red-800">
              <p className="font-medium mb-1">Service Worker Implementation Required</p>
              <p>PWA requires service worker registration, manifest.json, and offline caching strategy</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-slate-600" />
              <div>
                <p className="text-sm font-medium">{t({ en: 'Offline Mode', ar: 'الوضع غير المتصل' })}</p>
                <p className="text-xs text-slate-500">{t({ en: 'Cache critical data for offline access', ar: 'تخزين البيانات للوصول دون اتصال' })}</p>
              </div>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-slate-600" />
              <div>
                <p className="text-sm font-medium">{t({ en: 'Background Sync', ar: 'المزامنة الخلفية' })}</p>
                <p className="text-xs text-slate-500">{t({ en: 'Sync data when connection restored', ar: 'مزامنة البيانات عند استعادة الاتصال' })}</p>
              </div>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-slate-600" />
              <div>
                <p className="text-sm font-medium">{t({ en: 'Install Prompt', ar: 'تثبيت التطبيق' })}</p>
                <p className="text-xs text-slate-500">{t({ en: 'Add to home screen capability', ar: 'إضافة إلى الشاشة الرئيسية' })}</p>
              </div>
            </div>
            <Switch disabled />
          </div>
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">PWA Requirements:</p>
          <ul className="space-y-1 ml-4">
            <li>• Service worker registration</li>
            <li>• manifest.json configuration</li>
            <li>• Offline caching strategy</li>
            <li>• Background sync implementation</li>
            <li>• Install prompt handling</li>
            <li>• App icons (multiple sizes)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}