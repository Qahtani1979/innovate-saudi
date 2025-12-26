import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '@/components/LanguageContext';
import {
  Users,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Mail,
  Download,
  Loader2,
  UserPlus
} from 'lucide-react';
import { useEventRegistrations } from '@/hooks/useEventRegistrations';

const attendanceStatusColors = {
  registered: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  attended: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  no_show: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
};

export default function EventAttendeeList({ eventId, canManage = false }) {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const {
    registrations,
    isLoading,
    updateStatus,
    isUpdating
  } = useEventRegistrations({ eventId });

  const filteredRegistrations = (registrations || []).filter(reg => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();

    return reg.user_profiles?.full_name?.toLowerCase().includes(search) ||

      reg.attendee_email?.toLowerCase().includes(search);
  });

  const stats = {
    total: registrations.length,
    confirmed: registrations.filter(r => r.attendance_status === 'confirmed').length,
    attended: registrations.filter(r => r.attendance_status === 'attended').length,
    noShow: registrations.filter(r => r.attendance_status === 'no_show').length
  };

  const exportAttendees = () => {
    const csvContent = [
      ['Name', 'Email', 'Status', 'Registered At'].join(','),
      ...registrations.map(reg => [
        reg.user_profiles?.full_name || 'N/A',
        reg.user_profiles?.email || reg.attendee_email || 'N/A',
        reg.attendance_status || 'registered',
        new Date(reg.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-attendees-${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {t({ en: 'Attendees', ar: 'الحضور' })}
            <Badge variant="secondary">{stats.total}</Badge>
          </CardTitle>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t({ en: 'Search...', ar: 'بحث...' })}
                className="pl-9 w-[150px] lg:w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {canManage && (
              <Button variant="outline" size="sm" onClick={exportAttendees}>
                <Download className="h-4 w-4 mr-2" />
                {t({ en: 'Export', ar: 'تصدير' })}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold text-foreground">{stats.total}</p>
            <p className="text-[10px] text-muted-foreground uppercase">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
          </div>
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-lg font-bold text-green-600">{stats.confirmed}</p>
            <p className="text-[10px] text-muted-foreground uppercase">{t({ en: 'Confirmed', ar: 'مؤكد' })}</p>
          </div>
          <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <p className="text-lg font-bold text-emerald-600">{stats.attended}</p>
            <p className="text-[10px] text-muted-foreground uppercase">{t({ en: 'Attended', ar: 'حضر' })}</p>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-lg font-bold text-red-600">{stats.noShow}</p>
            <p className="text-[10px] text-muted-foreground uppercase">{t({ en: 'No Show', ar: 'لم يحضر' })}</p>
          </div>
        </div>

        <div className="space-y-2">
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <UserPlus className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground font-medium">
                {searchTerm
                  ? t({ en: 'No matches found', ar: 'لا توجد نتائج مطابقة' })
                  : t({ en: 'No registrations yet', ar: 'لا توجد تسجيلات بعد' })}
              </p>
            </div>
          ) : (
            <div className="border rounded-md divide-y overflow-hidden">
              {filteredRegistrations.map((reg) => (
                <div key={reg.id} className="p-3 flex items-center justify-between hover:bg-muted/5 transition-colors">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Avatar className="h-8 w-8 border">

                      <AvatarImage src={reg.user_profiles?.avatar_url} />
                      <AvatarFallback className="text-[10px]">

                        {reg.user_profiles?.full_name?.split(' ').map(n => n[0]).join('') ||

                          reg.attendee_email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-0.5">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="font-medium text-xs">

                          {reg.user_profiles?.full_name || reg.attendee_email}
                        </span>

                        {reg.registration_type === 'vip' && (
                          <Badge variant="warning" className="text-[8px] h-3 px-1 py-0 border-none">VIP</Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">

                        {reg.user_profiles?.email || reg.attendee_email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="text-right hidden sm:flex flex-col items-end">
                      <Badge className={`${attendanceStatusColors[reg.attendance_status] || 'bg-slate-100'} text-[10px] px-1.5 py-0 border-none shadow-none`}>
                        {t({
                          en: reg.attendance_status,
                          ar: reg.attendance_status === 'registered' ? 'مسجل' :
                            reg.attendance_status === 'confirmed' ? 'مؤكد' :
                              reg.attendance_status === 'attended' ? 'حضر' :
                                reg.attendance_status === 'no_show' ? 'لم يحضر' : 'ملغي'
                        })}
                      </Badge>
                    </div>

                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isUpdating}>
                            {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <MoreVertical className="h-3 w-3" />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {

                              updateStatus({
                                registrationId: reg.id,
                                status: 'confirmed'
                              });
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            {t({ en: 'Mark Confirmed', ar: 'تأكيد' })}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {

                              updateStatus({
                                registrationId: reg.id,
                                status: 'attended'
                              });
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                            {t({ en: 'Mark Attended', ar: 'حضر' })}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {

                              updateStatus({
                                registrationId: reg.id,
                                status: 'no_show'
                              });
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2 text-red-600" />
                            {t({ en: 'Mark No Show', ar: 'لم يحضر' })}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
