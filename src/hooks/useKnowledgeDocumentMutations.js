import { useMutation } from '@tanstack/react-query';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useAuditLogger } from '@/hooks/useAuditLogger';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import * as usePlatformCore from './usePlatformCore';

/**
 * Hook for knowledge document mutations
 */
export function useKnowledgeDocumentMutations() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const { user } = useAuth();
    const { logAction } = useAuditLogger();
    const { notify } = useNotificationSystem();

    const { uploadMutation } = usePlatformCore.useFileStorage();

    const uploadDocument = useMutation({
        /** @param {{file: File, category: string}} args */
        mutationFn: async ({ file, category }) => {
            // Upload using centralized hook
            const uploadResult = await uploadMutation.mutateAsync({
                file,
                bucket: 'knowledge-documents',
                folder: category
            });

            // Create knowledge document record
            const { data, error: insertError } = await supabase.from('knowledge_documents').insert([{
                title_en: file.name,
                doc_type: category,
                file_url: uploadResult.file_url,
                file_path: uploadResult.file_path, // Store path for easier deletion/management
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
                // @ts-ignore
                entity_id: data.id,
                // @ts-ignore
                details: { title: data.title_en, type: data.doc_type }
            });

            // Notification: Document Uploaded
            notify({
                type: 'document_uploaded',
                entityType: 'knowledge_document',
                entityId: data.id,
                recipientEmails: [], // Admin/Public
                title: 'Document Uploaded',
                message: `New document uploaded: ${data.title_en}`,
                sendEmail: false
            });
        },
        onError: (error) => {
            console.error('Upload error:', error);
            toast.error(t({ en: 'Upload failed', ar: 'فشل الرفع' }));
        }
    });

    const deleteDocument = useMutation({
        /** @param {string} id */
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

    const createKnowledgeDocument = useMutation({
        mutationFn: async (documentData) => {
            const { data, error } = await supabase
                .from('knowledge_documents')
                .insert({
                    // @ts-ignore
                    ...documentData,
                    created_by: user?.email,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] });
            toast.success(t({ en: 'Document created', ar: 'تم إنشاء المستند' }));

            logAction({
                action: 'create',
                entity_type: 'knowledge_document',
                // @ts-ignore
                entity_id: data.id,
                // @ts-ignore
                details: { title: data.title_en, type: data.category }
            });

            // Notification: Document Created
            notify({
                type: 'document_created',
                entityType: 'knowledge_document',
                entityId: data.id,
                recipientEmails: [],
                title: 'Document Created',
                message: `New document created: ${data.title_en}`,
                sendEmail: false
            });
        },
        onError: (error) => {
            console.error('Creation error:', error);
            toast.error(t({ en: 'Creation failed', ar: 'فشل الإنشاء' }));
        }
    });

    return {
        uploadDocument,
        deleteDocument,
        createKnowledgeDocument
    };
}

