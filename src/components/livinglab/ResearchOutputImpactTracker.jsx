import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { BookOpen, Award, TestTube, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useRDProjects } from '@/hooks/useRDProjects';
import { usePilotsList } from '@/hooks/usePilots';

export default function ResearchOutputImpactTracker({ labId }) {
  const { language, t } = useLanguage();

  const { data: projects = [] } = useRDProjects({ living_lab_id: labId });
  const { data: pilots = [] } = usePilotsList();

  const totalPublications = projects.reduce((sum, p) => sum + (p.publications?.length || 0), 0);
  const totalCitations = projects.reduce((sum, p) =>
    sum + (p.publications?.reduce((s, pub) => s + (pub.citations || 0), 0) || 0), 0);
  const totalPatents = projects.reduce((sum, p) => sum + (p.patents?.length || 0), 0);

  const pilotConversions = projects.filter(p =>
    pilots.some(pilot => pilot.rd_project_id === p.id)
  );

  const deployments = pilots.filter(p =>
    projects.some(proj => proj.id === p.rd_project_id) && p.stage === 'scaled'
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          {t({ en: 'Research Impact Lifecycle', ar: 'دورة حياة تأثير البحث' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <BookOpen className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-600">{totalPublications}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Publications', ar: 'منشورات' })}</p>
          </div>

          <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
            <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-600">{totalCitations}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Citations', ar: 'اقتباسات' })}</p>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
            <Award className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-600">{totalPatents}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Patents', ar: 'براءات' })}</p>
          </div>

          <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 text-center">
            <TestTube className="h-5 w-5 text-teal-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-teal-600">{pilotConversions.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Pilots', ar: 'تجارب' })}</p>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-center">
            <TrendingUp className="h-5 w-5 text-amber-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-amber-600">{deployments.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Deployed', ar: 'منشور' })}</p>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border-2 border-blue-300">
          <h4 className="font-semibold text-blue-900 mb-2">
            {t({ en: 'Impact Summary', ar: 'ملخص التأثير' })}
          </h4>
          <p className="text-sm text-slate-700">
            {t({
              en: `Lab research generated ${totalPublications} publications (${totalCitations} citations), ${totalPatents} patents, resulted in ${pilotConversions.length} municipal pilots with ${deployments.length} scaled deployments.`,
              ar: `بحث المختبر ولّد ${totalPublications} منشور (${totalCitations} اقتباس)، ${totalPatents} براءة اختراع، أدى إلى ${pilotConversions.length} تجربة بلدية مع ${deployments.length} عمليات نشر موسعة.`
            })}
          </p>
        </div>

        {pilotConversions.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">
              {t({ en: 'Research-to-Pilot Conversions', ar: 'تحويلات من البحث للتجربة' })}
            </h4>
            <div className="space-y-2">
              {pilotConversions.slice(0, 5).map((project) => {
                const relatedPilot = pilots.find(p => p.rd_project_id === project.id);
                return (
                  <div key={project.id} className="p-3 border rounded-lg hover:border-blue-300 hover:bg-blue-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-900">{project.title_en}</p>
                        {relatedPilot && (
                          <Link to={createPageUrl(`PilotDetail?id=${relatedPilot.id}`)} className="text-xs text-blue-600 hover:underline">
                            → {relatedPilot.title_en}
                          </Link>
                        )}
                      </div>
                      <Badge className={relatedPilot?.stage === 'scaled' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                        {relatedPilot?.stage || 'active'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
