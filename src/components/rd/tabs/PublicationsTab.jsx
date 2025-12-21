import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Award, ExternalLink } from 'lucide-react';

export default function PublicationsTab({ project, t, language }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        {t({ en: 'Publications', ar: 'المنشورات' })}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {project.publications && project.publications.length > 0 ? (
                        <div className="space-y-3">
                            {project.publications.map((pub, i) => (
                                <div key={i} className="p-4 border rounded-lg">
                                    <p className="font-medium text-sm text-slate-900">{pub.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-600">{pub.publication}</span>
                                        <span className="text-xs text-slate-500">• {pub.year}</span>
                                    </div>
                                    {pub.authors && pub.authors.length > 0 && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            {pub.authors.join(', ')}
                                        </p>
                                    )}
                                    {pub.url && (
                                        <Button variant="outline" size="sm" asChild className="mt-2">
                                            <a href={pub.url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-3 w-3 mr-2" />
                                                {t({ en: 'View Publication', ar: 'عرض المنشور' })}
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">{t({ en: 'No publications yet', ar: 'لا توجد منشورات بعد' })}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {project.patents && project.patents.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-amber-600" />
                            {t({ en: 'Patents', ar: 'براءات الاختراع' })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {project.patents.map((patent, i) => (
                                <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="font-medium text-sm text-amber-900">{patent.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-600">{patent.number}</span>
                                        <Badge variant="outline" className="text-xs">{patent.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
