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
    const { portfolio_id, organization_id, reviewer_email, action, review_data } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Portfolio review: ${action} for portfolio ${portfolio_id}`);

    let result;

    switch (action) {
      case 'submit_review':
        const { data: review, error: reviewError } = await supabase
          .from('portfolio_reviews')
          .insert({
            portfolio_id,
            reviewer_email,
            score: review_data?.score,
            comments: review_data?.comments,
            criteria_scores: review_data?.criteria_scores,
            recommendation: review_data?.recommendation,
            status: 'submitted',
            submitted_at: new Date().toISOString()
          })
          .select()
          .single();

        if (reviewError) throw reviewError;
        result = { submitted: true, review };
        break;

      case 'get_portfolio_stats':
        // Get portfolio statistics
        const { data: projects } = await supabase
          .from('portfolio_projects')
          .select('status, budget, actual_spend')
          .eq('portfolio_id', portfolio_id);

        const stats = {
          total_projects: projects?.length || 0,
          completed: projects?.filter(p => p.status === 'completed').length || 0,
          in_progress: projects?.filter(p => p.status === 'in_progress').length || 0,
          total_budget: projects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0,
          total_spend: projects?.reduce((sum, p) => sum + (p.actual_spend || 0), 0) || 0
        };

        result = { stats };
        break;

      case 'generate_report':
        // Generate portfolio review report
        const { data: portfolio } = await supabase
          .from('portfolios')
          .select('*, portfolio_projects(*), portfolio_reviews(*)')
          .eq('id', portfolio_id)
          .single();

        const { data: reviews } = await supabase
          .from('portfolio_reviews')
          .select('*')
          .eq('portfolio_id', portfolio_id)
          .order('submitted_at', { ascending: false });

        const avgScore = reviews?.length 
          ? reviews.reduce((sum, r) => sum + (r.score || 0), 0) / reviews.length 
          : 0;

        result = { 
          portfolio,
          reviews: reviews || [],
          average_score: avgScore,
          review_count: reviews?.length || 0
        };
        break;

      default:
        // Get all reviews for portfolio
        const { data: allReviews } = await supabase
          .from('portfolio_reviews')
          .select('*')
          .eq('portfolio_id', portfolio_id);

        result = { reviews: allReviews || [] };
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in portfolio-review:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
