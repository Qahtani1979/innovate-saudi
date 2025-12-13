import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { toast } from 'sonner';

const attendanceStatusColors = {
  registered: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  attended: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  no_show: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
};

export default function EventAttendeeList({ eventId, canManage = false }) {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['event-registrations', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          user_profiles:user_id (
            id,
            full_name,
            avatar_url,
            email
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!eventId
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ registrationId, status }) => {
      const { error } = await supabase
        .from('event_registrations')
        .update({ attendance_status: status })
        .eq('id', registrationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['event-registrations', eventId]);
      toast.success(t({ en: 'Status updated', ar: 'تم تحديث الحالة' }));
    },
    onError: () => {
      toast.error(t({ en: 'Failed to update status', ar: 'فشل تحديث الحالة' }));
    }
  });

  const filteredRegistrations = registrations.filter(reg => {
    if (!searchTerm) return true;
    const name = reg.user_profiles?.full_name || reg.attendee_email || '';
    const email = reg.user_profiles?.email || reg.attendee_email || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase());
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
          {canManage && (
            <Button variant="outline" size="sm" onClick={exportAttendees}>
              <Download className="h-4 w-4 mr-2" />
              {t({ en: 'Export', ar: 'تصدير' })}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
          </div>
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-lg font-bold text-green-600">{stats.confirmed}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Confirmed', ar: 'مؤكد' })}</p>
          </div>
          <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <p className="text-lg font-bold text-emerald-600">{stats.attended}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Attended', ar: 'حضر' })}</p>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-lg font-bold text-red-600">{stats.noShow}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'No Show', ar: 'لم يحضر' })}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t({ en: 'Search attendees...', ar: 'بحث في الحضور...' })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Attendee List */}
        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-8">
            <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              {searchTerm 
                ? t({ en: 'No attendees found', ar: 'لم يتم العثور على حضور' })
                : t({ en: 'No registrations yet', ar: 'لا توجد تسجيلات بعد' })
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredRegistrations.map(reg => (
              <div 
                key={reg.id} 
                className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={reg.user_profiles?.avatar_url} />
                    <AvatarFallback>
                      {(reg.user_profiles?.full_name || reg.attendee_email || '?')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {reg.user_profiles?.full_name || t({ en: 'Guest', ar: 'ضيف' })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reg.user_profiles?.email || reg.attendee_email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={attendanceStatusColors[reg.attendance_status || 'registered']}>
                    {(reg.attendance_status || 'registered').replace(/_/g, ' ')}
                  </Badge>

                  {canManage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => updateStatusMutation.mutate({ 
                            registrationId: reg.id, 
                            status: 'confirmed' 
                          })}
                        >
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          {t({ en: 'Mark Confirmed', ar: 'تأكيد' })}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => updateStatusMutation.mutate({ 
                            registrationId: reg.id, 
                            status: 'attended' 
                          })}
                        >
                          <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                          {t({ en: 'Mark Attended', ar: 'حضر' })}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => updateStatusMutation.mutate({ 
                            registrationId: reg.id, 
                            status: 'no_show' 
                          })}
                        >
                          <XCircle className="h-4 w-4 mr-2 text-red-600" />
                          {t({ en: 'Mark No Show', ar: 'لم يحضر' })}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          {t({ en: 'Send Email', ar: 'إرسال بريد' })}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
