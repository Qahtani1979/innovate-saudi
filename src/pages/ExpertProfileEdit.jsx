import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../components/LanguageContext';
import { Save, X, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ExpertProfileEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const expertId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: expert, isLoading } = useQuery({
    queryKey: ['expert-profile', expertId],
    queryFn: async () => {
      const experts = await base44.entities.ExpertProfile.list();
      return experts.find(e => e.id === expertId);
    },
    enabled: !!expertId
  });

  const [formData, setFormData] = useState(expert || {});

  React.useEffect(() => {
    if (expert) setFormData(expert);
  }, [expert]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.ExpertProfile.update(expertId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['expert-profile']);
      toast.success(t({ en: 'Profile updated', ar: 'تم تحديث الملف' }));
      navigate(createPageUrl(`ExpertDetail?id=${expertId}`));
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Edit Expert Profile', ar: 'تعديل ملف الخبير' })}
        </h1>
        <Button variant="outline" onClick={() => navigate(createPageUrl(`ExpertDetail?id=${expertId}`))}>
          <X className="h-4 w-4 mr-2" />
          {t({ en: 'Cancel', ar: 'إلغاء' })}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t({ en: 'Title', ar: 'اللقب' })}</label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t({ en: 'Position', ar: 'المنصب' })}</label>
              <Input
                value={formData.position || ''}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">{t({ en: 'Biography (English)', ar: 'السيرة (إنجليزي)' })}</label>
            <Textarea
              value={formData.bio_en || ''}
              onChange={(e) => setFormData({ ...formData, bio_en: e.target.value })}
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t({ en: 'Biography (Arabic)', ar: 'السيرة (عربي)' })}</label>
            <Textarea
              value={formData.bio_ar || ''}
              onChange={(e) => setFormData({ ...formData, bio_ar: e.target.value })}
              rows={4}
              dir="rtl"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Expertise Areas (comma-separated)', ar: 'مجالات الخبرة' })}
            </label>
            <Input
              defaultValue={formData.expertise_areas?.join(', ')}
              onChange={(e) => setFormData({ 
                ...formData, 
                expertise_areas: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Sector Specializations', ar: 'التخصصات القطاعية' })}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['urban_design', 'transport', 'environment', 'digital_services', 'health', 'education', 'safety', 'economic_development'].map((sector) => (
                <div key={sector} className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.sector_specializations?.includes(sector)}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({
                        ...prev,
                        sector_specializations: checked
                          ? [...(prev.sector_specializations || []), sector]
                          : (prev.sector_specializations || []).filter(s => s !== sector)
                      }));
                    }}
                  />
                  <span className="text-sm capitalize">{sector.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t({ en: 'Availability (hours/month)', ar: 'التوفر (ساعات/شهر)' })}</label>
              <Input
                type="number"
                value={formData.availability_hours_per_month || 20}
                onChange={(e) => setFormData({ ...formData, availability_hours_per_month: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t({ en: 'Years of Experience', ar: 'سنوات الخبرة' })}</label>
              <Input
                type="number"
                value={formData.years_of_experience || 0}
                onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => updateMutation.mutate(formData)}
              disabled={updateMutation.isPending}
              className="flex-1 bg-purple-600"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Save Changes', ar: 'حفظ التغييرات' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ExpertProfileEdit, { requiredPermissions: ['expert_edit_own', 'expert_edit_all'] });