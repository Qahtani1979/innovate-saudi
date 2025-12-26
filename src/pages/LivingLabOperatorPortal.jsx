import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Beaker, Microscope, Calendar, TrendingUp, Activity, Plus,
  BookOpen, CheckCircle2, BarChart3, Wrench, Loader2
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useMyLivingLabs } from '../hooks/useLivingLabs';
import { useRDProjects } from '../hooks/useRDProjects';
import { useMyLabBookings } from '../hooks/useLivingLabBookings';

function LivingLabOperatorPortal() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();

  // RLS: Labs I manage
  const { data: myLabs = [], isLoading: loadingLabs } = useMyLivingLabs(user?.email);

  const myLabIds = myLabs.map(l => l.id);

  // Projects in my labs
  const { data: labProjects = [], isLoading: loadingProjects } = useRDProjects({
    living_lab_id: myLabIds.length > 0 ? myLabIds : null
  });

  // Bookings for my labs
  const { data: bookings = [], isLoading: loadingBookings } = useMyLabBookings(myLabIds);

  const activeProjects = labProjects.filter(p => p.status === 'active');
  const completedProjects = labProjects.filter(p => p.status === 'completed');
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const totalCapacity = myLabs.reduce((sum, l) => sum + (l.capacity || 0), 0);
  const totalUsed = myLabs.reduce((sum, l) => sum + (l.current_projects || 0), 0);
  const avgUtilization = totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0;

  if (loadingLabs || (myLabIds.length > 0 && (loadingProjects || loadingBookings))) {
    return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-700 to-blue-600 bg-clip-text text-transparent">
            {t({ en: 'Living Lab Operator Portal', ar: 'بوابة مشغل المختبرات الحية' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Manage research labs, testbeds, and innovation facilities', ar: 'إدارة المختبرات البحثية ومرافق الابتكار' })}
          </p>
        </div>
        <Link to={createPageUrl('LivingLabCreate')}>
          <Button className="bg-gradient-to-r from-teal-600 to-blue-600">
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'New Lab', ar: 'مختبر جديد' })}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Beaker className="h-8 w-8 text-teal-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-teal-600">{myLabs.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'My Labs', ar: 'مختبراتي' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Microscope className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600">{activeProjects.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Active Projects', ar: 'مشاريع نشطة' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600">{completedProjects.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-600">{avgUtilization}%</p>
              <p className="text-sm text-slate-600">{t({ en: 'Avg Utilization', ar: 'متوسط الاستخدام' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-amber-600">{pendingBookings.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Bookings', ar: 'حجوزات' })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-600" />
              {t({ en: 'Quick Actions', ar: 'إجراءات سريعة' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to={createPageUrl('LivingLabs')}>
              <Button className="w-full justify-start bg-gradient-to-r from-teal-600 to-blue-600">
                <Beaker className="h-4 w-4 mr-2" />
                {t({ en: 'Manage Labs', ar: 'إدارة المختبرات' })}
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              {t({ en: 'View Bookings', ar: 'عرض الحجوزات' })}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Wrench className="h-4 w-4 mr-2" />
              {t({ en: 'Equipment Maintenance', ar: 'صيانة المعدات' })}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              {t({ en: 'Performance Reports', ar: 'تقارير الأداء' })}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              {t({ en: 'Recent Applications', ar: 'الطلبات الأخيرة' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingBookings.slice(0, 4).map((booking) => {
              const lab = myLabs.find(l => l.id === booking.living_lab_id);
              return (
                <div key={booking.id} className="p-3 border rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm text-slate-900">{booking.project_title || 'New Booking'}</p>
                        <Badge className="bg-yellow-100 text-yellow-700 text-xs">{booking.status}</Badge>
                      </div>
                      <p className="text-xs text-slate-600">{lab?.name_en} • {booking.requester_email}</p>
                    </div>
                    <Button size="sm">
                      {t({ en: 'Review', ar: 'مراجعة' })}
                    </Button>
                  </div>
                </div>
              );
            })}
            {pendingBookings.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                {t({ en: 'No pending bookings', ar: 'لا توجد حجوزات معلقة' })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lab Cards */}
      <div className="grid grid-cols-1 gap-6">
        {myLabs.map((lab) => {
          const projects = labProjects.filter(p => p.living_lab_id === lab.id);
          const labBookings = bookings.filter(b => b.living_lab_id === lab.id);

          return (
            <Card key={lab.id} className="border-l-4 border-l-teal-500">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono text-xs">{lab.code}</Badge>
                      <Badge className={
                        lab.status === 'active' ? 'bg-green-100 text-green-700' :
                          'bg-slate-100 text-slate-700'
                      }>{lab.status}</Badge>
                    </div>
                    <h3 className="font-bold text-xl text-slate-900 mb-1">
                      {language === 'ar' && lab.name_ar ? lab.name_ar : lab.name_en}
                    </h3>
                    <p className="text-sm text-slate-600">{lab.city_id}</p>
                  </div>
                  <Link to={createPageUrl(`LivingLabDetail?id=${lab.id}`)}>
                    <Button variant="outline">
                      {t({ en: 'Manage', ar: 'إدارة' })}
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  <div className="text-center p-3 bg-slate-50 rounded">
                    <div className="text-2xl font-bold text-slate-700">{lab.capacity || 0}</div>
                    <div className="text-xs text-slate-600">{t({ en: 'Capacity', ar: 'السعة' })}</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
                    <div className="text-xs text-slate-600">{t({ en: 'Projects', ar: 'مشاريع' })}</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded">
                    <div className="text-2xl font-bold text-purple-600">{lab.equipment?.length || 0}</div>
                    <div className="text-xs text-slate-600">{t({ en: 'Equipment', ar: 'معدات' })}</div>
                  </div>
                  <div className="text-center p-3 bg-teal-50 rounded">
                    <div className="text-2xl font-bold text-teal-600">{labBookings.length}</div>
                    <div className="text-xs text-slate-600">{t({ en: 'Bookings', ar: 'حجوزات' })}</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {lab.capacity > 0 ? Math.round((lab.current_projects / lab.capacity) * 100) : 0}%
                    </div>
                    <div className="text-xs text-slate-600">{t({ en: 'Util', ar: 'استخدام' })}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default ProtectedPage(LivingLabOperatorPortal, {
  requiredPermissions: ['livinglab_manage']
});
