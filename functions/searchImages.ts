import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchQuery, page = 1 } = await req.json();
    
    if (!searchQuery) {
      return Response.json({ error: 'Search query is required' }, { status: 400 });
    }

    // Unsplash API access key from environment
    const UNSPLASH_ACCESS_KEY = Deno.env.get('UNSPLASH_ACCESS_KEY');
    
    // Search photos on Unsplash
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=9&page=${page}&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Format results for our UI
    const images = data.results.map(photo => ({
      url: photo.urls.regular,
      thumbnail: photo.urls.small,
      credit: `Photo by ${photo.user.name}`,
      description: photo.alt_description || photo.description || searchQuery,
      source: 'Unsplash',
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html
    }));

    return Response.json({ 
      success: true,
      images,
      total: data.total
    });

  } catch (error) {
    console.error('Image search error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});