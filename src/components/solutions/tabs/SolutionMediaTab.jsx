import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, Code, Video } from 'lucide-react';

/**
 * SolutionMediaTab - Displays media and resources for a solution
 * @param {Object} props - Component props
 * @param {Object} props.solution - Solution data
 * @param {Function} props.t - Translation function
 */
export default function SolutionMediaTab({ solution, t }) {
    return (
        <>
            {solution.image_url && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t({ en: 'Main Image', ar: 'الصورة الرئيسية' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <img src={solution.image_url} alt={solution.name_en} className="w-full rounded-lg" />
                    </CardContent>
                </Card>
            )}

            {solution.gallery_urls && solution.gallery_urls.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t({ en: 'Gallery', ar: 'المعرض' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {solution.gallery_urls.map((url, i) => (
                                <img key={i} src={url} alt={`Gallery ${i + 1}`} className="w-full rounded-lg" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {solution.video_url && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Video className="h-5 w-5 text-red-600" />
                            {t({ en: 'Demo Video', ar: 'فيديو تجريبي' })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                            <p className="text-slate-500">Video Player</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {(solution.demo_url || solution.documentation_url || solution.api_documentation_url) && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t({ en: 'Resources', ar: 'الموارد' })}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {solution.demo_url && (
                            <Button variant="outline" asChild className="w-full justify-start">
                                <a href={solution.demo_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Live Demo
                                </a>
                            </Button>
                        )}
                        {solution.documentation_url && (
                            <Button variant="outline" asChild className="w-full justify-start">
                                <a href={solution.documentation_url} target="_blank" rel="noopener noreferrer">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Documentation
                                </a>
                            </Button>
                        )}
                        {solution.api_documentation_url && (
                            <Button variant="outline" asChild className="w-full justify-start">
                                <a href={solution.api_documentation_url} target="_blank" rel="noopener noreferrer">
                                    <Code className="h-4 w-4 mr-2" />
                                    API Docs
                                </a>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </>
    );
}
