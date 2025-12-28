import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { useMutation } from '@/hooks/useAppQueryClient';
import { useAuth } from '@/lib/AuthContext';

// ... Notification Types Constants (Keep these as they are specific to challenges) ...
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

// ... Notification Title Templates (Keep) ...
const NOTIFICATION_TITLES = {
  [CHALLENGE_NOTIFICATION_TYPES.CREATED]: { en: 'New Challenge Created', ar: 'تم إنشاء تحدي جديد' },
  [CHALLENGE_NOTIFICATION_TYPES.SUBMITTED]: { en: 'Challenge Submitted for Review', ar: 'تم تقديم التحدي للمراجعة' },
  [CHALLENGE_NOTIFICATION_TYPES.APPROVED]: { en: 'Challenge Approved', ar: 'تمت الموافقة على التحدي' },
  [CHALLENGE_NOTIFICATION_TYPES.REJECTED]: { en: 'Challenge Requires Changes', ar: 'التحدي يحتاج تعديلات' },
  [CHALLENGE_NOTIFICATION_TYPES.ASSIGNED]: { en: 'Challenge Assigned to You', ar: 'تم تعيين تحدي لك' },
  [CHALLENGE_NOTIFICATION_TYPES.REVIEWER_ASSIGNED]: { en: 'New Challenge to Review', ar: 'تحدي جديد للمراجعة' },
  [CHALLENGE_NOTIFICATION_TYPES.SLA_WARNING]: { en: 'Challenge SLA Warning', ar: 'تحذير: اقتراب موعد التحدي' },
  [CHALLENGE_NOTIFICATION_TYPES.SOLUTION_MATCHED]: { en: 'Solution Matched to Your Challenge', ar: 'تم مطابقة حل لتحديك' },
  [CHALLENGE_NOTIFICATION_TYPES.COMMENT_ADDED]: { en: 'New Comment on Challenge', ar: 'تعليق جديد على التحدي' },
};

// ... Message Generator (Keep) ...
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
    [CHALLENGE_NOTIFICATION_TYPES.COMMENT_ADDED]: {
      en: `New comment on "${challengeTitle}"`,
      ar: `تعليق جديد على "${challengeTitle}"`
    }
  };
  return messages[type]?.[language] || messages[type]?.en || `Notification for ${challengeTitle}`;
};

