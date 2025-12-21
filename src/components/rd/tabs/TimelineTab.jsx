import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from 'lucide-react';

export default function TimelineTab({ project, t, language, onApproveMilestone }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    {t({ en: 'Project Timeline', ar: 'الجدول الزمني' })}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {project.timeline ? (
                    <div className="space-y-3">
                        {project.timeline.start_date && (
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <span className="text-sm text-slate-600">{t({ en: 'Start Date', ar: 'تاريخ البدء' })}:</span>
                                <span className="text-sm font-medium">{project.timeline.start_date}</span>
                            </div>
                        )}
                        {project.timeline.end_date && (
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <span className="text-sm text-slate-600">{t({ en: 'End Date', ar: 'تاريخ الانتهاء' })}:</span>
                                <span className="text-sm font-medium">{project.timeline.end_date}</span>
                            </div>
                        )}
                        {project.timeline.milestones && project.timeline.milestones.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-slate-700 mb-3">{t({ en: 'Milestones', ar: 'المراحل' })}:</p>
                                <div className="space-y-2">
                                    {project.timeline.milestones.map((milestone, i) => (
                                        <div key={i} className="p-3 border rounded-lg hover:bg-slate-50 group">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-slate-900">{milestone.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">{milestone.status}</Badge>
                                                    {project.status === 'active' && milestone.status === 'in_progress' && milestone.requires_approval && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => onApproveMilestone(milestone)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            {t({ en: 'Approve', ar: 'موافقة' })}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            {milestone.date && (
                                                <p className="text-xs text-slate-500 mt-1">{milestone.date}</p>
                                            )}
                                            {milestone.deliverables && milestone.deliverables.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {milestone.deliverables.map((d, j) => (
                                                        <Badge key={j} variant="outline" className="text-xs">{d}</Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
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
