import React from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BarChart3, Target, TrendingUp, GitBranch, AlertTriangle, ClipboardList } from 'lucide-react';

export default function StrategyMonitoringTab({ filteredMonitoringTools, filteredDemandTools }) {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        {t({ en: 'Strategy Monitoring & Review (Phase 6)', ar: 'مراقبة ومراجعة الاستراتيجية (المرحلة 6)' })}
                    </CardTitle>
                    <CardDescription>
                        {t({ en: 'Real-time tracking of strategy execution, KPIs, alignment, and performance metrics', ar: 'تتبع تنفيذ الاستراتيجية ومؤشرات الأداء والمواءمة في الوقت الفعلي' })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredMonitoringTools.map(tool => {
                            const Icon = tool.icon;
                            return (
                                <Link key={tool.path} to={tool.path}>
                                    <Card className="hover:border-blue-400/50 transition-colors cursor-pointer h-full">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                                                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                            <Link to="/strategy-cockpit">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                {t({ en: 'Open Strategy Cockpit', ar: 'فتح لوحة القيادة' })}
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to="/strategic-kpi-tracker">
                                <Target className="h-4 w-4 mr-2" />
                                {t({ en: 'KPI Tracker', ar: 'متتبع المؤشرات' })}
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Monitoring Features */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3">
                            <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'Real-time Dashboards', ar: 'لوحات الوقت الفعلي' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'Live KPI tracking with automated alerts and progress updates', ar: 'تتبع المؤشرات مباشرة مع تنبيهات آلية وتحديثات التقدم' })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
                            <GitBranch className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'Alignment Tracking', ar: 'تتبع المواءمة' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'Monitor entity alignment with strategic objectives', ar: 'مراقبة مواءمة الكيانات مع الأهداف الاستراتيجية' })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-3">
                            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'Gap Analysis', ar: 'تحليل الفجوات' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'Identify coverage gaps and get AI recommendations', ar: 'تحديد فجوات التغطية والحصول على توصيات الذكاء الاصطناعي' })}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Demand & Resource Tools */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        {t({ en: 'Demand & Resource Management', ar: 'إدارة الطلب والموارد' })}
                    </CardTitle>
                    <CardDescription>
                        {t({ en: 'Track strategy-driven demand, action plans, and national alignment', ar: 'تتبع الطلب المدفوع بالاستراتيجية وخطط العمل والمواءمة الوطنية' })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                        {filteredDemandTools.map(tool => {
                            const Icon = tool.icon;
                            return (
                                <Link key={tool.path} to={tool.path}>
                                    <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 rounded-lg bg-primary/10">
                                                    <Icon className="h-6 w-6 text-primary" />
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
                </CardContent>
            </Card>
        </div>
    );
}
