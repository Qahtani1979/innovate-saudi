import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Shield, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import StrategicPlanSelector from '@/components/strategy/StrategicPlanSelector';
import SolutionReadinessGate from '@/components/solutions/SolutionReadinessGate';

export default function Step1Setup({
    formData,
    setFormData,
    challenges,
    solutions,
    municipalities,
    regions,
    cities,
    livingLabs,
    sectorOptions,
    filteredSolutions,
    readinessChecked,
    setReadinessChecked,
    selectedSolutionForCheck,
    setSelectedSolutionForCheck,
    handleAISuggestions,
    isAIProcessing,
    t
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Step 1: Pre-Pilot Setup | الإعداد الأولي</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Pilot Code | رمز التجربة</Label>
                    <Input
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="PILOT-2026-001"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Related Challenge | التحدي المرتبط</Label>
                        <Select
                            value={formData.challenge_id}
                            onValueChange={(value) => {
                                const challenge = challenges.find(c => c.id === value);
                                setFormData({
                                    ...formData,
                                    challenge_id: value,
                                    sector: challenge?.sector || '',
                                    municipality_id: challenge?.municipality_id || ''
                                });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select challenge" />
                            </SelectTrigger>
                            <SelectContent>
                                {challenges.map(c => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.code} - {c.title_en}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Solution Provider | مقدم الحل</Label>
                        <Select
                            value={formData.solution_id}
                            onValueChange={(value) => {
                                setFormData({ ...formData, solution_id: value });
                                const solution = solutions.find(s => s.id === value);
                                setSelectedSolutionForCheck(solution);
                                setReadinessChecked(false);
                            }}
                            disabled={!formData.challenge_id}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={
                                    formData.challenge_id
                                        ? t({ en: 'Select solution', ar: 'اختر الحل' })
                                        : t({ en: 'Select challenge first', ar: 'اختر التحدي أولاً' })
                                } />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredSolutions.length > 0 ? (
                                    filteredSolutions.map(s => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.name_en} - {s.provider_name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>
                                        {t({ en: 'No matched solutions', ar: 'لا توجد حلول مطابقة' })}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        {formData.challenge_id && filteredSolutions.length === 0 && (
                            <p className="text-xs text-amber-600">
                                {t({ en: 'No solutions matched to this challenge. Consider running AI matching first.', ar: 'لا توجد حلول مرتبطة بهذا التحدي. جرب المطابقة الذكية أولاً.' })}
                            </p>
                        )}
                    </div>
                </div>

                {/* MANDATORY READINESS GATE */}
                {formData.solution_id && selectedSolutionForCheck && !readinessChecked && (
                    <div className="mt-6">
                        <SolutionReadinessGate
                            solution={selectedSolutionForCheck}
                            onProceed={() => {
                                setReadinessChecked(true);
                            }}
                        />
                    </div>
                )}

                {formData.solution_id && !readinessChecked && (
                    <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-lg">
                        <p className="text-sm text-amber-900 font-medium flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            {t({ en: 'Complete readiness check to proceed', ar: 'أكمل فحص الجاهزية للمتابعة' })}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Region | المنطقة</Label>
                        <Select
                            value={formData.region_id}
                            onValueChange={(value) => setFormData({ ...formData, region_id: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                            <SelectContent>
                                {regions.map(r => (
                                    <SelectItem key={r.id} value={r.id}>
                                        {r.name_en}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>City | المدينة</Label>
                        <Select
                            value={formData.city_id}
                            onValueChange={(value) => setFormData({ ...formData, city_id: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent>
                                {cities.map(c => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name_en}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Municipality | البلدية</Label>
                        <Select
                            value={formData.municipality_id}
                            onValueChange={(value) => setFormData({ ...formData, municipality_id: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select municipality" />
                            </SelectTrigger>
                            <SelectContent>
                                {municipalities.map(m => (
                                    <SelectItem key={m.id} value={m.id}>
                                        {m.name_en} | {m.name_ar}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Living Lab (Optional) | المختبر الحي</Label>
                        <Select
                            value={formData.living_lab_id || 'none'}
                            onValueChange={(value) => setFormData({ ...formData, living_lab_id: value === 'none' ? null : value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select living lab" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {livingLabs.map(lab => (
                                    <SelectItem key={lab.id} value={lab.id}>
                                        {lab.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Sector | القطاع</Label>
                        <Select
                            value={formData.sector}
                            onValueChange={(value) => setFormData({ ...formData, sector: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select sector" />
                            </SelectTrigger>
                            <SelectContent>
                                {sectorOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label} | {option.label_ar}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Strategic Alignment Section */}
                <div className="border-t pt-4 mt-4">
                    <StrategicPlanSelector
                        selectedPlanIds={formData.strategic_plan_ids || []}
                        selectedObjectiveIds={formData.strategic_objective_ids || []}
                        onPlanChange={(ids) => setFormData({ ...formData, strategic_plan_ids: ids })}
                        onObjectiveChange={(ids) => setFormData({ ...formData, strategic_objective_ids: ids })}
                        showObjectives={true}
                        label={t({ en: 'Strategic Alignment | التوافق الاستراتيجي', ar: 'التوافق الاستراتيجي' })}
                    />
                </div>

                {formData.challenge_id && formData.solution_id && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Sparkles className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">AI Auto-Design | التصميم الآلي</p>
                                    <p className="text-xs text-slate-600">Let AI suggest pilot design and KPIs</p>
                                </div>
                            </div>
                            <Button
                                onClick={handleAISuggestions}
                                disabled={isAIProcessing}
                                className="bg-gradient-to-r from-blue-600 to-teal-600"
                            >
                                {isAIProcessing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Generate
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
