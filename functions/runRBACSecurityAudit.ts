import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Run comprehensive RBAC security audit
 * Identifies orphaned permissions, unused roles, security gaps
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [users, roles, delegations, teams] = await Promise.all([
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.Role.list(),
      base44.asServiceRole.entities.DelegationRule.filter({ is_active: true }),
      base44.asServiceRole.entities.Team.list()
    ]);

    // Find users without roles
    const usersWithoutRoles = users.filter(u => !u.assigned_roles || u.assigned_roles.length === 0);

    // Find unused roles
    const usedRoles = new Set();
    users.forEach(u => u.assigned_roles?.forEach(r => usedRoles.add(r)));
    const unusedRoles = roles.filter(r => !usedRoles.has(r.name) && !r.is_system_role);

    // Find expired delegations
    const expiredDelegations = delegations.filter(d => 
      d.end_date && new Date(d.end_date) < new Date()
    );

    // Find permission conflicts
    const permissionConflicts = [];
    users.forEach(user => {
      const userPermissions = new Set();
      user.assigned_roles?.forEach(roleName => {
        const role = roles.find(r => r.name === roleName);
        role?.permissions?.forEach(p => userPermissions.add(p));
      });

      // Check for conflicting permissions
      if (userPermissions.has('challenge_delete') && !userPermissions.has('challenge_edit')) {
        permissionConflicts.push({
          user: user.email,
          issue: 'Can delete but not edit challenges'
        });
      }
    });

    return Response.json({
      success: true,
      audit: {
        timestamp: new Date().toISOString(),
        summary: {
          totalUsers: users.length,
          usersWithoutRoles: usersWithoutRoles.length,
          totalRoles: roles.length,
          unusedRoles: unusedRoles.length,
          activeDelegations: delegations.length,
          expiredDelegations: expiredDelegations.length,
          permissionConflicts: permissionConflicts.length
        },
        findings: {
          usersWithoutRoles: usersWithoutRoles.map(u => u.email),
          unusedRoles: unusedRoles.map(r => r.name),
          expiredDelegations: expiredDelegations.map(d => ({
            id: d.id,
            delegator: d.delegator_email,
            delegatee: d.delegatee_email,
            expired: d.end_date
          })),
          permissionConflicts
        },
        recommendations: [
          usersWithoutRoles.length > 0 && 'Assign roles to users without roles',
          unusedRoles.length > 0 && 'Review and remove unused roles',
          expiredDelegations.length > 0 && 'Deactivate expired delegations',
          permissionConflicts.length > 0 && 'Fix permission conflicts'
        ].filter(Boolean)
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});