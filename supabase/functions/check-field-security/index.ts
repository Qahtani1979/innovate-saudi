import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Field-level security configuration
const fieldSecurityConfig: Record<string, Record<string, string[]>> = {
  challenges: {
    restricted: ['budget_estimate', 'internal_notes', 'stakeholders'],
    sensitive: ['challenge_owner_email', 'reviewer'],
    public: ['title_en', 'title_ar', 'description_en', 'description_ar', 'status', 'category']
  },
  pilots: {
    restricted: ['budget', 'internal_metrics', 'contract_details'],
    sensitive: ['team_members', 'provider_contact'],
    public: ['title_en', 'title_ar', 'description_en', 'status', 'municipality_id']
  },
  solutions: {
    restricted: ['pricing_details', 'internal_rating'],
    sensitive: ['provider_email', 'technical_specs'],
    public: ['name_en', 'name_ar', 'description_en', 'category', 'status']
  },
  users: {
    restricted: ['role', 'permissions', 'internal_notes'],
    sensitive: ['email', 'phone', 'organization'],
    public: ['display_name', 'avatar_url']
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, user_email, entity_type, field_name, action = 'read' } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!entity_type || !field_name) {
      return new Response(JSON.stringify({ 
        success: false,
        allowed: true, // Default to allowed if not specified
        error: "entity_type and field_name are required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Checking field security: ${entity_type}.${field_name} for ${user_email || user_id}`);

    // Get user roles
    let roles: string[] = ['viewer'];
    if (user_id) {
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user_id);
      roles = userRoles?.map(r => r.role) || ['viewer'];
    }

    // Admin has access to everything
    if (roles.includes('admin')) {
      return new Response(JSON.stringify({ 
        success: true,
        allowed: true,
        field_level: 'admin_access',
        roles
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get field configuration
    const entityConfig = fieldSecurityConfig[entity_type] || { public: [], sensitive: [], restricted: [] };
    
    let fieldLevel = 'public';
    let allowed = true;
    
    if (entityConfig.restricted?.includes(field_name)) {
      fieldLevel = 'restricted';
      // Only admin and moderator can access restricted fields
      allowed = roles.includes('admin') || roles.includes('moderator');
    } else if (entityConfig.sensitive?.includes(field_name)) {
      fieldLevel = 'sensitive';
      // Admin, moderator, and editor can access sensitive fields
      allowed = roles.includes('admin') || roles.includes('moderator') || roles.includes('editor');
    } else {
      fieldLevel = 'public';
      allowed = true;
    }

    // Write operations require higher privileges
    if (action === 'write' || action === 'update') {
      if (fieldLevel === 'restricted') {
        allowed = roles.includes('admin');
      } else if (fieldLevel === 'sensitive') {
        allowed = roles.includes('admin') || roles.includes('moderator');
      } else {
        allowed = roles.includes('admin') || roles.includes('moderator') || roles.includes('editor');
      }
    }

    console.log(`Field ${field_name} (${fieldLevel}): ${allowed ? 'allowed' : 'denied'}`);

    return new Response(JSON.stringify({ 
      success: true,
      allowed,
      field_level: fieldLevel,
      entity_type,
      field_name,
      action,
      roles
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in check-field-security:", error);
    return new Response(JSON.stringify({ success: false, allowed: true, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
