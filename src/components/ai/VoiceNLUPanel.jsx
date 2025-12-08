import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../LanguageContext';
import { Mic, Brain, AlertCircle } from 'lucide-react';

export default function VoiceNLUPanel() {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          {t({ en: 'Advanced Voice AI & NLU', ar: 'الذكاء الصوتي المتقدم' })}
          <Badge className="ml-auto bg-amber-600">Partial</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-amber-800">
              <p className="font-medium">Advanced Features Pending</p>
              <p>Wake word detection, advanced NLU, and Arabic dialect support needed</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Basic Voice Input</p>
              <p className="text-xs text-slate-500">Speech-to-text (AR/EN)</p>
            </div>
            <Badge className="bg-green-600">Implemented</Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Wake Word Detection</p>
              <p className="text-xs text-slate-500">"Hey Saudi Innovates"</p>
            </div>
            <Badge variant="outline">Missing</Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Advanced Arabic NLU</p>
              <p className="text-xs text-slate-500">Dialect support & intent</p>
            </div>
            <Badge variant="outline">Missing</Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Voice-Only Mode</p>
              <p className="text-xs text-slate-500">Hands-free navigation</p>
            </div>
            <Badge variant="outline">Missing</Badge>
          </div>
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Enhancement features:</p>
          <ul className="space-y-1 ml-4">
            <li>• Wake word detection ("Hey Saudi Innovates")</li>
            <li>• Arabic dialect understanding</li>
            <li>• Context-aware intent parsing</li>
            <li>• Voice-only navigation mode</li>
            <li>• Multi-turn voice conversations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}