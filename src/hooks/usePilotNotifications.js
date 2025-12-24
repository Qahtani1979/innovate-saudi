import { useNotificationSystem } from '@/hooks/useNotificationSystem';

export const usePilotNotifications = () => {
  const { notify } = useNotificationSystem();
  const notifyStageChange = async (pilot, oldStage, newStage, userEmail) => {
    // Notify pilot owner/creator
    if (pilot.created_by) {
      await notify({
        title: `Pilot "${pilot.title_en}" stage changed`,
        message: `Stage changed from ${oldStage} to ${newStage}`,
        type: 'alert',
        entityType: 'pilot',
        entityId: pilot.id,
        recipientEmails: [pilot.created_by],
        metadata: { old_stage: oldStage, new_stage: newStage }
      });
    }

    // If approved or rejected, send specific notification
    if (['completed', 'cancelled'].includes(newStage)) {
      await notify({
        title: `Your pilot has been ${newStage}`,
        message: `Pilot "${pilot.title_en}" is now ${newStage}`,
        type: newStage === 'completed' ? 'success' : 'alert',
        entityType: 'pilot',
        entityId: pilot.id,
        recipientEmails: [pilot.created_by]
      });
    }
  };

  const notifyApprover = async (pilotId, approverEmail, pilotTitle) => {
    await notify({
      title: 'Pilot Approval Required',
      message: `Pilot "${pilotTitle}" needs your review`,
      type: 'task',
      entityType: 'pilot',
      entityId: pilotId,
      recipientEmails: [approverEmail]
    });
  };

  const notifyRequester = async (pilotId, requesterEmail, pilotTitle, decision, reason = null) => {
    await notify({
      title: `Your pilot has been ${decision}`,
      message: reason
        ? `Pilot "${pilotTitle}" has been ${decision}. Reason: ${reason}`
        : `Pilot "${pilotTitle}" has been ${decision}`,
      type: decision === 'approved' ? 'success' : 'alert',
      entityType: 'pilot',
      entityId: pilotId,
      recipientEmails: [requesterEmail],
      metadata: { decision, reason }
    });
  };

  const notifySLAWarning = async (pilotId, reviewerEmail, pilotTitle, daysRemaining) => {
    await notify({
      title: 'Pilot Review SLA Warning',
      message: `Pilot "${pilotTitle}" is approaching its SLA deadline. ${daysRemaining} days remaining.`,
      type: 'warning',
      entityType: 'pilot',
      entityId: pilotId,
      recipientEmails: [reviewerEmail],
      metadata: { days_remaining: daysRemaining }
    });
  };

  return {
    notifyStageChange,
    notifyApprover,
    notifyRequester,
    notifySLAWarning
  };
};

export default usePilotNotifications;
