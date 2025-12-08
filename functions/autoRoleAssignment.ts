import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Auto-assign roles based on user profile and organization
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, userEmail } = await req.json();
    const targetEmail = userEmail || user.email;

    // Get user profile
    const userProfiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: targetEmail });
    const profile = userProfiles[0];

    if (!profile) {
      return Response.json({ message: 'No profile found', assignedRoles: [] });
    }

    const rolesToAssign = [];

    // Auto-assign based on profile attributes
    if (profile.organization_type === 'municipality') {
      rolesToAssign.push('municipal_innovator');
    }

    if (profile.organization_type === 'startup') {
      rolesToAssign.push('startup_provider');
    }

    if (profile.organization_type === 'university' || profile.organization_type === 'research_center') {
      rolesToAssign.push('researcher');
    }

    if (profile.expertise_areas?.includes('evaluation') || profile.expertise_areas?.includes('review')) {
      rolesToAssign.push('expert_evaluator');
    }

    // Update user with assigned roles
    const currentUser = await base44.asServiceRole.entities.User.filter({ email: targetEmail });
    if (currentUser[0]) {
      const existingRoles = currentUser[0].assigned_roles || [];
      const newRoles = [...new Set([...existingRoles, ...rolesToAssign])];

      await base44.asServiceRole.entities.User.update(currentUser[0].id, {
        assigned_roles: newRoles
      });
    }

    return Response.json({ 
      success: true,
      assignedRoles: rolesToAssign,
      message: `Assigned ${rolesToAssign.length} roles based on profile`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});