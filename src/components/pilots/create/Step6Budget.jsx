import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, X, Loader2, Sparkles } from 'lucide-react';
import FileUploader from '@/components/FileUploader';
import { toast } from 'sonner';

export default function Step6Budget({
    formData,
    setFormData,
    invokeAI,
    isAIProcessing,
    t
}) {

    const optimizeBudget = async () => {
        if (!formData.budget || !formData.description_en) {
            toast.error('Please set total budget and describe the pilot first');
            return;
        }
        try {
            const response = await invokeAI({
                prompt: `Optimize budget allocation for this pilot:
Total Budget: ${formData.budget} ${formData.budget_currency}
Description: ${formData.description_en}
Duration: ${formData.duration_weeks} weeks
Sector: ${formData.sector}
Technology: ${formData.technology_stack?.map(t => t.technology).join(', ') || 'TBD'}

Create a realistic budget breakdown across categories:
- Technology & Equipment (hardware, software, licenses)
- Personnel & Consultants
- Operations & Maintenance
- Data Collection & Analysis
- Training & Capacity Building
- Marketing & Communication
- Contingency (10-15%)

Ensure total equals ${formData.budget}. Return JSON array with: category, amount, description`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        budget_breakdown: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    category: { type: "string" },
                                    amount: { type: "number" },
                                    description: { type: "string" }
                                }
                            }
                        },
                        funding_sources: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    source: { type: "string" },
                                    amount: { type: "number" },
                                    confirmed: { type: "boolean" }
                                }
                            }
                        }
                    }
                }
            });
            if (response.success) {
                setFormData(prev => ({
                    ...prev,
                    budget_breakdown: response.data?.budget_breakdown,
                    funding_sources: response.data?.funding_sources
                }));
                toast.success('AI optimized budget allocation');
            }
        } catch (error) {
            toast.error('Failed to optimize budget: ' + error.message);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Step 6: Budget & Media | الميزانية والوسائط</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Total Budget | إجمالي الميزانية</Label>
                        <Input
                            type="number"
                            value={formData.budget}
                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                            placeholder="500000"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Currency | العملة</Label>
                        <Select
                            value={formData.budget_currency}
                            onValueChange={(value) => setFormData({ ...formData, budget_currency: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SAR">SAR (ريال سعودي)</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {formData.budget && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-900 mb-2">Budget Breakdown | تفصيل الميزانية</p>
                        <div className="space-y-2 text-sm text-slate-700">
                            <div className="flex justify-between">
                                <span>Vendor cost:</span>
                                <span className="font-medium">{(formData.budget * 0.6).toLocaleString()} {formData.budget_currency}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Municipality cost:</span>
                                <span className="font-medium">{(formData.budget * 0.3).toLocaleString()} {formData.budget_currency}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Contingency (10%):</span>
                                <span className="font-medium">{(formData.budget * 0.1).toLocaleString()} {formData.budget_currency}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="border-t pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900">{t({ en: 'Budget Details', ar: 'تفاصيل الميزانية' })}</h3>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={optimizeBudget}
                            disabled={isAIProcessing || !formData.budget}
                        >
                            {isAIProcessing ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Optimizing...</>
                            ) : (
                                <><Sparkles className="h-4 w-4 mr-2" /> AI Budget Optimizer</>
                            )}
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Budget Breakdown | تفاصيل الميزانية</Label>
                            <Button size="sm" variant="outline" onClick={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    budget_breakdown: [...(prev.budget_breakdown || []), { category: '', amount: 0, description: '' }]
                                }));
                            }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </div>
                        {formData.budget_breakdown?.map((item, idx) => (
                            <Card key={idx} className="p-3 bg-slate-50">
                                <div className="flex items-start gap-3">
                                    <div className="flex-1 grid grid-cols-3 gap-3">
                                        <Input
                                            placeholder="Category"
                                            value={item.category || ''}
                                            onChange={(e) => {
                                                const updated = [...formData.budget_breakdown];
                                                updated[idx].category = e.target.value;
                                                setFormData({ ...formData, budget_breakdown: updated });
                                            }}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Amount"
                                            value={item.amount || ''}
                                            onChange={(e) => {
                                                const updated = [...formData.budget_breakdown];
                                                updated[idx].amount = parseFloat(e.target.value);
                                                setFormData({ ...formData, budget_breakdown: updated });
                                            }}
                                        />
                                        <Input
                                            placeholder="Description"
                                            value={item.description || ''}
                                            onChange={(e) => {
                                                const updated = [...formData.budget_breakdown];
                                                updated[idx].description = e.target.value;
                                                setFormData({ ...formData, budget_breakdown: updated });
                                            }}
                                        />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            budget_breakdown: prev.budget_breakdown.filter((_, i) => i !== idx)
                                        }));
                                    }}>
                                        <X className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Funding Sources | مصادر التمويل</Label>
                            <Button size="sm" variant="outline" onClick={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    funding_sources: [...(prev.funding_sources || []), { source: '', amount: 0, confirmed: false }]
                                }));
                            }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Source
                            </Button>
                        </div>
                        {formData.funding_sources?.map((fs, idx) => (
                            <Card key={idx} className="p-3 bg-slate-50">
                                <div className="flex items-start gap-3">
                                    <div className="flex-1 grid grid-cols-3 gap-3">
                                        <Input
                                            placeholder="Source"
                                            value={fs.source || ''}
                                            onChange={(e) => {
                                                const updated = [...formData.funding_sources];
                                                updated[idx].source = e.target.value;
                                                setFormData({ ...formData, funding_sources: updated });
                                            }}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Amount"
                                            value={fs.amount || ''}
                                            onChange={(e) => {
                                                const updated = [...formData.funding_sources];
                                                updated[idx].amount = parseFloat(e.target.value);
                                                setFormData({ ...formData, funding_sources: updated });
                                            }}
                                        />
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={fs.confirmed || false}
                                                onChange={(e) => {
                                                    const updated = [...formData.funding_sources];
                                                    updated[idx].confirmed = e.target.checked;
                                                    setFormData({ ...formData, funding_sources: updated });
                                                }}
                                                className="rounded"
                                            />
                                            <span className="text-sm">Confirmed</span>
                                        </label>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            funding_sources: prev.funding_sources.filter((_, i) => i !== idx)
                                        }));
                                    }}>
                                        <X className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                    <h3 className="font-semibold text-slate-900">{t({ en: 'Pilot Media', ar: 'وسائط التجربة' })}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t({ en: 'Pilot Image', ar: 'صورة التجربة' })}</Label>
                            <FileUploader
                                type="image"
                                label={t({ en: 'Upload Image', ar: 'رفع صورة' })}
                                maxSize={10}
                                enableImageSearch={true}
                                searchContext={formData.title_en || formData.description_en?.substring(0, 100)}
                                onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t({ en: 'Pilot Video', ar: 'فيديو التجربة' })}</Label>
                            <FileUploader
                                type="video"
                                label={t({ en: 'Upload Video', ar: 'رفع فيديو' })}
                                maxSize={200}
                                preview={false}
                                onUploadComplete={(url) => setFormData({ ...formData, video_url: url })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{t({ en: 'Gallery Images', ar: 'معرض الصور' })}</Label>
                        <FileUploader
                            type="image"
                            label={t({ en: 'Add to Gallery', ar: 'إضافة للمعرض' })}
                            maxSize={10}
                            onUploadComplete={(url) => {
                                setFormData(prev => ({
                                    ...prev,
                                    gallery_urls: [...(prev.gallery_urls || []), url]
                                }));
                            }}
                        />
                        {formData.gallery_urls?.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mt-2">
                                {formData.gallery_urls.map((url, idx) => (
                                    <div key={idx} className="relative group">
                                        <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 h-6 w-6"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    gallery_urls: prev.gallery_urls.filter((_, i) => i !== idx)
                                                }));
                                            }}
                                        >
                                            <X className="h-3 w-3 text-white" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Tags (comma separated) | الوسوم</Label>
                        <Input
                            value={formData.tags?.join(', ') || ''}
                            onChange={(e) => setFormData({
                                ...formData,
                                tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                            })}
                            placeholder="smart city, IoT, sustainability"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_published || false}
                                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                className="rounded"
                            />
                            <span className="text-sm">Published</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_flagship || false}
                                onChange={(e) => setFormData({ ...formData, is_flagship: e.target.checked })}
                                className="rounded"
                            />
                            <span className="text-sm">Flagship</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_archived || false}
                                onChange={(e) => setFormData({ ...formData, is_archived: e.target.checked })}
                                className="rounded"
                            />
                            <span className="text-sm">Archived</span>
                        </label>
                    </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                    <h3 className="font-semibold text-slate-900">{t({ en: 'Supporting Documents', ar: 'الوثائق الداعمة' })}</h3>
                    <p className="text-sm text-slate-600">
                        {t({
                            en: 'Upload proposals, technical specs, contracts, or other relevant documents',
                            ar: 'رفع المقترحات، المواصفات الفنية، العقود، أو الوثائق الأخرى ذات الصلة'
                        })}
                    </p>

                    <div className="space-y-3">
                        <FileUploader
                            type="document"
                            label={t({ en: 'Upload Document', ar: 'رفع وثيقة' })}
                            maxSize={50}
                            preview={false}
                            onUploadComplete={(url) => {
                                setFormData(prev => ({
                                    ...prev,
                                    documents: [...(prev.documents || []), {
                                        name: 'Document ' + ((prev.documents?.length || 0) + 1),
                                        url: url,
                                        type: 'application/pdf',
                                        uploaded_date: new Date().toISOString()
                                    }]
                                }));
                            }}
                        />

                        {formData.documents && formData.documents.length > 0 && (
                            <div className="space-y-2 mt-4">
                                <Label>{t({ en: 'Uploaded Documents', ar: 'الوثائق المرفوعة' })}</Label>
                                {formData.documents.map((doc, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div>
                                            <Input
                                                placeholder={t({ en: 'Document name', ar: 'اسم الوثيقة' })}
                                                value={doc.name}
                                                onChange={(e) => {
                                                    const updated = [...formData.documents];
                                                    updated[idx].name = e.target.value;
                                                    setFormData({ ...formData, documents: updated });
                                                }}
                                                className="mb-1"
                                            />
                                            <p className="text-xs text-slate-500">{new Date(doc.uploaded_date).toLocaleDateString()}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    documents: prev.documents.filter((_, i) => i !== idx)
                                                }));
                                            }}
                                        >
                                            <X className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
