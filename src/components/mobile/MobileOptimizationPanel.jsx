import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Smartphone, CheckCircle, AlertCircle } from 'lucide-react';

export default function MobileOptimizationPanel() {
  const { t } = useLanguage();

  const optimizations = [
    { name: 'Responsive Breakpoints', status: 'complete', coverage: 95 },
    { name: 'Touch-Friendly UI', status: 'complete', coverage: 90 },
    { name: 'Mobile Navigation', status: 'complete', coverage: 88 },
    { name: 'Touch Gestures', status: 'partial', coverage: 45 },
    { name: 'Mobile Forms', status: 'complete', coverage: 85 },
    { name: 'Native App', status: 'missing', coverage: 0 },
    { name: 'PWA Support', status: 'partial', coverage: 30 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-blue-600" />
          {t({ en: 'Mobile Optimization Status', ar: 'حالة تحسين الموبايل' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {optimizations.map((opt, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {opt.status === 'complete' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                )}
                <span className="text-sm font-medium">{opt.name}</span>
              </div>
              <Badge variant={opt.status === 'complete' ? 'default' : 'outline'}>
                {opt.coverage}%
              </Badge>
            </div>
            <Progress value={opt.coverage} className="h-1" />
          </div>
        ))}

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Enhancement priorities:</p>
          <ul className="space-y-1 ml-4">
            <li>• Advanced touch gestures (swipe, pinch)</li>
            <li>• Native mobile app (iOS/Android)</li>
            <li>• PWA with offline mode</li>
            <li>• Mobile-optimized charts</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}