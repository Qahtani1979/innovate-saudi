/**
 * Unified Notification System (Gold Standard)
 * Centralizes all in-app and email notification logic.
 */

import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

/**
 * @typedef {Object} NotificationPayload
 * @property {string} type - Notification Type (e.g., 'challenge_created', 'program_updated')
 * @property {string} entityType - Entity Type (e.g., 'challenge', 'program')
 * @property {string} entityId - Entity ID
 * @property {string[]} recipientEmails - List of recipient emails
 * @property {string} title - Title (En)
 * @property {string} [titleAr] - Title (Ar) - Optional
 * @property {string} message - Message (En)
 * @property {string} [messageAr] - Message (Ar) - Optional
 * @property {Object} [metadata] - Additional metadata
 * @property {boolean} [sendEmail=false] - Whether to trigger email
 * @property {string} [emailTemplate] - Email template name (if sendEmail is true)
 * @property {Object} [emailVariables] - Email variables (if sendEmail is true)
 */

export function useNotificationSystem() {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();

    /**
     * Send Notification (Unified)
     */
    const notifyMutation = useMutation({
        /** @param {NotificationPayload} payload */
        mutationFn: async (payload) => {
            const {
                type,
                entityType,
                entityId,
                recipientEmails,
                title,
                titleAr,
                message,
                messageAr,
                metadata = {},
                sendEmail = false,
                emailTemplate,
                emailVariables = {}
            } = payload;

            const results = {};

            // 1. In-App Notifications
            if (recipientEmails?.length > 0) {
                const notifications = recipientEmails.map(email => ({
                    type: type, // Changed from notification_type to type to match table schema
                    entity_type: entityType,
                    entity_id: entityId,
                    user_email: email,
                    title: title,
                    message: message,
                    metadata: {
                        ...metadata,
                        title_ar: titleAr,
                        message_ar: messageAr,
                        sent_at: new Date().toISOString(),
                        sender: user?.email
                    },
                    is_read: false,
                    created_at: new Date().toISOString()
                }));

                const { error } = await supabase
                    .from('notifications')
                    .insert(notifications);

                if (error) {
                    // Fallback to citizen_notifications if notifications table structure is different or restricted
                    // Checking table existence or assuming 'notifications' based on useNotifications.js
                    // usage in useNotifications.js was 'notifications'.
                    console.error('Notification insert failed', error);
                    throw error;
                }

                results.inApp = true;
            }

            // 2. Email Notifications
            if (sendEmail && emailTemplate && recipientEmails?.length > 0) {
                try {
                    const { data, error } = await supabase.functions.invoke('email-trigger-hub', {
                        body: {
                            template: emailTemplate,
                            recipients: recipientEmails,
                            variables: {
                                ...emailVariables,
                                title,
                                message
                            }
                        }
                    });
                    if (error) throw error;
                    results.email = true;
                } catch (emailError) {
                    console.warn('Email trigger failed', emailError);
                    results.emailError = emailError.message;
                }
            }

            return results;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            if (data.emailError) {
                console.warn('Notification sent but email failed:', data.emailError);
            }
        },
        onError: (error) => {
            console.error('System Notification Failed:', error);
            // Don't toast error to user for background notifications usually, 
            // but can log or toast if critical.
        }
    });

    /**
     * Mark As Read
     */
    const markAsRead = useMutation({
        /** @param {string} notificationId */
        mutationFn: async (notificationId) => {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    return {
        notify: notifyMutation.mutateAsync,
        markAsRead: markAsRead.mutateAsync,
        isNotifying: notifyMutation.isPending
    };
}

