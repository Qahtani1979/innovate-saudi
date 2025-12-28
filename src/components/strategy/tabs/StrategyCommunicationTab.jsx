import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Megaphone, Globe, BookOpen, Bell, BarChart3 } from 'lucide-react';

export default function StrategyCommunicationTab({ filteredCommunicationTools }) {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-white dark:from-pink-950 dark:to-background">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-pink-600" />
                        {t({ en: 'Strategy Communication & Publishing (Phase 5)', ar: 'التواصل والنشر الاستراتيجي (المرحلة 5)' })}
                    </CardTitle>
                    <CardDescription>
                        {t({ en: 'Plan communications, generate impact stories, manage stakeholder notifications, and publish strategy publicly', ar: 'تخطيط الاتصالات وإنشاء قصص الأثر وإدارة إشعارات أصحاب المصلحة ونشر الاستراتيجية علنياً' })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCommunicationTools.map(tool => {
                            const Icon = tool.icon;
                            return (
                                <Link key={tool.path} to={tool.path}>
                                    <Card className="hover:border-pink-400/50 transition-colors cursor-pointer h-full">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 rounded-lg bg-pink-100 dark:bg-pink-900">
                                                    <Icon className="h-6 w-6 text-pink-600 dark:text-pink-400" />
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
                            <Link to="/strategy-communication-page">
                                <Megaphone className="h-4 w-4 mr-2" />
                                {t({ en: 'Open Communication Center', ar: 'فتح مركز التواصل' })}
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to="/public-strategy-dashboard-page">
                                <Globe className="h-4 w-4 mr-2" />
                                {t({ en: 'Public Dashboard', ar: 'اللوحة العامة' })}
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Communication Features */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mb-3">
                            <BookOpen className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'Impact Stories', ar: 'قصص الأثر' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'AI-generated narratives from strategy outcomes', ar: 'سرديات مولدة بالذكاء الاصطناعي من نتائج الاستراتيجية' })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3">
                            <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'Smart Notifications', ar: 'إشعارات ذكية' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'Automated stakeholder notifications by role', ar: 'إشعارات آلية لأصحاب المصلحة حسب الدور' })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
                            <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'Communication Analytics', ar: 'تحليلات التواصل' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'Track engagement and reach metrics', ar: 'تتبع مقاييس المشاركة والوصول' })}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
