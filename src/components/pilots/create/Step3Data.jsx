import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Step3Data({
    formData,
    setFormData,
    invokeAI,
    isAIProcessing,
    challenges,
    solutions,
    t
}) {

    // AI Logic for Team Generation
    const generateTeam = async () => {
        if (!formData.challenge_id) {
            toast.error('Please select a challenge first');
            return;
        }
        try {
            const challenge = challenges.find(c => c.id === formData.challenge_id);
            const response = await invokeAI({
                prompt: `Generate an optimal team composition for this pilot project:
Challenge: ${challenge?.title_en}
Sector: ${formData.sector}
Description: ${formData.description_en}
Solution type: ${formData.solution_id ? solutions.find(s => s.id === formData.solution_id)?.name_en : 'TBD'}

Generate 5-7 team members with realistic roles for a municipal innovation pilot. Include:
- Municipality representatives
- Technical experts
- Project management
- Domain specialists

Return as JSON array with: name (realistic Arabic name), role, organization (municipality/ministry/provider), email (format: name@org.gov.sa), responsibility`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        team: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    role: { type: "string" },
                                    organization: { type: "string" },
                                    email: { type: "string" },
                                    responsibility: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
            if (response.success) {
                setFormData(prev => ({ ...prev, team: response.data?.team }));
                toast.success('AI generated team structure');
            }
        } catch (error) {
            toast.error('Failed to generate team: ' + error.message);
        }
    };

    // AI Logic for Stakeholders
    const mapStakeholders = async () => {
        if (!formData.challenge_id) {
            toast.error('Please select a challenge first');
            return;
        }
        try {
            const challenge = challenges.find(c => c.id === formData.challenge_id);
            const response = await invokeAI({
                prompt: `Identify key stakeholders for this municipal innovation pilot:
Challenge: ${challenge?.title_en}
Sector: ${formData.sector}
Municipality: ${formData.municipality_id}
Scope: ${formData.scope || formData.description_en}

Identify 6-10 stakeholders including:
- Government entities (ministry, municipality departments)
- Community groups (affected residents, neighborhood councils)
- Private sector (utilities, service providers)
- Regulatory bodies
- Academic institutions (if relevant)

Return JSON with: name, type (government/community/private/regulatory/academic), involvement (their role/interest)`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        stakeholders: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    type: { type: "string" },
                                    involvement: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
            if (response.success) {
                setFormData(prev => ({ ...prev, stakeholders: response.data?.stakeholders }));
                toast.success('AI mapped stakeholders');
            }
        } catch (error) {
            toast.error('Failed to map stakeholders: ' + error.message);
        }
    };

    // AI Logic for Tech Stack
    const recommendTechStack = async () => {
        if (!formData.description_en) {
            toast.error('Please describe the pilot first');
            return;
        }
        try {
            const solution = solutions.find(s => s.id === formData.solution_id);
            const response = await invokeAI({
                prompt: `Recommend technology stack for this pilot:
Description: ${formData.description_en}
Solution: ${solution?.name_en || 'TBD'}
Sector: ${formData.sector}
Budget: ${formData.budget}

Recommend 8-12 technologies covering:
- Hardware (sensors, devices)
- Software (platforms, apps)
- Data & Analytics
- Communication & Networking
- Security & Compliance

Return JSON with: category, technology, version, purpose`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        technology_stack: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    category: { type: "string" },
                                    technology: { type: "string" },
                                    version: { type: "string" },
                                    purpose: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
            if (response.success) {
                setFormData(prev => ({ ...prev, technology_stack: response.data?.technology_stack }));
                toast.success('✨ AI recommended tech stack');
            }
        } catch (error) {
            toast.error('Failed: ' + error.message);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Step 3: Target Population & Data Collection | الفئة المستهدفة وجمع البيانات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Team Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Team Members | أعضاء الفريق</Label>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={generateTeam}
                                disabled={isAIProcessing || !formData.challenge_id}
                            >
                                {isAIProcessing ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                                ) : (
                                    <><Sparkles className="h-4 w-4 mr-2" /> AI Team Builder</>
                                )}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    team: [...(prev.team || []), { name: '', role: '', email: '', organization: '', responsibility: '' }]
                                }));
                            }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Member
                            </Button>
                        </div>
                    </div>
                    {formData.team?.map((member, idx) => (
                        <Card key={idx} className="p-4 bg-slate-50">
                            <div className="flex items-start gap-3">
                                <div className="flex-1 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            placeholder="Name"
                                            value={member.name || ''}
                                            onChange={(e) => {
                                                const updated = [...formData.team];
                                                updated[idx].name = e.target.value;
                                                setFormData({ ...formData, team: updated });
                                            }}
                                        />
                                        <Input
                                            placeholder="Role"
                                            value={member.role || ''}
                                            onChange={(e) => {
                                                const updated = [...formData.team];
                                                updated[idx].role = e.target.value;
                                                setFormData({ ...formData, team: updated });
                                            }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            placeholder="Email"
                                            value={member.email || ''}
                                            onChange={(e) => {
                                                const updated = [...formData.team];
                                                updated[idx].email = e.target.value;
                                                setFormData({ ...formData, team: updated });
                                            }}
                                        />
                                        <Input
                                            placeholder="Organization"
                                            value={member.organization || ''}
                                            onChange={(e) => {
                                                const updated = [...formData.team];
                                                updated[idx].organization = e.target.value;
                                                setFormData({ ...formData, team: updated });
                                            }}
                                        />
                                    </div>
                                    <Input
                                        placeholder="Responsibility"
                                        value={member.responsibility || ''}
                                        onChange={(e) => {
                                            const updated = [...formData.team];
                                            updated[idx].responsibility = e.target.value;
                                            setFormData({ ...formData, team: updated });
                                        }}
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            team: prev.team.filter((_, i) => i !== idx)
                                        }));
                                    }}
                                >
                                    <X className="h-4 w-4 text-red-600" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Stakeholders Section */}
                <div className="border-t pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Stakeholders | أصحاب المصلحة</Label>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={mapStakeholders}
                                disabled={isAIProcessing || !formData.challenge_id}
                            >
                                {isAIProcessing ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Mapping...</>
                                ) : (
                                    <><Sparkles className="h-4 w-4 mr-2" /> AI Stakeholder Map</>
                                )}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    stakeholders: [...(prev.stakeholders || []), { name: '', type: '', involvement: '' }]
                                }));
                            }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Stakeholder
                            </Button>
                        </div>
                    </div>
                    {formData.stakeholders?.map((sh, idx) => (
                        <Card key={idx} className="p-4 bg-slate-50">
                            <div className="flex items-start gap-3">
                                <div className="flex-1 grid grid-cols-3 gap-3">
                                    <Input
                                        placeholder="Name"
                                        value={sh.name || ''}
                                        onChange={(e) => {
                                            const updated = [...formData.stakeholders];
                                            updated[idx].name = e.target.value;
                                            setFormData({ ...formData, stakeholders: updated });
                                        }}
                                    />
                                    <Input
                                        placeholder="Type (e.g., Government)"
                                        value={sh.type || ''}
                                        onChange={(e) => {
                                            const updated = [...formData.stakeholders];
                                            updated[idx].type = e.target.value;
                                            setFormData({ ...formData, stakeholders: updated });
                                        }}
                                    />
                                    <Input
                                        placeholder="Involvement"
                                        value={sh.involvement || ''}
                                        onChange={(e) => {
                                            const updated = [...formData.stakeholders];
                                            updated[idx].involvement = e.target.value;
                                            setFormData({ ...formData, stakeholders: updated });
                                        }}
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            stakeholders: prev.stakeholders.filter((_, i) => i !== idx)
                                        }));
                                    }}
                                >
                                    <X className="h-4 w-4 text-red-600" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="space-y-4 pt-6 border-t">
                    <h3 className="font-semibold text-slate-900">{t({ en: 'Target Population', ar: 'الفئة المستهدفة' })}</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Population Size</Label>
                            <Input
                                type="number"
                                value={formData.target_population?.size || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    target_population: {
                                        ...(formData.target_population || {}),
                                        size: parseInt(e.target.value)
                                    }
                                })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Demographics</Label>
                            <Input
                                value={formData.target_population?.demographics || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    target_population: {
                                        ...(formData.target_population || {}),
                                        demographics: e.target.value
                                    }
                                })}
                                placeholder="Young professionals, families"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input
                                value={formData.target_population?.location || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    target_population: {
                                        ...(formData.target_population || {}),
                                        location: e.target.value
                                    }
                                })}
                                placeholder="Downtown area"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                    <h3 className="font-semibold text-slate-900">{t({ en: 'Data Collection', ar: 'جمع البيانات' })}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Methods (comma-separated)</Label>
                            <Input
                                placeholder="Surveys, Sensors, Interviews"
                                value={formData.data_collection?.methods?.join(', ') || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    data_collection: {
                                        ...(formData.data_collection || {}),
                                        methods: e.target.value.split(',').map(m => m.trim()).filter(m => m)
                                    }
                                })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Frequency</Label>
                            <Input
                                placeholder="Weekly, Monthly, Real-time"
                                value={formData.data_collection?.frequency || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    data_collection: {
                                        ...(formData.data_collection || {}),
                                        frequency: e.target.value
                                    }
                                })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tools (comma-separated)</Label>
                            <Input
                                placeholder="Google Forms, IoT Platform"
                                value={formData.data_collection?.tools?.join(', ') || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    data_collection: {
                                        ...(formData.data_collection || {}),
                                        tools: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                                    }
                                })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Responsible Party</Label>
                            <Input
                                placeholder="Team member or organization"
                                value={formData.data_collection?.responsible_party || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    data_collection: {
                                        ...(formData.data_collection || {}),
                                        responsible_party: e.target.value
                                    }
                                })}
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Technology Stack | المكدس التقني</Label>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={recommendTechStack}
                                disabled={isAIProcessing || !formData.description_en}
                            >
                                {isAIProcessing ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Recommending...</>
                                ) : (
                                    <><Sparkles className="h-4 w-4 mr-2" /> AI Tech Recommender</>
                                )}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    technology_stack: [...(prev.technology_stack || []), { category: '', technology: '', version: '', purpose: '' }]
                                }));
                            }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Tech
                            </Button>
                        </div>
                    </div>
                    {formData.technology_stack?.map((tech, idx) => (
                        <Card key={idx} className="p-4 bg-slate-50">
                            <div className="flex items-start gap-3">
                                <div className="flex-1 grid grid-cols-4 gap-3">
                                    <Input
                                        placeholder="Category"
                                        value={tech.category || ''}
                                        onChange={(e) => {
                                            const updated = [...formData.technology_stack];
                                            updated[idx].category = e.target.value;
                                            setFormData({ ...formData, technology_stack: updated });
                                        }}
                                    />
                                    <Input
                                        placeholder="Technology"
                                        value={tech.technology || ''}
                                        onChange={(e) => {
                                            const updated = [...formData.technology_stack];
                                            updated[idx].technology = e.target.value;
                                            setFormData({ ...formData, technology_stack: updated });
                                        }}
                                    />
                                    <Input
                                        placeholder="Version"
                                        value={tech.version || ''}
                                        onChange={(e) => {
                                            const updated = [...formData.technology_stack];
                                            updated[idx].version = e.target.value;
                                            setFormData({ ...formData, technology_stack: updated });
                                        }}
                                    />
                                    <Input
                                        placeholder="Purpose"
                                        value={tech.purpose || ''}
                                        onChange={(e) => {
                                            const updated = [...formData.technology_stack];
                                            updated[idx].purpose = e.target.value;
                                            setFormData({ ...formData, technology_stack: updated });
                                        }}
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            technology_stack: prev.technology_stack.filter((_, i) => i !== idx)
                                        }));
                                    }}
                                >
                                    <X className="h-4 w-4 text-red-600" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
