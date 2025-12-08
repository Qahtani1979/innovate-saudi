import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { program_application_id } = await req.json();

    if (!program_application_id) {
      return Response.json({ error: 'program_application_id required' }, { status: 400 });
    }

    const applications = await base44.asServiceRole.entities.ProgramApplication.filter({ id: program_application_id });
    const application = applications[0];

    if (!application) {
      return Response.json({ error: 'Application not found' }, { status: 404 });
    }

    // Only process graduated/completed applications
    if (application.status !== 'graduated' && application.status !== 'completed') {
      return Response.json({ error: 'Application not graduated' }, { status: 400 });
    }

    // Check if applicant already has startup profile
    const existingProfiles = await base44.asServiceRole.entities.StartupProfile.filter({ 
      user_email: application.applicant_email 
    });

    if (existingProfiles.length > 0) {
      // Link existing profile to program
      await base44.asServiceRole.entities.StartupProfile.update(existingProfiles[0].id, {
        program_alumni_ids: [...(existingProfiles[0].program_alumni_ids || []), application.program_id],
        program_graduation_dates: {
          ...(existingProfiles[0].program_graduation_dates || {}),
          [application.program_id]: new Date().toISOString()
        }
      });

      return Response.json({
        success: true,
        linked: true,
        startup_profile_id: existingProfiles[0].id,
        message: 'Existing startup profile linked to program'
      });
    }

    // Auto-create startup profile from program graduate
    const programs = await base44.asServiceRole.entities.Program.filter({ id: application.program_id });
    const program = programs[0];

    const newProfile = await base44.asServiceRole.entities.StartupProfile.create({
      user_email: application.applicant_email,
      name_en: application.project_name || application.applicant_name,
      description_en: application.project_description || 'Program graduate startup',
      stage: 'seed',
      team_size: 3,
      sectors: program?.focus_areas || [],
      program_alumni_ids: [application.program_id],
      program_graduation_dates: {
        [application.program_id]: new Date().toISOString()
      },
      source_program_id: application.program_id,
      auto_created_from_program: true
    });

    // Update application with link
    await base44.asServiceRole.entities.ProgramApplication.update(program_application_id, {
      startup_profile_created: true,
      startup_profile_id: newProfile.id
    });

    // Send welcome email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: application.applicant_email,
      subject: 'Your Startup Profile Created - Welcome to Saudi Innovates',
      body: `Congratulations on graduating from ${program?.name_en}!

Your startup profile has been automatically created. You can now:
• Explore municipal challenges and opportunities
• Apply to the Matchmaker program for AI-powered opportunity discovery
• Submit solutions to challenges
• Track your opportunity pipeline

Start exploring opportunities now!`
    });

    return Response.json({
      success: true,
      created: true,
      startup_profile_id: newProfile.id,
      message: 'Startup profile auto-created from program graduation'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});