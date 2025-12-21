
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Calendar, TestTube } from 'lucide-react';
import { createPageUrl } from '@/utils';

/**
 * PilotsOverviewCard - Displays active pilots overview.
 * @param {Object} props - Component props
 * @param {Array} props.pilots - Array of pilots
 * @param {Function} props.t - Translation function
 * @param {String} props.language - Current language ('en' or 'ar')
 */
export default function PilotsOverviewCard({ pilots, t, language }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{t({ en: 'Active Pilots', ar: 'التجارب النشطة' })}</CardTitle>
                    <Link to={createPageUrl('MyPilots')}>
                        <Button variant="outline" size="sm">{t({ en: 'All', ar: 'الكل' })}</Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {pilots.filter(p => ['active', 'monitoring', 'preparation'].includes(p.stage)).slice(0, 4).map((pilot) => (
                        <Link
                            key={pilot.id}
                            to={createPageUrl(`PilotDetail?id=${pilot.id}`)}
                            className="block p-3 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <Badge variant="outline" className="font-mono text-xs">{pilot.code}</Badge>
                                <Badge className="bg-purple-100 text-purple-700 text-xs">{pilot.stage}</Badge>
                            </div>
                            <h3 className="font-medium text-slate-900 text-sm mb-1 truncate">
                                {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                            </h3>
                            {pilot.timeline?.pilot_end && (
                                <div className="flex items-center gap-1 text-xs text-slate-600">
                                    <Calendar className="h-3 w-3" />
                                    <span>{t({ en: 'Ends:', ar: 'ينتهي:' })} {new Date(pilot.timeline.pilot_end).toLocaleDateString()}</span>
                                </div>
                            )}
                        </Link>
                    ))}
                    {pilots.filter(p => ['active', 'monitoring'].includes(p.stage)).length === 0 && (
                        <div className="text-center py-6">
                            <TestTube className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">{t({ en: 'No active pilots', ar: 'لا توجد تجارب نشطة' })}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
