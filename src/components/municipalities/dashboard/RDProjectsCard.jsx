
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Microscope } from 'lucide-react';
import { createPageUrl } from '@/utils';

/**
 * RDProjectsCard - Displays R&D projects overview.
 * @param {Object} props - Component props
 * @param {Array} props.rdProjects - Array of R&D projects
 * @param {Function} props.t - Translation function
 * @param {String} props.language - Current language ('en' or 'ar')
 */
export default function RDProjectsCard({ rdProjects, t, language }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{t({ en: 'R&D Projects', ar: 'مشاريع البحث' })}</CardTitle>
                    <Link to={createPageUrl('MyRDProjects')}>
                        <Button variant="outline" size="sm">{t({ en: 'All', ar: 'الكل' })}</Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {rdProjects.slice(0, 4).map((project) => (
                        <Link
                            key={project.id}
                            to={createPageUrl(`RDProjectDetail?id=${project.id}`)}
                            className="block p-3 border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <Badge variant="outline" className="font-mono text-xs">{project.code}</Badge>
                                <Badge className={
                                    project.status === 'active' ? 'bg-green-100 text-green-700 text-xs' :
                                        project.status === 'completed' ? 'bg-blue-100 text-blue-700 text-xs' :
                                            'bg-slate-100 text-slate-700 text-xs'
                                }>{project.status}</Badge>
                            </div>
                            <h3 className="font-medium text-slate-900 text-sm truncate">
                                {language === 'ar' && project.title_ar ? project.title_ar : project.title_en}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                                <span>TRL: {project.trl_current || project.trl_start || 0}</span>
                            </div>
                        </Link>
                    ))}
                    {rdProjects.length === 0 && (
                        <div className="text-center py-6">
                            <Microscope className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">{t({ en: 'No R&D projects', ar: 'لا توجد مشاريع بحث' })}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
