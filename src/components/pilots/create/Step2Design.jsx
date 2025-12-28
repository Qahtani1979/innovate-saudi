import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from 'lucide-react';

export default function Step2Design({
    formData,
    setFormData,
    t
}) {
    const addKPI = () => {
        setFormData(prev => ({
            ...prev,
            kpis: [...prev.kpis, { name: '', baseline: '', target: '', unit: '', frequency: 'weekly' }]
        }));
    };

    const removeKPI = (index) => {
        setFormData(prev => ({
            ...prev,
            kpis: prev.kpis.filter((_, i) => i !== index)
        }));
    };

    const updateKPI = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            kpis: prev.kpis.map((kpi, i) => i === index ? { ...kpi, [field]: value } : kpi)
        }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Step 2: Design & KPIs | التصميم ومؤشرات الأداء</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Pilot Title (English) <span className="text-xs text-muted-foreground">(max 200)</span></Label>
                        <Input
                            value={formData.title_en}
                            onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                            placeholder="Smart Drainage Monitoring Pilot"
                            maxLength={200}
                        />
                        <span className="text-xs text-muted-foreground">{formData.title_en?.length || 0}/200</span>
                    </div>
                    <div className="space-y-2">
                        <Label>عنوان التجربة (عربي) <span className="text-xs text-muted-foreground">(max 200)</span></Label>
                        <Input
                            value={formData.title_ar}
                            onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                            placeholder="تجربة مراقبة التصريف الذكي"
                            dir="rtl"
                            maxLength={200}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Tagline (English) <span className="text-xs text-muted-foreground">(max 150)</span></Label>
                        <Input
                            value={formData.tagline_en}
                            onChange={(e) => setFormData({ ...formData, tagline_en: e.target.value })}
                            placeholder="Brief one-liner description"
                            maxLength={150}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>الشعار (عربي) <span className="text-xs text-muted-foreground">(max 150)</span></Label>
                        <Input
                            value={formData.tagline_ar}
                            onChange={(e) => setFormData({ ...formData, tagline_ar: e.target.value })}
                            placeholder="وصف مختصر"
                            dir="rtl"
                            maxLength={150}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Description (English) <span className="text-xs text-muted-foreground">(max 2000)</span></Label>
                    <Textarea
                        value={formData.description_en}
                        onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                        placeholder="Detailed pilot approach and methodology..."
                        rows={4}
                        maxLength={2000}
                    />
                    <span className="text-xs text-muted-foreground">{formData.description_en?.length || 0}/2000</span>
                </div>

                <div className="space-y-2">
                    <Label>الوصف (عربي) <span className="text-xs text-muted-foreground">(max 2000)</span></Label>
                    <Textarea
                        value={formData.description_ar}
                        onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                        placeholder="نهج التجربة التفصيلي والمنهجية..."
                        rows={4}
                        dir="rtl"
                        maxLength={2000}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Objective (English) <span className="text-xs text-muted-foreground">(max 1000)</span></Label>
                    <Textarea
                        value={formData.objective_en}
                        onChange={(e) => setFormData({ ...formData, objective_en: e.target.value })}
                        placeholder="What this pilot aims to achieve..."
                        rows={2}
                        maxLength={1000}
                    />
                </div>

                <div className="space-y-2">
                    <Label>الهدف (عربي) <span className="text-xs text-muted-foreground">(max 1000)</span></Label>
                    <Textarea
                        value={formData.objective_ar}
                        onChange={(e) => setFormData({ ...formData, objective_ar: e.target.value })}
                        placeholder="ما تهدف هذه التجربة إلى تحقيقه..."
                        rows={2}
                        dir="rtl"
                        maxLength={1000}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Sub-Sector | القطاع الفرعي <span className="text-xs text-muted-foreground">(max 100)</span></Label>
                    <Input
                        value={formData.sub_sector}
                        onChange={(e) => setFormData({ ...formData, sub_sector: e.target.value })}
                        placeholder="e.g., Public Parks, Road Safety"
                        maxLength={100}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Key Performance Indicators | مؤشرات الأداء الرئيسية</Label>
                        <Button onClick={addKPI} size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Add KPI
                        </Button>
                    </div>

                    {formData.kpis.map((kpi, index) => (
                        <Card key={index} className="p-4 bg-slate-50">
                            <div className="flex items-start gap-3">
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                    <Input
                                        placeholder="KPI Name"
                                        value={kpi.name}
                                        onChange={(e) => updateKPI(index, 'name', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Unit (e.g., complaints/month)"
                                        value={kpi.unit}
                                        onChange={(e) => updateKPI(index, 'unit', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Baseline value"
                                        value={kpi.baseline}
                                        onChange={(e) => updateKPI(index, 'baseline', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Target value"
                                        value={kpi.target}
                                        onChange={(e) => updateKPI(index, 'target', e.target.value)}
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeKPI(index)}
                                    className="hover:bg-red-50"
                                >
                                    <X className="h-4 w-4 text-red-600" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="border-t pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Success Criteria | معايير النجاح</Label>
                        <Button size="sm" variant="outline" onClick={() => {
                            setFormData(prev => ({
                                ...prev,
                                success_criteria: [...(prev.success_criteria || []), { criterion: '', threshold: '', met: false }]
                            }));
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Criterion
                        </Button>
                    </div>
                    {formData.success_criteria?.map((sc, idx) => (
                        <Card key={idx} className="p-4 bg-slate-50">
                            <div className="flex items-start gap-3">
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                    <Input
                                        placeholder="Success criterion"
                                        value={sc.criterion || ''}
                                        onChange={(e) => {
                                            const updated = [...formData.success_criteria];
                                            updated[idx].criterion = e.target.value;
                                            setFormData({ ...formData, success_criteria: updated });
                                        }}
                                    />
                                    <Input
                                        placeholder="Threshold"
                                        value={sc.threshold || ''}
                                        onChange={(e) => {
                                            const updated = [...formData.success_criteria];
                                            updated[idx].threshold = e.target.value;
                                            setFormData({ ...formData, success_criteria: updated });
                                        }}
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            success_criteria: prev.success_criteria.filter((_, i) => i !== idx)
                                        }));
                                    }}
                                >
                                    <X className="h-4 w-4 text-red-600" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="space-y-2">
                        <Label>TRL Start | المستوى التقني الأولي</Label>
                        <Input
                            type="number"
                            min="1"
                            max="9"
                            value={formData.trl_start}
                            onChange={(e) => setFormData({ ...formData, trl_start: parseInt(e.target.value) || 1 })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Expected Risk | المخاطر المتوقعة</Label>
                        <select
                            className="w-full p-2 border rounded-md"
                            value={formData.risk_level}
                            onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
                        >
                            <option value="low">Low | منخفض</option>
                            <option value="medium">Medium | متوسط</option>
                            <option value="high">High | عالٍ</option>
                        </select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
