import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, entity_name, limit = 10, threshold = 0.7 } = await req.json();

    if (!query) {
      return Response.json({ error: 'Query text required' }, { status: 400 });
    }

    const allowedEntities = ['Challenge', 'Solution', 'KnowledgeDocument', 'CitizenIdea', 'Organization'];
    if (!allowedEntities.includes(entity_name)) {
      return Response.json({ error: `Entity ${entity_name} not supported` }, { status: 400 });
    }

    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!googleApiKey) {
      return Response.json({ error: 'GOOGLE_API_KEY not configured' }, { status: 500 });
    }

    // Generate embedding for query
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${googleApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: {
            parts: [{
              text: query
            }]
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: `Gemini API error: ${errorText}` }, { status: 500 });
    }

    const data = await response.json();
    const queryEmbedding = data.embedding?.values;

    if (!queryEmbedding) {
      return Response.json({ error: 'Failed to generate query embedding' }, { status: 500 });
    }

    // Fetch all entities with embeddings
    const allEntities = await base44.entities[entity_name].list();
    const entitiesWithEmbeddings = allEntities.filter(e => e.embedding && e.embedding.length > 0);

    // Calculate cosine similarity
    const cosineSimilarity = (a, b) => {
      if (a.length !== b.length) return 0;
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
      }
      return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    };

    // Score and rank
    const scored = entitiesWithEmbeddings.map(entity => ({
      ...entity,
      similarity_score: cosineSimilarity(queryEmbedding, entity.embedding)
    }));

    // Filter by threshold and sort
    const results = scored
      .filter(e => e.similarity_score >= threshold)
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, limit);

    return Response.json({
      success: true,
      query: query,
      entity_name: entity_name,
      results: results,
      total_candidates: entitiesWithEmbeddings.length,
      matches_found: results.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});