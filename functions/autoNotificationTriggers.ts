import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { entity_name, entity_id, old_status, new_status, citizen_email } = await req.json();

    if (!citizen_email) {
      return Response.json({ error: 'Citizen email required' }, { status: 400 });
    }

    let notificationData = null;

    // CitizenIdea status changes
    if (entity_name === 'CitizenIdea') {
      const idea = (await base44.asServiceRole.entities.CitizenIdea.filter({ id: entity_id }))[0];
      
      if (new_status === 'under_review') {
        notificationData = {
          notification_type: 'idea_under_review',
          title_en: 'Your Idea is Under Review',
          title_ar: 'فكرتك قيد المراجعة',
          message_en: `Your idea "${idea?.title}" is now being reviewed by our team.`,
          message_ar: `فكرتك "${idea?.title}" قيد المراجعة من قبل فريقنا.`,
          action_url: `/IdeaDetail?id=${entity_id}`
        };
      } else if (new_status === 'approved') {
        notificationData = {
          notification_type: 'idea_approved',
          title_en: 'Your Idea Was Approved!',
          title_ar: 'تم قبول فكرتك!',
          message_en: `Congratulations! Your idea "${idea?.title}" has been approved.`,
          message_ar: `تهانينا! تم قبول فكرتك "${idea?.title}".`,
          action_url: `/IdeaDetail?id=${entity_id}`,
          priority: 'high'
        };
        
        // Award points
        await base44.asServiceRole.functions.invoke('pointsAutomation', {
          eventType: 'idea_approved',
          ideaId: entity_id,
          citizenEmail: citizen_email
        });
      } else if (new_status === 'converted_to_challenge') {
        const challengeId = idea?.converted_challenge_id;
        notificationData = {
          notification_type: 'idea_converted',
          title_en: 'Your Idea Became a Challenge!',
          title_ar: 'أصبحت فكرتك تحدياً!',
          message_en: `Great news! Your idea "${idea?.title}" has been converted to an official challenge.`,
          message_ar: `أخبار رائعة! تم تحويل فكرتك "${idea?.title}" إلى تحدي رسمي.`,
          action_url: challengeId ? `/ChallengeDetail?id=${challengeId}` : `/IdeaDetail?id=${entity_id}`,
          priority: 'high'
        };
        
        // Award conversion points
        await base44.asServiceRole.functions.invoke('pointsAutomation', {
          eventType: 'idea_converted',
          ideaId: entity_id,
          citizenEmail: citizen_email
        });
      } else if (new_status === 'rejected') {
        notificationData = {
          notification_type: 'idea_rejected',
          title_en: 'Update on Your Idea',
          title_ar: 'تحديث على فكرتك',
          message_en: `Thank you for your submission. Your idea "${idea?.title}" was not selected at this time. We appreciate your participation!`,
          message_ar: `شكراً لمشاركتك. لم يتم اختيار فكرتك "${idea?.title}" هذه المرة. نقدر مشاركتك!`,
          action_url: `/IdeaDetail?id=${entity_id}`,
          priority: 'medium'
        };
      }
    }

    // Challenge resolution notification
    if (entity_name === 'Challenge' && new_status === 'resolved') {
      const challenge = (await base44.asServiceRole.entities.Challenge.filter({ id: entity_id }))[0];
      
      if (challenge?.citizen_origin_idea_id) {
        const idea = (await base44.asServiceRole.entities.CitizenIdea.filter({ id: challenge.citizen_origin_idea_id }))[0];
        
        notificationData = {
          notification_type: 'challenge_resolved',
          title_en: 'Challenge from Your Idea Resolved!',
          title_ar: 'تم حل التحدي من فكرتك!',
          message_en: `The challenge "${challenge?.title_en}" based on your idea has been successfully resolved!`,
          message_ar: `تم حل التحدي "${challenge?.title_ar}" المبني على فكرتك بنجاح!`,
          action_url: `/ChallengeDetail?id=${entity_id}`,
          priority: 'high'
        };
        
        // Award resolution points
        await base44.asServiceRole.functions.invoke('pointsAutomation', {
          eventType: 'challenge_resolved',
          ideaId: challenge.citizen_origin_idea_id,
          citizenEmail: idea?.submitter_email || citizen_email
        });
      }
    }

    // Pilot launch notification
    if (entity_name === 'Pilot' && new_status === 'active') {
      const pilot = (await base44.asServiceRole.entities.Pilot.filter({ id: entity_id }))[0];
      
      if (pilot?.citizen_origin_idea_id) {
        const idea = (await base44.asServiceRole.entities.CitizenIdea.filter({ id: pilot.citizen_origin_idea_id }))[0];
        
        notificationData = {
          notification_type: 'pilot_launched',
          title_en: 'Pilot from Your Idea Launched!',
          title_ar: 'تم إطلاق تجربة من فكرتك!',
          message_en: `A pilot project "${pilot?.title_en}" based on your idea is now live!`,
          message_ar: `مشروع تجريبي "${pilot?.title_ar}" مبني على فكرتك أصبح فعالاً الآن!`,
          action_url: `/PilotDetail?id=${entity_id}`,
          priority: 'high'
        };
      }
    }

    // Create notification
    if (notificationData) {
      await base44.asServiceRole.entities.CitizenNotification.create({
        citizen_identifier: citizen_email,
        entity_type: entity_name.toLowerCase(),
        entity_id,
        ...notificationData
      });

      // Send email
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: citizen_email,
        subject: notificationData.title_en,
        body: notificationData.message_en
      });
    }

    return Response.json({ success: true, notificationSent: !!notificationData });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Provider Match Notifications - Phase 5 Gap #35
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { challenge_id, challenge_embedding } = await req.json();

    if (!challenge_id || !challenge_embedding) {
      return Response.json({ error: 'Challenge ID and embedding required' }, { status: 400 });
    }

    // Get challenge details
    const challenge = (await base44.asServiceRole.entities.Challenge.filter({ id: challenge_id }))[0];
    if (!challenge) {
      return Response.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Find matching solutions using semantic search
    const matchingResults = await base44.asServiceRole.functions.invoke('semanticSearch', {
      query_embedding: challenge_embedding,
      entity_type: 'Solution',
      top_k: 10,
      min_score: 0.70
    });

    const matchingSolutions = matchingResults.data?.results || [];
    const notificationsSent = [];

    // Notify each solution provider
    for (const match of matchingSolutions) {
      const solution = match.entity;
      if (!solution.contact_email) continue;

      // Create notification
      await base44.asServiceRole.entities.Notification.create({
        user_email: solution.contact_email,
        notification_type: 'challenge_match',
        entity_type: 'challenge',
        entity_id: challenge_id,
        title_en: 'New Challenge Matches Your Solution',
        title_ar: 'تحدي جديد يطابق حلك',
        message_en: `A new challenge "${challenge.title_en}" matches your solution "${solution.name_en}" with ${Math.round(match.score * 100)}% relevance.`,
        message_ar: `تحدي جديد "${challenge.title_ar}" يطابق حلك "${solution.name_ar}" بنسبة ${Math.round(match.score * 100)}%.`,
        action_url: `/ChallengeDetail?id=${challenge_id}`,
        priority: match.score > 0.85 ? 'high' : 'medium',
        metadata: {
          solution_id: solution.id,
          match_score: match.score
        }
      });

      // Send email
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: solution.contact_email,
        subject: `New Challenge Opportunity: ${challenge.title_en}`,
        body: `Hello,\n\nWe found a new challenge that matches your solution "${solution.name_en}" with ${Math.round(match.score * 100)}% relevance.\n\nChallenge: ${challenge.title_en}\nSector: ${challenge.sector}\nMunicipality: ${challenge.municipality_id}\n\nView details: ${Deno.env.get('BASE_URL') || 'https://app.base44.com'}/ChallengeDetail?id=${challenge_id}\n\nBest regards,\nSaudi Innovates Platform`
      });

      notificationsSent.push({
        solution_id: solution.id,
        provider_email: solution.contact_email,
        match_score: match.score
      });
    }

    return Response.json({ 
      success: true, 
      notifications_sent: notificationsSent.length,
      matches: matchingSolutions.length 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});