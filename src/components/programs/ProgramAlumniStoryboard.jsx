import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Award, Rocket, Sparkles, Users, TrendingUp, Lightbulb, TestTube, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { toast } from 'sonner';

export default function ProgramAlumniStoryboard({ program, showPublicOnly = false }) {
  const { language, isRTL, t } = useLanguage();
  const [generatingStories, setGeneratingStories] = useState(false);
  const [aiStories, setAiStories] = useState(null);

  // Fetch program participants/alumni
  const { data: applications = [] } = useQuery({
    queryKey: ['program-applications-alumni', program?.id],
    queryFn: async () => {
      const all = await base44.entities.ProgramApplication.list();
      return all.filter(a => 
        a.program_id === program.id && 
        (a.status === 'graduated' || a.status === 'active')
      );
    },
    enabled: !!program
  });

  // Fetch solutions by alumni
  const { data: alumniSolutions = [] } = useQuery({
    queryKey: ['alumni-solutions', program?.id],
    queryFn: async () => {
      const participantEmails = applications.map(a => a.applicant_email);
      if (participantEmails.length === 0) return [];
      
      const all = await base44.entities.Solution.list();
      return all.filter(s => 
        participantEmails.includes(s.created_by) ||
        participantEmails.some(email => s.provider_name?.includes(email))
      );
    },
    enabled: applications.length > 0
  });

  // Fetch pilots by alumni
  const { data: alumniPilots = [] } = useQuery({
    queryKey: ['alumni-pilots', program?.id],
    queryFn: async () => {
      const participantEmails = applications.map(a => a.applicant_email);
      if (participantEmails.length === 0) return [];
      
      const all = await base44.entities.Pilot.list();
      return all.filter(p => 
        participantEmails.includes(p.created_by) ||
        p.team?.some(t => participantEmails.includes(t.email))
      );
    },
    enabled: applications.length > 0
  });

  const handleGenerateStories = async () => {
    setGeneratingStories(true);
    try {
      const alumniData = applications.slice(0, 10).map(app => ({
        name: app.applicant_name || app.applicant_email,
        organization: app.organization_name,
        achievements: {
          solutions: alumniSolutions.filter(s => s.created_by === app.applicant_email).length,
          pilots: alumniPilots.filter(p => p.created_by === app.applicant_email).length
        }
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate inspiring alumni success stories for this innovation program in BOTH English and Arabic:

Program: ${program.name_en}
Type: ${program.program_type}
Alumni Data: ${JSON.stringify(alumniData)}

For each alumnus (up to 6), create a bilingual success story:
1. Impact summary (what they achieved post-program)
2. Key milestone (solution launched, pilot scaled, funding raised, etc.)
3. Quote (inspirational testimonial)
4. Current status (company stage, research position, etc.)

Return stories with both en and ar for each field.`,
        response_json_schema: {
          type: 'object',
          properties: {
            stories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  alumnus_name: { type: 'string' },
                  impact_summary_en: { type: 'string' },
                  impact_summary_ar: { type: 'string' },
                  milestone_en: { type: 'string' },
                  milestone_ar: { type: 'string' },
                  quote_en: { type: 'string' },
                  quote_ar: { type: 'string' },
                  current_status_en: { type: 'string' },
                  current_status_ar: { type: 'string' }
                }
              }
            }
          }
        }
      });
      setAiStories(result);
    } catch (error) {
      toast.error(t({ en: 'Failed to generate stories', ar: 'فشل توليد القصص' }));
    } finally {
      setGeneratingStories(false);
    }
  };

  if (!program) return null;

  const graduatedCount = applications.filter(a => a.status === 'graduated').length;
  const totalSolutions = alumniSolutions.length;
  const totalPilots = alumniPilots.length;

  return (
    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            {t({ en: 'Alumni Success Stories', ar: 'قصص نجاح الخريجين' })}
          </CardTitle>
          <Button 
            onClick={handleGenerateStories}
            disabled={generatingStories || graduatedCount === 0}
            className="bg-amber-600"
          >
            {generatingStories ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Generate Stories', ar: 'توليد القصص' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Impact Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600">{graduatedCount}</div>
            <div className="text-xs text-slate-600 mt-1">{t({ en: 'Graduates', ar: 'خريج' })}</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{totalSolutions}</div>
            <div className="text-xs text-slate-600 mt-1">{t({ en: 'Solutions', ar: 'حل' })}</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-3xl font-bold text-purple-600">{totalPilots}</div>
            <div className="text-xs text-slate-600 mt-1">{t({ en: 'Pilots', ar: 'تجربة' })}</div>
          </div>
        </div>

        {/* AI Generated Stories */}
        {aiStories?.stories && aiStories.stories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiStories.stories.map((story, idx) => (
              <Card key={idx} className="bg-white border-2 border-amber-300 hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
                      {story.alumnus_name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{story.alumnus_name}</h4>
                      <p className="text-xs text-slate-600">
                        {language === 'ar' ? story.current_status_ar : story.current_status_en}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-semibold text-blue-900 mb-1">
                        {t({ en: 'Achievement', ar: 'الإنجاز' })}
                      </p>
                      <p className="text-sm text-blue-800">
                        {language === 'ar' ? story.milestone_ar : story.milestone_en}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-xs italic text-purple-800">
                        "{language === 'ar' ? story.quote_ar : story.quote_en}"
                      </p>
                    </div>
                    <p className="text-xs text-slate-700">
                      {language === 'ar' ? story.impact_summary_ar : story.impact_summary_en}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Alumni Solutions Showcase */}
        {alumniSolutions.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              {t({ en: 'Solutions Developed by Alumni', ar: 'الحلول المطورة من الخريجين' })}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {alumniSolutions.slice(0, 6).map((solution) => (
                <Link key={solution.id} to={createPageUrl(`SolutionDetail?id=${solution.id}`)}>
                  <Card className="hover:shadow-md transition-all border hover:border-amber-400">
                    <CardContent className="pt-4">
                      <Badge className="mb-2 bg-amber-100 text-amber-700 text-xs">
                        {solution.maturity_level?.replace(/_/g, ' ')}
                      </Badge>
                      <h4 className="font-medium text-sm text-slate-900 line-clamp-2">
                        {language === 'ar' && solution.name_ar ? solution.name_ar : solution.name_en}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">{solution.provider_name}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Alumni Pilots */}
        {alumniPilots.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <TestTube className="h-4 w-4 text-blue-600" />
              {t({ en: 'Pilots Led by Alumni', ar: 'التجارب بقيادة الخريجين' })}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {alumniPilots.slice(0, 6).map((pilot) => (
                <Link key={pilot.id} to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
                  <Card className="hover:shadow-md transition-all border hover:border-blue-400">
                    <CardContent className="pt-4">
                      <Badge className="mb-2 bg-blue-100 text-blue-700 text-xs">
                        {pilot.stage?.replace(/_/g, ' ')}
                      </Badge>
                      <h4 className="font-medium text-sm text-slate-900 line-clamp-2">
                        {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">{pilot.sector?.replace(/_/g, ' ')}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {graduatedCount === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">
              {t({ en: 'No alumni yet - check back after program completion', ar: 'لا يوجد خريجون بعد - تحقق بعد إكمال البرنامج' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}