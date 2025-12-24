import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/components/LanguageContext';
import { useVisibilitySystem } from '@/hooks/visibility/useVisibilitySystem';

/**
 * Hook for messaging functionality
 */
export function useMessages(options = {}) {
    const { conversationId, recipientEmail, limit = 50 } = options;
    const { user } = useAuth();
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['messages', { conversationId, recipientEmail, limit }],
        queryFn: async () => {
            let query = supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            // Apply visibility rules
            query = applyVisibilityRules(query, 'message');

            // Filter by conversation or recipient
            if (conversationId) {
                query = query.eq('conversation_id', conversationId);
            } else if (recipientEmail) {
                query = query.or(`sender_email.eq.${user?.email},recipient_email.eq.${user?.email}`);
                query = query.or(`sender_email.eq.${recipientEmail},recipient_email.eq.${recipientEmail}`);
            } else {
                // User's messages only
                query = query.or(`sender_email.eq.${user?.email},recipient_email.eq.${user?.email}`);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: !!user,
        staleTime: 1000 * 30, // 30 seconds
    });
}

/**
 * Hook for single conversation
 */
export function useConversation(conversationId) {
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['conversation', conversationId],
        queryFn: async () => {
            let query = supabase
                .from('conversations')
                .select('*')
                .eq('id', conversationId)
                .single();

            query = applyVisibilityRules(query, 'conversation');

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: !!conversationId,
    });
}

/**
 * Hook for user's conversations list
 */
export function useConversations() {
    const { user } = useAuth();
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['conversations', user?.email],
        queryFn: async () => {
            let query = supabase
                .from('conversations')
                .select('*')
                .or(`participant1_email.eq.${user?.email},participant2_email.eq.${user?.email}`)
                .order('updated_at', { ascending: false });

            query = applyVisibilityRules(query, 'conversation');

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: !!user,
    });
}

/**
 * Hook for message mutations
 */
export function useMessageMutations() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { t } = useLanguage();

    const sendMessage = useMutation({
        mutationFn: async ({ content, recipientEmail, conversationId, metadata = {} }) => {
            const messageData = {
                sender_email: user?.email,
                sender_name: user?.user_metadata?.full_name || user?.email,
                recipient_email: recipientEmail,
                content,
                conversation_id: conversationId,
                is_read: false,
                metadata,
                created_at: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from('messages')
                .insert(messageData)
                .select()
                .single();

            if (error) throw error;

            // Update conversation timestamp if exists
            if (conversationId) {
                await supabase
                    .from('conversations')
                    .update({ updated_at: new Date().toISOString() })
                    .eq('id', conversationId);
            }

            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['messages']);
            queryClient.invalidateQueries(['conversations']);
            if (data.conversation_id) {
                queryClient.invalidateQueries(['conversation', data.conversation_id]);
            }
            toast.success(t({ en: 'Message sent', ar: 'تم إرسال الرسالة' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to send message', ar: 'فشل إرسال الرسالة' }));
            console.error('Send message error:', error);
        },
    });

    const markAsRead = useMutation({
        mutationFn: async (messageId) => {
            const { error } = await supabase
                .from('messages')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('id', messageId);

            if (error) throw error;
            return messageId;
        },
        onSuccess: (messageId) => {
            queryClient.invalidateQueries(['messages']);
            // Don't show toast for mark as read (too noisy)
        },
        onError: (error) => {
            console.error('Mark as read error:', error);
        },
    });

    const deleteMessage = useMutation({
        mutationFn: async (messageId) => {
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', messageId);

            if (error) throw error;
            return messageId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['messages']);
            queryClient.invalidateQueries(['conversations']);
            toast.success(t({ en: 'Message deleted', ar: 'تم حذف الرسالة' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to delete message', ar: 'فشل حذف الرسالة' }));
            console.error('Delete message error:', error);
        },
    });

    const markAllAsRead = useMutation({
        mutationFn: async (conversationId) => {
            const { error } = await supabase
                .from('messages')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('conversation_id', conversationId)
                .eq('recipient_email', user?.email)
                .eq('is_read', false);

            if (error) throw error;
            return conversationId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['messages']);
            toast.success(t({ en: 'All messages marked as read', ar: 'تم وضع علامة مقروء على جميع الرسائل' }));
        },
        onError: (error) => {
            console.error('Mark all as read error:', error);
        },
    });

    return {
        sendMessage,
        markAsRead,
        deleteMessage,
        markAllAsRead,
    };
}

export default useMessages;
