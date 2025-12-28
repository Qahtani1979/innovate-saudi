import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Step5Timeline({
    formData,
    setFormData,
    invokeAI,
    isAIProcessing,
    challenges,
    solutions,
    t
}) {

    // Auto-calculate end date when start date or duration changes
    useEffect(() => {
        if (formData.start_date && formData.duration_weeks) {
            const startDate = new Date(formData.start_date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + (formData.duration_weeks * 7));
            setFormData(prev => ({
                ...prev,
                end_date: endDate.toISOString().split('T')[0]
            }));
        }
    }, [formData.start_date, formData.duration_weeks, setFormData]);

    const generateMilestones = async () => {
        if (!formData.start_date || !formData.duration_weeks) {
            toast.error(t({ en: 'Please set start date and duration first', ar: 'يرجى تحديد تاريخ البدء والمدة أولاً' }));
            return;
        }

        try {
            const challenge = challenges.find(c => c.id === formData.challenge_id);
            const solution = solutions.find(s => s.id === formData.solution_id);

            const prompt = `
        Generate project milestones for Saudi municipal pilot:
        
        Pilot: ${formData.title_en}
        Challenge: ${challenge?.title_en}
        Solution: ${solution?.name_en}
        Start Date: ${formData.start_date}
        Duration: ${formData.duration_weeks} weeks
        End Date: ${formData.end_date || 'TBD'}
        Sector: ${formData.sector}
        
        Generate 6-10 key milestones covering the pilot lifecycle:
        - Planning and preparation phase
        - Deployment and setup
        - Testing and validation
        - Data collection periods
        - Evaluation checkpoints
        - Final assessment and reporting
        
        CRITICAL: Provide SEPARATE English and Arabic content for ALL fields.
        
        For each milestone provide:
        - name: English ONLY (e.g., "Planning & Preparation")
        - name_ar: Arabic ONLY (e.g., "التخطيط والإعداد")
        - description: English ONLY (detailed description)
        - description_ar: Arabic ONLY (detailed description)
        - due_date: calculate based on start date and duration (YYYY-MM-DD format)
        - deliverables: array of English strings (2-3 items)
        - deliverables_ar: array of Arabic strings (2-3 items)
        - dependencies: array of strings (if applicable)
        
        Ensure milestones are evenly distributed across the pilot duration.
      `;

            const result = await invokeAI({
                prompt,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        milestones: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    name_ar: { type: 'string' },
                                    description: { type: 'string' },
                                    description_ar: { type: 'string' },
                                    due_date: { type: 'string' },
                                    deliverables: { type: 'array', items: { type: 'string' } },
                                    deliverables_ar: { type: 'array', items: { type: 'string' } },
                                    dependencies: { type: 'array', items: { type: 'string' } },
                                    status: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            });

            if (!result.success) {
                throw new Error('AI generation failed');
            }

            // Sort milestones by due date
            const sortedMilestones = (result.data?.milestones || []).sort((a, b) =>
                new Date(a.due_date) - new Date(b.due_date)
            );

            setFormData(prev => ({
                ...prev,
                milestones: sortedMilestones.map(m => ({ ...m, status: 'pending' }))
            }));

            toast.success(t({ en: 'Milestones generated!', ar: 'تم إنشاء المعالم!' }));
        } catch (error) {
            toast.error(t({ en: 'Failed to generate milestones', ar: 'فشل إنشاء المعالم' }));
        }
    };

    const addMilestone = () => {
        setFormData(prev => ({
            ...prev,
            milestones: [...prev.milestones, {
                name: '',
                name_ar: '',
                description: '',
                description_ar: '',
                due_date: '',
                status: 'pending',
                deliverables: [],
                deliverables_ar: [],
                dependencies: []
            }]
        }));
    };

    const removeMilestone = (index) => {
        setFormData(prev => ({
            ...prev,
            milestones: prev.milestones.filter((_, i) => i !== index)
        }));
    };

    const updateMilestone = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            milestones: prev.milestones.map((m, i) => i === index ? { ...m, [field]: value } : m)
        }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Step 5: Timeline | الجدول الزمني</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Start Date | تاريخ البدء</Label>
                        <Input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Duration (weeks) | المدة (أسابيع)</Label>
                        <Input
                            type="number"
                            min="1"
                            max="52"
                            value={formData.duration_weeks}
                            onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) || 8 })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>End Date (Auto-calculated) | تاريخ الانتهاء (تلقائي)</Label>
                        <Input
                            type="date"
                            value={formData.end_date}
                            disabled
                            className="bg-slate-50"
                        />
                    </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-900">
                    ℹ️ {t({
                        en: 'End date is automatically calculated based on start date + duration',
                        ar: 'يتم احتساب تاريخ الانتهاء تلقائياً بناءً على تاريخ البدء + المدة'
                    })}
                </div>

                <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <Label>Milestones | المعالم الرئيسية</Label>
                            <p className="text-xs text-slate-500 mt-1">
                                {t({ en: 'AI can generate milestones based on timeline', ar: 'يمكن للذكاء الاصطناعي إنشاء المعالم بناءً على الجدول الزمني' })}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={generateMilestones}
                                disabled={isAIProcessing || !formData.start_date || !formData.duration_weeks}
                                variant="outline"
                                size="sm"
                            >
                                {isAIProcessing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {t({ en: 'Generating...', ar: 'جاري الإنشاء...' })}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        {t({ en: 'Generate with AI', ar: 'إنشاء بالذكاء الاصطناعي' })}
                                    </>
                                )}
                            </Button>
                            <Button onClick={addMilestone} size="sm" variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                {t({ en: 'Add Manual', ar: 'إضافة يدوية' })}
                            </Button>
                        </div>
                    </div>

                    {formData.milestones.length > 0 ? (
                        <div className="space-y-3">
                            {formData.milestones
                                .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                                .map((milestone, index) => (
                                    <Card key={index} className="p-4 bg-slate-50">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1 space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Input
                                                        placeholder={t({ en: 'Milestone name (English)', ar: 'اسم المعلم (إنجليزي)' })}
                                                        value={milestone.name}
                                                        onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                                                    />
                                                    <Input
                                                        placeholder={t({ en: 'اسم المعلم (عربي)', ar: 'Milestone name (Arabic)' })}
                                                        value={milestone.name_ar || ''}
                                                        onChange={(e) => updateMilestone(index, 'name_ar', e.target.value)}
                                                        dir="rtl"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Textarea
                                                        placeholder={t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}
                                                        value={milestone.description || ''}
                                                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                                                        rows={2}
                                                    />
                                                    <Textarea
                                                        placeholder={t({ en: 'الوصف (عربي)', ar: 'Description (Arabic)' })}
                                                        value={milestone.description_ar || ''}
                                                        onChange={(e) => updateMilestone(index, 'description_ar', e.target.value)}
                                                        rows={2}
                                                        dir="rtl"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <Input
                                                        type="date"
                                                        value={milestone.due_date}
                                                        onChange={(e) => updateMilestone(index, 'due_date', e.target.value)}
                                                    />
                                                    <Input
                                                        placeholder={t({ en: 'Deliverables (EN, comma-sep)', ar: 'المخرجات (إنجليزي)' })}
                                                        value={milestone.deliverables?.join(', ') || ''}
                                                        onChange={(e) => updateMilestone(index, 'deliverables', e.target.value.split(',').map(d => d.trim()).filter(d => d))}
                                                    />
                                                    <Input
                                                        placeholder={t({ en: 'المخرجات (عربي، بفاصلة)', ar: 'Deliverables (AR, comma-sep)' })}
                                                        value={milestone.deliverables_ar?.join(', ') || ''}
                                                        onChange={(e) => updateMilestone(index, 'deliverables_ar', e.target.value.split(',').map(d => d.trim()).filter(d => d))}
                                                        dir="rtl"
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeMilestone(index)}
                                                className="hover:bg-red-50"
                                            >
                                                <X className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                        </div>
                    ) : (
                        <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-center">
                            <p className="text-sm text-slate-600">
                                {t({
                                    en: 'No milestones added yet. Generate with AI or add manually.',
                                    ar: 'لم تتم إضافة معالم بعد. قم بالإنشاء بالذكاء الاصطناعي أو أضف يدوياً.'
                                })}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
