import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Database, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export default function AIDataQualityDashboard() {
  const { language, t } = useLanguage();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list(),
    initialData: []
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list(),
    initialData: []
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions'],
    queryFn: () => base44.entities.Solution.list(),
    initialData: []
  });

  const calculateCompleteness = (entity, requiredFields, optionalFields) => {
    const allFields = [...requiredFields, ...optionalFields];
    const filledFields = allFields.filter(field => {
      const value = entity[field];
      return value !== null && value !== undefined && value !== '' && 
             (!Array.isArray(value) || value.length > 0);
    });
    return Math.round((filledFields.length / allFields.length) * 100);
  };

  const challengeRequiredFields = ['title_en', 'municipality_id', 'sector'];
  const challengeOptionalFields = ['description_en', 'root_cause_en', 'kpis', 'stakeholders', 'data_evidence'];
  
  const challengeScores = challenges.map(c => 
    calculateCompleteness(c, challengeRequiredFields, challengeOptionalFields)
  );
  const avgChallengeCompleteness = challengeScores.length > 0
    ? Math.round(challengeScores.reduce((a, b) => a + b, 0) / challengeScores.length)
    : 0;

  const pilotRequiredFields = ['title_en', 'challenge_id', 'municipality_id'];
  const pilotOptionalFields = ['description_en', 'kpis', 'team', 'milestones', 'budget'];
  
  const pilotScores = pilots.map(p => 
    calculateCompleteness(p, pilotRequiredFields, pilotOptionalFields)
  );
  const avgPilotCompleteness = pilotScores.length > 0
    ? Math.round(pilotScores.reduce((a, b) => a + b, 0) / pilotScores.length)
    : 0;

  const solutionRequiredFields = ['name_en', 'provider_name'];
  const solutionOptionalFields = ['description_en', 'features', 'case_studies', 'pricing_details'];
  
  const solutionScores = solutions.map(s => 
    calculateCompleteness(s, solutionRequiredFields, solutionOptionalFields)
  );
  const avgSolutionCompleteness = solutionScores.length > 0
    ? Math.round(solutionScores.reduce((a, b) => a + b, 0) / solutionScores.length)
    : 0;

  const overallCompleteness = Math.round(
    (avgChallengeCompleteness + avgPilotCompleteness + avgSolutionCompleteness) / 3
  );

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-300">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            {t({ en: 'Data Quality Dashboard', ar: 'لوحة جودة البيانات' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-300 text-center">
            <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-3" />
            <p className="text-5xl font-bold text-purple-600 mb-2">{overallCompleteness}%</p>
            <p className="text-sm text-slate-600">{t({ en: 'Overall Data Completeness', ar: 'الاكتمال الإجمالي للبيانات' })}</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-white rounded border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-900">
                  {t({ en: 'Challenges', ar: 'التحديات' })} ({challenges.length})
                </span>
                <span className={`text-2xl font-bold ${getScoreColor(avgChallengeCompleteness)}`}>
                  {avgChallengeCompleteness}%
                </span>
              </div>
              <Progress value={avgChallengeCompleteness} className="h-2" />
            </div>

            <div className="p-4 bg-white rounded border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-900">
                  {t({ en: 'Pilots', ar: 'التجارب' })} ({pilots.length})
                </span>
                <span className={`text-2xl font-bold ${getScoreColor(avgPilotCompleteness)}`}>
                  {avgPilotCompleteness}%
                </span>
              </div>
              <Progress value={avgPilotCompleteness} className="h-2" />
            </div>

            <div className="p-4 bg-white rounded border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-900">
                  {t({ en: 'Solutions', ar: 'الحلول' })} ({solutions.length})
                </span>
                <span className={`text-2xl font-bold ${getScoreColor(avgSolutionCompleteness)}`}>
                  {avgSolutionCompleteness}%
                </span>
              </div>
              <Progress value={avgSolutionCompleteness} className="h-2" />
            </div>
          </div>

          {overallCompleteness < 80 && (
            <div className="p-4 bg-amber-50 rounded border-2 border-amber-300">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900 mb-1">
                    {t({ en: 'Quality Improvement Needed', ar: 'تحسين الجودة مطلوب' })}
                  </p>
                  <p className="text-xs text-amber-700">
                    {t({ 
                      en: 'Some entities are missing important fields. Complete profiles improve matching and insights.', 
                      ar: 'بعض الكيانات تفتقد حقول مهمة. الملفات الكاملة تحسن المطابقة والرؤى.' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}