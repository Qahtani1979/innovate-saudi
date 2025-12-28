import { useState } from 'react';
import { useMatchEngagements, useMatchEngagementMutations } from '@/hooks/useMatchmakerEngagements';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLanguage } from '../LanguageContext';
import { Calendar, MessageSquare, Video, Mail } from 'lucide-react';

export default function EngagementScheduler({ matchId }) {
    const { t, isRTL } = useLanguage();
    const [activeTab, setActiveTab] = useState('log');
    const [logData, setLogData] = useState({
        engagement_type: 'meeting',
        date_occurred: new Date().toISOString().split('T')[0],
        notes: '',
        outcomes: '',
        next_steps: '',
        sentiment: 'positive'
    });

    // Fetch existing engagements
    const { data: engagements = [] } = useMatchEngagements(matchId);

    const { logEngagement } = useMatchEngagementMutations(matchId);

    const handleLogEngagement = () => {
        logEngagement.mutate(logData, {
            onSuccess: () => {
                setLogData({
                    engagement_type: 'meeting',
                    date_occurred: new Date().toISOString().split('T')[0],
                    notes: '',
                    outcomes: '',
                    next_steps: '',
                    sentiment: 'positive'
                });
            }
        });
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'meeting': return <Video className="h-4 w-4" />;
            case 'email': return <Mail className="h-4 w-4" />;
            case 'workshop': return <Calendar className="h-4 w-4" />;
            default: return <MessageSquare className="h-4 w-4" />;
        }
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        {t({ en: 'Engagement Log & Schedule', ar: 'سجل التفاعل والجدول' })}
                    </CardTitle>
                    <Button variant="outline" size="sm">
                        {t({ en: 'Sync Calendar', ar: 'مزامنة التقويم' })}
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full mb-4">
                        <TabsTrigger value="log" className="flex-1">{t({ en: 'Log Activity', ar: 'تسجيل نشاط' })}</TabsTrigger>
                        <TabsTrigger value="history" className="flex-1">{t({ en: 'History', ar: 'السجل' })} ({engagements.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="log" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t({ en: 'Type', ar: 'النوع' })}</label>
                                <Select
                                    value={logData.engagement_type}
                                    onValueChange={(val) => setLogData(d => ({ ...d, engagement_type: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="meeting">Meeting</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="workshop">Workshop</SelectItem>
                                        <SelectItem value="site_visit">Site Visit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t({ en: 'Date', ar: 'التاريخ' })}</label>
                                <Input
                                    type="date"
                                    value={logData.date_occurred}
                                    onChange={(e) => setLogData(d => ({ ...d, date_occurred: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t({ en: 'Notes', ar: 'ملاحظات' })}</label>
                            <Textarea
                                value={logData.notes}
                                onChange={(e) => setLogData(d => ({ ...d, notes: e.target.value }))}
                                placeholder={t({ en: 'Meeting minutes, key discussion points...', ar: 'محضر الاجتماع، نقاط النقاش الرئيسية...' })}
                                className="h-24"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t({ en: 'Outcomes / Decisions', ar: 'النتائج / القرارات' })}</label>
                            <Textarea
                                value={logData.outcomes}
                                onChange={(e) => setLogData(d => ({ ...d, outcomes: e.target.value }))}
                                placeholder={t({ en: 'What was decided?', ar: 'ماذا تقرر؟' })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t({ en: 'Next Steps', ar: 'الخطوات التالية' })}</label>
                            <Input
                                value={logData.next_steps}
                                onChange={(e) => setLogData(d => ({ ...d, next_steps: e.target.value }))}
                                placeholder={t({ en: 'Action items...', ar: 'بنود العمل...' })}
                            />
                        </div>

                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleLogEngagement}
                            disabled={logEngagement.isPending}
                        >
                            {logEngagement.isPending ? t({ en: 'Saving...', ar: 'جاري الحفظ...' }) : t({ en: 'Log Engagement', ar: 'تسجيل التفاعل' })}
                        </Button>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4 max-h-[400px] overflow-y-auto">
                        {engagements.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                {t({ en: 'No engagements recorded yet.', ar: 'لم يتم تسجيل أي تفاعلات بعد.' })}
                            </div>
                        ) : (
                            <div className="relative border-l border-slate-200 ml-3 space-y-6 pl-6 py-2">
                                {engagements.map((eng) => (
                                    <div key={eng.id} className="relative">
                                        <div className="absolute -left-[31px] top-1 h-6 w-6 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center text-slate-500">
                                            {getTypeIcon(eng.engagement_type)}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-sm capitalize">{eng.engagement_type.replace('_', ' ')}</span>
                                                <span className="text-xs text-slate-500">{new Date(eng.date_occurred).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-slate-700">{eng.notes}</p>
                                            {eng.outcomes && (
                                                <div className="text-xs bg-green-50 text-green-800 p-2 rounded mt-2">
                                                    <strong>Outcome:</strong> {eng.outcomes}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
