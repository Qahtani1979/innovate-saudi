import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, per_page = 10, page = 1 } = await req.json();
    
    const UNSPLASH_ACCESS_KEY = Deno.env.get("UNSPLASH_ACCESS_KEY");

    if (!query) {
      return new Response(JSON.stringify({ 
        success: false, 
        images: [],
        error: "Query is required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Searching images for: "${query}"`);

    // If Unsplash key is available, use Unsplash API
    if (UNSPLASH_ACCESS_KEY) {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${per_page}&page=${page}`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const images = data.results.map((img: Record<string, unknown>) => ({
          id: img.id,
          url: (img.urls as Record<string, string>)?.regular,
          thumb: (img.urls as Record<string, string>)?.thumb,
          alt: img.alt_description || query,
          photographer: (img.user as Record<string, string>)?.name,
          source: 'unsplash'
        }));

        console.log(`Found ${images.length} images from Unsplash`);

        return new Response(JSON.stringify({ 
          success: true,
          images,
          total: data.total,
          total_pages: data.total_pages
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fallback: Return placeholder images
    console.log("Using placeholder images (no Unsplash key)");
    
    const placeholderImages = Array.from({ length: per_page }, (_, i) => ({
      id: `placeholder-${i}`,
      url: `https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80`,
      thumb: `https://images.unsplash.com/photo-1557683316-973673baf926?w=200&q=80`,
      alt: query,
      photographer: 'Unsplash',
      source: 'placeholder'
    }));

    return new Response(JSON.stringify({ 
      success: true,
      images: placeholderImages,
      total: per_page,
      total_pages: 1,
      note: 'Using placeholder images. Add UNSPLASH_ACCESS_KEY for real results.'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in search-images:", error);
    return new Response(JSON.stringify({ success: false, images: [], error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
