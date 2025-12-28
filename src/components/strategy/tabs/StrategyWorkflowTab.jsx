import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Target } from 'lucide-react';
import { phases } from '@/config/strategyHubTools';

export default function StrategyWorkflowTab({
    currentPhaseIndex,
    plansLoading,
    plans,
    activePlans,
    draftPlans,
    avgProgress,
    pendingApprovals,
    isRTL
}) {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            {/* Phase Progress */}
            <Card>
                <CardHeader>
                    <CardTitle>{t({ en: 'Strategic Lifecycle', ar: 'دورة حياة الاستراتيجية' })}</CardTitle>
                    <CardDescription>
                        {t({ en: 'Current phase and progress through the 8-phase methodology', ar: 'المرحلة الحالية والتقدم عبر منهجية المراحل الثمانية' })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        {phases.map((phase, index) => {
                            const Icon = phase.icon;
                            const isActive = index === currentPhaseIndex;
                            const isCompleted = index < currentPhaseIndex;
                            return (
                                <div key={phase.key} className="flex flex-col items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-100 text-green-600' :
                                        isActive ? 'bg-primary text-primary-foreground' :
                                            'bg-muted text-muted-foreground'
                                        }`}>
                                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                    </div>
                                    <span className={`text-xs mt-1 text-center ${isActive ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                                        {t(phase.label)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <Progress value={(currentPhaseIndex / (phases.length - 1)) * 100} className="h-2" />
                </CardContent>
            </Card>

            {/* Active Strategic Plans */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{t({ en: 'Strategic Plans', ar: 'الخطط الاستراتيجية' })}</CardTitle>
                        <CardDescription>{t({ en: 'Active and draft strategic plans', ar: 'الخطط الاستراتيجية النشطة والمسودات' })}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/strategy-drill-down">
                            {t({ en: 'View All', ar: 'عرض الكل' })}
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {plansLoading ? (
                        <div className="text-center py-8 text-muted-foreground">{t({ en: 'Loading...', ar: 'جاري التحميل...' })}</div>
                    ) : plans.length === 0 ? (
                        <div className="text-center py-8">
                            <Target className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                            <p className="text-muted-foreground">{t({ en: 'No strategic plans yet', ar: 'لا توجد خطط استراتيجية بعد' })}</p>
                            <Button className="mt-4" asChild>
                                <Link to="/strategic-plan-builder">{t({ en: 'Create First Plan', ar: 'إنشاء الخطة الأولى' })}</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {plans.slice(0, 5).map(plan => (
                                <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${plan.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`} />
                                        <div>
                                            <p className="font-medium">{isRTL ? plan.name_ar || plan.name_en : plan.name_en}</p>
                                            <p className="text-sm text-muted-foreground">{plan.timeframe_start} - {plan.timeframe_end}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                                            {plan.status}
                                        </Badge>
                                        <div className="w-24">
                                            <Progress value={plan.progress_percentage || 0} className="h-1.5" />
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link to={`/strategy-drill-down?plan=${plan.id}`}>
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Monitoring Widgets */}
            <div className="grid md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t({ en: 'Strategic Coverage', ar: 'التغطية الاستراتيجية' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {['Challenges', 'Pilots', 'Programs', 'Partnerships'].map((entity, i) => (
                                <div key={entity} className="flex items-center justify-between">
                                    <span className="text-sm">{entity}</span>
                                    <div className="flex items-center gap-2">
                                        <Progress value={60 + i * 10} className="w-24 h-1.5" />
                                        <span className="text-sm text-muted-foreground w-10">{60 + i * 10}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="link" className="mt-3 p-0" asChild>
                            <Link to="/strategy-alignment">{t({ en: 'View Details', ar: 'عرض التفاصيل' })}</Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t({ en: 'Pending Actions', ar: 'الإجراءات المعلقة' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pendingApprovals.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>{t({ en: 'No pending actions', ar: 'لا توجد إجراءات معلقة' })}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {pendingApprovals.map(approval => (
                                    <div key={approval.id} className="flex items-center justify-between p-2 rounded border">
                                        <span className="text-sm">{approval.request_type}</span>
                                        <Badge variant="outline">Pending</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Button variant="link" className="mt-3 p-0" asChild>
                            <Link to="/strategy-governance-page">{t({ en: 'Manage Approvals', ar: 'إدارة الموافقات' })}</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
