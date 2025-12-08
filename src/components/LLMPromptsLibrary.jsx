import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from './LanguageContext';
import { BookOpen, Edit, Copy } from 'lucide-react';

export default function LLMPromptsLibrary() {
  const { language, isRTL, t } = useLanguage();
  const [prompts] = useState([
    { id: 1, name: 'Challenge Summarizer', category: 'Challenges', uses: 1834 },
    { id: 2, name: 'Solution Matcher', category: 'Matching', uses: 956 },
    { id: 3, name: 'KPI Suggester', category: 'Analytics', uses: 672 }
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          {t({ en: 'LLM Prompts Library', ar: 'مكتبة الأوامر النصية' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {prompts.map(prompt => (
          <div key={prompt.id} className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-sm">{prompt.name}</p>
                <Badge variant="outline" className="text-xs mt-1">{prompt.category}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{prompt.uses} uses</span>
                <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost"><Copy className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}