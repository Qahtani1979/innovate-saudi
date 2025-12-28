import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Settings, Sparkles, Brain, Layers } from 'lucide-react';

export default function StrategyRecalibrationTab({ filteredRecalibrationTools }) {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950 dark:to-background">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-indigo-600" />
                        {t({ en: 'Strategy Recalibration (Phase 8)', ar: 'إعادة معايرة الاستراتيجية (المرحلة 8)' })}
                    </CardTitle>
                    <CardDescription>
                        {t({ en: 'AI-powered feedback analysis, adjustment decision matrix, mid-cycle pivots, baseline recalibration, and next cycle initialization', ar: 'تحليل التعليقات بالذكاء الاصطناعي ومصفوفة قرار التعديل والتحويلات منتصف الدورة وإعادة معايرة الأساس وبدء الدورة التالية' })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredRecalibrationTools.map(tool => {
                            const Icon = tool.icon;
                            return (
                                <Link key={tool.path} to={tool.path}>
                                    <Card className="hover:border-indigo-400/50 transition-colors cursor-pointer h-full">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900">
                                                    <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
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
                            <Link to="/strategy-recalibration-page">
                                <Settings className="h-4 w-4 mr-2" />
                                {t({ en: 'Open Recalibration Center', ar: 'فتح مركز إعادة المعايرة' })}
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to="/strategic-plan-builder">
                                <Sparkles className="h-4 w-4 mr-2" />
                                {t({ en: 'New Strategy Cycle', ar: 'دورة استراتيجية جديدة' })}
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Recalibration Features */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-3">
                            <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'AI Feedback Analysis', ar: 'تحليل التعليقات بالذكاء الاصطناعي' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'Sentiment analysis and theme extraction from feedback', ar: 'تحليل المشاعر واستخراج المواضيع من التعليقات' })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-3">
                            <Layers className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'Decision Matrix', ar: 'مصفوفة القرار' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'Data-driven adjustment recommendations', ar: 'توصيات تعديل مبنية على البيانات' })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
                            <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'Next Cycle Init', ar: 'بدء الدورة التالية' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'Carry forward learnings to next planning cycle', ar: 'نقل التعلم إلى دورة التخطيط التالية' })}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
