import React from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle2, GitBranch, Users } from 'lucide-react';

export default function StrategyGovernanceTab({ filteredGovernanceTools }) {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-background">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-600" />
                        {t({ en: 'Strategy Governance & Approval (Phase 4)', ar: 'حوكمة الاستراتيجية والموافقات (المرحلة 4)' })}
                    </CardTitle>
                    <CardDescription>
                        {t({ en: 'Manage approvals, version control, committee reviews, and strategic ownership', ar: 'إدارة الموافقات والتحكم بالإصدارات ومراجعات اللجان والملكية الاستراتيجية' })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredGovernanceTools.map(tool => {
                            const Icon = tool.icon;
                            return (
                                <Link key={tool.path + tool.tab} to={tool.path}>
                                    <Card className="hover:border-purple-400/50 transition-colors cursor-pointer h-full">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                                                    <Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{t(tool.label)}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {t({
                                                            en: tool.tab === 'signoff' ? 'Track stakeholder approvals and sign-offs' :
                                                                tool.tab === 'versions' ? 'Manage strategy versions and history' :
                                                                    tool.tab === 'committee' ? 'Committee decision tracking and voting' :
                                                                        tool.path.includes('budget') ? 'Strategic budget allocation' :
                                                                            'Assign RACI ownership matrix',
                                                            ar: tool.tab === 'signoff' ? 'تتبع موافقات وتوقيعات أصحاب المصلحة' :
                                                                tool.tab === 'versions' ? 'إدارة إصدارات الاستراتيجية والتاريخ' :
                                                                    tool.tab === 'committee' ? 'تتبع قرارات اللجنة والتصويت' :
                                                                        tool.path.includes('budget') ? 'تخصيص الميزانية الاستراتيجية' :
                                                                            'تعيين مصفوفة ملكية RACI'
                                                        })}
                                                    </p>
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
                            <Link to="/strategy-governance-page">
                                <Shield className="h-4 w-4 mr-2" />
                                {t({ en: 'Open Governance Dashboard', ar: 'فتح لوحة الحوكمة' })}
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to="/strategy-ownership-page">
                                <Users className="h-4 w-4 mr-2" />
                                {t({ en: 'Manage Ownership', ar: 'إدارة الملكية' })}
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Governance Features */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-3">
                            <CheckCircle2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'Multi-Step Approvals', ar: 'موافقات متعددة الخطوات' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'Configurable approval workflows with SLA tracking', ar: 'سير عمل موافقات قابلة للتكوين مع تتبع اتفاقية الخدمة' })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3">
                            <GitBranch className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'Version History', ar: 'تاريخ الإصدارات' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'Complete audit trail with change comparison', ar: 'مسار تدقيق كامل مع مقارنة التغييرات' })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
                            <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{t({ en: 'Committee Decisions', ar: 'قرارات اللجنة' })}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t({ en: 'Track committee votes, decisions, and action items', ar: 'تتبع تصويتات اللجنة والقرارات وبنود العمل' })}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
