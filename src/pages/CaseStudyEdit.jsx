import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../components/LanguageContext';
import { Award, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useCaseStudy, useCaseStudyMutations } from '@/hooks/useCaseStudies';

function CaseStudyEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const caseId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();

  const { data: caseStudy, isLoading } = useCaseStudy(caseId);
  const { updateCaseStudy } = useCaseStudyMutations();

  const [formData, setFormData] = useState({});

  React.useEffect(() => {
    if (caseStudy) setFormData(caseStudy);
  }, [caseStudy]);

  const handleUpdate = () => {
    updateCaseStudy.mutate({ id: caseId, data: formData }, {
      onSuccess: () => {
        navigate(createPageUrl('Knowledge'));
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Edit Case Study', ar: 'تعديل دراسة الحالة' })}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            {t({ en: 'Case Study Details', ar: 'تفاصيل دراسة الحالة' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })}</Label>
              <Input
                value={formData.title_en || ''}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}</Label>
              <Input
                value={formData.title_ar || ''}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
            <Textarea
              value={formData.description_en || ''}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Challenge Addressed', ar: 'التحدي المعالج' })}</Label>
            <Textarea
              value={formData.challenge_addressed || ''}
              onChange={(e) => setFormData({ ...formData, challenge_addressed: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Solution Applied', ar: 'الحل المطبق' })}</Label>
            <Textarea
              value={formData.solution_applied || ''}
              onChange={(e) => setFormData({ ...formData, solution_applied: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Impact Statement', ar: 'بيان الأثر' })}</Label>
            <Textarea
              value={formData.impact_statement || ''}
              onChange={(e) => setFormData({ ...formData, impact_statement: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl('Knowledge'))}
            >
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateCaseStudy.isPending}
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              {updateCaseStudy.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t({ en: 'Save Changes', ar: 'حفظ التغييرات' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(CaseStudyEdit, { requiredPermissions: ['case_study_edit'] });
