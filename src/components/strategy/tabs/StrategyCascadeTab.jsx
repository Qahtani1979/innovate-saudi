import React from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Zap, TrendingUp, ClipboardList, Sparkles, Target, CheckCircle2, FileText, BarChart3 } from 'lucide-react';

export default function StrategyCascadeTab({ filteredCascadeGenerators }) {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950 dark:to-background">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-orange-600" />
                        {t({ en: 'Strategy Cascade Generators (Phase 3)', ar: 'مولدات التدرج الاستراتيجي (المرحلة 3)' })}
                    </CardTitle>
                    <CardDescription>
                        {t({ en: 'AI-powered generation of entities aligned with strategic objectives across 8 entity types', ar: 'إنشاء كيانات بالذكاء الاصطناعي متوافقة مع الأهداف الاستراتيجية عبر 8 أنواع من الكيانات' })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {filteredCascadeGenerators.map(gen => {
                            const Icon = gen.icon;
                            return (
                                <Link
                                    key={gen.path}
                                    to={gen.path}
                                    className="flex flex-col items-center p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-orange-400/50 transition-all group"
                                >
                                    <Icon className={`h-8 w-8 ${gen.color} group-hover:scale-110 transition-transform`} />
                                    <span className="mt-2 text-sm font-medium text-center">{t(gen.label)}</span>
                                </Link>
                            );
                        })}
                    </div>
                    <div className="mt-6 flex gap-3">
                        <Button asChild>
                            <Link to="/strategy-demand-dashboard">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                {t({ en: 'Open Demand Dashboard', ar: 'فتح لوحة الطلب' })}
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to="/action-plan-page">
                                <ClipboardList className="h-4 w-4 mr-2" />
                                {t({ en: 'Action Plans', ar: 'خطط العمل' })}
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Cascade Features */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-3">
                            <Sparkles className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'AI-Powered Generation', ar: 'إنشاء بالذكاء الاصطناعي' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'Automatically generate entities aligned with strategic objectives', ar: 'إنشاء كيانات تلقائياً متوافقة مع الأهداف الاستراتيجية' })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3">
                            <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'Objective Linking', ar: 'ربط الأهداف' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'All generated entities linked to strategic objectives and KPIs', ar: 'جميع الكيانات المُنشأة مرتبطة بالأهداف الاستراتيجية ومؤشرات الأداء' })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
                            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'Quality Assurance', ar: 'ضمان الجودة' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'AI quality scoring and validation before entity creation', ar: 'تقييم جودة بالذكاء الاصطناعي والتحقق قبل إنشاء الكيانات' })}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Links */}
            <Card>
                <CardHeader>
                    <CardTitle>{t({ en: 'Related Tools', ar: 'أدوات ذات صلة' })}</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-3 flex-wrap">
                    <Button variant="outline" asChild>
                        <Link to="/strategy-templates-page">
                            <FileText className="h-4 w-4 mr-2" />
                            {t({ en: 'Strategy Templates', ar: 'قوالب الاستراتيجية' })}
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to="/national-strategy-linker-page">
                            <Target className="h-4 w-4 mr-2" />
                            {t({ en: 'National Alignment', ar: 'المواءمة الوطنية' })}
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to="/baseline-data-page">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            {t({ en: 'Baseline Data', ar: 'البيانات الأساسية' })}
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
