import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
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

export default function RoleRequestDialog({ open, onOpenChange, user, availableRoles }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    requested_role_id: '',
    justification: ''
  });
  const [rateLimitError, setRateLimitError] = useState(null);
  const [remainingRequests, setRemainingRequests] = useState(3);

  // Check rate limit on mount
  React.useEffect(() => {
    if (open && user?.email) {
      base44.entities.RoleRequest.filter({
        user_email: user.email,
        requested_date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
      }).then(recentRequests => {
        setRemainingRequests(3 - recentRequests.length);
        if (recentRequests.length >= 3) {
          setRateLimitError(t({ 
            en: 'Maximum 3 role requests per 24 hours reached. Please try again tomorrow.', 
            ar: 'تم الوصول إلى الحد الأقصى 3 طلبات في 24 ساعة. يرجى المحاولة غداً.' 
          }));
        }
      });
    }
  }, [open, user?.email]);

  const createRequestMutation = useMutation({
    mutationFn: async (data) => {
      // Final rate limit check before submission
      const recentRequests = await base44.entities.RoleRequest.filter({
        user_email: user.email,
        requested_date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
      });
      
      if (recentRequests.length >= 3) {
        throw new Error(t({ 
          en: 'Rate limit: Maximum 3 role requests per 24 hours', 
          ar: 'الحد الأقصى: 3 طلبات في 24 ساعة' 
        }));
      }

      return await base44.entities.RoleRequest.create({
        user_email: user.email,
        requested_role_id: data.requested_role_id,
        justification: data.justification,
        status: 'pending',
        requested_date: new Date().toISOString()
      });
    },
    onError: (error) => {
      setRateLimitError(error.message);
      toast.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['role-requests']);
      toast.success(t({ en: 'Role request submitted!', ar: 'تم إرسال طلب الدور!' }));
      onOpenChange(false);
      setFormData({ requested_role_id: '', justification: '' });
      setRateLimitError(null);
    }
  });

  const handleSubmit = () => {
    if (!formData.requested_role_id || !formData.justification) {
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
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {rateLimitError}
            </AlertDescription>
          </Alert>
        )}

        {!rateLimitError && remainingRequests < 3 && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
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
              value={formData.requested_role_id} 
              onValueChange={(v) => setFormData({ ...formData, requested_role_id: v })}
              disabled={remainingRequests <= 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Choose a role...', ar: 'اختر دوراً...' })} />
              </SelectTrigger>
              <SelectContent>
                {availableRoles?.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
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