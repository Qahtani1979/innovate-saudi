import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Smartphone, Apple, AlertCircle } from 'lucide-react';

export default function NativeMobileApp() {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-slate-600" />
          {t({ en: 'Native Mobile Apps', ar: 'تطبيقات الموبايل الأصلية' })}
          <Badge className="ml-auto bg-red-600">Not Started</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">Not Supported by Platform</p>
              <p>Platform is React web-based. Native apps require separate development</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="p-3 border rounded-lg opacity-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Apple className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-sm font-medium">iOS App</p>
                  <p className="text-xs text-slate-500">Swift / React Native</p>
                </div>
              </div>
              <Badge variant="outline">Not Available</Badge>
            </div>
          </div>

          <div className="p-3 border rounded-lg opacity-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-sm font-medium">Android App</p>
                  <p className="text-xs text-slate-500">Kotlin / React Native</p>
                </div>
              </div>
              <Badge variant="outline">Not Available</Badge>
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
          <p className="text-blue-800 font-medium mb-1">Alternative: PWA</p>
          <p className="text-blue-700">Progressive Web App provides app-like experience with install capability</p>
        </div>
      </CardContent>
    </Card>
  );
}
