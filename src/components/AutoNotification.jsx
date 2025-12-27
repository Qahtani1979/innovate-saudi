/**
 * Auto Notification Utilities
 * Provides helper functions for creating notifications using the Gold Standard hook pattern.
 * These are utility functions that components can use with useNotificationSystem hook.
 */

/**
 * Build notification payload for status changes
 */
export const buildStatusChangeNotification = (entity, entityType, oldStatus, newStatus) => {
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

  const message = messages[entityType]?.[newStatus];
  if (!message) return null;

  return {
    type: `${entityType.toLowerCase()}_status_changed`,
    entityType: entityType.toLowerCase(),
    entityId: entity.id,
    title: `${entityType} Status Updated`,
    message: `${entity.code || entity.title_en || entity.name_en}: ${message}`,
    priority: entityType === 'Event' && newStatus === 'cancelled' ? 'high' : 'medium',
    metadata: {
      old_status: oldStatus,
      new_status: newStatus,
      entity_code: entity.code
    }
  };
};

/**
 * Build notification payload for program events
 */
export const buildProgramEventNotification = (program, eventType, metadata = {}) => {
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
  if (!message) return null;

  return {
    type: `program_${eventType}`,
    entityType: 'program',
    entityId: program.id,
    title: `Program: ${program.name_en || program.title_en}`,
    message,
    priority: ['approved', 'launched'].includes(eventType) ? 'high' : 'medium',
    metadata: {
      program_code: program.code,
      event_type: eventType,
      ...metadata
    }
  };
};

/**
 * Build notification payload for event actions
 */
export const buildEventActionNotification = (event, actionType, metadata = {}) => {
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
  if (!message) return null;

  return {
    type: `event_${actionType}`,
    entityType: 'event',
    entityId: event.id,
    title: `Event: ${event.title_en}`,
    message,
    priority: ['cancelled', 'reminder'].includes(actionType) ? 'high' : 'medium',
    metadata: {
      event_code: event.code,
      action_type: actionType,
      ...metadata
    }
  };
};

/**
 * Hook for using notification utilities
 * Usage:
 * const { notifyStatusChange, notifyProgramEvent, notifyEventAction } = useAutoNotifications();
 * await notifyStatusChange(entity, 'Challenge', 'pending', 'approved', ['user@example.com']);
 */
export const useAutoNotifications = () => {
  // This would be imported from useNotificationSystem in components
  // Keeping as utility functions that return payloads for now
  return {
    buildStatusChangeNotification,
    buildProgramEventNotification,
    buildEventActionNotification
  };
};

