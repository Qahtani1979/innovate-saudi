import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Citizen Notification Service
 * Sends notifications to citizens about idea status changes
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { eventType, ideaId, challengeId, pilotId, citizenEmail } = await req.json();

    if (!citizenEmail || !eventType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch related entity
    let title_en = '';
    let message_en = '';
    let title_ar = '';
    let message_ar = '';
    let actionUrl = '';

    if (eventType === 'idea_submitted') {
      title_en = 'Idea Submitted Successfully';
      title_ar = 'تم تقديم الفكرة بنجاح';
      message_en = 'Thank you for sharing your idea! Our team will review it soon.';
      message_ar = 'شكراً لمشاركة فكرتك! سيقوم فريقنا بمراجعتها قريباً.';
      actionUrl = `/IdeaDetail?id=${ideaId}`;
    } else if (eventType === 'idea_under_review') {
      title_en = 'Your Idea is Being Reviewed';
      title_ar = 'فكرتك قيد المراجعة';
      message_en = 'A specialist is now reviewing your idea.';
      message_ar = 'يقوم أحد المختصين الآن بمراجعة فكرتك.';
      actionUrl = `/IdeaDetail?id=${ideaId}`;
    } else if (eventType === 'idea_approved') {
      title_en = 'Idea Approved!';
      title_ar = 'تمت الموافقة على فكرتك!';
      message_en = 'Great news! Your idea has been approved and will be considered for implementation.';
      message_ar = 'أخبار رائعة! تمت الموافقة على فكرتك وسيتم النظر في تنفيذها.';
      actionUrl = `/IdeaDetail?id=${ideaId}`;
    } else if (eventType === 'idea_converted') {
      const challenge = await base44.asServiceRole.entities.Challenge.list();
      const ch = challenge.find(c => c.id === challengeId);
      
      title_en = 'Your Idea Became a Challenge!';
      title_ar = 'تحولت فكرتك إلى تحدي!';
      message_en = `Your idea has been converted to Challenge: "${ch?.title_en || 'Challenge'}". Track its progress here.`;
      message_ar = `تم تحويل فكرتك إلى تحدي: "${ch?.title_ar || 'تحدي'}". تابع تقدمها من هنا.`;
      actionUrl = `/ChallengeDetail?id=${challengeId}`;
    } else if (eventType === 'challenge_resolved') {
      const challenge = await base44.asServiceRole.entities.Challenge.list();
      const ch = challenge.find(c => c.id === challengeId);
      
      title_en = 'Your Idea Led to Real Impact!';
      title_ar = 'أدت فكرتك إلى تأثير حقيقي!';
      message_en = `The challenge based on your idea has been resolved! See the results.`;
      message_ar = `تم حل التحدي المبني على فكرتك! شاهد النتائج.`;
      actionUrl = `/ChallengeDetail?id=${challengeId}`;
    }

    // Create notification record
    const notification = await base44.asServiceRole.entities.CitizenNotification.create({
      citizen_identifier: citizenEmail,
      notification_type: eventType,
      entity_type: ideaId ? 'idea' : challengeId ? 'challenge' : 'pilot',
      entity_id: ideaId || challengeId || pilotId,
      title_en,
      title_ar,
      message_en,
      message_ar,
      action_url: actionUrl,
      delivery_channel: 'email'
    });

    // Send email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: citizenEmail,
      subject: title_en,
      body: `
        <h2>${title_en}</h2>
        <p>${message_en}</p>
        <p><a href="https://saudiarab.innovate${actionUrl}">View Details</a></p>
        <hr/>
        <h2 dir="rtl">${title_ar}</h2>
        <p dir="rtl">${message_ar}</p>
      `
    });

    // Mark as sent
    await base44.asServiceRole.entities.CitizenNotification.update(notification.id, {
      is_sent: true,
      sent_date: new Date().toISOString()
    });

    return Response.json({ success: true, notification_id: notification.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});