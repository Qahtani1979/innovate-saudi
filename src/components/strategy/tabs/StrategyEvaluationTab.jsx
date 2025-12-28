import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Target, FileBarChart, BookOpen, Users, TrendingUp, Lightbulb } from 'lucide-react';

export default function StrategyEvaluationTab({ filteredEvaluationTools }) {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-background">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-600" />
                        {t({ en: 'Strategy Evaluation & Review (Phase 7)', ar: 'تقييم ومراجعة الاستراتيجية (المرحلة 7)' })}
                    </CardTitle>
                    <CardDescription>
                        {t({ en: 'Expert evaluation panels, ROI analysis, case studies, lessons learned capture, and impact assessment', ar: 'لجان تقييم الخبراء وتحليل العائد على الاستثمار ودراسات الحالة وجمع الدروس المستفادة وتقييم الأثر' })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                        {filteredEvaluationTools.map(tool => {
                            const Icon = tool.icon;
                            return (
                                <Link key={tool.path} to={tool.path}>
                                    <Card className="hover:border-green-400/50 transition-colors cursor-pointer h-full">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                                                    <Icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{t(tool.label)}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">{t(tool.desc)}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                    <div className="mt-6 flex gap-3">
                        <Button asChild>
                            <Link to="/strategy-review-page">
                                <FileBarChart className="h-4 w-4 mr-2" />
                                {t({ en: 'Open Evaluation Panel', ar: 'فتح لوحة التقييم' })}
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to="/knowledge">
                                <BookOpen className="h-4 w-4 mr-2" />
                                {t({ en: 'Knowledge Repository', ar: 'مستودع المعرفة' })}
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Evaluation Features */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
                            <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'Expert Panels', ar: 'لجان الخبراء' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'Multi-stakeholder evaluation with scoring criteria', ar: 'تقييم متعدد أصحاب المصلحة مع معايير التسجيل' })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3">
                            <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'ROI Calculator', ar: 'حاسبة العائد' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'Measure return on investment for strategic initiatives', ar: 'قياس العائد على الاستثمار للمبادرات الاستراتيجية' })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-3">
                            <Lightbulb className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'Lessons Learned', ar: 'الدروس المستفادة' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'Capture and share organizational learnings', ar: 'جمع ومشاركة التعلم المؤسسي' })}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
