import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Users, Award } from 'lucide-react';

export default function ExpertsTab({ project, expertEvaluations, t, language, projectId }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-purple-600" />
                        {t({ en: 'Peer Review Panel', ar: 'لجنة المراجعة' })}
                    </CardTitle>
                    <Link to={createPageUrl(`ExpertMatchingEngine?entity_type=rd_project&entity_id=${projectId}`)} target="_blank">
                        <Button size="sm" className="bg-purple-600">
                            <Users className="h-4 w-4 mr-2" />
                            {t({ en: 'Assign Peer Reviewers', ar: 'تعيين محكمين' })}
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                {expertEvaluations.length > 0 ? (
                    <div className="space-y-4">
                        {expertEvaluations.map((evaluation) => (
                            <div key={evaluation.id} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="font-medium text-slate-900">{evaluation.expert_email}</p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(evaluation.evaluation_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-purple-600">{evaluation.overall_score}</div>
                                        <Badge className={
                                            evaluation.recommendation === 'approve' ? 'bg-green-100 text-green-700' :
                                                evaluation.recommendation === 'reject' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                        }>
                                            {evaluation.recommendation?.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    <div className="text-center p-2 bg-white rounded">
                                        <div className="text-sm font-bold text-green-600">{evaluation.innovation_score}</div>
                                        <div className="text-xs text-slate-600">{t({ en: 'Innovation', ar: 'الابتكار' })}</div>
                                    </div>
                                    <div className="text-center p-2 bg-white rounded">
                                        <div className="text-sm font-bold text-blue-600">{evaluation.impact_score}</div>
                                        <div className="text-xs text-slate-600">{t({ en: 'Impact', ar: 'التأثير' })}</div>
                                    </div>
                                    <div className="text-center p-2 bg-white rounded">
                                        <div className="text-sm font-bold text-purple-600">{evaluation.technical_quality_score}</div>
                                        <div className="text-xs text-slate-600">{t({ en: 'Quality', ar: 'الجودة' })}</div>
                                    </div>
                                    <div className="text-center p-2 bg-white rounded">
                                        <div className="text-sm font-bold text-red-600">{evaluation.risk_score}</div>
                                        <div className="text-xs text-slate-600">{t({ en: 'Risk', ar: 'المخاطر' })}</div>
                                    </div>
                                </div>

                                {evaluation.feedback_text && (
                                    <div className="p-3 bg-white rounded border">
                                        <p className="text-sm text-slate-700">{evaluation.feedback_text}</p>
                                    </div>
                                )}
                            </div>
                        ))}

                        {expertEvaluations.length >= 2 && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm font-semibold text-blue-900 mb-2">
                                    {t({ en: 'Peer Review Consensus', ar: 'إجماع المحكمين' })}
                                </p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">{t({ en: 'Peer Reviewers:', ar: 'المحكمون:' })}</span>
                                        <span className="font-medium">{expertEvaluations.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">{t({ en: 'Recommendation:', ar: 'التوصية:' })}</span>
                                        <span className="font-medium text-green-600">
                                            {(expertEvaluations.filter(e => e.recommendation === 'approve').length / expertEvaluations.length * 100).toFixed(0)}% Approve
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">{t({ en: 'Avg. Score:', ar: 'متوسط النقاط:' })}</span>
                                        <span className="font-medium text-purple-600">
                                            {(expertEvaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / expertEvaluations.length).toFixed(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Award className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 mb-4">{t({ en: 'No peer reviews yet', ar: 'لا توجد مراجعات بعد' })}</p>
                        <Link to={createPageUrl(`ExpertMatchingEngine?entity_type=rd_project&entity_id=${projectId}`)} target="_blank">
                            <Button className="bg-purple-600">
                                <Users className="h-4 w-4 mr-2" />
                                {t({ en: 'Request Peer Review', ar: 'طلب مراجعة الأقران' })}
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
