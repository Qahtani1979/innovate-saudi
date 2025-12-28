import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from './LanguageContext';
import { CheckCircle2, X, Award } from 'lucide-react';
import { useRDMutations } from '@/hooks/useRDMutations';

export default function RDProjectCompletionWorkflow({ project, onClose }) {
  const { language, isRTL, t } = useLanguage();

  const [impactSummary, setImpactSummary] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [trlAchieved, setTrlAchieved] = useState(project.trl_current || project.trl_start);
  const [commercializationPotential, setCommercializationPotential] = useState('medium');

  const { completeProject } = useRDMutations();

  const handleComplete = () => {
    completeProject.mutate({
      project,
      trlAchieved,
      impactSummary,
      lessonsLearned,
      commercializationPotential
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          {t({ en: 'Complete R&D Project', ar: 'إتمام مشروع البحث' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm font-semibold text-slate-900">{project.title_en}</p>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="outline">Start TRL: {project.trl_start}</Badge>
            <Badge variant="outline">Target TRL: {project.trl_target}</Badge>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t({ en: 'Final TRL Achieved', ar: 'مستوى الجاهزية النهائي المحقق' })}</Label>
          <Select value={trlAchieved?.toString()} onValueChange={(v) => setTrlAchieved(parseInt(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                <SelectItem key={level} value={level.toString()}>
                  TRL {level}
                  {level === project.trl_target && ' (Target)'}
                  {level > project.trl_target && ' (Above target!)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t({ en: 'Impact Summary', ar: 'ملخص التأثير' })}</Label>
          <Textarea
            value={impactSummary}
            onChange={(e) => setImpactSummary(e.target.value)}
            placeholder={t({
              en: 'Summarize the academic, practical, and policy impact achieved...',
              ar: 'لخص التأثير الأكاديمي والعملي والسياسي المحقق...'
            })}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>{t({ en: 'Commercialization Potential', ar: 'إمكانية التسويق' })}</Label>
          <Select value={commercializationPotential} onValueChange={setCommercializationPotential}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">{t({ en: 'High - Ready for pilot/market', ar: 'عالي - جاهز للتجريب/السوق' })}</SelectItem>
              <SelectItem value="medium">{t({ en: 'Medium - Needs pilot validation', ar: 'متوسط - يحتاج تحقق تجريبي' })}</SelectItem>
              <SelectItem value="low">{t({ en: 'Low - Further research needed', ar: 'منخفض - يحتاج مزيد بحث' })}</SelectItem>
              <SelectItem value="none">{t({ en: 'None - Academic only', ar: 'لا يوجد - أكاديمي فقط' })}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t({ en: 'Lessons Learned', ar: 'الدروس المستفادة' })}</Label>
          <Textarea
            value={lessonsLearned}
            onChange={(e) => setLessonsLearned(e.target.value)}
            placeholder={t({
              en: 'What went well? What could be improved? Key insights for future projects...',
              ar: 'ما الذي نجح؟ ما الذي يمكن تحسينه؟ رؤى رئيسية للمشاريع المستقبلية...'
            })}
            rows={4}
          />
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Award className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-900 mb-1">
                {t({ en: 'Project Outputs Summary', ar: 'ملخص مخرجات المشروع' })}
              </p>
              <div className="text-xs text-slate-700 space-y-1">
                <p>• Publications: {project.publications?.length || 0}</p>
                <p>• Patents: {project.patents?.length || 0}</p>
                <p>• Datasets: {project.datasets_generated?.length || 0}</p>
                <p>• TRL Progress: {project.trl_start} → {trlAchieved}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={handleComplete}
            disabled={completeProject.isPending || !impactSummary}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {t({ en: 'Mark Complete', ar: 'وضع علامة مكتمل' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
