import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';

/**
 * Hook to fetch email templates
 */
export function useEmailTemplates() {
    return useQuery({
        queryKey: ['email-templates'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('email_templates')
                .select('*')
                .order('category', { ascending: true })
                .order('name_en', { ascending: true });
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook for email template mutations
 */
export function useEmailTemplateMutations() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();

    const saveTemplate = useMutation({
        mutationFn: async ({ id, ...data }) => {
            if (id) {
                const { error } = await supabase
                    .from('email_templates')
                    .update(data)
                    .eq('id', id);
                if (error) throw error;
                return { isUpdate: true };
            } else {
                const { error } = await supabase
                    .from('email_templates')
                    .insert(data);
                if (error) throw error;
                return { isUpdate: false };
            }
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['email-templates'] });
            toast.success(t({ en: 'Template saved successfully', ar: 'تم حفظ القالب بنجاح' }));
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const deleteTemplate = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('email_templates')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['email-templates'] });
            toast.success(t({ en: 'Template deleted', ar: 'تم حذف القالب' }));
        }
    });

    return { saveTemplate, deleteTemplate };
}

/**
 * Hook for testing email templates
 */
export function useEmailTester() {
    const { t } = useLanguage();

    const sendTestEmail = useMutation({
        mutationFn: async ({ recipientEmail, template, previewLanguage, currentUser }) => {
            // Build comprehensive test variables - language-aware based on preview language
            const isArabic = previewLanguage === 'ar';
            const testVariables = {
                userName: currentUser?.user_metadata?.full_name || (isArabic ? 'مستخدم تجريبي' : 'Test User'),
                userEmail: currentUser?.email || 'test@example.com',
                sentAt: new Date().toLocaleString(isArabic ? 'ar-SA' : 'en-US'),
                loginUrl: window.location.origin,
                dashboardUrl: window.location.origin,
                detailUrl: window.location.origin,
                trackingUrl: window.location.origin,
                taskUrl: window.location.origin,
                // Role-related variables
                roleName: isArabic ? 'موظف بلدية' : 'Municipality Staff',
                requestedRole: isArabic ? 'موظف بلدية' : 'Municipality Staff',
                rejectionReason: isArabic ? 'سبب الرفض التجريبي' : 'Sample rejection reason for testing',
                // Entity-related variables
                challengeTitle: isArabic ? 'عنوان التحدي التجريبي' : 'Sample Challenge Title',
                solutionTitle: isArabic ? 'عنوان الحل التجريبي' : 'Sample Solution Title',
                pilotTitle: isArabic ? 'عنوان التجربة التجريبية' : 'Sample Pilot Title',
                proposalTitle: isArabic ? 'عنوان المقترح التجريبي' : 'Sample Proposal Title',
                ideaTitle: isArabic ? 'عنوان الفكرة التجريبية' : 'Sample Idea Title',
                taskName: isArabic ? 'اسم المهمة التجريبية' : 'Sample Task Name',
                // Status and counts
                newStatus: isArabic ? 'تمت الموافقة' : 'approved',
                score: '85',
                totalItems: '5',
                // Time-related
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US'),
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US'),
                // Organization
                organizationName: isArabic ? 'المنظمة التجريبية' : 'Sample Organization',
                municipalityName: isArabic ? 'البلدية التجريبية' : 'Sample Municipality',
            };

            // Use the current template if it has a key (saved), otherwise send direct content for preview (unsaved draft)
            // Note: The original component logic checked for selectedTemplateId AND template.template_key.
            // However, we can infer "saved" if we pass the ID or if the caller handles that logic.
            // Here we assume the caller passes the correct object structure expected by the edge function.

            const templateExists = template.id && template.template_key;

            const payload = templateExists ? {
                template_key: template.template_key,
                recipient_email: recipientEmail,
                variables: testVariables,
                language: previewLanguage,
                force_send: true,
                triggered_by: currentUser?.email
            } : {
                recipient_email: recipientEmail,
                subject: previewLanguage === 'ar' ? template.subject_ar || template.subject_en : template.subject_en,
                html: `
             <div style="font-family: ${previewLanguage === 'ar' ? "'Noto Sans Arabic', sans-serif" : 'Arial, sans-serif'}; direction: ${previewLanguage === 'ar' ? 'rtl' : 'ltr'}; max-width: 600px; margin: 0 auto; padding: 20px;">
               <div style="background: linear-gradient(135deg, ${template.header_gradient_start || '#006C35'}, ${template.header_gradient_end || '#00A651'}); padding: 24px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
                 <h1 style="margin: 0;">${previewLanguage === 'ar' ? template.header_title_ar || template.header_title_en : template.header_title_en || 'Test Email'}</h1>
               </div>
               <div style="padding: 24px; background: #fff; border: 1px solid #eee; border-top: none;">
                 ${previewLanguage === 'ar' ? template.body_ar || template.body_en : template.body_en}
               </div>
               <div style="padding: 16px; background: #f5f5f5; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px;">
                 <p>© ${new Date().getFullYear()} Saudi Innovates. ${previewLanguage === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.</p>
               </div>
             </div>
           `,
                language: previewLanguage,
                force_send: true,
                triggered_by: currentUser?.email
            };

            const { data, error } = await supabase.functions.invoke('send-email', {
                body: payload
            });

            if (error) throw error;
            return data;
        },
        onSuccess: (data, variables) => {
            if (data.success) {
                toast.success(t({ en: `Test email sent to ${variables.recipientEmail}`, ar: `تم إرسال البريد التجريبي إلى ${variables.recipientEmail}` }));
            } else {
                const errorMessage = typeof data.error === 'object'
                    ? data.error?.message || JSON.stringify(data.error)
                    : data.error || data.message || 'Failed to send email';
                toast.error(errorMessage, { duration: 8000 });
            }
        },
        onError: (error) => {
            console.error('Error sending test email:', error);
            toast.error(error.message);
        }
    });

    return { sendTestEmail };
}



