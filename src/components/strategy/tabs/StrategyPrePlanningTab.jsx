import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Search, Layers, Globe, AlertTriangle, FileBarChart, Settings, Calendar, MessageSquare } from 'lucide-react';

export default function StrategyPrePlanningTab({ filteredPreplanningTools }) {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white dark:from-teal-950 dark:to-background">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-teal-600" />
                        {t({ en: 'Pre-Planning & Analysis (Phase 1)', ar: 'التخطيط المسبق والتحليل (المرحلة 1)' })}
                    </CardTitle>
                    <CardDescription>
                        {t({ en: 'Environmental scanning, SWOT analysis, stakeholder mapping, risk assessment, and baseline data collection', ar: 'المسح البيئي وتحليل SWOT ورسم خرائط أصحاب المصلحة وتقييم المخاطر وجمع البيانات الأساسية' })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredPreplanningTools.map(tool => {
                            const Icon = tool.icon;
                            return (
                                <Link key={tool.path} to={tool.path}>
                                    <Card className="hover:border-teal-400/50 transition-colors cursor-pointer h-full">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900">
                                                    <Icon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
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
                            <Link to="/environmental-scan-page">
                                <Search className="h-4 w-4 mr-2" />
                                {t({ en: 'Start Environmental Scan', ar: 'بدء المسح البيئي' })}
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to="/swot-analysis-page">
                                <Layers className="h-4 w-4 mr-2" />
                                {t({ en: 'SWOT Analysis', ar: 'تحليل SWOT' })}
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Pre-Planning Features */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-3">
                            <Globe className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'PESTLE Analysis', ar: 'تحليل PESTLE' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'Political, Economic, Social, Tech, Legal, Environmental factors', ar: 'العوامل السياسية والاقتصادية والاجتماعية والتقنية والقانونية والبيئية' })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-3">
                            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'Risk Registry', ar: 'سجل المخاطر' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'Identify, assess, and mitigate strategic risks', ar: 'تحديد وتقييم وتخفيف المخاطر الاستراتيجية' })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3">
                            <FileBarChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'Baseline Metrics', ar: 'مقاييس الأساس' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'Establish baselines for measuring future progress', ar: 'وضع خطوط أساس لقياس التقدم المستقبلي' })}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>{t({ en: 'Related Planning Tools', ar: 'أدوات تخطيط ذات صلة' })}</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-3 flex-wrap">
                    <Button variant="outline" asChild>
                        <Link to="/strategy-review-page">
                            <Settings className="h-4 w-4 mr-2" />
                            {t({ en: 'Adjustment Wizard', ar: 'معالج التعديل' })}
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to="/strategy-timeline-page">
                            <Calendar className="h-4 w-4 mr-2" />
                            {t({ en: 'Timeline Planning', ar: 'تخطيط الجدول الزمني' })}
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to="/strategy-feedback-dashboard">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            {t({ en: 'Feedback Dashboard', ar: 'لوحة التعليقات' })}
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
