import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, MapPin, Users, Coins, Target } from 'lucide-react';

export default function Step7Review({ formData, t, language }) {
    // Helper to safely display values
    const displayValue = (val) => val || '-';
    const displayDate = (date) => date ? new Date(date).toLocaleDateString() : '-';

    return (
        <Card className="bg-slate-50 border-slate-200">
            <CardHeader>
                <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    {t({ en: 'Review Pilot Details', ar: 'مراجعة تفاصيل التجربة' })}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">

                {/* 1. Basic Info */}
                <section className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-700">
                        <Target className="h-5 w-5" />
                        {t({ en: '1. Pilot Identity', ar: '١. هوية التجربة' })}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                        <div className="bg-white p-3 rounded border">
                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Title (EN)</span>
                            <span className="font-medium text-slate-900">{displayValue(formData.title_en)}</span>
                        </div>
                        <div className="bg-white p-3 rounded border text-right">
                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">العنوان (عربي)</span>
                            <span className="font-medium text-slate-900">{displayValue(formData.title_ar)}</span>
                        </div>
                        <div className="bg-white p-3 rounded border md:col-span-2">
                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Sector | القطاع</span>
                            <div className="flex gap-2">
                                <Badge variant="outline">{displayValue(formData.sector)}</Badge>
                                {formData.sub_sector && <Badge variant="secondary">{formData.sub_sector}</Badge>}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Location & Sandbox */}
                <section className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-700">
                        <MapPin className="h-5 w-5" />
                        {t({ en: '2. Location & Sandbox', ar: '٢. الموقع والبيئة التجريبية' })}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                        <div className="bg-white p-3 rounded border">
                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Region & City</span>
                            <span className="font-medium text-slate-900">
                                {formData.region_id ? `Region: ${formData.region_id}` : ''}
                                {formData.city_id ? `, City: ${formData.city_id}` : ''}
                            </span>
                        </div>
                        <div className="bg-white p-3 rounded border">
                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Sandbox Environment</span>
                            <span className="font-medium text-slate-900">{displayValue(formData.sandbox_id)}</span>
                        </div>
                        <div className="bg-white p-3 rounded border md:col-span-2">
                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Safety Protocols</span>
                            <ul className="list-disc list-inside text-sm text-slate-700">
                                {formData.safety_protocols?.length > 0 ? (
                                    formData.safety_protocols.map((p, i) => (
                                        <li key={i}>{typeof p === 'string' ? p : (language === 'ar' ? p.protocol_ar : p.protocol)}</li>
                                    ))
                                ) : (
                                    <li className="text-slate-400 italic">No protocols defined</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 3. Team & Stakeholders */}
                <section className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-700">
                        <Users className="h-5 w-5" />
                        {t({ en: '3. Data & Team', ar: '٣. البيانات والفريق' })}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                        <div className="bg-white p-3 rounded border">
                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Target Population</span>
                            <span className="font-medium text-slate-900">{displayValue(formData.target_population_size)} beneficiaries</span>
                        </div>
                        <div className="bg-white p-3 rounded border">
                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Team Details</span>
                            <span className="font-medium text-slate-900">
                                {formData.team_members?.length || 0} Members, {formData.stakeholders?.length || 0} Stakeholders
                            </span>
                        </div>
                    </div>
                </section>

                {/* 4. Implementation */}
                <section className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-700">
                        <Clock className="h-5 w-5" />
                        {t({ en: '4. Timeline & KPIs', ar: '٤. الجدول الزمني ومؤشرات الأداء' })}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-7">
                        <div className="bg-white p-3 rounded border">
                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Start Date</span>
                            <span className="font-medium text-slate-900">{displayDate(formData.start_date)}</span>
                        </div>
                        <div className="bg-white p-3 rounded border">
                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Duration</span>
                            <span className="font-medium text-slate-900">{displayValue(formData.duration_weeks)} Weeks</span>
                        </div>
                        <div className="bg-white p-3 rounded border">
                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Milestones</span>
                            <span className="font-medium text-slate-900">{formData.milestones?.length || 0} Defined</span>
                        </div>
                        <div className="bg-white p-3 rounded border md:col-span-3">
                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Key Performance Indicators (KPIs)</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {formData.kpis?.length > 0 ? (
                                    formData.kpis.map((k, i) => (
                                        <Badge key={i} variant="secondary">
                                            {k.name} (T: {k.target} {k.unit})
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-slate-400">No KPIs defined</span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Budget */}
                <section className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-700">
                        <Coins className="h-5 w-5" />
                        {t({ en: '5. Budget', ar: '٥. الميزانية' })}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 pl-7">
                        <div className="bg-white p-3 rounded border flex justify-between items-center">
                            <div>
                                <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Total Budget</span>
                                <span className="text-2xl font-bold text-green-700">
                                    {formData.budget ? parseInt(formData.budget).toLocaleString() : '0'}
                                    <span className="text-sm font-normal text-slate-500 ml-1">{formData.budget_currency}</span>
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Funding</span>
                                <span className="font-medium text-slate-900">
                                    {formData.funding_sources?.length || 0} Sources
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

            </CardContent>
        </Card>
    );
}
