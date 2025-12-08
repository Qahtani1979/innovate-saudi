import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Auto Expert Assignment - Phase 7 Gap #40
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { entity_type, entity_id, assignment_type, sector } = await req.json();

    if (!entity_type || !entity_id || !assignment_type) {
      return Response.json({ error: 'entity_type, entity_id, and assignment_type required' }, { status: 400 });
    }

    // Get all experts with matching expertise
    const allExperts = await base44.asServiceRole.entities.ExpertProfile.list();
    
    // Filter by sector if provided
    const sectorExperts = sector 
      ? allExperts.filter(e => e.expertise_areas?.includes(sector) && e.is_active && e.is_verified)
      : allExperts.filter(e => e.is_active && e.is_verified);

    if (sectorExperts.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'No experts available for this sector',
        fallback: 'assign_manually'
      }, { status: 404 });
    }

    // Use ExpertMatchingEngine for AI-based assignment
    let assignedExperts = [];
    
    try {
      const matchingResult = await base44.asServiceRole.functions.invoke('expertMatching', {
        entity_type,
        entity_id,
        required_count: 2,
        sector
      });
      
      assignedExperts = matchingResult.data?.assigned_experts || [];
    } catch (err) {
      console.error('Expert matching failed, falling back to availability:', err);
    }

    // Fallback: Assign by availability if AI matching fails
    if (assignedExperts.length === 0) {
      // Get current assignments to find least busy experts
      const recentAssignments = await base44.asServiceRole.entities.ExpertAssignment.filter({
        status: { $in: ['pending', 'active'] }
      });

      const expertWorkload = {};
      recentAssignments.forEach(a => {
        expertWorkload[a.expert_email] = (expertWorkload[a.expert_email] || 0) + 1;
      });

      // Sort by workload (ascending) and take top 2
      const sortedExperts = sectorExperts.sort((a, b) => {
        return (expertWorkload[a.user_email] || 0) - (expertWorkload[b.user_email] || 0);
      });

      assignedExperts = sortedExperts.slice(0, 2);
    }

    // Create ExpertAssignment records
    const assignments = [];
    for (const expert of assignedExperts) {
      const assignment = await base44.asServiceRole.entities.ExpertAssignment.create({
        entity_type,
        entity_id,
        assignment_type,
        expert_email: expert.user_email || expert.email,
        expert_name: expert.full_name || expert.name,
        status: 'pending',
        assigned_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        expertise_match_score: expert.match_score || 0.8
      });

      // Send notification
      await base44.asServiceRole.entities.Notification.create({
        user_email: expert.user_email || expert.email,
        notification_type: 'expert_assignment',
        entity_type,
        entity_id,
        title_en: `New ${entity_type} Evaluation Assignment`,
        title_ar: `مهمة تقييم ${entity_type} جديدة`,
        message_en: `You have been assigned to evaluate a ${entity_type}. Please complete your evaluation within 7 days.`,
        message_ar: `تم تعيينك لتقييم ${entity_type}. يرجى إكمال التقييم خلال 7 أيام.`,
        action_url: `/ExpertAssignmentQueue`,
        priority: 'high'
      });

      assignments.push(assignment);
    }

    return Response.json({ 
      success: true, 
      assignments_created: assignments.length,
      assigned_experts: assignedExperts.map(e => ({
        email: e.user_email || e.email,
        name: e.full_name || e.name
      }))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});