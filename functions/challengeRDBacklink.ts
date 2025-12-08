import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Auto-updates Challenge.linked_rd_ids when R&D entities reference challenges
 * Run periodically or trigger on R&D create/update
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const rdProjects = await base44.asServiceRole.entities.RDProject.list();
    const rdCalls = await base44.asServiceRole.entities.RDCall.list();
    const rdProposals = await base44.asServiceRole.entities.RDProposal.list();
    
    const updatedChallenges = [];

    // Group R&D entities by challenge_id
    const rdByChallengeId = new Map();
    
    [...rdProjects, ...rdCalls, ...rdProposals].forEach(rd => {
      const challengeIds = rd.challenge_ids || (rd.challenge_id ? [rd.challenge_id] : []);
      challengeIds.forEach(cid => {
        if (!rdByChallengeId.has(cid)) {
          rdByChallengeId.set(cid, []);
        }
        rdByChallengeId.get(cid).push(rd.id);
      });
    });

    // Update challenges
    for (const [challengeId, rdIds] of rdByChallengeId.entries()) {
      const challenge = await base44.asServiceRole.entities.Challenge.get(challengeId).catch(() => null);
      if (!challenge) continue;

      const currentRdIds = challenge.linked_rd_ids || [];
      const newRdIds = [...new Set([...currentRdIds, ...rdIds])];

      if (JSON.stringify(currentRdIds.sort()) !== JSON.stringify(newRdIds.sort())) {
        await base44.asServiceRole.entities.Challenge.update(challengeId, {
          linked_rd_ids: newRdIds
        });
        updatedChallenges.push({ id: challengeId, rd_count: newRdIds.length });
      }
    }

    return Response.json({
      success: true,
      updated: updatedChallenges.length,
      challenges_updated: updatedChallenges
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});