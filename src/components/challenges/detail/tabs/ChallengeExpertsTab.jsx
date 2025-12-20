import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { Award, Star } from 'lucide-react';

export default function ChallengeExpertsTab({ expertEvaluations = [] }) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            {t({ en: 'Expert Evaluations', ar: 'تقييمات الخبراء' })} ({expertEvaluations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expertEvaluations.length > 0 ? (
            <div className="space-y-4">
              {expertEvaluations.map((evaluation) => (
                <div key={evaluation.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{evaluation.evaluator_name || evaluation.evaluator_email}</p>
                      <p className="text-xs text-muted-foreground">{evaluation.evaluator_organization}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < (evaluation.overall_score || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  
                  {evaluation.criteria_scores && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {Object.entries(evaluation.criteria_scores).map(([key, value]) => (
                        <div key={key} className="text-xs">
                          <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                          <span className="ml-1 font-medium">{value}/5</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {evaluation.comments && (
                    <p className="text-sm text-muted-foreground">{evaluation.comments}</p>
                  )}
                  
                  {evaluation.recommendations && evaluation.recommendations.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium mb-2">{t({ en: 'Recommendations:', ar: 'التوصيات:' })}</p>
                      <div className="flex flex-wrap gap-1">
                        {evaluation.recommendations.map((rec, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{rec}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(evaluation.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">{t({ en: 'No expert evaluations yet', ar: 'لا توجد تقييمات من الخبراء بعد' })}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
