import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Microscope, FileText, Award, Users, Globe, Sparkles, Loader2, Linkedin, Mail, GraduationCap, Building2, MapPin } from 'lucide-react';
import { useState } from 'react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { ContactSection, BioSection, SkillsBadges, ProfessionalSection } from '../components/profile/BilingualProfileDisplay';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function ResearcherProfile() {
  const { language, isRTL, t } = useLanguage();
  const researcherId = new URLSearchParams(window.location.search).get('id');
  const [collaborators, setCollaborators] = useState([]);
  const { invokeAI, status, isLoading: loadingCollab, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: researcher } = useQuery({
    queryKey: ['researcherProfile', researcherId],
    queryFn: async () => {
      const profiles = await base44.entities.ResearcherProfile.filter({ id: researcherId });
      return profiles[0];
    }
  });

  const findCollaborators = async () => {
    const result = await invokeAI({
      prompt: `Find potential collaborators for this researcher:
Name: ${researcher?.full_name_en}
Research Areas: ${researcher?.research_areas?.join(', ')}
Expertise: ${researcher?.expertise_keywords?.join(', ')}
Institution: ${researcher?.institution_id}

Suggest 5 researchers or institutions who would be ideal collaborators based on complementary expertise.`,
      response_json_schema: {
        type: 'object',
        properties: {
          collaborators: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                institution: { type: 'string' },
                expertise: { type: 'array', items: { type: 'string' } },
                match_score: { type: 'number' },
                collaboration_potential: { type: 'string' }
              }
            }
          }
        }
      }
    });
    if (result.success) {
      setCollaborators(result.data?.collaborators || []);
    }
  };

  const r = researcher;

  return (
    <PageLayout>
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className={`flex items-start gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
              {r?.avatar_url ? (
                <img src={r.avatar_url} className="h-full w-full rounded-2xl object-cover" alt={r?.full_name_en} />
              ) : (
                <Microscope className="h-12 w-12 text-white" />
              )}
            </div>
            <div className="flex-1">
              {/* Bilingual Name */}
              <h1 className="text-3xl font-bold text-foreground">
                {language === 'ar' ? (r?.full_name_ar || r?.full_name_en) : r?.full_name_en}
              </h1>
              {r?.full_name_ar && r?.full_name_en && (
                <p className="text-lg text-muted-foreground" dir={language === 'ar' ? 'ltr' : 'rtl'}>
                  {language === 'ar' ? r?.full_name_en : r?.full_name_ar}
                </p>
              )}
              
              {/* Bilingual Title */}
              <p className="text-lg text-muted-foreground mt-1">
                {language === 'ar' ? (r?.title_ar || r?.title_en) : (r?.title_en || r?.title_ar)}
              </p>
              
              {/* Institution & Location */}
              <div className={`flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                {r?.institution_name && (
                  <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Building2 className="h-4 w-4" />
                    <span>{r.institution_name}</span>
                  </div>
                )}
                {r?.department && (
                  <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <GraduationCap className="h-4 w-4" />
                    <span>{r.department}</span>
                  </div>
                )}
              </div>
              
              {/* Badges */}
              <div className={`flex gap-2 mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {r?.is_verified && <Badge className="bg-primary">✓ {t({ en: 'Verified', ar: 'موثق' })}</Badge>}
                <Badge variant="outline">h-index: {r?.h_index || 0}</Badge>
                {r?.orcid_id && <Badge variant="outline">ORCID</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <FileText className="h-5 w-5 text-primary" />
              {t({ en: 'Publications', ar: 'المنشورات' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-4xl font-bold text-primary">{r?.publications?.length || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">{t({ en: 'Published papers', ar: 'أوراق منشورة' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Award className="h-5 w-5 text-amber-600" />
              {t({ en: 'Citations', ar: 'الاستشهادات' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-4xl font-bold text-amber-600">{r?.total_citations || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">{t({ en: 'Total citations', ar: 'إجمالي الاستشهادات' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Microscope className="h-5 w-5 text-secondary-foreground" />
              {t({ en: 'Projects', ar: 'المشاريع' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-4xl font-bold text-secondary-foreground">{r?.rd_project_ids?.length || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">{t({ en: 'Active R&D', ar: 'بحث نشط' })}</p>
          </CardContent>
        </Card>

        {/* Bio & Contact */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t({ en: 'About', ar: 'نبذة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <BioSection 
              bioEn={r?.bio_en} 
              bioAr={r?.bio_ar}
              showBoth={!!(r?.bio_en && r?.bio_ar)}
            />
            
            {/* Expertise Keywords */}
            {r?.expertise_keywords?.length > 0 && (
              <div className="pt-4 border-t">
                <SkillsBadges 
                  skills={r.expertise_keywords} 
                  label={{ en: 'Expertise', ar: 'الخبرات' }}
                  colorClass="bg-primary/10 text-primary"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Contact', ar: 'التواصل' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactSection
              email={r?.user_email || r?.email}
              linkedinUrl={r?.linkedin_url}
              website={r?.google_scholar_url || r?.website}
            />
            
            {r?.orcid_id && (
              <div className="mt-3 pt-3 border-t">
                <a 
                  href={`https://orcid.org/${r.orcid_id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  ORCID: {r.orcid_id}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Research Areas */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>{t({ en: 'Research Areas', ar: 'مجالات البحث' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <SkillsBadges 
              skills={r?.research_areas} 
              colorClass="bg-secondary text-secondary-foreground"
            />
            {!r?.research_areas?.length && (
              <p className="text-sm text-muted-foreground">{t({ en: 'No research areas specified', ar: 'لا توجد مجالات بحث محددة' })}</p>
            )}
          </CardContent>
        </Card>

        {/* Publications */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>{t({ en: 'Recent Publications', ar: 'المنشورات الحديثة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {r?.publications?.slice(0, 5).map((pub, i) => (
                <div key={i} className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium text-foreground">{pub.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {pub.journal} • {pub.year} • {pub.citations} {t({ en: 'citations', ar: 'استشهاد' })}
                  </p>
                  {pub.url && (
                    <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-2 inline-block">
                      {t({ en: 'View Publication', ar: 'عرض المنشور' })}
                    </a>
                  )}
                </div>
              ))}
              {!r?.publications?.length && (
                <p className="text-sm text-muted-foreground text-center py-4">{t({ en: 'No publications listed', ar: 'لا توجد منشورات' })}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Collaboration Recommender */}
        <Card className="md:col-span-3 border-2 border-teal-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal-600" />
              {t({ en: 'AI Collaboration Recommender', ar: 'موصي التعاون الذكي' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
            <Button onClick={findCollaborators} disabled={loadingCollab || !isAvailable} className="bg-teal-600">
              {loadingCollab ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'Find Potential Collaborators', ar: 'ابحث عن متعاونين محتملين' })}
            </Button>

            {collaborators.length > 0 && (
              <div className="space-y-3">
                {collaborators.map((collab, i) => (
                  <div key={i} className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{collab.name}</h4>
                        <p className="text-sm text-slate-600">{collab.institution}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {collab.expertise?.slice(0, 3).map((exp, j) => (
                            <Badge key={j} variant="outline" className="text-xs">{exp}</Badge>
                          ))}
                        </div>
                        <p className="text-sm text-slate-700 mt-2">{collab.collaboration_potential}</p>
                      </div>
                      <Badge className="bg-teal-600">{collab.match_score}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(ResearcherProfile, { requiredPermissions: [] });