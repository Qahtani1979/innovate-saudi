import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { AlertCircle } from 'lucide-react';

export default function ChallengeProblemTab({ challenge }) {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-6">
      {(challenge.problem_statement_en || challenge.problem_statement_ar) && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Problem Statement', ar: 'بيان المشكلة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {language === 'ar' && challenge.problem_statement_ar 
                ? challenge.problem_statement_ar 
                : challenge.problem_statement_en}
            </p>
          </CardContent>
        </Card>
      )}

      {(challenge.root_cause_ar || challenge.root_cause_en) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              {t({ en: 'Root Cause', ar: 'السبب الجذري' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p 
              className="text-sm text-muted-foreground leading-relaxed" 
              dir={language === 'ar' && challenge.root_cause_ar ? 'rtl' : 'ltr'}
            >
              {language === 'ar' && challenge.root_cause_ar ? challenge.root_cause_ar : challenge.root_cause_en}
            </p>
          </CardContent>
        </Card>
      )}

      {challenge.root_causes?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              {t({ en: 'Root Causes (Multiple)', ar: 'الأسباب الجذرية (متعددة)' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {challenge.root_causes.map((cause, i) => (
                <div key={i} className="p-3 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                  <p className="text-sm text-muted-foreground">{cause}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {challenge.affected_population && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Affected Population', ar: 'السكان المتأثرون' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {challenge.affected_population.size && (
              <div>
                <span className="text-muted-foreground">Size:</span> {challenge.affected_population.size}
              </div>
            )}
            {challenge.affected_population.demographics && (
              <div>
                <span className="text-muted-foreground">Demographics:</span> {challenge.affected_population.demographics}
              </div>
            )}
            {challenge.affected_population.location && (
              <div>
                <span className="text-muted-foreground">Location:</span> {challenge.affected_population.location}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {challenge.constraints?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Constraints', ar: 'القيود' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {challenge.constraints.map((constraint, i) => (
                <div key={i} className="p-3 border rounded-lg">
                  <Badge variant="outline" className="text-xs mb-1">{constraint.type}</Badge>
                  <p className="text-sm text-muted-foreground">{constraint.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
