import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Building2, CheckCircle2, XCircle, Star } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function VendorApproval() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedVendor, setSelectedVendor] = React.useState(null);
  const [reviewNotes, setReviewNotes] = React.useState('');

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors-pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('status', 'under_review');
      if (error) throw error;
      return data || [];
    }
  });

  const approveMutation = useMutation({
    mutationFn: async ({ vendorId, approved }) => {
      const { error } = await supabase
        .from('vendors')
        .update({
          status: approved ? 'approved' : 'registered',
          is_approved: approved,
          approval_date: approved ? new Date().toISOString() : null,
          reviewed_by: user?.email,
          review_notes: reviewNotes
        })
        .eq('id', vendorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors-pending'] });
      setSelectedVendor(null);
      setReviewNotes('');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Vendor Approval Queue', ar: 'قائمة الموافقات على الموردين' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Review and approve vendor registrations', ar: 'مراجعة والموافقة على تسجيلات الموردين' })}
        </p>
      </div>

      <Card className="border-2 border-blue-300 bg-blue-50">
        <CardContent className="pt-6 text-center">
          <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-2" />
          <p className="text-4xl font-bold text-blue-600">{vendors.length}</p>
          <p className="text-sm text-slate-600">{t({ en: 'Pending Approval', ar: 'في انتظار الموافقة' })}</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {vendors.map(vendor => (
          <Card key={vendor.id} className="border-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{vendor.name_en || vendor.name_ar}</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">{vendor.code}</p>
                </div>
                <Badge className="bg-blue-200 text-blue-800">{vendor.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-600">{t({ en: 'Vendor Type', ar: 'نوع المورد' })}</p>
                  <p className="text-sm text-slate-900">{vendor.vendor_type}</p>
                </div>
                {vendor.sector && vendor.sector.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600">{t({ en: 'Sectors', ar: 'القطاعات' })}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {vendor.sector.slice(0, 2).map((s, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {vendor.certifications && vendor.certifications.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600">{t({ en: 'Certifications', ar: 'الشهادات' })}</p>
                    <Badge className="bg-green-100 text-green-700 text-xs mt-1">
                      {vendor.certifications.length} {t({ en: 'certs', ar: 'شهادة' })}
                    </Badge>
                  </div>
                )}
              </div>

              {selectedVendor === vendor.id ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder={t({ en: 'Review notes...', ar: 'ملاحظات المراجعة...' })}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="h-24"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => approveMutation.mutate({ vendorId: vendor.id, approved: true })}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {t({ en: 'Approve', ar: 'موافقة' })}
                    </Button>
                    <Button
                      onClick={() => approveMutation.mutate({ vendorId: vendor.id, approved: false })}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {t({ en: 'Reject', ar: 'رفض' })}
                    </Button>
                    <Button
                      onClick={() => setSelectedVendor(null)}
                      variant="outline"
                    >
                      {t({ en: 'Cancel', ar: 'إلغاء' })}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setSelectedVendor(vendor.id)}>
                  {t({ en: 'Review', ar: 'مراجعة' })}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ProtectedPage(VendorApproval, { requiredPermissions: ['vendor_approve'] });