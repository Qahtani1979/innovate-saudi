/**
 * Challenge Notifications Hook
 * Implements: notif-1 (status change), notif-2 (assignment), notif-3 (comments),
 * notif-4 (deadlines), email-1 to email-5 (email triggers)
 */

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';

// Notification types for challenges
export const CHALLENGE_NOTIFICATION_TYPES = {
  // Status changes (notif-1)
  CREATED: 'challenge_created',
  SUBMITTED: 'challenge_submitted',
  APPROVED: 'challenge_approved',
  REJECTED: 'challenge_rejected',
  PUBLISHED: 'challenge_published',
  RESOLVED: 'challenge_resolved',
  
  // Assignments (notif-2)
  ASSIGNED: 'challenge_assigned',
  REVIEWER_ASSIGNED: 'challenge_reviewer_assigned',
  OWNERSHIP_TRANSFERRED: 'challenge_ownership_transferred',
  
  // Comments (notif-3)
  COMMENT_ADDED: 'challenge_comment_added',
  COMMENT_REPLIED: 'challenge_comment_replied',
  
  // Deadlines (notif-4)
  SLA_WARNING: 'challenge_sla_warning',
  SLA_BREACH: 'challenge_sla_breach',
  DEADLINE_APPROACHING: 'challenge_deadline_approaching',
  
  // Solutions (email-3)
  SOLUTION_MATCHED: 'challenge_solution_matched',
  PROPOSAL_RECEIVED: 'challenge_proposal_received',
};

// Notification title templates
const NOTIFICATION_TITLES = {
  [CHALLENGE_NOTIFICATION_TYPES.CREATED]: {
    en: 'New Challenge Created',
    ar: 'تم إنشاء تحدي جديد'
  },
  [CHALLENGE_NOTIFICATION_TYPES.SUBMITTED]: {
    en: 'Challenge Submitted for Review',
    ar: 'تم تقديم التحدي للمراجعة'
  },
  [CHALLENGE_NOTIFICATION_TYPES.APPROVED]: {
    en: 'Challenge Approved',
    ar: 'تمت الموافقة على التحدي'
  },
  [CHALLENGE_NOTIFICATION_TYPES.REJECTED]: {
    en: 'Challenge Requires Changes',
    ar: 'التحدي يحتاج تعديلات'
  },
  [CHALLENGE_NOTIFICATION_TYPES.ASSIGNED]: {
    en: 'Challenge Assigned to You',
    ar: 'تم تعيين تحدي لك'
  },
  [CHALLENGE_NOTIFICATION_TYPES.REVIEWER_ASSIGNED]: {
    en: 'New Challenge to Review',
    ar: 'تحدي جديد للمراجعة'
  },
  [CHALLENGE_NOTIFICATION_TYPES.SLA_WARNING]: {
    en: 'Challenge SLA Warning',
    ar: 'تحذير: اقتراب موعد التحدي'
  },
  [CHALLENGE_NOTIFICATION_TYPES.SOLUTION_MATCHED]: {
    en: 'Solution Matched to Your Challenge',
    ar: 'تم مطابقة حل لتحديك'
  },
  [CHALLENGE_NOTIFICATION_TYPES.COMMENT_ADDED]: {
    en: 'New Comment on Challenge',
    ar: 'تعليق جديد على التحدي'
  },
};

// Generate notification message
const getNotificationMessage = (type, metadata, language = 'en') => {
  const challengeTitle = metadata?.challenge_title || 'Challenge';
  
  const messages = {
    [CHALLENGE_NOTIFICATION_TYPES.CREATED]: {
      en: `Challenge "${challengeTitle}" has been created successfully.`,
      ar: `تم إنشاء التحدي "${challengeTitle}" بنجاح.`
    },
    [CHALLENGE_NOTIFICATION_TYPES.SUBMITTED]: {
      en: `Challenge "${challengeTitle}" has been submitted and is awaiting review.`,
      ar: `تم تقديم التحدي "${challengeTitle}" وهو في انتظار المراجعة.`
    },
    [CHALLENGE_NOTIFICATION_TYPES.APPROVED]: {
      en: `Challenge "${challengeTitle}" has been approved and is now active.`,
      ar: `تمت الموافقة على التحدي "${challengeTitle}" وهو نشط الآن.`
    },
    [CHALLENGE_NOTIFICATION_TYPES.REJECTED]: {
      en: `Challenge "${challengeTitle}" requires changes. Reason: ${metadata?.rejection_reason || 'See details'}`,
      ar: `التحدي "${challengeTitle}" يحتاج تعديلات. السبب: ${metadata?.rejection_reason || 'انظر التفاصيل'}`
    },
    [CHALLENGE_NOTIFICATION_TYPES.ASSIGNED]: {
      en: `You have been assigned to challenge "${challengeTitle}".`,
      ar: `تم تعيينك للتحدي "${challengeTitle}".`
    },
    [CHALLENGE_NOTIFICATION_TYPES.SOLUTION_MATCHED]: {
      en: `A solution has been matched to your challenge "${challengeTitle}" with ${metadata?.match_score || 0}% compatibility.`,
      ar: `تم مطابقة حل لتحديك "${challengeTitle}" بنسبة توافق ${metadata?.match_score || 0}%.`
    },
    [CHALLENGE_NOTIFICATION_TYPES.SLA_WARNING]: {
      en: `Challenge "${challengeTitle}" SLA deadline is approaching. Due: ${metadata?.due_date || 'Soon'}`,
      ar: `موعد التحدي "${challengeTitle}" يقترب. الموعد: ${metadata?.due_date || 'قريباً'}`
    },
  };
  
  return messages[type]?.[language] || messages[type]?.en || `Notification for ${challengeTitle}`;
};

