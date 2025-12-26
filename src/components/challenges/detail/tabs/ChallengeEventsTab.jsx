import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '@/components/LanguageContext';
import { useChallengeLinkedEvents } from '@/hooks/useChallengeLinkedData';

export default function ChallengeEventsTab({ challenge }) {
    const { t } = useLanguage();
    const challengeId = challenge?.id;

    const { events, isLoading } = useChallengeLinkedEvents(challengeId);

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading events...</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-green-600" />
                        {t({ en: 'Related Events & Milestones', ar: 'الفعاليات والمعالم' })}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {events.length > 0 ? (
                        <div className="space-y-3">
                            {events.map((event) => (
                                <div key={event.id} className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900">{event.title || event.name}</p>
                                            <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                                {event.event_date && (
                                                    <span>📅 {new Date(event.event_date).toLocaleDateString()}</span>
                                                )}
                                                {event.location && <span>📍 {event.location}</span>}
                                            </div>
                                        </div>
                                        {event.event_type && (
                                            <Badge variant="outline" className="text-xs">{event.event_type}</Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">{t({ en: 'No events linked yet', ar: 'لا توجد فعاليات مرتبطة' })}</p>
                        </div>
                    )}

                    {/* Show milestones from treatment plan */}
                    {challenge.treatment_plan?.milestones?.length > 0 && (
                        <div className="mt-6">
                            <p className="font-semibold text-slate-900 mb-3">{t({ en: 'Treatment Milestones', ar: 'معالم المعالجة' })}</p>
                            <div className="space-y-2">
                                {challenge.treatment_plan.milestones.map((milestone, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white border rounded">
                                        <div className="flex items-center gap-3">
                                            {milestone.status === 'completed' ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            ) : milestone.status === 'in_progress' ? (
                                                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                                            ) : (
                                                <Clock className="h-5 w-5 text-slate-400" />
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{milestone.name}</p>
                                                {milestone.due_date && (
                                                    <p className="text-xs text-slate-500">Due: {milestone.due_date}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={
                                            milestone.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-slate-100 text-slate-700'
                                        }>
                                            {milestone.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
