import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, MapPin, Loader2, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Step4Sandbox({
    formData,
    setFormData,
    sandboxes,
    filteredSandboxes,
    invokeAI,
    isAIProcessing,
    challenges,
    solutions,
    t
}) {

    const generateSafetyChecklist = async () => {
        try {
            const challenge = challenges.find(c => c.id === formData.challenge_id);
            const solution = solutions.find(s => s.id === formData.solution_id);
            const sandbox = sandboxes.find(sb => sb.id === formData.sandbox_id);

            const prompt = `
        Generate comprehensive safety checklist for Saudi municipal pilot project:
        
        Pilot: ${formData.title_en}
        Challenge: ${challenge?.title_en}
        Solution: ${solution?.name_en}
        Sector: ${formData.sector}
        Sandbox: ${sandbox?.name || 'General deployment'}
        Location: ${formData.sandbox_zone}
        Duration: ${formData.duration_weeks} weeks
        
        Generate detailed safety protocols covering:
        1. Public safety measures
        2. Data privacy and cybersecurity compliance
        3. Emergency response protocols
        4. Environmental safety considerations
        5. Regulatory compliance requirements
        6. Risk mitigation procedures
        7. Communication and transparency measures
        8. Monitoring and reporting requirements
        
        Return 8-12 specific, actionable safety protocol items in bilingual format (AR + EN).
      `;

            const result = await invokeAI({
                prompt,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        safety_protocols: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    item_en: { type: 'string' },
                                    item_ar: { type: 'string' },
                                    category: { type: 'string' },
                                    priority: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            });

            if (!result.success) {
                throw new Error('AI generation failed');
            }

            setFormData(prev => ({
                ...prev,
                safety_protocols: result.data?.safety_protocols || []
            }));

            toast.success(t({ en: 'Safety checklist generated!', ar: 'تم إنشاء قائمة السلامة!' }));
        } catch (error) {
            toast.error(t({ en: 'Failed to generate checklist', ar: 'فشل إنشاء القائمة' }));
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Step 4: Sandbox & Compliance | منطقة الاختبار والامتثال
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Select Sandbox (Optional) | اختر منطقة الاختبار (اختياري)</Label>
                    <Select
                        value={formData.sandbox_id}
                        onValueChange={(value) => {
                            const sandbox = sandboxes.find(sb => sb.id === value);
                            setFormData({
                                ...formData,
                                sandbox_id: value,
                                sandbox_zone: sandbox?.name || ''
                            });
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t({ en: 'Select sandbox zone (optional)', ar: 'اختر منطقة الاختبار (اختياري)' })} />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredSandboxes.length > 0 ? (
                                filteredSandboxes.map(sb => (
                                    <SelectItem key={sb.id} value={sb.id}>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-3 w-3" />
                                            <span>{sb.name} ({sb.location}) - Capacity: {sb.current_projects || 0}/{sb.max_capacity || 10}</span>
                                        </div>
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="none" disabled>
                                    {t({ en: 'No matching sandboxes available', ar: 'لا توجد مناطق اختبار متاحة' })}
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Sandbox Zone/Location | الموقع المحدد</Label>
                    <Input
                        value={formData.sandbox_zone}
                        onChange={(e) => setFormData({ ...formData, sandbox_zone: e.target.value })}
                        placeholder="e.g., Downtown District A, King Fahd Road Area"
                    />
                </div>

                <div className="space-y-3">
                    <Label>Regulatory Exemptions Needed | الاستثناءات التنظيمية المطلوبة</Label>
                    <Textarea
                        value={formData.regulatory_exemptions.join('\n')}
                        onChange={(e) => setFormData({
                            ...formData,
                            regulatory_exemptions: e.target.value.split('\n').filter(l => l.trim())
                        })}
                        placeholder={t({
                            en: 'List any regulatory exemptions or special approvals needed (one per line)...',
                            ar: 'اذكر أي استثناءات تنظيمية أو موافقات خاصة مطلوبة (واحدة في كل سطر)...'
                        })}
                        rows={3}
                    />
                </div>

                <div className="border-t pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Safety Protocols | بروتوكولات السلامة</Label>
                        <Button
                            onClick={generateSafetyChecklist}
                            disabled={isAIProcessing || !formData.challenge_id}
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
                                    {t({ en: 'Generate Checklist', ar: 'إنشاء القائمة' })}
                                </>
                            )}
                        </Button>
                    </div>

                    {formData.safety_protocols && formData.safety_protocols.length > 0 && (
                        <div className="space-y-2">
                            {formData.safety_protocols.map((protocol, idx) => (
                                <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-green-900">
                                                {typeof protocol === 'string' ? protocol : protocol.item_en}
                                            </p>
                                            {typeof protocol === 'object' && protocol.item_ar && (
                                                <p className="text-sm text-green-800 mt-1" dir="rtl">{protocol.item_ar}</p>
                                            )}
                                            {typeof protocol === 'object' && protocol.category && (
                                                <Badge variant="outline" className="mt-2 text-xs">{protocol.category}</Badge>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    safety_protocols: prev.safety_protocols.filter((_, i) => i !== idx)
                                                }));
                                            }}
                                        >
                                            <X className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
