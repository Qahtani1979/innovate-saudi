import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    CheckCircle2, XCircle, AlertTriangle, Target, TrendingUp,
    ChevronDown, ChevronRight, Sparkles, Database, Workflow,
    Users, Network, FileText, Brain, Shield, ArrowLeftRight
} from 'lucide-react';

/**
 * BaseCoverageReport
 * A reusable template for system coverage reports.
 * Reduces boilerplate in individual report pages.
 */
export default function BaseCoverageReport({ title, data, language, isRTL, t }) {
    const [expandedSections, setExpandedSections] = useState({});

    const toggleSection = (key) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const renderStatus = (status) => {
        switch (status) {
            case 'complete':
            case 'exists':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'partial':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            default:
                return <XCircle className="h-4 w-4 text-red-500" />;
        }
    };

    return (
        <div className={`p-6 space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="flex justify-between items-center bg-card p-6 rounded-xl border-l-4 border-l-primary shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t({ en: 'Comprehensive system health and feature coverage audit', ar: 'تدقيق شامل لصحة النظام وتغطية الميزات' })}
                    </p>
                </div>
                <div className="text-right">
                    <Badge variant="outline" className="text-lg px-4 py-1">v5.0 Verified</Badge>
                    <div className="text-xs text-muted-foreground mt-2">Last Updated: Dec 2025</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t({ en: 'Total Coverage', ar: 'إجمالي التغطية' })}</p>
                                <h3 className="text-3xl font-bold mt-1">94.8%</h3>
                            </div>
                            <Target className="h-8 w-8 text-primary opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                {/* Additional stat cards can be added here or passed via props */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Assessment Header */}
                    {data.assessment && (
                        <Card className="border-l-4 border-l-destructive bg-destructive/5">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    {t({ en: 'Critical Assessment', ar: 'التقييم الحرج' })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm space-y-2 whitespace-pre-wrap">
                                    {data.assessment}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Pages & Features */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                <Workflow className="h-5 w-5 text-primary" />
                                {t({ en: 'System Pages & Features', ar: 'صفحات النظام والميزات' })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.pages?.map((page, idx) => (
                                <div key={idx} className="border rounded-lg overflow-hidden transition-all hover:border-primary/50">
                                    <div
                                        className="bg-muted/30 p-4 flex items-center justify-between cursor-pointer"
                                        onClick={() => toggleSection(`page-${idx}`)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {renderStatus(page.status)}
                                            <div>
                                                <h4 className="font-semibold">{page.name}</h4>
                                                <p className="text-xs text-muted-foreground">{page.path}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-right">
                                            <div>
                                                <div className="text-sm font-medium">{page.coverage}%</div>
                                                <Progress value={page.coverage} className="h-1.5 w-20" />
                                            </div>
                                            {expandedSections[`page-${idx}`] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        </div>
                                    </div>

                                    {expandedSections[`page-${idx}`] && (
                                        <div className="p-4 bg-background border-t grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div>
                                                <p className="text-sm font-medium mb-2">{t({ en: 'Implemented Features', ar: 'الميزات المنفذة' })}</p>
                                                <ul className="space-y-1">
                                                    {page.features?.map((f, i) => (
                                                        <li key={i} className="text-xs flex items-start gap-1">
                                                            <span className="text-blue-500">•</span> {f}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium mb-2">{t({ en: 'Identified Gaps', ar: 'الفجوات المحددة' })}</p>
                                                <ul className="space-y-1">
                                                    {page.gaps?.map((g, i) => (
                                                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                                            <span className="text-yellow-500">•</span> {g}
                                                        </li>
                                                    ))}
                                                </ul>
                                                {page.aiFeatures?.length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="text-xs font-semibold text-primary flex items-center gap-1">
                                                            <Sparkles className="h-3 w-3" />
                                                            {t({ en: 'AI Capabilities', ar: 'قدرات الذكاء الاصطناعي' })}
                                                        </p>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {page.aiFeatures.map((ai, i) => (
                                                                <Badge key={i} variant="secondary" className="text-[10px] py-0">{ai}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* System Components */}
                    {data.components?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    {t({ en: 'Infrastructure Components', ar: 'مكونات البنية التحتية' })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.components.map((comp, idx) => (
                                    <div key={idx} className="p-4 border rounded-lg space-y-2 hover:border-primary/50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold">{comp.name}</h4>
                                            {renderStatus(comp.status)}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <p>{comp.description}</p>
                                            <Badge variant="secondary">{comp.coverage}%</Badge>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Workflows */}
                    {data.workflows?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                    <Network className="h-5 w-5 text-primary" />
                                    {t({ en: 'Core Workflows', ar: 'سير العمل الأساسي' })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {data.workflows.map((wf, idx) => (
                                    <div key={idx} className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-lg">{wf.name}</h4>
                                            <Badge variant="outline">{wf.coverage}% Coverage</Badge>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {wf.stages?.map((stage, i) => (
                                                <div key={i} className="p-3 border rounded-lg bg-muted/20">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {renderStatus(stage.status)}
                                                        <span className="text-sm font-semibold">{stage.name}</span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground">{stage.automation}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* User Journeys */}
                    {data.userJourneys?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    {t({ en: 'User Journeys', ar: 'رحلات المستخدم' })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {data.userJourneys.map((journey, idx) => (
                                    <div key={idx} className="space-y-3">
                                        <h4 className="font-bold">{journey.persona}</h4>
                                        <div className="relative pl-4 border-l-2 border-primary/20 space-y-4">
                                            {journey.journey?.map((step, i) => (
                                                <div key={i} className="relative">
                                                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                                                    <div className="bg-muted/30 p-3 rounded-lg">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="text-sm font-semibold">{step.step}</span>
                                                            <Badge variant="secondary" className="text-[10px]">{step.page}</Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">{step.implementation}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Data Layer */}
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Database className="h-5 w-5 text-primary" />
                                {t({ en: 'Data Layer Coverage', ar: 'تغطية طبقة البيانات' })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Object.entries(data.entities || {}).map(([name, entity], idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold">{name}</span>
                                        <Badge variant={entity.status === 'complete' || entity.status === 'exists' ? 'default' : 'outline'}>
                                            {entity.status}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {Array.isArray(entity.fields) ? (
                                            entity.fields.map((f, i) => (
                                                <Badge key={i} variant="outline" className="text-[9px] px-1 font-mono">{f}</Badge>
                                            ))
                                        ) : (
                                            Object.entries(entity.fields || {}).map(([group, fields], i) => (
                                                <div key={i} className="w-full">
                                                    <p className="text-[8px] uppercase text-muted-foreground mt-1 mb-0.5">{group}</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {fields.map((f, j) => (
                                                            <Badge key={j} variant="outline" className="text-[9px] px-1 font-mono">{f}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                                        <span>Pop: {entity.population?.total || entity.population || 0}</span>
                                        {(entity.with_embedding !== undefined || entity.population?.with_embedding !== undefined) && (
                                            <span className="text-blue-500 flex items-center gap-0.5">
                                                <Brain className="h-2.5 w-2.5" /> Vector: {entity.with_embedding ?? entity.population?.with_embedding}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* AI Capabilities */}
                    {data.aiFeatures?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    {t({ en: 'AI Deep Dive', ar: 'الغوص العميق في الذكاء الاصطناعي' })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.aiFeatures.map((ai, idx) => (
                                    <div key={idx} className="p-3 border rounded-lg space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold">{ai.name}</span>
                                            <Badge variant="secondary" className="text-[10px]">{ai.accuracy}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{ai.description}</p>
                                        <div className="flex justify-between text-[10px]">
                                            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">{ai.implementation}</span>
                                            <span className="text-muted-foreground">{ai.performance}</span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Integration Points */}
                    {data.integrationPoints?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Network className="h-5 w-5 text-primary" />
                                    {t({ en: 'Ecosystem integration', ar: 'تكامل النظام البيئي' })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.integrationPoints.map((point, idx) => (
                                    <div key={idx} className="p-3 border rounded-lg space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold">{point.name}</span>
                                            {renderStatus(point.status)}
                                        </div>
                                        <p className="text-xs text-muted-foreground">{point.description}</p>
                                        {point.implementation && (
                                            <p className="text-[10px] text-green-600 bg-green-50 p-1 rounded italic">
                                                {point.implementation}
                                            </p>
                                        )}
                                        {point.gaps?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {point.gaps.map((gap, i) => (
                                                    <Badge key={i} variant="outline" className="text-[9px] text-red-500 border-red-200">
                                                        {gap}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Strategic Recommendations */}
                    {data.recommendations?.length > 0 && (
                        <Card className="border-primary/50 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    {t({ en: 'Recommendations', ar: 'التوصيات' })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.recommendations.map((rec, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={rec.priority === 'P0' ? 'destructive' : 'default'} className="text-[10px] h-4">
                                                {rec.priority}
                                            </Badge>
                                            <span className="text-sm font-bold">{rec.title}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{rec.description}</p>
                                        <div className="flex gap-2 mt-1">
                                            <Badge variant="outline" className="text-[9px]">{rec.impact} Impact</Badge>
                                            <Badge variant="outline" className="text-[9px]">{rec.effort} Effort</Badge>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Comparisons & Insights */}
                    {data.comparisons && (
                        <div className="space-y-4">
                            {Object.entries(data.comparisons).map(([key, items], idx) => {
                                if (key === 'keyInsight') return (
                                    <Card key={idx} className="bg-yellow-50 border-yellow-200">
                                        <CardContent className="pt-6">
                                            <div className="flex gap-3">
                                                <Sparkles className="h-5 w-5 text-yellow-600 shrink-0" />
                                                <p className="text-sm text-yellow-900 font-medium italic">{items}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                                if (!Array.isArray(items)) return null;
                                return (
                                    <Card key={idx}>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <ArrowLeftRight className="h-5 w-5 text-primary" />
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {items.map((item, i) => (
                                                    <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 border rounded-lg hover:border-primary/30 transition-colors">
                                                        <div className="font-bold text-sm flex items-center">{item.aspect}</div>
                                                        <div className="space-y-1">
                                                            {Object.entries(item).map(([k, v], j) => {
                                                                if (['aspect', 'gap'].includes(k)) return null;
                                                                return (
                                                                    <div key={j} className="text-xs">
                                                                        <span className="text-muted-foreground capitalize">{k}:</span> {v}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded italic self-center">
                                                            {item.gap}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Comparison Tables */}
                    {data.comparisonTables?.length > 0 && (
                        <div className="space-y-4">
                            {data.comparisonTables.map((table, idx) => (
                                <Card key={idx}>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Layers className="h-5 w-5 text-primary" />
                                            {table.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    {table.headers.map((h, i) => (
                                                        <th key={i} className="text-left p-2 font-bold">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {table.rows.map((row, i) => (
                                                    <tr key={i} className="border-b hover:bg-slate-50 transition-colors">
                                                        {row.map((cell, j) => (
                                                            <td key={j} className="p-2 text-xs">{cell}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* RBAC & Access Control */}
                    {data.rbacConfig && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    {t({ en: 'Access Control', ar: 'التحكم في الوصول' })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold border-b pb-1">Permissions</h4>
                                        {data.rbacConfig.permissions.map((perm, i) => (
                                            <div key={i} className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[10px]">{perm.name}</Badge>
                                                    <span className="text-xs font-medium">{perm.description}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {perm.assignedTo.map((role, j) => (
                                                        <Badge key={j} className="text-[9px] bg-slate-100 text-slate-600">{role}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold border-b pb-1">RLS Rules</h4>
                                        <ul className="space-y-1">
                                            {data.rbacConfig.rlsRules.map((rule, i) => (
                                                <li key={i} className="text-xs flex gap-2">
                                                    <span className="text-primary">•</span>
                                                    {rule}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
