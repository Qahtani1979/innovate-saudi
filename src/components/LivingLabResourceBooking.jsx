import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from './LanguageContext';
import { Calendar, Clock, Package, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function LivingLabResourceBooking({ lab }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    resource_type: 'equipment',
    resource_name: '',
    quantity_requested: 1,
    start_datetime: '',
    end_datetime: '',
    purpose: '',
    requester_name: '',
    requester_email: ''
  });

  const { data: resourceBookings = [] } = useQuery({
    queryKey: ['resource-bookings', lab.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('living_lab_resource_bookings')
        .select('*')
        .eq('living_lab_id', lab.id);
      if (error) throw error;
      return data || [];
    }
  });

  const bookingMutation = useMutation({
    mutationFn: async (data) => {
      const { data: booking, error } = await supabase
        .from('living_lab_resource_bookings')
        .insert({
          ...data,
          living_lab_id: lab.id,
          status: 'pending'
        })
        .select()
        .single();
      if (error) throw error;

      // Create notification for lab admin
      await supabase.from('notifications').insert({
        title: `New Resource Booking Request - ${lab.name_en}`,
        body: `${data.requester_name} has requested ${data.resource_name} from ${new Date(data.start_datetime).toLocaleString()} to ${new Date(data.end_datetime).toLocaleString()}`,
        notification_type: 'approval',
        priority: 'medium',
        link_url: `/LivingLabDetail?id=${lab.id}`,
        entity_type: 'LivingLabResourceBooking',
        entity_id: booking.id,
        action_required: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-bookings'] });
      toast.success(t({ en: 'Booking request submitted', ar: 'تم إرسال طلب الحجز' }));
      setFormData({
        resource_type: 'equipment',
        resource_name: '',
        quantity_requested: 1,
        start_datetime: '',
        end_datetime: '',
        purpose: '',
        requester_name: '',
        requester_email: ''
      });
    }
  });

  const approvalMutation = useMutation({
    mutationFn: async ({ id, approved }) => {
      const booking = resourceBookings.find(b => b.id === id);
      const { error } = await supabase
        .from('living_lab_resource_bookings')
        .update({
          status: approved ? 'approved' : 'rejected',
          approved_by: user?.email,
          approval_date: new Date().toISOString(),
          notification_sent: true
        })
        .eq('id', id);
      if (error) throw error;

      // Notify requester
      await supabase.from('notifications').insert({
        title: approved ? 'Resource Booking Approved' : 'Resource Booking Rejected',
        body: `Your booking request for ${booking?.resource_name} has been ${approved ? 'approved' : 'rejected'}.`,
        notification_type: 'alert',
        priority: approved ? 'medium' : 'high',
        link_url: `/LivingLabDetail?id=${lab.id}`,
        entity_type: 'LivingLabResourceBooking',
        entity_id: id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-bookings'] });
      toast.success(t({ en: 'Booking updated', ar: 'تم تحديث الحجز' }));
    }
  });

  const availableResources = [
    ...(lab.equipment_inventory?.map(eq => ({ name: eq.name, type: 'equipment', available: eq.status === 'available' })) || []),
    ...(lab.facilities?.map(f => ({ name: f, type: 'lab_space', available: true })) || [])
  ];

  const pendingBookings = resourceBookings.filter(b => b.status === 'pending');
  const activeBookings = resourceBookings.filter(b => b.status === 'approved' || b.status === 'active');

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            {t({ en: 'Book Resources', ar: 'حجز الموارد' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t({ en: 'Resource Type', ar: 'نوع المورد' })}</Label>
              <Select
                value={formData.resource_type}
                onValueChange={(value) => setFormData({...formData, resource_type: value, resource_name: ''})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipment">{t({ en: 'Equipment', ar: 'معدات' })}</SelectItem>
                  <SelectItem value="lab_space">{t({ en: 'Lab Space', ar: 'مساحة مختبر' })}</SelectItem>
                  <SelectItem value="technical_support">{t({ en: 'Technical Support', ar: 'دعم فني' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t({ en: 'Resource', ar: 'المورد' })}</Label>
              <Select
                value={formData.resource_name}
                onValueChange={(value) => setFormData({...formData, resource_name: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select resource', ar: 'اختر المورد' })} />
                </SelectTrigger>
                <SelectContent>
                  {availableResources
                    .filter(r => r.type === formData.resource_type)
                    .map((resource, idx) => (
                      <SelectItem key={idx} value={resource.name}>
                        {resource.name} {!resource.available && '(Unavailable)'}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>{t({ en: 'Quantity', ar: 'الكمية' })}</Label>
              <Input
                type="number"
                min="1"
                value={formData.quantity_requested}
                onChange={(e) => setFormData({...formData, quantity_requested: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <Label>{t({ en: 'Start Date/Time', ar: 'تاريخ/وقت البدء' })}</Label>
              <Input
                type="datetime-local"
                value={formData.start_datetime}
                onChange={(e) => setFormData({...formData, start_datetime: e.target.value})}
              />
            </div>

            <div>
              <Label>{t({ en: 'End Date/Time', ar: 'تاريخ/وقت الانتهاء' })}</Label>
              <Input
                type="datetime-local"
                value={formData.end_datetime}
                onChange={(e) => setFormData({...formData, end_datetime: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t({ en: 'Your Name', ar: 'الاسم' })}</Label>
              <Input
                value={formData.requester_name}
                onChange={(e) => setFormData({...formData, requester_name: e.target.value})}
              />
            </div>

            <div>
              <Label>{t({ en: 'Email', ar: 'البريد الإلكتروني' })}</Label>
              <Input
                type="email"
                value={formData.requester_email}
                onChange={(e) => setFormData({...formData, requester_email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label>{t({ en: 'Purpose', ar: 'الغرض' })}</Label>
            <Textarea
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              rows={2}
            />
          </div>

          <Button
            onClick={() => bookingMutation.mutate(formData)}
            disabled={!formData.resource_name || !formData.start_datetime || bookingMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {t({ en: 'Submit Booking Request', ar: 'إرسال طلب الحجز' })}
          </Button>
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      {user?.role === 'admin' && pendingBookings.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertCircle className="h-5 w-5" />
              {t({ en: 'Pending Approvals', ar: 'الموافقات المعلقة' })} ({pendingBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingBookings.map((booking) => (
              <div key={booking.id} className="p-4 bg-white rounded-lg border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{booking.resource_type}</Badge>
                      <Badge className="bg-amber-100 text-amber-700">{booking.status}</Badge>
                    </div>
                    <p className="font-medium">{booking.resource_name}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      {booking.requester_name} • Qty: {booking.quantity_requested}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(booking.start_datetime).toLocaleString()} → {new Date(booking.end_datetime).toLocaleString()}
                    </p>
                    {booking.purpose && (
                      <p className="text-sm text-slate-600 mt-2">{booking.purpose}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => approvalMutation.mutate({ id: booking.id, approved: true })}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={approvalMutation.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => approvalMutation.mutate({ id: booking.id, approved: false })}
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600"
                      disabled={approvalMutation.isPending}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            {t({ en: 'Active Resource Bookings', ar: 'الحجوزات النشطة' })} ({activeBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeBookings.map((booking) => (
            <div key={booking.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{booking.resource_type}</Badge>
                    <Badge className="bg-green-100 text-green-700">{booking.status}</Badge>
                  </div>
                  <p className="font-medium">{booking.resource_name}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {booking.requester_name} • Qty: {booking.quantity_requested}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(booking.start_datetime).toLocaleString()} → {new Date(booking.end_datetime).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {activeBookings.length === 0 && (
            <p className="text-center text-slate-500 py-8">
              {t({ en: 'No active bookings', ar: 'لا توجد حجوزات نشطة' })}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}