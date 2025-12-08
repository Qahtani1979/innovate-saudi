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
    }
  };

  const message = messages[entityType]?.[newStatus];
  if (message) {
    await createNotification({
      title: `${entityType} Status Updated`,
      body: `${entity.code || entity.title_en}: ${message}`,
      type: 'alert',
      priority: 'medium',
      linkUrl: `${entityType}Detail?id=${entity.id}`,
      entityType: entityType.toLowerCase(),
      entityId: entity.id
    });
  }
};