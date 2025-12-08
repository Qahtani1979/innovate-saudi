import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get ideas from last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const allIdeas = await base44.asServiceRole.entities.CitizenIdea.list('-created_date', 500);
    const weekIdeas = allIdeas.filter(i => i.created_date > sevenDaysAgo);

    // Generate AI insights
    const insights = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze these citizen ideas from the past week:

${weekIdeas.map((idea, idx) => `${idx + 1}. ${idea.title} - ${idea.category} (${idea.vote_count || 0} votes)`).join('\n')}

Generate weekly insights report:
1. Top 3 trending themes
2. Geographic patterns (which cities most active)
3. Sentiment analysis (positive suggestions vs complaints)
4. Conversion opportunities (which ideas should become challenges)
5. Recommendations for municipality action`,
      response_json_schema: {
        type: "object",
        properties: {
          trending_themes: { type: "array", items: { type: "string" } },
          geographic_patterns: { type: "string" },
          sentiment_summary: { type: "string" },
          conversion_opportunities: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Get admin users
    const users = await base44.asServiceRole.entities.User.list();
    const admins = users.filter(u => u.role === 'admin');

    // Send email to admins
    for (const admin of admins) {
      await base44.integrations.Core.SendEmail({
        to: admin.email,
        subject: 'Weekly Citizen Ideas Report',
        body: `
<h2>Weekly Citizen Ideas Report</h2>

<h3>📊 This Week's Summary</h3>
<ul>
  <li>Total submissions: ${weekIdeas.length}</li>
  <li>Total votes: ${weekIdeas.reduce((sum, i) => sum + (i.vote_count || 0), 0)}</li>
  <li>Top category: ${weekIdeas.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1;
    return acc;
  }, {})[0]}</li>
</ul>

<h3>🔥 Trending Themes</h3>
<ul>
  ${insights.trending_themes.map(t => `<li>${t}</li>`).join('\n')}
</ul>

<h3>📍 Geographic Patterns</h3>
<p>${insights.geographic_patterns}</p>

<h3>💡 Conversion Opportunities</h3>
<ul>
  ${insights.conversion_opportunities.map(c => `<li>${c}</li>`).join('\n')}
</ul>

<h3>🎯 Recommendations</h3>
<ul>
  ${insights.recommendations.map(r => `<li>${r}</li>`).join('\n')}
</ul>

<p><a href="${Deno.env.get('APP_URL') || 'https://app.base44.com'}/pages/IdeasManagement">View Ideas Management →</a></p>
        `
      });
    }

    return Response.json({ 
      success: true, 
      report: insights,
      ideas_count: weekIdeas.length,
      emails_sent: admins.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});