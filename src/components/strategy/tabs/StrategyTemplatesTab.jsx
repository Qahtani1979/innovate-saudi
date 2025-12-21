import React from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileText, Sparkles, Target, Globe } from 'lucide-react';

export default function StrategyTemplatesTab({ filteredTemplateTools }) {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-950 dark:to-background">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-cyan-600" />
                        {t({ en: 'Strategy Template Library', ar: 'مكتبة قوالب الاستراتيجية' })}
                    </CardTitle>
                    <CardDescription>
                        {t({ en: 'MoMAH Innovation & R&D strategy templates with coverage analysis and AI recommendations', ar: 'قوالب استراتيجيات الابتكار والبحث والتطوير لوزارة البلديات مع تحليل التغطية وتوصيات الذكاء الاصطناعي' })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                        {filteredTemplateTools.map(tool => {
                            const Icon = tool.icon;
                            return (
                                <Link key={tool.path} to={tool.path}>
                                    <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 rounded-lg bg-cyan-100 dark:bg-cyan-900">
                                                    <Icon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
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
                            <Link to="/strategy-templates-page">
                                <FileText className="h-4 w-4 mr-2" />
                                {t({ en: 'Open Template Library', ar: 'فتح مكتبة القوالب' })}
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to="/strategic-plan-builder">
                                <Sparkles className="h-4 w-4 mr-2" />
                                {t({ en: 'Create from Scratch', ar: 'إنشاء من البداية' })}
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Template Features */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-3">
                            <Target className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'Coverage Analysis', ar: 'تحليل التغطية' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'Analyze templates against MoMAH service domains and innovation areas', ar: 'تحليل القوالب مقابل مجالات خدمات الوزارة ومجالات الابتكار' })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-3">
                            <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'AI Recommendations', ar: 'توصيات الذكاء الاصطناعي' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'Get AI-powered suggestions for new templates based on gaps', ar: 'احصل على اقتراحات مدعومة بالذكاء الاصطناعي لقوالب جديدة بناءً على الفجوات' })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
                            <Globe className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'Vision 2030 Aligned', ar: 'متوافق مع رؤية 2030' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'All templates aligned with Saudi Vision 2030 programs', ar: 'جميع القوالب متوافقة مع برامج رؤية السعودية 2030' })}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
