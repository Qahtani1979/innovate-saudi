import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { 
  UserCog, Clock, CheckCircle2, XCircle, AlertCircle, ArrowUpCircle, 
  Building2, GraduationCap, Briefcase, Microscope, Users, Shield
} from 'lucide-react';

const PERSONA_OPTIONS = [
  { value: 'municipality', label: { en: 'Municipality Staff', ar: 'موظف بلدية' }, icon: Building2, description: { en: 'Work for a municipality and manage local innovation', ar: 'العمل لدى بلدية وإدارة الابتكار المحلي' } },
  { value: 'provider', label: { en: 'Solution Provider / Startup', ar: 'مزود حلول / شركة ناشئة' }, icon: Briefcase, description: { en: 'Offer solutions to municipal challenges', ar: 'تقديم حلول للتحديات البلدية' } },
  { value: 'expert', label: { en: 'Expert / Evaluator', ar: 'خبير / مقيّم' }, icon: GraduationCap, description: { en: 'Evaluate proposals and provide expertise', ar: 'تقييم المقترحات وتقديم الخبرة' } },
  { value: 'researcher', label: { en: 'Researcher / Academic', ar: 'باحث / أكاديمي' }, icon: Microscope, description: { en: 'Conduct R&D and academic research', ar: 'إجراء البحث والتطوير الأكاديمي' } },
];

// Rate limit: max 1 request every 30 days
const RATE_LIMIT_DAYS = 30;

export default function RoleRequestCard() {
  const { t, language, isRTL } = useLanguage();
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();
  
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [justification, setJustification] = useState('');

  // Fetch existing role requests
  const { data: roleRequests = [], isLoading } = useQuery({
    queryKey: ['my-role-requests', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_requests')
        .select('*')
        .eq('user_email', user?.email)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.email
  });

  // Check rate limit
  const canSubmitNewRequest = () => {
    if (roleRequests.length === 0) return true;
    const lastRequest = roleRequests[0];
    const daysSinceLastRequest = Math.floor((Date.now() - new Date(lastRequest.created_at).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceLastRequest >= RATE_LIMIT_DAYS;
  };

  const hasPendingRequest = roleRequests.some(r => r.status === 'pending');
  const daysUntilCanRequest = roleRequests.length > 0 
    ? Math.max(0, RATE_LIMIT_DAYS - Math.floor((Date.now() - new Date(roleRequests[0].created_at).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Submit role request mutation
  const submitRequestMutation = useMutation({
    mutationFn: async ({ role, justification }) => {
      const { data, error } = await supabase
        .from('role_requests')
        .insert({
          user_id: user?.id,
          user_email: user?.email,
          requested_role: role,
          justification,
          status: 'pending'
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-role-requests']);
      toast.success(t({ en: 'Role request submitted successfully', ar: 'تم إرسال طلب الدور بنجاح' }));
      setShowRequestDialog(false);
      setSelectedRole('');
      setJustification('');
    },
    onError: (error) => {
      console.error('Role request error:', error);
      toast.error(t({ en: 'Failed to submit request', ar: 'فشل في إرسال الطلب' }));
    }
  });

  const handleSubmitRequest = () => {
    if (!selectedRole) {
      toast.error(t({ en: 'Please select a role', ar: 'يرجى اختيار دور' }));
      return;
    }
    if (!justification.trim() || justification.length < 50) {
      toast.error(t({ en: 'Please provide a detailed justification (min 50 characters)', ar: 'يرجى تقديم مبرر مفصل (50 حرف على الأقل)' }));
      return;
    }
    submitRequestMutation.mutate({ role: selectedRole, justification });
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: { icon: Clock, className: 'bg-yellow-100 text-yellow-700', label: { en: 'Pending', ar: 'قيد الانتظار' } },
      approved: { icon: CheckCircle2, className: 'bg-green-100 text-green-700', label: { en: 'Approved', ar: 'مقبول' } },
      rejected: { icon: XCircle, className: 'bg-red-100 text-red-700', label: { en: 'Rejected', ar: 'مرفوض' } }
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {t(config.label)}
      </Badge>
    );
  };

  const getRoleLabel = (role) => {
    const labels = {
      municipality: { en: 'Municipality Staff', ar: 'موظف بلدية' },
      provider: { en: 'Provider', ar: 'مزود' },
      expert: { en: 'Expert', ar: 'خبير' },
      researcher: { en: 'Researcher', ar: 'باحث' },
      citizen: { en: 'Citizen', ar: 'مواطن' }
    };
    return t(labels[role] || { en: role, ar: role });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5" />
          {t({ en: 'Account Type & Role Request', ar: 'نوع الحساب وطلب الدور' })}
        </CardTitle>
        <CardDescription>
          {t({ en: 'Request access to additional platform features based on your role', ar: 'اطلب الوصول إلى ميزات إضافية بناءً على دورك' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Role */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-1">{t({ en: 'Current Account Type', ar: 'نوع الحساب الحالي' })}</p>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold capitalize">{userProfile?.selected_persona || 'Citizen'}</span>
          </div>
        </div>

        {/* Pending Request Warning */}
        {hasPendingRequest && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t({ en: 'You have a pending role request. Please wait for admin review.', ar: 'لديك طلب دور قيد الانتظار. يرجى انتظار مراجعة المسؤول.' })}
            </AlertDescription>
          </Alert>
        )}

        {/* Rate Limit Warning */}
        {!canSubmitNewRequest() && !hasPendingRequest && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              {t({ 
                en: `You can submit a new request in ${daysUntilCanRequest} days.`, 
                ar: `يمكنك تقديم طلب جديد خلال ${daysUntilCanRequest} يوم.` 
              })}
            </AlertDescription>
          </Alert>
        )}

        {/* Request Button */}
        <Button 
          onClick={() => setShowRequestDialog(true)}
          disabled={hasPendingRequest || !canSubmitNewRequest()}
          className="w-full"
        >
          <ArrowUpCircle className="h-4 w-4 mr-2" />
          {t({ en: 'Request Role Change', ar: 'طلب تغيير الدور' })}
        </Button>

        {/* Previous Requests */}
        {roleRequests.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3">{t({ en: 'Request History', ar: 'سجل الطلبات' })}</p>
            <div className="space-y-2">
              {roleRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{getRoleLabel(request.requested_role)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t({ en: 'Request Role Change', ar: 'طلب تغيير الدور' })}</DialogTitle>
            <DialogDescription>
              {t({ en: 'Select the role you want to request and provide justification', ar: 'اختر الدور الذي تريده وقدم المبررات' })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Select Role', ar: 'اختر الدور' })}
              </label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Choose a role...', ar: 'اختر دوراً...' })} />
                </SelectTrigger>
                <SelectContent>
                  {PERSONA_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{t(option.label)}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedRole && (
                <p className="text-xs text-muted-foreground mt-2">
                  {t(PERSONA_OPTIONS.find(o => o.value === selectedRole)?.description || { en: '', ar: '' })}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Justification', ar: 'المبرر' })}
              </label>
              <Textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder={t({ 
                  en: 'Explain why you need this role (organization, position, purpose)...', 
                  ar: 'اشرح لماذا تحتاج هذا الدور (المنظمة، المنصب، الغرض)...' 
                })}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {justification.length}/50 {t({ en: 'characters minimum', ar: 'حرف على الأقل' })}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button 
              onClick={handleSubmitRequest}
              disabled={submitRequestMutation.isPending || !selectedRole || justification.length < 50}
            >
              {t({ en: 'Submit Request', ar: 'إرسال الطلب' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
