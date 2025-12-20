import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '@/components/LanguageContext';
import { Image } from 'lucide-react';

export default function ChallengeMediaTab({ challenge }) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {challenge.image_url && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5 text-purple-600" />
              {t({ en: 'Featured Image', ar: 'الصورة المميزة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <img 
              src={challenge.image_url} 
              alt={challenge.title_en} 
              className="w-full rounded-lg object-cover max-h-96"
            />
          </CardContent>
        </Card>
      )}

      {challenge.gallery_urls && challenge.gallery_urls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Gallery', ar: 'معرض الصور' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {challenge.gallery_urls.map((url, i) => (
                <img 
                  key={i} 
                  src={url} 
                  alt={`Gallery ${i + 1}`} 
                  className="w-full rounded-lg object-cover aspect-square"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!challenge.image_url && (!challenge.gallery_urls || challenge.gallery_urls.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <Image className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">{t({ en: 'No media uploaded yet', ar: 'لم يتم رفع أي وسائط بعد' })}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
