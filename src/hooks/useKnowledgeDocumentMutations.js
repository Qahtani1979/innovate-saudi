import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useAuditLogger } from '@/hooks/useAuditLogger';

/**
 * Hook for knowledge document mutations
 */
export function useKnowledgeDocumentMutations() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    const { user } = useAuth();
    const { logAction } = useAuditLogger();

    const uploadDocument = useMutation({
        mutationFn: async ({ file, category }) => {
            // Upload file to Supabase storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('knowledge-documents')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('knowledge-documents')
                .getPublicUrl(fileName);

            // Create knowledge document record
            const { data, error: insertError } = await supabase.from('knowledge_documents').insert([{
                title_en: file.name,
                doc_type: category,
                file_url: publicUrl,
                tags: [category],
                is_public: true,
                created_by: user?.email
            }]).select().single();

            if (insertError) throw insertError;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] });
            toast.success(t({ en: 'File uploaded successfully', ar: 'تم رفع الملف بنجاح' }));

            logAction({
                action: 'create',
                entity_type: 'knowledge_document',
                entity_id: data.id,
                details: { title: data.title_en, type: data.doc_type }
            });
        },
        onError: (error) => {
            console.error('Upload error:', error);
            toast.error(t({ en: 'Upload failed', ar: 'فشل الرفع' }));
        }
    });

    const deleteDocument = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('knowledge_documents').delete().eq('id', id);
            if (error) throw error;
            return id;
        },
        onSuccess: (id) => {
            queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] });
            toast.success(t({ en: 'File deleted', ar: 'تم حذف الملف' }));

            logAction({
                action: 'delete',
                entity_type: 'knowledge_document',
                entity_id: id
            });
        },
        onError: (error) => {
            console.error('Delete error:', error);
            toast.error(t({ en: 'Delete failed', ar: 'فشل الحذف' }));
        }
    });

    return {
        uploadDocument,
        deleteDocument
    };
}
