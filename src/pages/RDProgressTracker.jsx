import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Microscope, TrendingUp, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import ProtectedPage from '../components/permissions/ProtectedPage';

function RDProgressTracker() {
  const { language, isRTL, t } = useLanguage();

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects-progress'],
    queryFn: () => base44.entities.RDProject.list()
  });

  const activeProjects = rdProjects.filter(p => p.status === 'active');
  const onTrack = activeProjects.filter(p => {
    const milestones = p.timeline?.milestones || [];
    const completed = milestones.filter(m => m.status === 'completed').length;
    const total = milestones.length;
    return total > 0 && (completed / total) >= 0.7;
  }).length;

  const atRisk = activeProjects.filter(p => {
    const endDate = p.timeline?.end_date;
    if (!endDate) return false;
    const daysLeft = (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24);
    return daysLeft < 90 && daysLeft > 0;
  }).length;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'R&D Progress Tracker', ar: 'متتبع تقدم البحث والتطوير' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Monitor research project milestones and deliverables', ar: 'مراقبة معالم المشاريع البحثية والمخرجات' })}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Microscope className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{activeProjects.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Active Projects', ar: 'مشاريع نشطة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{onTrack}</p>
            <p className="text-sm text-slate-600">{t({ en: 'On Track', ar: 'على المسار' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{atRisk}</p>
            <p className="text-sm text-slate-600">{t({ en: 'At Risk', ar: 'معرض للخطر' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">
              {rdProjects.filter(p => p.status === 'completed').length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Progress */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Project Progress', ar: 'تقدم المشاريع' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeProjects.map(project => {
            const milestones = project.timeline?.milestones || [];
            const completed = milestones.filter(m => m.status === 'completed').length;
            const total = milestones.length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <Link key={project.id} to={createPageUrl(`RDProjectDetail?id=${project.id}`)}>
                <div className="p-4 border-2 rounded-lg hover:bg-purple-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-2">{project.code}</Badge>
                      <h3 className="font-semibold text-slate-900">{project.title_en}</h3>
                      <p className="text-sm text-slate-600">{project.institution_en}</p>
                    </div>
                    <Badge className={progress >= 70 ? 'bg-green-600' : progress >= 40 ? 'bg-yellow-600' : 'bg-red-600'}>
                      {progress}%
                    </Badge>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">
                        {completed}/{total} {t({ en: 'milestones', ar: 'معلم' })}
                      </span>
                      <span className="text-sm text-slate-600">
                        TRL {project.trl_start} → {project.trl_current || project.trl_start}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(RDProgressTracker, { requiredPermissions: [] });