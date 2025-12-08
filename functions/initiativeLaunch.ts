import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, entity_type, entity_id, comments, checklist } = await req.json();

    let entity, entityName;
    
    if (entity_type === 'pilot') {
      const pilots = await base44.asServiceRole.entities.Pilot.filter({ id: entity_id });
      entity = pilots[0];
      entityName = entity?.title_en;
    } else if (entity_type === 'program') {
      const programs = await base44.asServiceRole.entities.Program.filter({ id: entity_id });
      entity = programs[0];
      entityName = entity?.name_en;
    } else if (entity_type === 'rd_call') {
      const calls = await base44.asServiceRole.entities.RDCall.filter({ id: entity_id });
      entity = calls[0];
      entityName = entity?.title_en;
    }

    if (!entity) {
      return Response.json({ error: 'Entity not found' }, { status: 404 });
    }

    if (action === 'submit') {
      // Submit for launch approval
      const updates = {
        launch_status: 'pending_approval',
        launch_submitted_by: user.email,
        launch_submitted_date: new Date().toISOString(),
        launch_checklist: checklist
      };

      if (entity_type === 'pilot') {
        await base44.asServiceRole.entities.Pilot.update(entity_id, updates);
      } else if (entity_type === 'program') {
        await base44.asServiceRole.entities.Program.update(entity_id, updates);
      } else if (entity_type === 'rd_call') {
        await base44.asServiceRole.entities.RDCall.update(entity_id, updates);
      }

      // Send email to launch approver
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'launch.admin@example.com',
        subject: `Launch Approval Request: ${entityName}`,
        body: `Launch approval requested.\n\nType: ${entity_type}\nName: ${entityName}\nSubmitted by: ${user.full_name}\n\nPlease review launch checklist and approve.`
      });

      return Response.json({ success: true, message: 'Launch approval requested' });
    }

    if (action === 'approve') {
      const updates = {
        launch_status: 'approved',
        launch_approved_by: user.email,
        launch_approved_date: new Date().toISOString(),
        launch_comments: comments
      };

      if (entity_type === 'pilot') {
        updates.stage = 'active';
        await base44.asServiceRole.entities.Pilot.update(entity_id, updates);
      } else if (entity_type === 'program') {
        updates.status = 'active';
        await base44.asServiceRole.entities.Program.update(entity_id, updates);
      } else if (entity_type === 'rd_call') {
        updates.status = 'published';
        await base44.asServiceRole.entities.RDCall.update(entity_id, updates);
      }

      // Send email to submitter
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: entity.launch_submitted_by || entity.created_by,
        subject: `Launch Approved: ${entityName}`,
        body: `Launch approved!\n\nType: ${entity_type}\nName: ${entityName}\nApproved by: ${user.full_name}\nComments: ${comments || 'None'}\n\nYou can now proceed with launch.`
      });

      return Response.json({ success: true, message: 'Launch approved' });
    }

    if (action === 'reject') {
      const updates = {
        launch_status: 'rejected',
        launch_approved_by: user.email,
        launch_approved_date: new Date().toISOString(),
        launch_comments: comments
      };

      if (entity_type === 'pilot') {
        await base44.asServiceRole.entities.Pilot.update(entity_id, updates);
      } else if (entity_type === 'program') {
        await base44.asServiceRole.entities.Program.update(entity_id, updates);
      } else if (entity_type === 'rd_call') {
        await base44.asServiceRole.entities.RDCall.update(entity_id, updates);
      }

      // Send email to submitter
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: entity.launch_submitted_by || entity.created_by,
        subject: `Launch Rejected: ${entityName}`,
        body: `Launch rejected. Please address feedback.\n\nType: ${entity_type}\nName: ${entityName}\nRejected by: ${user.full_name}\nComments: ${comments || 'None'}`
      });

      return Response.json({ success: true, message: 'Launch rejected' });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});