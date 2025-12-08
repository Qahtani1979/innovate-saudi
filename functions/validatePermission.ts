import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Backend permission validation middleware
 * Validates if user has required permission before allowing action
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { permission, userId } = await req.json();
    
    // Get user roles
    const targetUser = userId ? 
      await base44.asServiceRole.entities.User.filter({ id: userId }).then(r => r[0]) :
      user;

    if (!targetUser) {
      return Response.json({ hasPermission: false, reason: 'User not found' });
    }

    const userRoles = targetUser.assigned_roles || [];
    
    // Get all roles with permissions
    const roles = await base44.asServiceRole.entities.Role.filter({
      name: { $in: userRoles }
    });

    // Check if any role has the permission
    const hasPermission = roles.some(role => 
      role.permissions?.includes(permission)
    );

    // Check delegations
    const activeDelegations = await base44.asServiceRole.entities.DelegationRule.filter({
      delegatee_email: targetUser.email,
      is_active: true,
      approval_status: 'approved'
    });

    const hasDelegatedPermission = activeDelegations.some(d => 
      d.delegated_permissions?.includes(permission) &&
      (!d.end_date || new Date(d.end_date) > new Date())
    );

    return Response.json({
      hasPermission: hasPermission || hasDelegatedPermission || targetUser.role === 'admin',
      source: hasPermission ? 'role' : hasDelegatedPermission ? 'delegation' : targetUser.role === 'admin' ? 'admin' : 'none',
      roles: userRoles
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});