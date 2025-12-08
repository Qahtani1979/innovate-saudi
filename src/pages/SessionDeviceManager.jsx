import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { Monitor, Smartphone, Globe, MapPin, Clock, LogOut, Shield, AlertTriangle, Trash2, Search, Settings } from 'lucide-react';
import SessionTimeoutConfig from '../components/access/SessionTimeoutConfig';
import MultiDevicePolicyBuilder from '../components/access/MultiDevicePolicyBuilder';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';

function SessionDeviceManager() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.UserSession.list('-last_activity', 200)
  });

  const forceLogoutMutation = useMutation({
    mutationFn: (id) => base44.entities.UserSession.update(id, { 
      is_active: false,
      logout_time: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['sessions']);
      toast.success(t({ en: 'Session terminated', ar: 'تم إنهاء الجلسة' }));
    }
  });

  const toggleTrustMutation = useMutation({
    mutationFn: ({ id, trusted }) => base44.entities.UserSession.update(id, { is_trusted: trusted }),
    onSuccess: () => {
      queryClient.invalidateQueries(['sessions']);
      toast.success(t({ en: 'Device trust updated', ar: 'تم تحديث ثقة الجهاز' }));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.UserSession.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['sessions']);
      toast.success(t({ en: 'Session deleted', ar: 'تم حذف الجلسة' }));
    }
  });

  const filteredSessions = sessions.filter(s => 
    s.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.session_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSessions = sessions.filter(s => s.is_active);
  const trustedDevices = sessions.filter(s => s.is_trusted);
  const uniqueUsers = new Set(sessions.map(s => s.user_email)).size;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-700 via-gray-700 to-zinc-700 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '🖥️ Session & Device Management', ar: '🖥️ إدارة الجلسات والأجهزة' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Monitor active sessions, manage devices, and enforce security policies', ar: 'مراقبة الجلسات النشطة وإدارة الأجهزة وتطبيق سياسات الأمان' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <Monitor className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{activeSessions.length}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Active Sessions', ar: 'جلسات نشطة' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{trustedDevices.length}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Trusted Devices', ar: 'أجهزة موثوقة' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Globe className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{uniqueUsers}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Active Users', ar: 'مستخدمون نشطون' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-50 to-white">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-600">{sessions.length}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Total Sessions', ar: 'إجمالي الجلسات' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
          <Input
            placeholder={t({ en: 'Search by user email or session ID...', ar: 'البحث بالبريد أو معرف الجلسة...' })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={isRTL ? 'pr-10' : 'pl-10'}
          />
        </div>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Active Sessions', ar: 'الجلسات النشطة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>{t({ en: 'User', ar: 'المستخدم' })}</TableHead>
                <TableHead>{t({ en: 'Device', ar: 'الجهاز' })}</TableHead>
                <TableHead>{t({ en: 'Location', ar: 'الموقع' })}</TableHead>
                <TableHead>{t({ en: 'Login Time', ar: 'وقت الدخول' })}</TableHead>
                <TableHead>{t({ en: 'Last Activity', ar: 'آخر نشاط' })}</TableHead>
                <TableHead>{t({ en: 'Status', ar: 'الحالة' })}</TableHead>
                <TableHead className="text-right">{t({ en: 'Actions', ar: 'الإجراءات' })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={session.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{session.user_email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {session.device_info?.is_mobile ? (
                        <Smartphone className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Monitor className="h-4 w-4 text-slate-600" />
                      )}
                      <div className="text-xs">
                        <p className="font-medium">{session.device_info?.browser || 'Unknown'}</p>
                        <p className="text-slate-500">{session.device_info?.os || '-'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span>{session.location?.city || 'Unknown'}, {session.location?.country || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {session.login_time ? new Date(session.login_time).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {session.last_activity ? new Date(session.last_activity).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={session.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                        {session.is_active ? t({ en: 'Active', ar: 'نشط' }) : t({ en: 'Inactive', ar: 'غير نشط' })}
                      </Badge>
                      {session.is_trusted && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          {t({ en: 'Trusted', ar: 'موثوق' })}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleTrustMutation.mutate({ id: session.id, trusted: !session.is_trusted })}
                        className="hover:bg-blue-50"
                      >
                        <Shield className={`h-4 w-4 ${session.is_trusted ? 'text-blue-600' : 'text-slate-400'}`} />
                      </Button>
                      {session.is_active && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(t({ en: 'Force logout this session?', ar: 'إنهاء هذه الجلسة؟' }))) {
                              forceLogoutMutation.mutate(session.id);
                            }
                          }}
                          className="hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(session.id)}
                        className="hover:bg-slate-100"
                      >
                        <Trash2 className="h-4 w-4 text-slate-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Session & Device Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SessionTimeoutConfig 
          onSave={(config) => {
            toast.success(t({ en: 'Session config saved', ar: 'تم حفظ الإعدادات' }));
          }}
        />
        <MultiDevicePolicyBuilder
          onSave={(policy) => {
            toast.success(t({ en: 'Device policy saved', ar: 'تم حفظ سياسة الأجهزة' }));
          }}
        />
      </div>

      {/* Device Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Devices by Type', ar: 'الأجهزة حسب النوع' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-slate-600" />
                  <span className="text-sm font-medium">{t({ en: 'Desktop', ar: 'سطح المكتب' })}</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {sessions.filter(s => !s.device_info?.is_mobile).length}
                </p>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">{t({ en: 'Mobile', ar: 'الجوال' })}</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {sessions.filter(s => s.device_info?.is_mobile).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Security Status', ar: 'حالة الأمان' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">{t({ en: 'Trusted Devices', ar: 'أجهزة موثوقة' })}</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{trustedDevices.length}</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-medium">{t({ en: 'Untrusted', ar: 'غير موثوق' })}</span>
                </div>
                <p className="text-2xl font-bold text-amber-900">{sessions.filter(s => !s.is_trusted).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProtectedPage(SessionDeviceManager, { requiredPermissions: ['user_manage', 'security_manage'] });