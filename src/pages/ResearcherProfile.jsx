import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Microscope, FileText, Award, Users, Globe, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ResearcherProfile() {
  const { language, isRTL, t } = useLanguage();
  const researcherId = new URLSearchParams(window.location.search).get('id');
  const [collaborators, setCollaborators] = useState([]);
  const [loadingCollab, setLoadingCollab] = useState(false);

  const { data: researcher } = useQuery({
    queryKey: ['researcherProfile', researcherId],
    queryFn: async () => {
      const profiles = await base44.entities.ResearcherProfile.filter({ id: researcherId });
      return profiles[0];
    }
  });

  const findCollaborators = async () => {
    setLoadingCollab(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
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
      setCollaborators(result.collaborators || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCollab(false);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <Microscope className="h-12 w-12 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900">{researcher?.[`full_name_${language}`]}</h1>
              <p className="text-lg text-slate-600">{researcher?.[`title_${language}`]}</p>
              <div className="flex gap-2 mt-3">
                {researcher?.is_verified && <Badge className="bg-blue-600">✓ Verified</Badge>}
                <Badge variant="outline">h-index: {researcher?.h_index || 0}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              {t({ en: 'Publications', ar: 'المنشورات' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-4xl font-bold text-blue-600">{researcher?.publications?.length || 0}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Published papers', ar: 'أوراق منشورة' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-600" />
              {t({ en: 'Citations', ar: 'الاستشهادات' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-4xl font-bold text-amber-600">{researcher?.total_citations || 0}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Total citations', ar: 'إجمالي الاستشهادات' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Microscope className="h-5 w-5 text-purple-600" />
              {t({ en: 'Projects', ar: 'المشاريع' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-4xl font-bold text-purple-600">{researcher?.rd_project_ids?.length || 0}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Active R&D', ar: 'بحث نشط' })}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>{t({ en: 'Research Areas', ar: 'مجالات البحث' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {researcher?.research_areas?.map((area, i) => (
                <Badge key={i} variant="outline" className="text-sm">{area}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>{t({ en: 'Recent Publications', ar: 'المنشورات الحديثة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {researcher?.publications?.slice(0, 5).map((pub, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-lg">
                  <p className="font-medium text-slate-900">{pub.title}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {pub.journal} • {pub.year} • {pub.citations} citations
                  </p>
                </div>
              ))}
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
            <Button onClick={findCollaborators} disabled={loadingCollab} className="bg-teal-600">
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
    </div>
  );
}

export default ProtectedPage(ResearcherProfile, { requiredPermissions: [] });