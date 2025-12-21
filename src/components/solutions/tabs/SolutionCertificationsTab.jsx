import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';

/**
 * SolutionCertificationsTab - Displays certifications and awards for a solution
 * @param {Object} props - Component props
 * @param {Object} props.solution - Solution data
 * @param {Function} props.t - Translation function
 */
export default function SolutionCertificationsTab({ solution, t }) {
    return (
        <>
            {solution.certifications && solution.certifications.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-green-600" />
                            {t({ en: 'Certifications', ar: 'الشهادات' })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {solution.certifications.map((cert, i) => (
                                <div key={i} className="p-3 border rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-slate-900">{cert.name}</p>
                                            {cert.issuer && (
                                                <p className="text-sm text-slate-600 mt-1">{cert.issuer}</p>
                                            )}
                                            {cert.date && (
                                                <p className="text-xs text-slate-500 mt-1">{cert.date}</p>
                                            )}
                                        </div>
                                        <Award className="h-5 w-5 text-green-600" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {solution.awards && solution.awards.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-yellow-600" />
                            {t({ en: 'Awards & Recognition', ar: 'الجوائز والتقدير' })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {solution.awards.map((award, i) => (
                                <div key={i} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="font-medium text-slate-900">{award.title}</p>
                                    {award.organization && (
                                        <p className="text-sm text-slate-600 mt-1">{award.organization}</p>
                                    )}
                                    {award.year && (
                                        <Badge className="bg-yellow-600 text-white mt-2">{award.year}</Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    );
}
