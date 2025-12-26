import { useState } from 'react';

import { useMatchmakerProposalMutations } from '@/hooks/useMatchmakerProposalMutations';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, ChevronRight, ChevronLeft, Save, Send, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
    { id: 'basics', title: { en: 'Executive Summary', ar: 'الملخص التنفيذي' } },
    { id: 'plan', title: { en: 'Implementation Plan', ar: 'خطة التنفيذ' } },
    { id: 'resources', title: { en: 'Resources & Budget', ar: 'الموارد والميزانية' } },
    { id: 'review', title: { en: 'Review & Submit', ar: 'المراجعة والإرسال' } }
];

export default function SolutionProposalWizard({ match, applicationId, challengeId, onComplete }) {
    const { t, isRTL } = useLanguage();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        title: '',
        executive_summary: '',
        implementation_plan: '',
        resource_requirements: '',
        timeline_weeks: '',
        budget_estimate: ''
    });



    const { createProposal } = useMatchmakerProposalMutations();

    const handleCreateProposal = (status) => {
        createProposal.mutate({
            matchId: match.id,
            applicationId,
            challengeId,
            formData,
            status
        }, {
            onSuccess: (data) => {
                if (status === 'submitted' && onComplete) {
                    onComplete(data);
                }
            }
        });
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Basics
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="space-y-2">
                            <Label>{t({ en: 'Proposal Title', ar: 'عنوان العرض' })}</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder={t({ en: 'e.g., Smart Waste Optimization Pilot', ar: 'مثال: تجربة تحسين إدارة النفايات الذكية' })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t({ en: 'Executive Summary', ar: 'الملخص التنفيذي' })}</Label>
                            <Textarea
                                value={formData.executive_summary}
                                onChange={(e) => handleInputChange('executive_summary', e.target.value)}
                                placeholder={t({ en: 'Briefly describe your proposed solution...', ar: 'صف باختصار الحل المقترح...' })}
                                className="h-32"
                            />
                        </div>
                    </div>
                );
            case 1: // Plan
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="space-y-2">
                            <Label>{t({ en: 'Implementation Plan', ar: 'خطة التنفيذ' })}</Label>
                            <Textarea
                                value={formData.implementation_plan}
                                onChange={(e) => handleInputChange('implementation_plan', e.target.value)}
                                placeholder={t({ en: 'Describe the steps, milestones, and deliverables...', ar: 'صف الخطوات والمعالم والتسليمات...' })}
                                className="h-48"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t({ en: 'Estimated Timeline (Weeks)', ar: 'الجدول الزمني المقدر (أسابيع)' })}</Label>
                            <Input
                                type="number"
                                value={formData.timeline_weeks}
                                onChange={(e) => handleInputChange('timeline_weeks', e.target.value)}
                                placeholder="e.g., 12"
                            />
                        </div>
                    </div>
                );
            case 2: // Resources
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="space-y-2">
                            <Label>{t({ en: 'Resource Requirements', ar: 'متطلبات الموارد' })}</Label>
                            <Textarea
                                value={formData.resource_requirements}
                                onChange={(e) => handleInputChange('resource_requirements', e.target.value)}
                                placeholder={t({ en: 'What do you need from the municipality? (Data, access, permits...)', ar: 'ماذا تحتاج من الأمانة؟ (بيانات، وصول، تصاريح...)' })}
                                className="h-32"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t({ en: 'Budget Estimate (SAR)', ar: 'تقدير الميزانية (ريال سعودي)' })}</Label>
                            <Input
                                type="number"
                                value={formData.budget_estimate}
                                onChange={(e) => handleInputChange('budget_estimate', e.target.value)}
                                placeholder="e.g., 50000"
                            />
                        </div>
                    </div>
                );
            case 3: // Review
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-slate-50 p-4 rounded-lg border space-y-3 text-sm">
                            <div>
                                <strong className="text-slate-900 block">{t({ en: 'Title', ar: 'العنوان' })}</strong>
                                <span className="text-slate-600">{formData.title || '-'}</span>
                            </div>
                            <div>
                                <strong className="text-slate-900 block">{t({ en: 'Summary', ar: 'الملخص' })}</strong>
                                <span className="text-slate-600 line-clamp-2">{formData.executive_summary || '-'}</span>
                            </div>
                            <div className="flex gap-4">
                                <div>
                                    <strong className="text-slate-900 block">{t({ en: 'Timeline', ar: 'المدة' })}</strong>
                                    <span className="text-slate-600">{formData.timeline_weeks} {t({ en: 'weeks', ar: 'أسابيع' })}</span>
                                </div>
                                <div>
                                    <strong className="text-slate-900 block">{t({ en: 'Budget', ar: 'الميزانية' })}</strong>
                                    <span className="text-slate-600">{formData.budget_estimate} SAR</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-800 rounded text-sm border border-yellow-100">
                            <FileText className="h-4 w-4" />
                            {t({ en: 'This proposal will be sent to the municipality for review.', ar: 'سيتم إرسال هذا العرض إلى الأمانة للمراجعة.' })}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto border-t-4 border-t-purple-600">
            <CardHeader>
                <div className="flex justify-between items-center mb-2">
                    <Badge variant="outline">{t({ en: 'New Proposal', ar: 'عرض جديد' })}</Badge>
                    <span className="text-xs text-slate-500">{t({ en: `Step ${currentStep + 1} of ${STEPS.length}`, ar: `خطوة ${currentStep + 1} من ${STEPS.length}` })}</span>
                </div>
                <CardTitle>{t(STEPS[currentStep].title)}</CardTitle>
                <CardDescription>
                    {t({ en: 'Create a proposal for the accepted match', ar: 'إنشاء عرض للمطابقة المقبولة' })}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Progress value={((currentStep + 1) / STEPS.length) * 100} className="mb-6 h-2" />

                <div className="min-h-[300px]">
                    {renderStepContent()}
                </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t pt-6">
                <Button
                    variant="ghost"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {t({ en: 'Back', ar: 'رجوع' })}
                </Button>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleCreateProposal('draft')}
                        disabled={createProposal.isPending}
                    >
                        {createProposal.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        {t({ en: 'Save Draft', ar: 'حفظ مسودة' })}
                    </Button>

                    {currentStep === STEPS.length - 1 ? (
                        <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => handleCreateProposal('submitted')}
                            disabled={createProposal.isPending}
                        >
                            {createProposal.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                            {t({ en: 'Submit Proposal', ar: 'إرسال العرض' })}
                        </Button>
                    ) : (
                        <Button onClick={nextStep}>
                            {t({ en: 'Next', ar: 'التالي' })}
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
