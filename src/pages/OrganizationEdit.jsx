import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { Save, Loader2, Sparkles, X } from 'lucide-react';
import FileUploader from '../components/FileUploader';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function OrganizationEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const orgId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: organization, isLoading } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: async () => {
      const orgs = await base44.entities.Organization.list();
      return orgs.find(o => o.id === orgId);
    },
    enabled: !!orgId
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list()
  });

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => base44.entities.Region.list()
  });

  const [formData, setFormData] = useState(null);
  const { invokeAI, status, isLoading: isAIProcessing, rateLimitInfo, isAvailable } = useAIWithFallback();

  React.useEffect(() => {
    if (organization && !formData) {
      setFormData(organization);
    }
  }, [organization]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Organization.update(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['organization', orgId]);
      // Auto-generate embedding if content changed
      base44.functions.invoke('generateEmbeddings', {
        entity_name: 'Organization',
        mode: 'missing'
      }).catch(err => console.error('Embedding generation failed:', err));
      toast.success(t({ en: 'Organization updated', ar: 'تم تحديث الجهة' }));
      navigate(createPageUrl(`OrganizationDetail?id=${orgId}`));
    }
  });

  const handleAIEnhance = async () => {
    const prompt = `Enhance this organization profile with professional, detailed bilingual content:

Organization: ${formData.name_en}
Type: ${formData.org_type}
Current Description: ${formData.description_en || 'N/A'}

Generate comprehensive bilingual (English + Arabic) content:
1. Improved names (EN + AR)
2. Professional descriptions (EN + AR) - 150+ words each`;

    const result = await invokeAI({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          name_en: { type: 'string' },
          name_ar: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' }
        }
      }
    });

    if (result.success) {
      setFormData(prev => ({
        ...prev,
        name_en: result.data.name_en || prev.name_en,
        name_ar: result.data.name_ar || prev.name_ar,
        description_en: result.data.description_en || prev.description_en,
        description_ar: result.data.description_ar || prev.description_ar
      }));
      toast.success(t({ en: '✨ AI enhancement complete!', ar: '✨ تم التحسين!' }));
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Edit Organization', ar: 'تعديل الجهة' })}
        </h1>
        <p className="text-slate-600 mt-1">{formData.name_en}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t({ en: 'Organization Information', ar: 'معلومات الجهة' })}</CardTitle>
            <Button
              onClick={handleAIEnhance}
              disabled={isAIProcessing || !isAvailable}
              variant="outline"
              size="sm"
            >
              {isAIProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Enhancing...', ar: 'جاري التحسين...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'AI Enhance', ar: 'تحسين ذكي' })}
                </>
              )}
            </Button>
          </div>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name (English)</Label>
              <Input
                value={formData.name_en}
                onChange={(e) => setFormData({...formData, name_en: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>اسم الجهة (عربي)</Label>
              <Input
                value={formData.name_ar || ''}
                onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description (English)</Label>
            <Textarea
              value={formData.description_en || ''}
              onChange={(e) => setFormData({...formData, description_en: e.target.value})}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>الوصف (عربي)</Label>
            <Textarea
              value={formData.description_ar || ''}
              onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
              rows={3}
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.org_type}
                onValueChange={(v) => setFormData({...formData, org_type: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ministry">Ministry</SelectItem>
                  <SelectItem value="municipality">Municipality</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                  <SelectItem value="university">University</SelectItem>
                  <SelectItem value="research_center">Research Center</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="sme">SME</SelectItem>
                  <SelectItem value="ngo">NGO</SelectItem>
                  <SelectItem value="international_org">International Org</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Partnership Status</Label>
              <Select
                value={formData.partnership_status || 'none'}
                onValueChange={(v) => setFormData({...formData, partnership_status: v, is_partner: v === 'active'})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active Partner</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Region</Label>
              <Select
                value={formData.region_id || ''}
                onValueChange={(v) => setFormData({...formData, region_id: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region..." />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Select
                value={formData.city_id || ''}
                onValueChange={(v) => setFormData({...formData, city_id: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city..." />
                </SelectTrigger>
                <SelectContent>
                  {cities.filter(c => !formData.region_id || c.region_id === formData.region_id).map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Team Size</Label>
              <Select
                value={formData.team_size || ''}
                onValueChange={(v) => setFormData({...formData, team_size: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select range..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10</SelectItem>
                  <SelectItem value="11-50">11-50</SelectItem>
                  <SelectItem value="51-200">51-200</SelectItem>
                  <SelectItem value="201-500">201-500</SelectItem>
                  <SelectItem value="501-1000">501-1000</SelectItem>
                  <SelectItem value="1000+">1000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Maturity Level</Label>
              <Select
                value={formData.maturity_level || ''}
                onValueChange={(v) => setFormData({...formData, maturity_level: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select maturity..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="early_stage">Early Stage</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="established">Established</SelectItem>
                  <SelectItem value="mature">Mature</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Specializations (comma-separated)</Label>
            <Textarea
              placeholder="e.g., AI, IoT, Smart City Solutions"
              value={formData.specializations?.join(', ') || ''}
              onChange={(e) => setFormData({...formData, specializations: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Website</Label>
            <Input
              value={formData.website || ''}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Region</Label>
              <Select
                value={formData.region_id || ''}
                onValueChange={(v) => setFormData({...formData, region_id: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region..." />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Select
                value={formData.city_id || ''}
                onValueChange={(v) => setFormData({...formData, city_id: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city..." />
                </SelectTrigger>
                <SelectContent>
                  {cities.filter(c => !formData.region_id || c.region_id === formData.region_id).map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Team Size</Label>
              <Select
                value={formData.team_size || ''}
                onValueChange={(v) => setFormData({...formData, team_size: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select range..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10</SelectItem>
                  <SelectItem value="11-50">11-50</SelectItem>
                  <SelectItem value="51-200">51-200</SelectItem>
                  <SelectItem value="201-500">201-500</SelectItem>
                  <SelectItem value="501-1000">501-1000</SelectItem>
                  <SelectItem value="1000+">1000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Maturity Level</Label>
              <Select
                value={formData.maturity_level || ''}
                onValueChange={(v) => setFormData({...formData, maturity_level: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select maturity..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="early_stage">Early Stage</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="established">Established</SelectItem>
                  <SelectItem value="mature">Mature</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={formData.address || ''}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Specializations (comma-separated)</Label>
            <Textarea
              placeholder="e.g., AI, IoT, Smart City Solutions"
              value={formData.specializations?.join(', ') || ''}
              onChange={(e) => setFormData({...formData, specializations: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input
                type="email"
                value={formData.contact_email || ''}
                onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input
                value={formData.contact_phone || ''}
                onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Website</Label>
            <Input
              value={formData.website || ''}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
            />
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-slate-900">{t({ en: 'Funding & Investment', ar: 'التمويل والاستثمار' })}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Funding Stage</Label>
                <Select
                  value={formData.funding_stage || ''}
                  onValueChange={(v) => setFormData({...formData, funding_stage: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bootstrapped">Bootstrapped</SelectItem>
                    <SelectItem value="seed">Seed</SelectItem>
                    <SelectItem value="series_a">Series A</SelectItem>
                    <SelectItem value="series_b">Series B</SelectItem>
                    <SelectItem value="series_c">Series C</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="not_applicable">Not Applicable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Annual Revenue Range</Label>
                <Select
                  value={formData.annual_revenue_range || ''}
                  onValueChange={(v) => setFormData({...formData, annual_revenue_range: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1M">0-1M SAR</SelectItem>
                    <SelectItem value="1M-10M">1M-10M SAR</SelectItem>
                    <SelectItem value="10M-50M">10M-50M SAR</SelectItem>
                    <SelectItem value="50M-100M">50M-100M SAR</SelectItem>
                    <SelectItem value="100M+">100M+ SAR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Funding Rounds (JSON format)', ar: 'جولات التمويل' })}</Label>
              <Textarea
                placeholder='[{"round_type": "seed", "amount": 1000000, "date": "2024-01-01", "lead_investor": "Investor Name"}]'
                value={JSON.stringify(formData.funding_rounds || [], null, 2)}
                onChange={(e) => {
                  try {
                    setFormData({...formData, funding_rounds: JSON.parse(e.target.value)});
                  } catch {}
                }}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Key Investors (JSON format)', ar: 'المستثمرون الرئيسيون' })}</Label>
              <Textarea
                placeholder='[{"name": "Investor Name", "type": "vc", "stake_percentage": 15}]'
                value={JSON.stringify(formData.key_investors || [], null, 2)}
                onChange={(e) => {
                  try {
                    setFormData({...formData, key_investors: JSON.parse(e.target.value)});
                  } catch {}
                }}
                rows={4}
              />
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-slate-900">{t({ en: 'Partnerships & Agreements', ar: 'الشراكات والاتفاقيات' })}</h3>

            <div className="space-y-2">
              <Label>{t({ en: 'Partnership Agreements (JSON format)', ar: 'اتفاقيات الشراكة' })}</Label>
              <Textarea
                placeholder='[{"partner_name": "Company X", "type": "Strategic", "start_date": "2024-01-01", "status": "active"}]'
                value={JSON.stringify(formData.partnership_agreements || [], null, 2)}
                onChange={(e) => {
                  try {
                    setFormData({...formData, partnership_agreements: JSON.parse(e.target.value)});
                  } catch {}
                }}
                rows={4}
              />
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-slate-900">{t({ en: 'Regulatory Compliance', ar: 'الامتثال التنظيمي' })}</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.regulatory_compliance?.iso_certified || false}
                    onChange={(e) => setFormData({
                      ...formData, 
                      regulatory_compliance: {...(formData.regulatory_compliance || {}), iso_certified: e.target.checked}
                    })}
                  />
                  <Label>ISO Certified</Label>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.regulatory_compliance?.gdpr_compliant || false}
                    onChange={(e) => setFormData({
                      ...formData, 
                      regulatory_compliance: {...(formData.regulatory_compliance || {}), gdpr_compliant: e.target.checked}
                    })}
                  />
                  <Label>GDPR Compliant</Label>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.regulatory_compliance?.pdpl_compliant || false}
                    onChange={(e) => setFormData({
                      ...formData, 
                      regulatory_compliance: {...(formData.regulatory_compliance || {}), pdpl_compliant: e.target.checked}
                    })}
                  />
                  <Label>PDPL Compliant</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>ISO Standards (comma-separated)</Label>
              <Input
                placeholder="ISO 9001, ISO 27001, ISO 14001"
                value={formData.regulatory_compliance?.iso_standards?.join(', ') || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  regulatory_compliance: {
                    ...(formData.regulatory_compliance || {}),
                    iso_standards: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }
                })}
              />
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-slate-900">{t({ en: 'Intellectual Property', ar: 'الملكية الفكرية' })}</h3>

            <div className="space-y-2">
              <Label>{t({ en: 'Patents (JSON format)', ar: 'براءات الاختراع' })}</Label>
              <Textarea
                placeholder='[{"title": "Patent Title", "number": "SA123456", "status": "granted", "filing_date": "2023-01-01"}]'
                value={JSON.stringify(formData.intellectual_property?.patents || [], null, 2)}
                onChange={(e) => {
                  try {
                    setFormData({
                      ...formData,
                      intellectual_property: {
                        ...(formData.intellectual_property || {}),
                        patents: JSON.parse(e.target.value)
                      }
                    });
                  } catch {}
                }}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Trademarks (JSON format)', ar: 'العلامات التجارية' })}</Label>
              <Textarea
                placeholder='[{"name": "Brand Name", "registration_number": "TM123456", "registration_date": "2023-01-01"}]'
                value={JSON.stringify(formData.intellectual_property?.trademarks || [], null, 2)}
                onChange={(e) => {
                  try {
                    setFormData({
                      ...formData,
                      intellectual_property: {
                        ...(formData.intellectual_property || {}),
                        trademarks: JSON.parse(e.target.value)
                      }
                    });
                  } catch {}
                }}
                rows={4}
              />
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-slate-900">{t({ en: 'Branding & Media', ar: 'العلامة التجارية والوسائط' })}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Logo', ar: 'الشعار' })}</Label>
                <FileUploader
                  type="image"
                  label={t({ en: 'Upload Logo', ar: 'رفع الشعار' })}
                  maxSize={5}
                  onUploadComplete={(url) => setFormData({...formData, logo_url: url})}
                />
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Main Image', ar: 'الصورة الرئيسية' })}</Label>
                <FileUploader
                  type="image"
                  label={t({ en: 'Upload Image', ar: 'رفع صورة' })}
                  maxSize={10}
                  onUploadComplete={(url) => setFormData({...formData, image_url: url})}
                />
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Banner', ar: 'البانر' })}</Label>
                <FileUploader
                  type="image"
                  label={t({ en: 'Upload Banner', ar: 'رفع بانر' })}
                  maxSize={10}
                  onUploadComplete={(url) => setFormData({...formData, banner_url: url})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Organization Brochure', ar: 'كتيب الجهة' })}</Label>
              <FileUploader
                type="document"
                label={t({ en: 'Upload PDF', ar: 'رفع PDF' })}
                maxSize={50}
                preview={false}
                onUploadComplete={(url) => setFormData({...formData, brochure_url: url})}
              />
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Gallery Images', ar: 'معرض الصور' })}</Label>
              <FileUploader
                type="image"
                label={t({ en: 'Add to Gallery', ar: 'إضافة للمعرض' })}
                maxSize={10}
                enableImageSearch={true}
                searchContext={formData.name_en}
                onUploadComplete={(url) => {
                  setFormData(prev => ({
                    ...prev,
                    gallery_urls: [...(prev.gallery_urls || []), url]
                  }));
                }}
              />
              {formData.gallery_urls?.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {formData.gallery_urls.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 h-6 w-6"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            gallery_urls: prev.gallery_urls.filter((_, i) => i !== idx)
                          }));
                        }}
                      >
                        <X className="h-3 w-3 text-white" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={() => navigate(createPageUrl(`OrganizationDetail?id=${orgId}`))}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={() => updateMutation.mutate(formData)}
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-teal-600"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Saving...', ar: 'جاري الحفظ...' })}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t({ en: 'Save Changes', ar: 'حفظ التغييرات' })}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(OrganizationEdit, { requiredPermissions: ['org_edit'] });