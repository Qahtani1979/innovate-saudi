/**
 * Auto Notification Hook
 * Replaces the legacy AutoNotification.jsx component/helper.
 * Provides standardized notification logic for various entities using useNotificationSystem.
 */

import { useNotificationSystem } from '@/hooks/useNotificationSystem';

export function useAutoNotification() {
    const { notify } = useNotificationSystem();

    /**
     * Notify on generic status change
     */
    const notifyOnStatusChange = async (entity, entityType, oldStatus, newStatus) => {
        const messages = {
            Challenge: {
                approved: 'Challenge approved and ready for treatment',
                in_treatment: 'Challenge moved to treatment track',
                resolved: 'Challenge marked as resolved'
            },
            Pilot: {
                approved: 'Pilot approved - ready to start',
                in_progress: 'Pilot execution started',
                completed: 'Pilot completed - awaiting evaluation'
            },
            Program: {
                approved: 'Program approved and ready for launch',
                active: 'Program is now active',
                completed: 'Program has been completed',
                cancelled: 'Program has been cancelled'
            },
            Event: {
                approved: 'Event approved and ready for publishing',
                published: 'Event is now published and open for registration',
                cancelled: 'Event has been cancelled',
                completed: 'Event has concluded'
            }
        };

        const capitalizedType = entityType.charAt(0).toUpperCase() + entityType.slice(1);
        const message = messages[capitalizedType]?.[newStatus];

        if (message) {
            await notify({
                title: `${capitalizedType} Status Updated`,
                message: `${entity.code || entity.title_en || entity.name_en}: ${message}`,
                type: 'alert',
                entityType: entityType.toLowerCase(),
                entityId: entity.id,
                recipientEmails: entity.challenge_owner_email ? [entity.challenge_owner_email] : (entity.created_by_email ? [entity.created_by_email] : [])
                // Attempting to guess recipient. If none, it won't trigger in-app for specific user but might still be recorded if logic allows. 
                // However, useNotificationSystem requires recipients for inApp insert.
                // If this is for system broadcast, we need a different mechanism in useNotificationSystem.
            });
        }
    };

    /**
     * Notify Program Event
     */
    const notifyProgramEvent = async (program, eventType, metadata = {}) => {
        const eventMessages = {
            created: 'New program has been created',
            submitted: 'Program submitted for approval',
            approved: 'Program has been approved',
            launched: 'Program has been launched and is accepting applications',
            application_received: 'New application received',
            participant_enrolled: 'Participant enrolled in program',
            session_scheduled: 'New session scheduled',
            milestone_completed: 'Program milestone completed',
            completed: 'Program has been completed'
        };

        const message = eventMessages[eventType];
        if (message) {
            await notify({
                title: `Program: ${program.name_en || program.title_en}`,
                message: message,
                type: eventType === 'application_received' ? 'task' : 'alert',
                entityType: 'program',
                entityId: program.id,
                recipientEmails: metadata.recipients
            });
        }
    };

    /**
     * Notify Event Action
     */
    const notifyEventAction = async (event, actionType, metadata = {}) => {
        const actionMessages = {
            created: 'New event has been created',
            submitted: 'Event submitted for approval',
            approved: 'Event has been approved',
            published: 'Event is now published',
            registration_opened: 'Registration is now open',
            registration_closed: 'Registration has closed',
            reminder: `Event reminder: ${event.title_en} is coming up`,
            cancelled: 'Event has been cancelled',
            completed: 'Event has concluded'
        };

        const message = actionMessages[actionType];
        if (message) {
            await notify({
                title: `Event: ${event.title_en}`,
                message: message,
                type: actionType === 'reminder' ? 'reminder' : 'alert',
                entityType: 'event',
                entityId: event.id,
                recipientEmails: metadata.recipients
            });
        }
    };

    return {
        notifyOnStatusChange,
        notifyProgramEvent,
        notifyEventAction
    };
}
