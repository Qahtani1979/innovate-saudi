import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export default function TimelineTab({ call, t }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    {t({ en: 'Important Dates', ar: 'التواريخ المهمة' })}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {call.timeline ? (
                    <div className="space-y-3">
                        {call.timeline.announcement_date && (
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <span className="text-sm text-slate-600">{t({ en: 'Announcement', ar: 'الإعلان' })}:</span>
                                <span className="text-sm font-medium">{call.timeline.announcement_date}</span>
                            </div>
                        )}
                        {call.timeline.submission_open && (
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                                <span className="text-sm text-slate-600">{t({ en: 'Submissions Open', ar: 'فتح التقديم' })}:</span>
                                <span className="text-sm font-medium text-green-700">{call.timeline.submission_open}</span>
                            </div>
                        )}
                        {call.timeline.submission_close && (
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                                <span className="text-sm text-slate-600">{t({ en: 'Deadline', ar: 'الموعد النهائي' })}:</span>
                                <span className="text-sm font-medium text-red-700">{call.timeline.submission_close}</span>
                            </div>
                        )}
                        {call.timeline.review_period && (
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <span className="text-sm text-slate-600">{t({ en: 'Review Period', ar: 'فترة المراجعة' })}:</span>
                                <span className="text-sm font-medium">{call.timeline.review_period}</span>
                            </div>
                        )}
                        {call.timeline.award_date && (
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                                <span className="text-sm text-slate-600">{t({ en: 'Award Date', ar: 'تاريخ الإعلان' })}:</span>
                                <span className="text-sm font-medium text-blue-700">{call.timeline.award_date}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-slate-500 text-sm text-center py-8">{t({ en: 'No timeline specified', ar: 'لم يتم تحديد الجدول الزمني' })}</p>
                )}
            </CardContent>
        </Card>
    );
}
