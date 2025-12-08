import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Service role for bulk operations
    const challenges = await base44.asServiceRole.entities.Challenge.list();
    
    const now = new Date();
    const updatedChallenges = [];
    const notifications = [];

    for (const challenge of challenges) {
      let needsUpdate = false;
      const updates = {};

      // Auto-calculate SLA due date if not set
      if (!challenge.sla_due_date && challenge.status === 'submitted') {
        const submissionDate = new Date(challenge.submission_date || challenge.created_date);
        const slaDeadline = new Date(submissionDate);
        
        // Different SLA by priority
        const slaDays = {
          tier_1: 7,
          tier_2: 14,
          tier_3: 21,
          tier_4: 30
        }[challenge.priority] || 21;
        
        slaDeadline.setDate(slaDeadline.getDate() + slaDays);
        updates.sla_due_date = slaDeadline.toISOString().split('T')[0];
        needsUpdate = true;
      }

      // Check for overdue and escalate
      if (challenge.sla_due_date && !['resolved', 'archived'].includes(challenge.status)) {
        const dueDate = new Date(challenge.sla_due_date);
        const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));

        if (daysOverdue > 0) {
          // Escalate based on days overdue
          const newEscalationLevel = daysOverdue >= 14 ? 2 : daysOverdue >= 7 ? 1 : 0;
          
          if (newEscalationLevel > (challenge.escalation_level || 0)) {
            updates.escalation_level = newEscalationLevel;
            updates.escalation_date = now.toISOString();
            needsUpdate = true;

            // Send notification to leadership
            notifications.push({
              type: 'challenge_escalation',
              challenge_id: challenge.id,
              challenge_code: challenge.code,
              challenge_title: challenge.title_en,
              escalation_level: newEscalationLevel,
              days_overdue: daysOverdue,
              municipality: challenge.municipality_id
            });
          }
        }
      }

      if (needsUpdate) {
        await base44.asServiceRole.entities.Challenge.update(challenge.id, updates);
        updatedChallenges.push({ id: challenge.id, updates });
      }
    }

    // Send leadership notifications for escalations
    for (const notif of notifications) {
      // Get admin emails
      const users = await base44.asServiceRole.entities.User.list();
      const admins = users.filter(u => u.role === 'admin');

      for (const admin of admins) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: admin.email,
          subject: `🚨 Challenge Escalation Alert: ${notif.challenge_code}`,
          body: `
A challenge has been escalated due to SLA overdue:

Challenge: ${notif.challenge_title}
Code: ${notif.challenge_code}
Municipality: ${notif.municipality}
Escalation Level: ${notif.escalation_level === 2 ? 'CRITICAL' : 'WARNING'}
Days Overdue: ${notif.days_overdue}

Please review and take action:
${process.env.BASE44_APP_URL || ''}/ChallengeDetail?id=${notif.challenge_id}

Saudi Innovates Platform
          `
        });
      }
    }

    return Response.json({
      success: true,
      updated: updatedChallenges.length,
      escalations: notifications.length,
      message: `SLA automation complete: ${updatedChallenges.length} challenges updated, ${notifications.length} escalations sent`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});