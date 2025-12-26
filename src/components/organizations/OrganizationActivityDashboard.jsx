import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Activity, TrendingUp, Target, TestTube, Microscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

import { useOrganizationActivity } from '@/hooks/useOrganizationActivity';

export default function OrganizationActivityDashboard({ organizationId }) {
  const { t, isRTL } = useLanguage();

  const { data: activityData, isLoading } = useOrganizationActivity(organizationId);

  const {
    organization,
    challenges = [],
    solutions = [],
    pilots = [],
    rdProjects = [],
    programs = []
  } = activityData || {};

  const loading = isLoading;
  // loadActivityData function removed as it is now handled by the hook

  if (loading) {
    return <div className="text-center py-8">{t({ en: 'Loading...', ar: 'جاري التحميل...' })}</div>;
  }

  const totalActivities = challenges.length + solutions.length + pilots.length + rdProjects.length + programs.length;

  return (
    <div className="space-y-6">
      {/* Activity Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-900">{totalActivities}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Activities', ar: 'إجمالي الأنشطة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-900">{challenges.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Challenges', ar: 'التحديات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-yellow-900">{solutions.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Solutions', ar: 'الحلول' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-6 text-center">
            <TestTube className="h-8 w-8 text-teal-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-teal-900">{pilots.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Pilots', ar: 'التجارب' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Microscope className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-900">{rdProjects.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'R&D', ar: 'البحث' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Recent Activity', ar: 'النشاط الأخير' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {solutions.slice(0, 3).map((sol, i) => (
              <Link key={i} to={createPageUrl('SolutionDetail') + '?id=' + sol.id}>
                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{isRTL ? sol.name_ar : sol.name_en}</p>
                    <p className="text-xs text-slate-500">Solution • {new Date(sol.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge className={sol.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                    {sol.is_verified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
              </Link>
            ))}
            {pilots.slice(0, 3).map((pilot, i) => (
              <Link key={i} to={createPageUrl('PilotDetail') + '?id=' + pilot.id}>
                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                  <TestTube className="h-5 w-5 text-teal-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{isRTL ? pilot.title_ar : pilot.title_en}</p>
                    <p className="text-xs text-slate-500">Pilot • {pilot.stage}</p>
                  </div>
                  <Badge>{pilot.stage}</Badge>
                </div>
              </Link>
            ))}
            {rdProjects.slice(0, 2).map((rd, i) => (
              <Link key={i} to={createPageUrl('RDProjectDetail') + '?id=' + rd.id}>
                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                  <Microscope className="h-5 w-5 text-purple-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{isRTL ? rd.title_ar : rd.title_en}</p>
                    <p className="text-xs text-slate-500">R&D • TRL {rd.trl_current}</p>
                  </div>
                  <Badge>{rd['status'] || 'Active'}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>


    </div>
  );
}