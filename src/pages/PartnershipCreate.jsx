import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../components/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Handshake, ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';

function PartnershipCreate() {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    partnership_type: 'strategic_alliance',
    scope_en: '',
    scope_ar: '',
    start_date: '',
    end_date: '',
    budget_shared: '',
    is_strategic: false,
    parties: []
  });

  const [newParty, setNewParty] = useState({
    organization_name: '',
    role: 'partner',
    contact_email: ''
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('organizations')
        .select('id, name_en, name_ar')
        .eq('is_deleted', false)
        .limit(100);
      return data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('partnerships')
        .insert({
          ...data,
          status: 'prospect',
          created_by: user?.email
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['partnerships']);
      toast.success(t({ en: 'Partnership created successfully', ar: 'تم إنشاء الشراكة بنجاح' }));
      navigate(createPageUrl('PartnershipRegistry'));
    },
    onError: (error) => {
      toast.error(t({ en: 'Failed to create partnership', ar: 'فشل في إنشاء الشراكة' }));
      console.error(error);
    }
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addParty = () => {
    if (newParty.organization_name) {
      setFormData(prev => ({
        ...prev,
        parties: [...prev.parties, { ...newParty }]
      }));
      setNewParty({ organization_name: '', role: 'partner', contact_email: '' });
    }
  };

  const removeParty = (index) => {
    setFormData(prev => ({
      ...prev,
      parties: prev.parties.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name_en) {
      toast.error(t({ en: 'Please enter partnership name', ar: 'يرجى إدخال اسم الشراكة' }));
      return;
    }
    createMutation.mutate({
      ...formData,
      budget_shared: formData.budget_shared ? parseFloat(formData.budget_shared) : null
    });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl('PartnershipRegistry'))}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Handshake className="h-8 w-8 text-indigo-600" />
            {t({ en: 'Create Partnership', ar: 'إنشاء شراكة' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Define a new strategic partnership', ar: 'تعريف شراكة استراتيجية جديدة' })}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Basic Information', ar: 'المعلومات الأساسية' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Name (English)', ar: 'الاسم (إنجليزي)' })} *</Label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => handleChange('name_en', e.target.value)}
                  placeholder={t({ en: 'Partnership name in English', ar: 'اسم الشراكة بالإنجليزية' })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Name (Arabic)', ar: 'الاسم (عربي)' })}</Label>
                <Input
                  value={formData.name_ar}
                  onChange={(e) => handleChange('name_ar', e.target.value)}
                  placeholder={t({ en: 'Partnership name in Arabic', ar: 'اسم الشراكة بالعربية' })}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Partnership Type', ar: 'نوع الشراكة' })}</Label>
                <select
                  value={formData.partnership_type}
                  onChange={(e) => handleChange('partnership_type', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="strategic_alliance">{t({ en: 'Strategic Alliance', ar: 'تحالف استراتيجي' })}</option>
                  <option value="rd_collaboration">{t({ en: 'R&D Collaboration', ar: 'تعاون بحثي' })}</option>
                  <option value="pilot_partnership">{t({ en: 'Pilot Partnership', ar: 'شراكة تجريبية' })}</option>
                  <option value="technology_transfer">{t({ en: 'Technology Transfer', ar: 'نقل التقنية' })}</option>
                  <option value="funding_partnership">{t({ en: 'Funding Partnership', ar: 'شراكة تمويلية' })}</option>
                  <option value="knowledge_sharing">{t({ en: 'Knowledge Sharing', ar: 'تبادل المعرفة' })}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_strategic}
                    onChange={(e) => handleChange('is_strategic', e.target.checked)}
                    className="rounded"
                  />
                  {t({ en: 'Strategic Partnership', ar: 'شراكة استراتيجية' })}
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Scope (English)', ar: 'النطاق (إنجليزي)' })}</Label>
                <Textarea
                  value={formData.scope_en}
                  onChange={(e) => handleChange('scope_en', e.target.value)}
                  placeholder={t({ en: 'Describe the partnership scope...', ar: 'وصف نطاق الشراكة...' })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Scope (Arabic)', ar: 'النطاق (عربي)' })}</Label>
                <Textarea
                  value={formData.scope_ar}
                  onChange={(e) => handleChange('scope_ar', e.target.value)}
                  placeholder={t({ en: 'Describe the partnership scope in Arabic...', ar: 'وصف نطاق الشراكة بالعربية...' })}
                  rows={3}
                  dir="rtl"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates & Budget */}
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Timeline & Budget', ar: 'الجدول الزمني والميزانية' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Start Date', ar: 'تاريخ البدء' })}</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'End Date', ar: 'تاريخ الانتهاء' })}</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Shared Budget (SAR)', ar: 'الميزانية المشتركة (ريال)' })}</Label>
                <Input
                  type="number"
                  value={formData.budget_shared}
                  onChange={(e) => handleChange('budget_shared', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parties */}
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Partner Organizations', ar: 'المنظمات الشريكة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.parties.length > 0 && (
              <div className="space-y-2">
                {formData.parties.map((party, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border-2 rounded-lg bg-slate-50">
                    <div>
                      <p className="font-medium">{party.organization_name}</p>
                      <p className="text-sm text-slate-600">{party.role} • {party.contact_email}</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeParty(i)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 border-2 border-dashed rounded-lg bg-slate-50">
              <h4 className="font-medium text-sm mb-3">{t({ en: 'Add Partner', ar: 'إضافة شريك' })}</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input
                  value={newParty.organization_name}
                  onChange={(e) => setNewParty(prev => ({ ...prev, organization_name: e.target.value }))}
                  placeholder={t({ en: 'Organization name', ar: 'اسم المنظمة' })}
                />
                <select
                  value={newParty.role}
                  onChange={(e) => setNewParty(prev => ({ ...prev, role: e.target.value }))}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="partner">{t({ en: 'Partner', ar: 'شريك' })}</option>
                  <option value="lead">{t({ en: 'Lead Partner', ar: 'الشريك الرئيسي' })}</option>
                  <option value="sponsor">{t({ en: 'Sponsor', ar: 'راعي' })}</option>
                  <option value="technical">{t({ en: 'Technical Partner', ar: 'شريك تقني' })}</option>
                </select>
                <Input
                  type="email"
                  value={newParty.contact_email}
                  onChange={(e) => setNewParty(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder={t({ en: 'Contact email', ar: 'البريد الإلكتروني' })}
                />
                <Button type="button" onClick={addParty} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  {t({ en: 'Add', ar: 'إضافة' })}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(createPageUrl('PartnershipRegistry'))}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button type="submit" className="bg-indigo-600" disabled={createMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {createMutation.isPending 
              ? t({ en: 'Creating...', ar: 'جاري الإنشاء...' })
              : t({ en: 'Create Partnership', ar: 'إنشاء الشراكة' })
            }
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ProtectedPage(PartnershipCreate, { requiredPermissions: ['partnership_create'] });
