import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const applications = await base44.asServiceRole.entities.ProgramApplication.list();
    const graduates = applications.filter(app => 
      app.graduation_status === 'graduated' && 
      !app.alumni_automation_complete
    );

    const results = {
      processed: 0,
      mentor_invites: 0,
      showcase_added: 0,
      impact_tracking_started: 0
    };

    for (const graduate of graduates) {
      // Check if should become mentor (high performance + willing)
      if (graduate.final_score >= 85 && graduate.mentor_interest) {
        await base44.asServiceRole.entities.ProgramApplication.update(graduate.id, {
          is_mentor: true,
          mentor_onboarding_date: new Date().toISOString()
        });

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: graduate.applicant_email,
          subject: `🎓 Invitation: Become a Mentor`,
          body: `Congratulations! Based on your exceptional performance, we invite you to mentor the next cohort.

Your expertise will help shape the next generation of innovators.

Click here to accept: ${Deno.env.get('BASE_URL')}/MentorDashboard`
        });

        results.mentor_invites++;
      }

      // Add to alumni showcase
      if (graduate.showcase_consent) {
        results.showcase_added++;
      }

      // Start 6-month impact tracking
      const sixMonthsOut = new Date();
      sixMonthsOut.setMonth(sixMonthsOut.getMonth() + 6);

      await base44.asServiceRole.entities.Notification.create({
        user_email: graduate.applicant_email,
        title: '6-Month Alumni Survey',
        message: 'Tell us about your journey since graduation',
        type: 'alumni_survey',
        scheduled_date: sixMonthsOut.toISOString(),
        is_read: false
      });

      await base44.asServiceRole.entities.ProgramApplication.update(graduate.id, {
        alumni_automation_complete: true,
        alumni_onboarded_date: new Date().toISOString()
      });

      results.processed++;
      results.impact_tracking_started++;
    }

    return Response.json({
      status: 'success',
      results
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});