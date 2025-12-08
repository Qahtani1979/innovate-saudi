import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../LanguageContext';
import { Image, Zap, AlertCircle } from 'lucide-react';

export default function ImageCDNConfig() {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5 text-teal-600" />
          {t({ en: 'Image & Asset CDN', ar: 'CDN للصور والأصول' })}
          <Badge className="ml-auto bg-amber-600">Not Configured</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-amber-800">
              <p className="font-medium">CDN Integration Recommended</p>
              <p>CloudFlare/CloudFront for faster image delivery globally</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Image Optimization</p>
              <p className="text-xs text-slate-500">WebP conversion, compression</p>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Responsive Images</p>
              <p className="text-xs text-slate-500">Multiple sizes, lazy loading</p>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">CDN Distribution</p>
              <p className="text-xs text-slate-500">Global edge caching</p>
            </div>
            <Switch disabled />
          </div>
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Benefits:</p>
          <ul className="space-y-1 ml-4">
            <li>• 50-70% faster image loading</li>
            <li>• Reduced bandwidth costs</li>
            <li>• Better mobile performance</li>
            <li>• Global edge caching</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}