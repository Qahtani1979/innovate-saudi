import { base44 } from '@/api/base44Client';

export const createNotification = async ({ title, body, type, priority, linkUrl, entityType, entityId, recipients }) => {
  try {
    // Create notification for each recipient
    if (recipients && recipients.length > 0) {
      for (const recipient of recipients) {
        await base44.entities.Notification.create({
          title,
          body,
          notification_type: type || 'alert',
          priority: priority || 'medium',
          link_url: linkUrl,
          entity_type: entityType,
          entity_id: entityId,
          created_by: 'system@saudiinnovates.sa'
        });
      }
    } else {
      // Broadcast notification
      await base44.entities.Notification.create({
        title,
        body,
        notification_type: type || 'alert',
        priority: priority || 'medium',
        link_url: linkUrl,
        entity_type: entityType,
        entity_id: entityId,
        created_by: 'system@saudiinnovates.sa'
      });
    }
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

export const notifyOnStatusChange = async (entity, entityType, oldStatus, newStatus) => {
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
  if (message) {
    await createNotification({
      title: `${entityType} Status Updated`,
      body: `${entity.code || entity.title_en || entity.name_en}: ${message}`,
      type: 'alert',
      priority: entityType === 'Event' && newStatus === 'cancelled' ? 'high' : 'medium',
      linkUrl: `${entityType}Detail?id=${entity.id}`,
      entityType: entityType.toLowerCase(),
      entityId: entity.id
    });
  }
};

// Program-specific notifications
export const notifyProgramEvent = async (program, eventType, metadata = {}) => {
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
    await createNotification({
      title: `Program: ${program.name_en || program.title_en}`,
      body: message,
      type: eventType === 'application_received' ? 'task' : 'alert',
      priority: ['approved', 'launched'].includes(eventType) ? 'high' : 'medium',
      linkUrl: `/ProgramDetail?id=${program.id}`,
      entityType: 'program',
      entityId: program.id,
      recipients: metadata.recipients
    });
  }
};

// Event-specific notifications
export const notifyEventAction = async (event, actionType, metadata = {}) => {
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
    await createNotification({
      title: `Event: ${event.title_en}`,
      body: message,
      type: actionType === 'reminder' ? 'reminder' : 'alert',
      priority: ['cancelled', 'reminder'].includes(actionType) ? 'high' : 'medium',
      linkUrl: `/EventDetail?id=${event.id}`,
      entityType: 'event',
      entityId: event.id,
      recipients: metadata.recipients
    });
  }
};