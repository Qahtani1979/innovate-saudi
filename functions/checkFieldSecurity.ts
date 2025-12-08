import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Check if user can access specific fields
 * Returns filtered data with only permitted fields
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entityType, fields, data } = await req.json();

    // Field security rules
    const securityRules = {
      Challenge: {
        budget_estimate: ['admin', 'challenge_manage'],
        stakeholders: ['admin', 'challenge_manage', 'challenge_view_all']
      },
      Pilot: {
        budget: ['admin', 'pilot_manage', 'pilot_view_all'],
        budget_spent: ['admin', 'pilot_manage'],
        risks: ['admin', 'pilot_manage']
      },
      Solution: {
        pricing_details: ['admin', 'solution_manage'],
        contract_template_url: ['admin', 'solution_manage']
      },
      RDProject: {
        budget: ['admin', 'rd_manage', 'rd_view_all'],
        funding_source_en: ['admin', 'rd_manage']
      },
      Organization: {
        funding_rounds: ['admin', 'org_manage'],
        annual_revenue_range: ['admin', 'org_manage']
      }
    };

    const entityRules = securityRules[entityType] || {};
    const userRoles = user.assigned_roles || [];
    const isAdmin = user.role === 'admin';

    // Filter fields
    const filteredData = { ...data };
    
    Object.keys(entityRules).forEach(field => {
      const allowedRoles = entityRules[field];
      const hasAccess = isAdmin || allowedRoles.some(role => userRoles.includes(role));
      
      if (!hasAccess && filteredData[field]) {
        delete filteredData[field];
      }
    });

    return Response.json({
      success: true,
      filteredData,
      maskedFields: Object.keys(data).filter(f => !filteredData[f])
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});