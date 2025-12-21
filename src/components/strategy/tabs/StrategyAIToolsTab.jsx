import React from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Sparkles, Brain, ArrowRight } from 'lucide-react';
import StrategicNarrativeGenerator from '@/components/strategy/StrategicNarrativeGenerator';
import StrategicGapProgramRecommender from '@/components/strategy/StrategicGapProgramRecommender';
import WhatIfSimulator from '@/components/strategy/WhatIfSimulator';
import BottleneckDetector from '@/components/strategy/BottleneckDetector';
import { aiAssistants } from '@/config/strategyHubTools';

export default function StrategyAIToolsTab({
    activeAITool,
    setActiveAITool,
    activePlanId,
    onProgramCreated
}) {
    const { t } = useLanguage();

    // Render AI Tool Component
    const renderAITool = () => {
        switch (activeAITool) {
            case 'narrative':
                return <StrategicNarrativeGenerator planId={activePlanId || ''} />;
            case 'gap':
                return (
                    <StrategicGapProgramRecommender
                        strategicPlanId={activePlanId || ''}
                        onProgramCreated={onProgramCreated}
                    />
                );
            case 'whatif':
                // Passing empty object for currentState as it is required by type but unused in component
                return <WhatIfSimulator currentState={{}} />;
            case 'bottleneck':
                return <BottleneckDetector />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {activeAITool ? (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{t(aiAssistants.find(a => a.key === activeAITool)?.label || { en: 'AI Tool', ar: 'أداة الذكاء' })}</CardTitle>
                        <Button variant="outline" size="sm" onClick={() => setActiveAITool(null)}>
                            {t({ en: 'Back to Tools', ar: 'العودة للأدوات' })}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {renderAITool()}
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid md:grid-cols-2 gap-4">
                        {aiAssistants.map(ai => {
                            const Icon = ai.icon;
                            return (
                                <Card key={ai.key} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setActiveAITool(ai.key)}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{t(ai.label)}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">{t(ai.desc)}</p>
                                                <Button size="sm" className="mt-3">
                                                    <Sparkles className="h-3 w-3 mr-1" />
                                                    {t({ en: 'Launch', ar: 'إطلاق' })}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t({ en: 'AI-Powered Analysis', ar: 'التحليل بالذكاء الاصطناعي' })}</CardTitle>
                            <CardDescription>
                                {t({ en: 'Advanced strategic analysis powered by AI', ar: 'تحليل استراتيجي متقدم مدعوم بالذكاء الاصطناعي' })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-3 flex-wrap">
                            <Button variant="outline" asChild>
                                <Link to="/strategy-review-page">
                                    {t({ en: 'Strategy Review', ar: 'مراجعة الاستراتيجية' })}
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link to="/strategy-alignment">
                                    {t({ en: 'Alignment Analysis', ar: 'تحليل المواءمة' })}
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link to="/strategy-copilot-chat">
                                    <Brain className="h-4 w-4 mr-2" />
                                    {t({ en: 'Strategy Copilot', ar: 'مساعد الاستراتيجية' })}
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