export function useChallengeNotifications() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  /**
   * Send in-app notification to users
   */
  const sendNotification = useCallback(async ({
    type,
    challengeId,
    recipientEmails,
    metadata = {}
  }) => {
    if (!recipientEmails?.length) return { success: false, error: 'No recipients' };
    
    try {
      const notifications = recipientEmails.map(email => ({
        notification_type: type,
        entity_type: 'challenge',
        entity_id: challengeId,
        user_email: email,
        title: NOTIFICATION_TITLES[type]?.en || 'Challenge Notification',
        message: getNotificationMessage(type, metadata, 'en'),
        metadata: {
          ...metadata,
          challenge_id: challengeId,
          sent_at: new Date().toISOString()
        },
        is_read: false
      }));
      
      const { error } = await supabase
        .from('citizen_notifications')
        .insert(notifications);
      
      if (error) throw error;
      
      // Invalidate notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      return { success: true };
    } catch (error) {
      console.error('[ChallengeNotifications] Failed to send:', error);
      return { success: false, error: error.message };
    }
  }, [queryClient]);
  
  /**
   * Send email notification via edge function (email-1 to email-5)
   */
  const sendEmailNotification = useCallback(async ({
    type,
    challengeId,
    recipientEmails,
    challengeTitle,
    challengeUrl,
    additionalData = {}
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('email-trigger-hub', {
        body: {
          template: `challenge_${type.replace('challenge_', '')}`,
          recipients: recipientEmails,
          variables: {
            challenge_title: challengeTitle,
            challenge_url: challengeUrl || `${window.location.origin}/challenges/${challengeId}`,
            ...additionalData
          }
        }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[ChallengeNotifications] Email failed:', error);
      return { success: false, error: error.message };
    }
  }, []);
  
  /**
   * Notify on status change (notif-1, email-1, email-2)
   */
  const notifyStatusChange = useMutation({
    mutationFn: async ({ challenge, oldStatus, newStatus, reviewerEmail, rejectionReason }) => {
      const results = [];
      const metadata = {
        challenge_title: challenge.title_en,
        old_status: oldStatus,
        new_status: newStatus,
        rejection_reason: rejectionReason
      };
      
      // Determine notification type
      const typeMap = {
        submitted: CHALLENGE_NOTIFICATION_TYPES.SUBMITTED,
        approved: CHALLENGE_NOTIFICATION_TYPES.APPROVED,
        rejected: CHALLENGE_NOTIFICATION_TYPES.REJECTED,
        published: CHALLENGE_NOTIFICATION_TYPES.PUBLISHED,
        resolved: CHALLENGE_NOTIFICATION_TYPES.RESOLVED
      };
      
      const notificationType = typeMap[newStatus];
      if (!notificationType) return results;
      
      // Send to challenge owner
      if (challenge.challenge_owner_email) {
        results.push(await sendNotification({
          type: notificationType,
          challengeId: challenge.id,
          recipientEmails: [challenge.challenge_owner_email],
          metadata
        }));
        
        // Send email for important status changes
        if (['approved', 'rejected', 'published'].includes(newStatus)) {
          results.push(await sendEmailNotification({
            type: notificationType,
            challengeId: challenge.id,
            recipientEmails: [challenge.challenge_owner_email],
            challengeTitle: challenge.title_en,
            additionalData: metadata
          }));
        }
      }
      
      // Notify reviewer on submission
      if (newStatus === 'submitted' && reviewerEmail) {
        results.push(await sendNotification({
          type: CHALLENGE_NOTIFICATION_TYPES.REVIEWER_ASSIGNED,
          challengeId: challenge.id,
          recipientEmails: [reviewerEmail],
          metadata
        }));
      }
      
      return results;
    }
  });
  
  /**
   * Notify on assignment change (notif-2, email-4)
   */
  const notifyAssignment = useMutation({
    mutationFn: async ({ challenge, assigneeEmail, assignmentType = 'owner' }) => {
      const type = assignmentType === 'reviewer' 
        ? CHALLENGE_NOTIFICATION_TYPES.REVIEWER_ASSIGNED
        : CHALLENGE_NOTIFICATION_TYPES.ASSIGNED;
      
      const metadata = {
        challenge_title: challenge.title_en,
        assignment_type: assignmentType,
        assigned_by: user?.email
      };
      
      // In-app notification
      const notifResult = await sendNotification({
        type,
        challengeId: challenge.id,
        recipientEmails: [assigneeEmail],
        metadata
      });
      
      // Email notification
      const emailResult = await sendEmailNotification({
        type,
        challengeId: challenge.id,
        recipientEmails: [assigneeEmail],
        challengeTitle: challenge.title_en,
        additionalData: metadata
      });
      
      return { notification: notifResult, email: emailResult };
    }
  });
  
  /**
   * Notify on solution match (email-3)
   */
  const notifySolutionMatch = useMutation({
    mutationFn: async ({ challenge, solution, matchScore }) => {
      const metadata = {
        challenge_title: challenge.title_en,
        solution_title: solution.title_en || solution.name_en,
        match_score: matchScore
      };
      
      return Promise.all([
        sendNotification({
          type: CHALLENGE_NOTIFICATION_TYPES.SOLUTION_MATCHED,
          challengeId: challenge.id,
          recipientEmails: [challenge.challenge_owner_email].filter(Boolean),
          metadata
        }),
        sendEmailNotification({
          type: CHALLENGE_NOTIFICATION_TYPES.SOLUTION_MATCHED,
          challengeId: challenge.id,
          recipientEmails: [challenge.challenge_owner_email].filter(Boolean),
          challengeTitle: challenge.title_en,
          additionalData: metadata
        })
      ]);
    }
  });
  
  /**
   * Notify on SLA warning (notif-4, email-5)
   */
  const notifySLAWarning = useMutation({
    mutationFn: async ({ challenge, dueDate, hoursRemaining }) => {
      const metadata = {
        challenge_title: challenge.title_en,
        due_date: dueDate,
        hours_remaining: hoursRemaining
      };
      
      const recipients = [
        challenge.challenge_owner_email,
        challenge.review_assigned_to
      ].filter(Boolean);
      
      return Promise.all([
        sendNotification({
          type: CHALLENGE_NOTIFICATION_TYPES.SLA_WARNING,
          challengeId: challenge.id,
          recipientEmails: recipients,
          metadata
        }),
        sendEmailNotification({
          type: CHALLENGE_NOTIFICATION_TYPES.SLA_WARNING,
          challengeId: challenge.id,
          recipientEmails: recipients,
          challengeTitle: challenge.title_en,
          additionalData: metadata
        })
      ]);
    }
  });
  
  /**
   * Notify on comment (notif-3)
   */
  const notifyComment = useMutation({
    mutationFn: async ({ challenge, comment, mentionedEmails = [] }) => {
      const metadata = {
        challenge_title: challenge.title_en,
        comment_preview: comment.comment_text?.substring(0, 100),
        commenter_email: comment.user_email
      };
      
      // Notify challenge owner (if not the commenter)
      const recipients = [
        challenge.challenge_owner_email,
        ...mentionedEmails
      ].filter(email => email && email !== comment.user_email);
      
      return sendNotification({
        type: CHALLENGE_NOTIFICATION_TYPES.COMMENT_ADDED,
        challengeId: challenge.id,
        recipientEmails: [...new Set(recipients)],
        metadata
      });
    }
  });
  
  return {
    // Core functions
    sendNotification,
    sendEmailNotification,
    
    // Specialized mutations
    notifyStatusChange,
    notifyAssignment,
    notifySolutionMatch,
    notifySLAWarning,
    notifyComment,
    
    // Constants
    CHALLENGE_NOTIFICATION_TYPES,
    NOTIFICATION_TITLES
  };
}

export default useChallengeNotifications;
