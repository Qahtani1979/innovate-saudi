import { Card, CardContent } from "@/components/ui/card";
import { Target, TrendingUp, DollarSign, BookOpen } from 'lucide-react';

export default function RDProjectMetrics({ project, t }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">{t({ en: 'TRL Start', ar: 'مستوى ابتدائي' })}</p>
                            <p className="text-3xl font-bold text-blue-600">{project.trl_start || 'N/A'}</p>
                        </div>
                        <Target className="h-8 w-8 text-blue-600" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">{t({ en: 'TRL Current', ar: 'مستوى حالي' })}</p>
                            <p className="text-3xl font-bold text-purple-600">{project.trl_current || project.trl_start || 'N/A'}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">{t({ en: 'TRL Target', ar: 'مستوى مستهدف' })}</p>
                            <p className="text-3xl font-bold text-green-600">{project.trl_target || 'N/A'}</p>
                        </div>
                        <Target className="h-8 w-8 text-green-600" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">{t({ en: 'Budget', ar: 'الميزانية' })}</p>
                            <p className="text-3xl font-bold text-amber-600">
                                {project.budget ? `${(project.budget / 1000).toFixed(0)}K` : 'N/A'}
                            </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-amber-600" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">{t({ en: 'Publications', ar: 'منشورات' })}</p>
                            <p className="text-3xl font-bold text-teal-600">{project.publications?.length || 0}</p>
                        </div>
                        <BookOpen className="h-8 w-8 text-teal-600" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
