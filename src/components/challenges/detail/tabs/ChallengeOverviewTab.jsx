import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '@/components/LanguageContext';
import { FileText } from 'lucide-react';
import TrackAssignment from '@/components/TrackAssignment';

export default function ChallengeOverviewTab({ challenge }) {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-6">
      <TrackAssignment challenge={challenge} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {t({ en: 'Description', ar: 'الوصف' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p 
            className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap" 
            dir={language === 'ar' && challenge.description_ar ? 'rtl' : 'ltr'}
          >
            {language === 'ar' && challenge.description_ar ? challenge.description_ar : challenge.description_en}
          </p>
        </CardContent>
      </Card>

      {(challenge.current_situation_en || challenge.current_situation_ar) && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Current Situation', ar: 'الوضع الحالي' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {language === 'ar' && challenge.current_situation_ar 
                ? challenge.current_situation_ar 
                : challenge.current_situation_en}
            </p>
          </CardContent>
        </Card>
      )}

      {(challenge.desired_outcome_en || challenge.desired_outcome_ar) && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Desired Outcome', ar: 'النتيجة المرغوبة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {language === 'ar' && challenge.desired_outcome_ar 
                ? challenge.desired_outcome_ar 
                : challenge.desired_outcome_en}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
