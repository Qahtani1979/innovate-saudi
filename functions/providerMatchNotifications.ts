import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all solutions with embeddings
    const solutions = await base44.asServiceRole.entities.Solution.filter({
      is_verified: true,
      is_published: true,
      embedding: { $exists: true }
    });

    // Get challenges created in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentChallenges = await base44.asServiceRole.entities.Challenge.filter({
      created_date: { $gte: sevenDaysAgo.toISOString() },
      is_published: true,
      status: { $in: ['submitted', 'under_review', 'approved'] }
    });

    if (recentChallenges.length === 0) {
      return Response.json({ message: 'No new challenges to match', matches: 0 });
    }

    const notifications = [];
    
    for (const solution of solutions) {
      // Find matching challenges using semantic search
      const matches = await base44.asServiceRole.functions.invoke('semanticSearch', {
        query_text: `${solution.name_en} ${solution.description_en}`,
        entity_name: 'Challenge',
        top_k: 5,
        min_score: 75
      });

      const newMatches = matches.data.filter(match => 
        recentChallenges.some(c => c.id === match.id)
      );

      if (newMatches.length > 0) {
        // Send email to provider
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: solution.contact_email || solution.created_by,
          subject: `New Challenge Matches for ${solution.name_en}`,
          body: `
            <h2>🎯 New Municipal Challenges Match Your Solution!</h2>
            <p>Your solution <strong>${solution.name_en}</strong> has been matched to ${newMatches.length} new challenges.</p>
            
            <h3>Top Matches:</h3>
            <ul>
              ${newMatches.map(match => `
                <li>
                  <strong>${match.title_en}</strong> - ${match.municipality_id}<br/>
                  Match Score: ${Math.round(match.similarity_score * 100)}%<br/>
                  <a href="${req.headers.get('origin')}/ChallengeDetail?id=${match.id}">View Challenge</a>
                </li>
              `).join('')}
            </ul>
            
            <p>Log in to your dashboard to express interest or submit a proposal.</p>
          `
        });

        // Create notification records
        for (const match of newMatches) {
          await base44.asServiceRole.entities.Notification.create({
            user_email: solution.contact_email || solution.created_by,
            type: 'solution_challenge_match',
            title: `New Challenge Match: ${match.title_en}`,
            message: `Your solution ${solution.name_en} matches challenge ${match.code} with ${Math.round(match.similarity_score * 100)}% score`,
            entity_type: 'Challenge',
            entity_id: match.id,
            priority: match.priority === 'tier_1' ? 'high' : 'normal',
            is_read: false
          });
        }

        notifications.push({
          solution_id: solution.id,
          solution_name: solution.name_en,
          match_count: newMatches.length,
          provider_email: solution.contact_email || solution.created_by
        });
      }
    }

    return Response.json({
      success: true,
      notifications_sent: notifications.length,
      total_matches: notifications.reduce((sum, n) => sum + n.match_count, 0),
      details: notifications
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});