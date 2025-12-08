import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entity_name, entity_ids, mode } = await req.json();

    // Validate entity_name
    const allowedEntities = ['Challenge', 'Solution', 'KnowledgeDocument', 'CitizenIdea', 'Organization', 'Pilot', 'RDProject'];
    if (!allowedEntities.includes(entity_name)) {
      return Response.json({ error: `Entity ${entity_name} not supported for embeddings` }, { status: 400 });
    }

    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!googleApiKey) {
      return Response.json({ error: 'GOOGLE_API_KEY not configured' }, { status: 500 });
    }

    // Fetch entities to embed
    let entities = [];
    if (mode === 'all') {
      entities = await base44.asServiceRole.entities[entity_name].list();
    } else if (mode === 'missing') {
      const all = await base44.asServiceRole.entities[entity_name].list();
      entities = all.filter(e => !e.embedding || e.embedding.length === 0);
    } else if (entity_ids && entity_ids.length > 0) {
      entities = await Promise.all(
        entity_ids.map(id => base44.asServiceRole.entities[entity_name].filter({ id }))
      );
      entities = entities.flat();
    }

    if (entities.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'No entities to process',
        processed: 0 
      });
    }

    // Generate embeddings
    const results = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < entities.length; i += BATCH_SIZE) {
      const batch = entities.slice(i, i + BATCH_SIZE);
      
      const batchResults = await Promise.all(batch.map(async (entity) => {
        try {
          // Build text to embed based on entity type
          let textToEmbed = '';
          
          if (entity_name === 'Challenge') {
            textToEmbed = `${entity.title_en || ''}\n${entity.description_en || ''}\nSector: ${entity.sector || ''}\nKeywords: ${entity.keywords?.join(', ') || ''}`;
          } else if (entity_name === 'Solution') {
            textToEmbed = `${entity.name_en || ''}\n${entity.description_en || ''}\nFeatures: ${entity.features?.join(', ') || ''}\nValue: ${entity.value_proposition || ''}\nSectors: ${entity.sectors?.join(', ') || ''}`;
          } else if (entity_name === 'KnowledgeDocument') {
            textToEmbed = `${entity.title_en || ''}\n${entity.excerpt_en || entity.content_en?.substring(0, 500) || ''}\nCategory: ${entity.category || ''}\nTags: ${entity.tags?.join(', ') || ''}`;
          } else if (entity_name === 'CitizenIdea') {
            textToEmbed = `${entity.title || ''}\n${entity.description || ''}\nCategory: ${entity.category || ''}`;
          } else if (entity_name === 'Organization') {
            textToEmbed = `${entity.name_en || ''}\n${entity.description_en || ''}\nType: ${entity.org_type || ''}\nSpecializations: ${entity.specializations?.join(', ') || ''}\nCapabilities: ${entity.capabilities?.join(', ') || ''}`;
          } else if (entity_name === 'Pilot') {
            textToEmbed = `${entity.title_en || ''}\n${entity.description_en || ''}\nObjectives: ${entity.objectives_en || ''}\nSector: ${entity.sector || ''}`;
          } else if (entity_name === 'RDProject') {
            textToEmbed = `${entity.title_en || ''}\n${entity.abstract_en || ''}\nResearch Area: ${entity.research_area || ''}\nKeywords: ${entity.keywords?.join(', ') || ''}`;
          }

          if (!textToEmbed || textToEmbed.trim().length < 10) {
            return { id: entity.id, success: false, error: 'Insufficient text content' };
          }

          // Call Google Gemini Embedding API
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${googleApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: 'models/text-embedding-004',
                content: {
                  parts: [{
                    text: textToEmbed
                  }]
                }
              })
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            return { id: entity.id, success: false, error: `Gemini API error: ${errorText}` };
          }

          const data = await response.json();
          const embedding = data.embedding?.values;

          if (!embedding || !Array.isArray(embedding)) {
            return { id: entity.id, success: false, error: 'Invalid embedding response' };
          }

          // Update entity with embedding
          await base44.asServiceRole.entities[entity_name].update(entity.id, {
            embedding: embedding,
            embedding_model: 'text-embedding-004',
            embedding_generated_date: new Date().toISOString()
          });

          return { id: entity.id, success: true, dimensions: embedding.length };
        } catch (error) {
          return { id: entity.id, success: false, error: error.message };
        }
      }));

      results.push(...batchResults);
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return Response.json({
      success: true,
      processed: results.length,
      successful: successCount,
      failed: failureCount,
      results: results,
      entity_name: entity_name
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});