import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from './LanguageContext';
import { Sparkles, RotateCcw, Save } from 'lucide-react';

export default function MIIWeightTuner() {
  const { language, isRTL, t } = useLanguage();
  const [weights, setWeights] = useState({
    challenges: 25,
    pilots: 30,
    solutions: 20,
    rd_projects: 15,
    programs: 10
  });

  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          {t({ en: 'MII Weight Tuner', ar: 'ضبط أوزان مؤشر الابتكار' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(weights).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="capitalize">{key.replace('_', ' ')}</span>
              <span className="font-bold">{value}%</span>
            </div>
            <Slider
              value={[value]}
              onValueChange={(v) => setWeights({...weights, [key]: v[0]})}
              max={50}
              step={5}
            />
          </div>
        ))}
        
        <div className="p-3 bg-slate-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <span className="font-medium">Total:</span>
            <span className={`font-bold ${total === 100 ? 'text-green-600' : 'text-red-600'}`}>{total}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex-1">
            <RotateCcw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Reset', ar: 'إعادة تعيين' })}
          </Button>
          <Button className="flex-1" disabled={total !== 100}>
            <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Save', ar: 'حفظ' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}