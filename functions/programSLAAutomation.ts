import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const programs = await base44.asServiceRole.entities.Program.list();
    const updates = [];
    const alerts = [];

    for (const program of programs) {
      if (!program.workflow_stage || program.is_deleted) continue;

      const stageSLAs = {
        'launch_approval_pending': 5,
        'selection_in_progress': 10,
        'mid_review_pending': 7,
        'completion_review_pending': 14
      };

      const sla_days = stageSLAs[program.workflow_stage];
      if (!sla_days) continue;

      const stageDate = new Date(program.updated_date);
      const now = new Date();
      const daysInStage = Math.floor((now - stageDate) / (1000 * 60 * 60 * 24));

      let escalation_level = 0;
      if (daysInStage > sla_days * 1.5) {
        escalation_level = 2;
      } else if (daysInStage > sla_days) {
        escalation_level = 1;
      }

      if (escalation_level > 0 && program.escalation_level !== escalation_level) {
        await base44.asServiceRole.entities.Program.update(program.id, {
          escalation_level,
          sla_due_date: new Date(stageDate.getTime() + sla_days * 24 * 60 * 60 * 1000).toISOString()
        });

        updates.push({
          program_id: program.id,
          name: program.name_en,
          stage: program.workflow_stage,
          days_overdue: daysInStage - sla_days,
          escalation_level
        });

        if (escalation_level === 2) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: program.contact_email || 'admin@platform.com',
            subject: `🚨 Critical: Program "${program.name_en}" - SLA Breach`,
            body: `Program has been in stage "${program.workflow_stage}" for ${daysInStage} days (SLA: ${sla_days} days).
            
Immediate action required.

View program: ${Deno.env.get('BASE_URL')}/ProgramDetail?id=${program.id}`
          });

          alerts.push(program.id);
        }
      }
    }

    return Response.json({
      status: 'success',
      programs_processed: programs.length,
      escalations_updated: updates.length,
      critical_alerts_sent: alerts.length,
      updates
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});