export function useChallengeNotifications() {
  const { notify } = useNotificationSystem();
  const { user } = useAuth();

  /**
   * Notify on status change (notif-1, email-1, email-2)
   */
  const notifyStatusChange = useMutation({
    /** @param {{challenge: any, oldStatus?: string, newStatus: string, reviewerEmail?: string, rejectionReason?: string}} params */
    mutationFn: async ({ challenge, oldStatus, newStatus, reviewerEmail, rejectionReason }) => {
      const metadata = {
        challenge_title: challenge.title_en,
        old_status: oldStatus,
        new_status: newStatus,
        rejection_reason: rejectionReason
      };

      const typeMap = {
        submitted: CHALLENGE_NOTIFICATION_TYPES.SUBMITTED,
        approved: CHALLENGE_NOTIFICATION_TYPES.APPROVED,
        rejected: CHALLENGE_NOTIFICATION_TYPES.REJECTED,
        published: CHALLENGE_NOTIFICATION_TYPES.PUBLISHED,
        resolved: CHALLENGE_NOTIFICATION_TYPES.RESOLVED
      };

      const notificationType = typeMap[newStatus];
      if (!notificationType) return;

      const titleEn = NOTIFICATION_TITLES[notificationType]?.en;
      const titleAr = NOTIFICATION_TITLES[notificationType]?.ar;
      const messageEn = getNotificationMessage(notificationType, metadata, 'en');
      const messageAr = getNotificationMessage(notificationType, metadata, 'ar');

      // 1. Notify Owner
      if (challenge.challenge_owner_email) {
        await notify({
          type: notificationType,
          entityType: 'challenge',
          entityId: challenge.id,
          recipientEmails: [challenge.challenge_owner_email],
          title: titleEn,
          titleAr: titleAr,
          message: messageEn,
          messageAr: messageAr,
          metadata,
          sendEmail: ['submitted', 'approved', 'rejected', 'published'].includes(newStatus),
          emailTemplate: `challenge_${notificationType.replace('challenge_', '')}`,
          emailVariables: {
            challenge_title: challenge.title_en,
            challenge_url: `${window.location.origin}/challenges/${challenge.id}`,
            challenge_code: challenge.code,
            user_name: challenge.challenge_owner || challenge.challenge_owner_email.split('@')[0],
            ...metadata
          }
        });
      }

      // 2. Notify Reviewer
      if (newStatus === 'submitted' && reviewerEmail) {
        await notify({
          type: CHALLENGE_NOTIFICATION_TYPES.REVIEWER_ASSIGNED,
          entityType: 'challenge',
          entityId: challenge.id,
          recipientEmails: [reviewerEmail],
          title: NOTIFICATION_TITLES[CHALLENGE_NOTIFICATION_TYPES.REVIEWER_ASSIGNED].en,
          titleAr: NOTIFICATION_TITLES[CHALLENGE_NOTIFICATION_TYPES.REVIEWER_ASSIGNED].ar,
          message: `You have been assigned to review "${challenge.title_en}"`,
          messageAr: `تم تعيينك لمراجعة "${challenge.title_en}"`,
          metadata,
          sendEmail: true,
          emailTemplate: 'challenge_reviewer_assigned',
          emailVariables: {
            challenge_title: challenge.title_en,
            challenge_url: `${window.location.origin}/challenges/${challenge.id}`,
          }
        });
      }
    }
  });

  /**
   * Notify on assignment change (notif-2, email-4)
   */
  const notifyAssignment = useMutation({
    /** @param {{challenge: any, assigneeEmail: string, assignmentType?: string}} params */
    mutationFn: async ({ challenge, assigneeEmail, assignmentType = 'owner' }) => {
      const type = assignmentType === 'reviewer'
        ? CHALLENGE_NOTIFICATION_TYPES.REVIEWER_ASSIGNED
        : CHALLENGE_NOTIFICATION_TYPES.ASSIGNED;

      const metadata = {
        challenge_title: challenge.title_en,
        assignment_type: assignmentType,
        assigned_by: user?.email
      };

      const titleEn = NOTIFICATION_TITLES[type]?.en;
      const titleAr = NOTIFICATION_TITLES[type]?.ar;
      const messageEn = getNotificationMessage(type, metadata, 'en');
      const messageAr = getNotificationMessage(type, metadata, 'ar');

      await notify({
        type,
        entityType: 'challenge',
        entityId: challenge.id,
        recipientEmails: [assigneeEmail],
        title: titleEn,
        titleAr: titleAr,
        message: messageEn,
        messageAr: messageAr,
        metadata,
        sendEmail: true,
        emailTemplate: `challenge_${type.replace('challenge_', '')}`,
        emailVariables: {
          challenge_title: challenge.title_en,
          challenge_url: `${window.location.origin}/challenges/${challenge.id}`,
          ...metadata
        }
      });
    }
  });

  /**
   * Notify on solution match (email-3)
   */
  const notifySolutionMatch = useMutation({
    /** @param {{challenge: any, solution: any, matchScore: number}} params */
    mutationFn: async ({ challenge, solution, matchScore }) => {
      const metadata = {
        challenge_title: challenge.title_en,
        solution_title: solution.title_en || solution.name_en,
        match_score: matchScore
      };

      const type = CHALLENGE_NOTIFICATION_TYPES.SOLUTION_MATCHED;
      const titleEn = NOTIFICATION_TITLES[type]?.en;
      const titleAr = NOTIFICATION_TITLES[type]?.ar;
      const messageEn = getNotificationMessage(type, metadata, 'en');
      const messageAr = getNotificationMessage(type, metadata, 'ar');

      await notify({
        type,
        entityType: 'challenge',
        entityId: challenge.id,
        recipientEmails: [challenge.challenge_owner_email].filter(Boolean),
        title: titleEn,
        titleAr: titleAr,
        message: messageEn,
        messageAr: messageAr,
        metadata,
        sendEmail: true,
        emailTemplate: 'challenge_solution_matched',
        emailVariables: {
          challenge_title: challenge.title_en,
          challenge_url: `${window.location.origin}/challenges/${challenge.id}`,
          ...metadata
        }
      });
    }
  });

  /**
   * Notify on SLA warning (notif-4, email-5)
   */
  const notifySLAWarning = useMutation({
    /** @param {{challenge: any, dueDate: string, hoursRemaining: number}} params */
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

      const type = CHALLENGE_NOTIFICATION_TYPES.SLA_WARNING;
      const titleEn = NOTIFICATION_TITLES[type]?.en;
      const titleAr = NOTIFICATION_TITLES[type]?.ar;
      const messageEn = getNotificationMessage(type, metadata, 'en');
      const messageAr = getNotificationMessage(type, metadata, 'ar');

      await notify({
        type,
        entityType: 'challenge',
        entityId: challenge.id,
        recipientEmails: recipients,
        title: titleEn,
        titleAr: titleAr,
        message: messageEn,
        messageAr: messageAr,
        metadata,
        sendEmail: true,
        emailTemplate: 'challenge_sla_warning',
        emailVariables: {
          challenge_title: challenge.title_en,
          challenge_url: `${window.location.origin}/challenges/${challenge.id}`,
          ...metadata
        }
      });
    }
  });

  /**
   * Notify on comment (notif-3)
   */
  const notifyComment = useMutation({
    /** @param {{challenge: any, comment: any, mentionedEmails: string[]}} params */
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

      const type = CHALLENGE_NOTIFICATION_TYPES.COMMENT_ADDED;
      const titleEn = NOTIFICATION_TITLES[type]?.en;
      const titleAr = NOTIFICATION_TITLES[type]?.ar;
      const messageEn = getNotificationMessage(type, metadata, 'en');
      const messageAr = getNotificationMessage(type, metadata, 'ar');

      await notify({
        type,
        entityType: 'challenge',
        entityId: challenge.id,
        recipientEmails: [...new Set(recipients)],
        title: titleEn,
        titleAr: titleAr,
        message: messageEn,
        messageAr: messageAr,
        metadata,
        sendEmail: false
      });
    }
  });

  return {
    notifyStatusChange,
    notifyAssignment,
    notifySolutionMatch,
    notifySLAWarning,
    notifyComment,
    CHALLENGE_NOTIFICATION_TYPES,
    NOTIFICATION_TITLES
  };
}

export default useChallengeNotifications;

