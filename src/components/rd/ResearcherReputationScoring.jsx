import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Award, Star } from 'lucide-react';

export default function ResearcherReputationScoring({ researcher }) {
  const { language, t } = useLanguage();

  const score = {
    overall: 87,
    publications: 92,
    citations: 85,
    grants: 78,
    collaborations: 90,
    impact: 84
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-purple-600" />
          {t({ en: 'Researcher Reputation', ar: 'سمعة الباحث' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-3">
        <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg text-center">
          <Award className="h-10 w-10 text-purple-600 mx-auto mb-2" />
          <p className="text-4xl font-bold text-purple-900">{score.overall}</p>
          <p className="text-sm text-purple-700">{t({ en: 'Reputation Score', ar: 'درجة السمعة' })}</p>
        </div>

        {Object.entries(score).filter(([k]) => k !== 'overall').map(([key, val]) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm capitalize">{key}</p>
              <Badge>{val}%</Badge>
            </div>
            <Progress value={val} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}