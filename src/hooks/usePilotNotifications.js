import { supabase } from '@/integrations/supabase/client';

export const usePilotNotifications = () => {
  const notifyStageChange = async (pilot, oldStage, newStage, userEmail) => {
    try {
      // Notify pilot owner/creator
      if (pilot.created_by) {
        await supabase.from('notifications').insert({
          user_email: pilot.created_by,
          notification_type: 'pilot_stage_change',
          title: `Pilot "${pilot.title_en}" stage changed`,
          message: `Stage changed from ${oldStage} to ${newStage}`,
          entity_type: 'pilot',
          entity_id: pilot.id,
          metadata: { old_stage: oldStage, new_stage: newStage }
        });
      }

      // If approved or rejected, send specific notification
      if (['completed', 'cancelled'].includes(newStage)) {
        await supabase.from('notifications').insert({
          user_email: pilot.created_by,
          notification_type: `pilot_${newStage}`,
          title: `Your pilot has been ${newStage}`,
          message: `Pilot "${pilot.title_en}" is now ${newStage}`,
          entity_type: 'pilot',
          entity_id: pilot.id
        });
      }
    } catch (error) {
      console.error('Error sending pilot notification:', error);
    }
  };

  const notifyApprover = async (pilotId, approverEmail, pilotTitle) => {
    try {
      await supabase.from('notifications').insert({
        user_email: approverEmail,
        notification_type: 'pilot_approval_needed',
        title: 'Pilot Approval Required',
        message: `Pilot "${pilotTitle}" needs your review`,
        entity_type: 'pilot',
        entity_id: pilotId
      });
    } catch (error) {
      console.error('Error notifying approver:', error);
    }
  };

  const notifyRequester = async (pilotId, requesterEmail, pilotTitle, decision, reason = null) => {
    try {
      await supabase.from('notifications').insert({
        user_email: requesterEmail,
        notification_type: `pilot_${decision}`,
        title: `Your pilot has been ${decision}`,
        message: reason 
          ? `Pilot "${pilotTitle}" has been ${decision}. Reason: ${reason}`
          : `Pilot "${pilotTitle}" has been ${decision}`,
        entity_type: 'pilot',
        entity_id: pilotId,
        metadata: { decision, reason }
      });
    } catch (error) {
      console.error('Error notifying requester:', error);
    }
  };

  const notifySLAWarning = async (pilotId, reviewerEmail, pilotTitle, daysRemaining) => {
    try {
      await supabase.from('notifications').insert({
        user_email: reviewerEmail,
        notification_type: 'pilot_sla_warning',
        title: 'Pilot Review SLA Warning',
        message: `Pilot "${pilotTitle}" is approaching its SLA deadline. ${daysRemaining} days remaining.`,
        entity_type: 'pilot',
        entity_id: pilotId,
        metadata: { days_remaining: daysRemaining }
      });
    } catch (error) {
      console.error('Error sending SLA warning:', error);
    }
  };

  return {
    notifyStageChange,
    notifyApprover,
    notifyRequester,
    notifySLAWarning
  };
};

export default usePilotNotifications;
