import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { municipality_id, week_start, week_end } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate date range
    const endDate = week_end ? new Date(week_end) : new Date();
    const startDate = week_start 
      ? new Date(week_start) 
      : new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    console.log(`Weekly ideas report: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Fetch ideas from the week
    let query = supabase
      .from('citizen_ideas')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (municipality_id) {
      query = query.eq('municipality_id', municipality_id);
    }

    const { data: ideas } = await query;

    // Calculate statistics
    const totalIdeas = ideas?.length || 0;
    const publishedIdeas = ideas?.filter(i => i.is_published).length || 0;
    const pendingIdeas = ideas?.filter(i => i.status === 'pending').length || 0;
    const approvedIdeas = ideas?.filter(i => i.status === 'approved').length || 0;
    const totalVotes = ideas?.reduce((sum, i) => sum + (i.votes_count || 0), 0) || 0;

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    ideas?.forEach(idea => {
      const category = idea.category || 'uncategorized';
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
    });

    // Top ideas by votes
    const topIdeas = [...(ideas || [])]
      .sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))
      .slice(0, 5)
      .map(i => ({
        id: i.id,
        title: i.title,
        votes: i.votes_count || 0,
        status: i.status
      }));

    // Generate report
    const report = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      summary: {
        total_ideas: totalIdeas,
        published: publishedIdeas,
        pending: pendingIdeas,
        approved: approvedIdeas,
        total_votes: totalVotes,
        avg_votes_per_idea: totalIdeas > 0 ? (totalVotes / totalIdeas).toFixed(1) : 0
      },
      category_breakdown: categoryBreakdown,
      top_ideas: topIdeas,
      trends: {
        ideas_vs_last_week: 'N/A', // Would need historical data
        engagement_trend: totalVotes > totalIdeas * 2 ? 'high' : totalVotes > totalIdeas ? 'medium' : 'low'
      }
    };

    // Save report
    const { data: savedReport, error } = await supabase
      .from('weekly_reports')
      .insert({
        report_type: 'ideas',
        municipality_id,
        period_start: startDate.toISOString(),
        period_end: endDate.toISOString(),
        data: report,
        generated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.warn('Could not save report:', error);
    }

    return new Response(JSON.stringify({ 
      success: true,
      report_id: savedReport?.id,
      ...report
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in weekly-ideas-report:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
