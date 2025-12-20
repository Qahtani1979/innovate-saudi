import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { UserPlus, Send, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from 'sonner';

// Predefined role types for the platform
const ROLE_OPTIONS = [
  { id: 'municipality_staff', name: { en: 'Municipality Staff', ar: 'موظف بلدية' } },
  { id: 'provider', name: { en: 'Solution Provider', ar: 'مزود حلول' } },
  { id: 'researcher', name: { en: 'Researcher / Academic', ar: 'باحث / أكاديمي' } },
  { id: 'expert', name: { en: 'Expert / Evaluator', ar: 'خبير / مقيّم' } },
  { id: 'program_manager', name: { en: 'Program Manager', ar: 'مدير برنامج' } },
  { id: 'pilot_manager', name: { en: 'Pilot Manager', ar: 'مدير تجربة' } },
  { id: 'moderator', name: { en: 'Moderator', ar: 'مشرف' } },
  { id: 'admin', name: { en: 'Administrator', ar: 'مسؤول' } },
];

export default function RoleRequestDialog({ open, onOpenChange, availableRoles, preSelectedRole }) {
  const { t, language } = useLanguage();
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    requested_role: preSelectedRole || '',
    justification: ''
  });
  const [rateLimitError, setRateLimitError] = useState(null);
  const [remainingRequests, setRemainingRequests] = useState(3);

  // Update form when preSelectedRole changes
  useEffect(() => {
    if (preSelectedRole) {
      setFormData(prev => ({ ...prev, requested_role: preSelectedRole }));
    }
  }, [preSelectedRole]);

  const roleOptions = availableRoles || ROLE_OPTIONS;

  // Check rate limit on mount
  useQuery({
    queryKey: ['role-request-rate-limit', user?.email],
    queryFn: async () => {
      if (!user?.email) return { count: 0 };
      
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('role_requests')
        .select('id')
        .eq('user_email', user.email)
        .gte('created_at', twentyFourHoursAgo);
      
      if (error) throw error;
      
      const count = data?.length || 0;
      setRemainingRequests(3 - count);
      
      if (count >= 3) {
        setRateLimitError(t({ 
          en: 'Maximum 3 role requests per 24 hours reached. Please try again tomorrow.', 
          ar: 'تم الوصول إلى الحد الأقصى 3 طلبات في 24 ساعة. يرجى المحاولة غداً.' 
        }));
      }
      
      return { count };
    },
    enabled: open && !!user?.email,
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data) => {
      // Final rate limit check before submission
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data: recentRequests, error: checkError } = await supabase
        .from('role_requests')
        .select('id')
        .eq('user_email', user.email)
        .gte('created_at', twentyFourHoursAgo);
      
      if (checkError) throw checkError;
      
      if (recentRequests.length >= 3) {
        throw new Error(t({ 
          en: 'Rate limit: Maximum 3 role requests per 24 hours', 
          ar: 'الحد الأقصى: 3 طلبات في 24 ساعة' 
        }));
      }

      const { error } = await supabase
        .from('role_requests')
        .insert({
          user_id: user?.id,
          user_email: user?.email,
          requested_role: data.requested_role,
          justification: data.justification,
          status: 'pending'
        });
      
      if (error) throw error;
    },
    onError: (error) => {
      setRateLimitError(error.message);
      toast.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['role-requests']);
      queryClient.invalidateQueries(['role-request-rate-limit']);
      toast.success(t({ en: 'Role request submitted!', ar: 'تم إرسال طلب الدور!' }));
      onOpenChange(false);
      setFormData({ requested_role: '', justification: '' });
      setRateLimitError(null);
    }
  });

  const handleSubmit = () => {
    if (!formData.requested_role || !formData.justification) {
      toast.error(t({ en: 'Please fill all fields', ar: 'يرجى ملء جميع الحقول' }));
      return;
    }
    if (remainingRequests <= 0) {
      toast.error(t({ 
        en: 'Rate limit reached. Maximum 3 requests per 24 hours.', 
        ar: 'تم الوصول للحد الأقصى. 3 طلبات كحد أقصى في 24 ساعة.' 
      }));
      return;
    }
    setRateLimitError(null);
    createRequestMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {t({ en: 'Request Additional Role', ar: 'طلب دور إضافي' })}
          </DialogTitle>
        </DialogHeader>

        {rateLimitError && (
          <Alert className="bg-destructive/10 border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              {rateLimitError}
            </AlertDescription>
          </Alert>
        )}

        {!rateLimitError && remainingRequests < 3 && (
          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              {t({ 
                en: `${remainingRequests} request(s) remaining in the next 24 hours`, 
                ar: `${remainingRequests} طلب متبقي في الـ 24 ساعة القادمة` 
              })}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Select Role', ar: 'اختر الدور' })}
            </label>
            <Select 
              value={formData.requested_role} 
              onValueChange={(v) => setFormData({ ...formData, requested_role: v })}
              disabled={remainingRequests <= 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Choose a role...', ar: 'اختر دوراً...' })} />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {typeof role.name === 'object' ? role.name[language] : role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Justification', ar: 'المبرر' })}
            </label>
            <Textarea
              value={formData.justification}
              onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
              rows={4}
              disabled={remainingRequests <= 0}
              placeholder={t({ 
                en: 'Explain why you need this role and how you will use it...',
                ar: 'اشرح لماذا تحتاج هذا الدور وكيف ستستخدمه...'
              })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={createRequestMutation.isPending || remainingRequests <= 0}
          >
            <Send className="h-4 w-4 mr-2" />
            {t({ en: 'Submit Request', ar: 'إرسال الطلب' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
