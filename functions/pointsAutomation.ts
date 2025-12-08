import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { eventType, ideaId, citizenEmail } = await req.json();

    // Get or create citizen points record
    let pointsRecord = (await base44.asServiceRole.entities.CitizenPoints.filter({ citizen_identifier: citizenEmail }))[0];
    
    if (!pointsRecord) {
      pointsRecord = await base44.asServiceRole.entities.CitizenPoints.create({
        citizen_identifier: citizenEmail,
        total_points: 0,
        points_breakdown: {
          ideas_submitted: 0,
          votes_received: 0,
          ideas_converted: 0,
          comments_posted: 0,
          challenges_resolved: 0
        },
        level: 'bronze',
        badges_earned: []
      });
    }

    const breakdown = pointsRecord.points_breakdown || {};
    let pointsToAdd = 0;
    let updatedBreakdown = { ...breakdown };

    // Award points based on event type
    switch (eventType) {
      case 'idea_submitted':
        pointsToAdd = 10;
        updatedBreakdown.ideas_submitted = (breakdown.ideas_submitted || 0) + 10;
        break;
      case 'vote_received':
        pointsToAdd = 2;
        updatedBreakdown.votes_received = (breakdown.votes_received || 0) + 2;
        break;
      case 'idea_converted':
        pointsToAdd = 50;
        updatedBreakdown.ideas_converted = (breakdown.ideas_converted || 0) + 50;
        break;
      case 'comment_posted':
        pointsToAdd = 5;
        updatedBreakdown.comments_posted = (breakdown.comments_posted || 0) + 5;
        break;
      case 'challenge_resolved':
        pointsToAdd = 100;
        updatedBreakdown.challenges_resolved = (breakdown.challenges_resolved || 0) + 100;
        break;
    }

    const newTotal = (pointsRecord.total_points || 0) + pointsToAdd;

    // Calculate level
    let level = 'bronze';
    if (newTotal >= 1000) level = 'diamond';
    else if (newTotal >= 500) level = 'platinum';
    else if (newTotal >= 200) level = 'gold';
    else if (newTotal >= 50) level = 'silver';

    // Update points
    await base44.asServiceRole.entities.CitizenPoints.update(pointsRecord.id, {
      total_points: newTotal,
      points_breakdown: updatedBreakdown,
      level,
      last_activity_date: new Date().toISOString()
    });

    // Check and award badges
    await checkAndAwardBadges(base44, citizenEmail, newTotal, updatedBreakdown);

    return Response.json({ 
      success: true, 
      pointsAwarded: pointsToAdd, 
      newTotal,
      level
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function checkAndAwardBadges(base44, citizenEmail, totalPoints, breakdown) {
  const badges = await base44.asServiceRole.entities.CitizenBadge.list();
  const citizenPoints = (await base44.asServiceRole.entities.CitizenPoints.filter({ citizen_identifier: citizenEmail }))[0];
  const earnedBadges = citizenPoints?.badges_earned || [];

  for (const badge of badges) {
    if (earnedBadges.includes(badge.badge_id)) continue;

    let shouldAward = false;

    switch (badge.criteria.type) {
      case 'submissions':
        shouldAward = (breakdown.ideas_submitted || 0) >= (badge.criteria.threshold || 0);
        break;
      case 'votes':
        shouldAward = (breakdown.votes_received || 0) >= (badge.criteria.threshold || 0);
        break;
      case 'conversions':
        shouldAward = (breakdown.ideas_converted || 0) >= (badge.criteria.threshold || 0);
        break;
      case 'impact':
        shouldAward = (breakdown.challenges_resolved || 0) >= (badge.criteria.threshold || 0);
        break;
    }

    if (shouldAward) {
      await base44.asServiceRole.entities.CitizenPoints.update(citizenPoints.id, {
        badges_earned: [...earnedBadges, badge.badge_id],
        total_points: (citizenPoints.total_points || 0) + (badge.points_awarded || 0)
      });

      await base44.asServiceRole.entities.CitizenBadge.update(badge.id, {
        times_awarded: (badge.times_awarded || 0) + 1
      });

      // Notify citizen
      await base44.asServiceRole.entities.CitizenNotification.create({
        citizen_identifier: citizenEmail,
        notification_type: 'recognition_earned',
        entity_type: 'idea',
        title_en: `Badge Earned: ${badge.name_en}`,
        title_ar: `تم كسب شارة: ${badge.name_ar}`,
        message_en: badge.description_en,
        message_ar: badge.description_ar,
        priority: 'medium'
      });
    }
  }
}