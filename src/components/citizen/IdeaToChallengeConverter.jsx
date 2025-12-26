import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Lightbulb, ArrowRight, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { useIdeaConversion } from '@/hooks/useCitizenIdeas';

export default function IdeaToChallengeConverter({ idea, onClose }) {
  const { t } = useLanguage();
  const convertIdea = useIdeaConversion();
  const [targetData, setTargetData] = useState({
    title_en: idea?.title || '',
    title_ar: idea?.title || '',
    description_en: idea?.description || '',
    description_ar: idea?.description || '',
    status: 'draft',
    is_published: false
  });

  const handleConvert = async () => {
    if (!idea) return;

    await convertIdea.mutateAsync({
      ideaId: idea.id,
      targetTable: 'challenges',
      targetData: {
        ...targetData,
        municipality_id: idea.municipality_id,
        created_by: idea.user_id
      },
      statusUpdate: 'converted_to_challenge'
    });

    if (onClose) onClose();
  };

  return (
    <Card className="border-amber-200 shadow-lg">
      <CardHeader className="bg-amber-50/50">
        <CardTitle className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Lightbulb className="h-5 w-5 text-amber-600" />
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          {t({ en: 'Convert Idea to Challenge', ar: 'تحويل الفكرة إلى تحدي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t({ en: 'Challenge Title (English)', ar: 'عنوان التحدي (إنجليزي)' })}</label>
          <Input
            value={targetData.title_en}
            onChange={(e) => setTargetData({ ...targetData, title_en: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t({ en: 'Problem Statement (English)', ar: 'بيان المشكلة (إنجليزي)' })}</label>
          <Textarea
            value={targetData.description_en}
            onChange={(e) => setTargetData({ ...targetData, description_en: e.target.value })}
            rows={4}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={handleConvert}
            disabled={convertIdea.isPending}
            className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
          >
            {convertIdea.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Convert Now', ar: 'تحويل الآن' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
