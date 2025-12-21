import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award } from 'lucide-react';
import RDProjectFinalEvaluationPanel from '../RDProjectFinalEvaluationPanel';

export default function FinalEvalTab({ project, expertEvaluations, t, onShowFinalEvaluation }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    {t({ en: 'Final Project Evaluation', ar: 'التقييم النهائي للمشروع' })}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {project.status === 'completed' ? (
                    <>
                        {expertEvaluations.length === 0 ? (
                            <div className="text-center py-12">
                                <Award className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 mb-4">{t({ en: 'No final evaluations yet', ar: 'لا توجد تقييمات نهائية بعد' })}</p>
                                <Button onClick={onShowFinalEvaluation} className="bg-purple-600">
                                    <Award className="h-4 w-4 mr-2" />
                                    {t({ en: 'Submit Final Evaluation', ar: 'تقديم التقييم النهائي' })}
                                </Button>
                            </div>
                        ) : (
                            <>
                                <RDProjectFinalEvaluationPanel project={project} onClose={() => { }} />
                                <Button onClick={onShowFinalEvaluation} className="w-full mt-4 bg-purple-600">
                                    <Award className="h-4 w-4 mr-2" />
                                    {t({ en: 'Add Another Evaluation', ar: 'إضافة تقييم آخر' })}
                                </Button>
                            </>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-slate-500">{t({ en: 'Final evaluation available when project is completed', ar: 'التقييم النهائي متاح عند اكتمال المشروع' })}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
