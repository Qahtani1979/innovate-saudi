import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from './LanguageContext';
import { Shield, Activity, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function SandboxCapacityManager({ sandbox }) {
  const { language, isRTL, t } = useLanguage();

  const { data: applications = [] } = useQuery({
    queryKey: ['sandbox-applications', sandbox.id],
    queryFn: async () => {
      const all = await base44.entities.SandboxApplication.list();
      return all.filter(a => a.sandbox_id === sandbox.id);
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['sandbox-pilots', sandbox.id],
    queryFn: async () => {
      const all = await base44.entities.Pilot.list();
      return all.filter(p => p.sandbox_zone?.includes(sandbox.name_en) || p.living_lab_id === sandbox.id);
    }
  });

  const activeApplications = applications.filter(a => a.status === 'active').length;
  const pendingApplications = applications.filter(a => a.status === 'submitted' || a.status === 'under_review').length;
  const utilizationRate = sandbox.capacity ? Math.round((sandbox.current_pilots / sandbox.capacity) * 100) : 0;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Capacity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Capacity', ar: 'السعة' })}</p>
                <p className="text-3xl font-bold text-purple-600">
                  {sandbox.current_pilots}/{sandbox.capacity}
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
                <p className="text-3xl font-bold text-blue-600">{activeApplications}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Pending', ar: 'معلق' })}</p>
                <p className="text-3xl font-bold text-amber-600">{pendingApplications}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Utilization', ar: 'الاستخدام' })}</p>
                <p className="text-3xl font-bold text-green-600">{utilizationRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Utilization Bar */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Capacity Utilization', ar: 'استخدام السعة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={utilizationRate} className="h-4" />
          <div className="flex justify-between mt-2 text-sm text-slate-600">
            <span>{sandbox.current_pilots} {t({ en: 'active', ar: 'نشط' })}</span>
            <span>{sandbox.capacity - sandbox.current_pilots} {t({ en: 'available', ar: 'متاح' })}</span>
          </div>
        </CardContent>
      </Card>

      {/* Active Projects */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Active Projects', ar: 'المشاريع النشطة' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {applications
            .filter(a => a.status === 'active')
            .map((app) => (
              <div key={app.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{app.project_title}</p>
                    <p className="text-sm text-slate-600 mt-1">{app.applicant_organization}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-green-100 text-green-700">{app.status}</Badge>
                      {app.start_date && (
                        <span className="text-xs text-slate-500">
                          {app.start_date} → {app.end_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

          {activeApplications === 0 && (
            <p className="text-center text-slate-500 py-8">
              {t({ en: 'No active projects', ar: 'لا توجد مشاريع نشطة' })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Linked Pilots */}
      {pilots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Linked Pilots', ar: 'التجارب المرتبطة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pilots.map((pilot) => (
              <Link key={pilot.id} to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
                <div className="p-4 border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{pilot.title_en}</p>
                      <p className="text-sm text-slate-600">{pilot.municipality_id}</p>
                    </div>
                    <Badge>{pilot.stage?.replace(/_/g, ' ')}</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}