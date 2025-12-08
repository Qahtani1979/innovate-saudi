import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rdProjectId, researcherNames } = await req.json();

    if (!rdProjectId || !researcherNames?.length) {
      return Response.json({ error: 'Missing rdProjectId or researcherNames' }, { status: 400 });
    }

    // Fetch R&D project
    const rdProject = await base44.asServiceRole.entities.RDProject.get(rdProjectId);
    
    if (!rdProject) {
      return Response.json({ error: 'R&D Project not found' }, { status: 404 });
    }

    // Use Google Scholar search via LLM with internet context
    const searchQuery = researcherNames.map(name => `author:"${name}"`).join(' OR ');
    
    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Search for academic publications by these researchers: ${researcherNames.join(', ')}. 
      
      Focus on publications related to: ${rdProject.title_en}
      Keywords: ${rdProject.keywords?.join(', ') || 'N/A'}
      
      Return a list of publications in JSON format with: title, authors, publication, year, url, abstract (if available).`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          publications: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                authors: { type: "array", items: { type: "string" } },
                publication: { type: "string" },
                year: { type: "number" },
                url: { type: "string" },
                abstract: { type: "string" }
              }
            }
          }
        }
      }
    });

    const newPublications = llmResponse.publications || [];

    // Merge with existing publications (avoid duplicates)
    const existingPubs = rdProject.publications || [];
    const mergedPubs = [...existingPubs];
    
    newPublications.forEach(newPub => {
      const isDuplicate = existingPubs.some(existing => 
        existing.title === newPub.title || 
        (existing.url && existing.url === newPub.url)
      );
      
      if (!isDuplicate) {
        mergedPubs.push(newPub);
      }
    });

    // Update R&D project
    await base44.asServiceRole.entities.RDProject.update(rdProjectId, {
      publications: mergedPubs,
      publications_count: mergedPubs.length,
      last_publication_sync_date: new Date().toISOString()
    });

    return Response.json({
      success: true,
      rdProjectId,
      newPublicationsFound: newPublications.length,
      duplicatesSkipped: newPublications.length - (mergedPubs.length - existingPubs.length),
      totalPublications: mergedPubs.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});