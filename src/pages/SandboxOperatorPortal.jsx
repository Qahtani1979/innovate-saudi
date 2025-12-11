import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  Shield, Activity, CheckCircle2, Clock, AlertTriangle, Plus, FileText,
  TrendingUp, BarChart3, Users, Zap, Bell, Target, TestTube, Calendar,
  Download, Wrench
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function SandboxOperatorPortal() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();

  // Find sandboxes I operate
  const { data: mySandboxes = [] } = useQuery({
    queryKey: ['my-sandboxes', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sandboxes')
        .select('*')
        .or(`manager_email.eq.${user?.email},created_by.eq.${user?.email}`);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // RLS: Applications to my sandboxes only
  const { data: applications = [] } = useQuery({
    queryKey: ['my-sandbox-applications', mySandboxes.length],
    queryFn: async () => {
      const mySandboxIds = mySandboxes.map(s => s.id);
      const all = await base44.entities.SandboxApplication.list();
      return all.filter(a => mySandboxIds.includes(a.sandbox_id));
    },
    enabled: mySandboxes.length > 0
  });

  // Incidents in my sandboxes
  const { data: incidents = [] } = useQuery({
    queryKey: ['my-sandbox-incidents', mySandboxes.length],
    queryFn: async () => {
      const mySandboxIds = mySandboxes.map(s => s.id);
      const all = await base44.entities.SandboxIncident.list();
      return all.filter(i => mySandboxIds.includes(i.sandbox_id));
    },
    enabled: mySandboxes.length > 0
  });

  // Exemptions in my sandboxes
  const { data: exemptions = [] } = useQuery({
    queryKey: ['my-sandbox-exemptions', mySandboxes.length],
    queryFn: async () => {
      const mySandboxIds = mySandboxes.map(s => s.id);
      const all = await base44.entities.RegulatoryExemption.list();
      return all.filter(e => mySandboxIds.includes(e.sandbox_id));
    },
    enabled: mySandboxes.length > 0
  });

  const pendingApplications = applications.filter(a => ['submitted', 'under_review'].includes(a.status));
  const activeProjects = applications.filter(a => a.status === 'active');
  const criticalIncidents = incidents.filter(i => i.severity === 'high' || i.severity === 'critical');
  const totalCapacity = mySandboxes.reduce((sum, s) => sum + (s.capacity || 0), 0);
  const totalUsed = mySandboxes.reduce((sum, s) => sum + (s.current_pilots || 0), 0);
  const utilization = totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
            {t({ en: 'Sandbox Operator Portal', ar: 'بوابة مشغل مناطق الاختبار' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Manage regulatory sandboxes and innovation projects', ar: 'إدارة مناطق الاختبار التنظيمية ومشاريع الابتكار' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl('SandboxCreate')}>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: 'New Sandbox', ar: 'منطقة جديدة' })}
            </Button>
          </Link>
        </div>
      </div>

      {/* Alert Banners */}
      {criticalIncidents.length > 0 && (
        <Card className="border-2 border-red-400 bg-gradient-to-r from-red-50 to-orange-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                <Bell className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-red-900">
                  {criticalIncidents.length} {t({ en: 'Critical Safety Incident(s)', ar: 'حوادث سلامة حرجة' })}
                </p>
                <p className="text-sm text-red-700">
                  {t({ en: 'Immediate attention required', ar: 'مطلوب انتباه فوري' })}
                </p>
              </div>
              <Link to={createPageUrl('SandboxReporting') + '?filter=incidents'}>
                <Button className="bg-red-600 hover:bg-red-700">
                  {t({ en: 'View', ar: 'عرض' })}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {pendingApplications.length > 0 && (
        <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-600 flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-amber-900">
                  {pendingApplications.length} {t({ en: 'Application(s) Pending Review', ar: 'طلبات تنتظر المراجعة' })}
                </p>
              </div>
              <Link to={createPageUrl('SandboxApproval')}>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  {t({ en: 'Review', ar: 'مراجعة' })}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-600">{mySandboxes.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'My Sandboxes', ar: 'مناطقي' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600">{activeProjects.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Active Projects', ar: 'مشاريع نشطة' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600">{exemptions.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Exemptions', ar: 'إعفاءات' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-teal-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-teal-600">{utilization}%</p>
              <p className="text-sm text-slate-600">{t({ en: 'Utilization', ar: 'الاستخدام' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-red-600">{criticalIncidents.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Incidents', ar: 'حوادث' })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Sandboxes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              {t({ en: 'My Sandboxes', ar: 'مناطق الاختبار الخاصة بي' })}
            </CardTitle>
            <Link to={createPageUrl('Sandboxes')}>
              <Button size="sm" variant="outline">
                {t({ en: 'View All', ar: 'عرض الكل' })}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mySandboxes.map((sandbox) => {
              const sandboxApps = applications.filter(a => a.sandbox_id === sandbox.id);
              const activeCount = sandboxApps.filter(a => a.status === 'active').length;
              const util = sandbox.capacity > 0 ? Math.round((sandbox.current_pilots / sandbox.capacity) * 100) : 0;
              
              return (
                <Link key={sandbox.id} to={createPageUrl(`SandboxDetail?id=${sandbox.id}`)}>
                  <Card className="hover:shadow-lg transition-all border-2 hover:border-purple-400">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="font-mono text-xs">{sandbox.code}</Badge>
                            <Badge className={
                              sandbox.status === 'active' ? 'bg-green-100 text-green-700 text-xs' :
                              sandbox.status === 'full' ? 'bg-red-100 text-red-700 text-xs' :
                              'bg-slate-100 text-slate-700 text-xs'
                            }>{sandbox.status}</Badge>
                          </div>
                          <h3 className="font-semibold text-slate-900 mb-1">
                            {language === 'ar' && sandbox.name_ar ? sandbox.name_ar : sandbox.name_en}
                          </h3>
                          <p className="text-sm text-slate-600">{sandbox.domain?.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-slate-50 rounded">
                          <div className="font-bold text-slate-700">{sandboxApps.length}</div>
                          <div className="text-slate-600">{t({ en: 'Apps', ar: 'طلبات' })}</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-bold text-green-600">{activeCount}</div>
                          <div className="text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="font-bold text-purple-600">{util}%</div>
                          <div className="text-slate-600">{t({ en: 'Util', ar: 'استخدام' })}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
            {mySandboxes.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No sandboxes assigned', ar: 'لا توجد مناطق معينة' })}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-600" />
              {t({ en: 'Quick Actions', ar: 'إجراءات سريعة' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to={createPageUrl('SandboxApproval')}>
              <Button className="w-full justify-start bg-gradient-to-r from-purple-600 to-indigo-600">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t({ en: 'Review Applications', ar: 'مراجعة الطلبات' })}
              </Button>
            </Link>
            <Link to={createPageUrl('SandboxReporting')}>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                {t({ en: 'Analytics & Reports', ar: 'التحليلات والتقارير' })}
              </Button>
            </Link>
            <Link to={createPageUrl('Sandboxes')}>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                {t({ en: 'Manage Sandboxes', ar: 'إدارة المناطق' })}
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {t({ en: 'Safety Incidents', ar: 'حوادث السلامة' })}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              {t({ en: 'Recent Applications', ar: 'الطلبات الأخيرة' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {applications.slice(0, 4).map((app) => {
              const sandbox = mySandboxes.find(s => s.id === app.sandbox_id);
              return (
                <Link key={app.id} to={createPageUrl(`SandboxApplicationDetail?id=${app.id}`)}>
                  <div className="p-3 border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm text-slate-900">{app.project_title}</p>
                          <Badge className={
                            app.status === 'active' ? 'bg-green-100 text-green-700 text-xs' :
                            app.status === 'approved' ? 'bg-blue-100 text-blue-700 text-xs' :
                            'bg-yellow-100 text-yellow-700 text-xs'
                          }>{app.status}</Badge>
                        </div>
                        <p className="text-xs text-slate-600">{sandbox?.name_en} • {app.applicant_organization}</p>
                      </div>
                      <Button size="sm">
                        {t({ en: 'Review', ar: 'مراجعة' })}
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
            {applications.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                {t({ en: 'No recent applications', ar: 'لا توجد طلبات حديثة' })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProtectedPage(SandboxOperatorPortal, { 
  requiredPermissions: ['sandbox_manage'] 
});