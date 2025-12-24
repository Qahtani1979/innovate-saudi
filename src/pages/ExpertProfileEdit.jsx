import { useState, useEffect } from 'react';
import { useExpertProfileById } from '@/hooks/useExpertData';
import { useExpertMutations } from '@/hooks/useExpertMutations';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../components/LanguageContext';
import { Save, X, Loader2, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function ExpertProfileEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const expertId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();

  const { data: expert, isLoading } = useExpertProfileById(expertId);
  const { updateExpertProfile } = useExpertMutations();

  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (expert) setFormData(expert);
  }, [expert]);

  const handleUpdate = () => {
    updateExpertProfile.mutate(
      { id: expertId, data: formData },
      {
        onSuccess: () => {
          navigate(createPageUrl(`ExpertDetail?id=${expertId}`));
        }
      }
    );
  };


  if (isLoading) {
    return <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
    </div>;
  }

  return (
    <PageLayout>
      <PageHeader
        icon={UserCog}
        title={t({ en: 'Edit Expert Profile', ar: 'ØªØ¹Ø¯ÙŠÙ„ Ù…Ù„Ù Ø§Ù„Ø®Ø¨ÙŠØ±' })}
        description={t({ en: 'Update your expert profile information', ar: 'ØªØ­Ø¯ÙŠØ« Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ù…Ù„Ù Ø§Ù„Ø®Ø¨ÙŠØ±' })}
        action={
          <Button variant="outline" onClick={() => navigate(createPageUrl(`ExpertDetail?id=${expertId}`))}>
            <X className="h-4 w-4 mr-2" />
            {t({ en: 'Cancel', ar: 'Ø¥Ù„ØºØ§Ø¡' })}
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t({ en: 'Title', ar: 'Ø§Ù„Ù„Ù‚Ø¨' })}</label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t({ en: 'Position', ar: 'Ø§Ù„Ù…Ù†ØµØ¨' })}</label>
              <Input
                value={formData.position || ''}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">{t({ en: 'Biography (English)', ar: 'Ø§Ù„Ø³ÙŠØ±Ø© (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)' })}</label>
            <Textarea
              value={formData.bio_en || ''}
              onChange={(e) => setFormData({ ...formData, bio_en: e.target.value })}
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t({ en: 'Biography (Arabic)', ar: 'Ø§Ù„Ø³ÙŠØ±Ø© (Ø¹Ø±Ø¨ÙŠ)' })}</label>
            <Textarea
              value={formData.bio_ar || ''}
              onChange={(e) => setFormData({ ...formData, bio_ar: e.target.value })}
              rows={4}
              dir="rtl"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Expertise Areas (comma-separated)', ar: 'Ù…Ø¬Ø§Ù„Ø§Øª Ø§Ù„Ø®Ø¨Ø±Ø©' })}
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
              {t({ en: 'Sector Specializations', ar: 'Ø§Ù„ØªØ®ØµØµØ§Øª Ø§Ù„Ù‚Ø·Ø§Ø¹ÙŠØ©' })}
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
              <label className="text-sm font-medium">{t({ en: 'Availability (hours/month)', ar: 'Ø§Ù„ØªÙˆÙØ± (Ø³Ø§Ø¹Ø§Øª/Ø´Ù‡Ø±)' })}</label>
              <Input
                type="number"
                value={formData.availability_hours_per_month || 20}
                onChange={(e) => setFormData({ ...formData, availability_hours_per_month: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t({ en: 'Years of Experience', ar: 'Ø³Ù†ÙˆØ§Øª Ø§Ù„Ø®Ø¨Ø±Ø©' })}</label>
              <Input
                type="number"
                value={formData.years_of_experience || 0}
                onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleUpdate}
              disabled={updateExpertProfile.isPending}
              className="flex-1 bg-purple-600"
            >
              {updateExpertProfile.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Save Changes', ar: 'Ø­ÙØ¸ Ø§Ù„ØªØºÙŠÙŠØ±Ø§Øª' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(ExpertProfileEdit, { requiredPermissions: ['expert_edit_own', 'expert_edit_all'] });
