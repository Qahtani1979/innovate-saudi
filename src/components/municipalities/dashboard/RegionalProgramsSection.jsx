
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import { createPageUrl } from '@/utils';

/**
 * RegionalProgramsSection - Displays available programs for the region.
 * @param {Object} props - Component props
 * @param {Array} props.regionalPrograms - Array of regional programs
 * @param {Function} props.t - Translation function
 * @param {String} props.language - Current language ('en' or 'ar')
 */
export default function RegionalProgramsSection({ regionalPrograms, t, language }) {
    if (!regionalPrograms || regionalPrograms.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-pink-600" />
                        {t({ en: 'Available Programs for Your Region', ar: 'البرامج المتاحة لمنطقتك' })}
                    </CardTitle>
                    <Link to={createPageUrl('Programs')}>
                        <Button size="sm" variant="outline">
                            {t({ en: 'All Programs', ar: 'كل البرامج' })}
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {regionalPrograms.filter(p => p.status === 'applications_open' || p.status === 'active').slice(0, 6).map((program) => (
                        <Link key={program.id} to={createPageUrl(`ProgramDetail?id=${program.id}`)}>
                            <Card className="hover:shadow-lg transition-all border-2 hover:border-pink-400">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge className={
                                            program.status === 'applications_open' ? 'bg-green-100 text-green-700 text-xs' :
                                                'bg-blue-100 text-blue-700 text-xs'
                                        }>{program.status?.replace(/_/g, ' ')}</Badge>
                                        <Badge variant="outline" className="text-xs">{program.program_type?.replace(/_/g, ' ')}</Badge>
                                    </div>
                                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                                        {language === 'ar' && program.name_ar ? program.name_ar : program.name_en}
                                    </h3>
                                    {program.timeline?.application_close && (
                                        <div className="flex items-center gap-1 text-xs text-red-600 mb-2">
                                            <Clock className="h-3 w-3" />
                                            <span>{t({ en: 'Closes:', ar: 'يغلق:' })} {new Date(program.timeline.application_close).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    <Link to={createPageUrl('ProgramApplicationWizard')}>
                                        <Button size="sm" className="w-full bg-pink-600 mt-2">
                                            {t({ en: 'Apply', ar: 'تقديم' })}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
