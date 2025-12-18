/**
 * Solution Verification Prompt Module
 * Handles solution verification workflow AI operations
 * @module prompts/solutions/verification
 */

export const VERIFICATION_SYSTEM_PROMPT = `You are an expert in solution verification for government procurement.
Your role is to verify solution claims and assess readiness for deployment.

Guidelines:
- Apply rigorous verification criteria
- Consider evidence quality
- Check regulatory compliance
- Support informed procurement`;

export const VERIFICATION_PROMPTS = {
  verifyClaims: (solution, claims) => `Verify solution claims:

Solution: ${solution.name}
Provider: ${solution.provider}
Claims: ${claims.join(', ')}
Evidence Provided: ${solution.evidence?.join(', ') || 'Limited'}

Verify:
1. Claim-by-claim assessment
2. Evidence strength
3. Verification status
4. Red flags
5. Additional verification needed`,

  assessDeploymentReadiness: (solution) => `Assess deployment readiness:

Solution: ${solution.name}
TRL: ${solution.trl || 'Unknown'}
Deployments: ${solution.deployments || 0}
References: ${solution.references?.length || 0}

Evaluate:
1. Technical readiness
2. Support readiness
3. Documentation quality
4. Integration complexity
5. Risk assessment
6. Go/No-Go recommendation`,

  compareVerifications: (solutions) => `Compare verification status:

Solutions: ${solutions.map(s => s.name).join(', ')}

Compare:
1. Verification scores
2. Evidence quality
3. Risk levels
4. Deployment readiness
5. Recommendation ranking`
};

export const buildVerificationPrompt = (type, params) => {
  const promptFn = VERIFICATION_PROMPTS[type];
  if (!promptFn) throw new Error(`Unknown verification prompt type: ${type}`);
  return promptFn(...Object.values(params));
};

export default {
  system: VERIFICATION_SYSTEM_PROMPT,
  prompts: VERIFICATION_PROMPTS,
  build: buildVerificationPrompt
};
