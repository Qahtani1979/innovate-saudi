import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Video } from 'lucide-react';

export default function MediaTab({ project, t }) {
    return (
        <div className="space-y-6">
            {project.image_url && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t({ en: 'Main Image', ar: 'الصورة الرئيسية' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <img src={project.image_url} alt={project.title_en} className="w-full rounded-lg" />
                    </CardContent>
                </Card>
            )}

            {project.gallery_urls && project.gallery_urls.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t({ en: 'Gallery', ar: 'المعرض' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {project.gallery_urls.map((url, i) => (
                                <img key={i} src={url} alt={`Gallery ${i + 1}`} className="w-full rounded-lg" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {project.video_url && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Video className="h-5 w-5 text-red-600" />
                            {t({ en: 'Video', ar: 'فيديو' })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                            <p className="text-slate-500">Video Player</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
