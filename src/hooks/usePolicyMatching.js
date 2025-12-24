import { useState } from 'react';
import { usePolicyMutations, usePolicyInvalidator } from '@/hooks/usePolicyMutations';
import { toast } from 'sonner';

export function usePolicyMatching() {
    const { updatePolicy } = usePolicyMutations();
    const { invalidatePolicies } = usePolicyInvalidator();
    const [isMatching, setIsMatching] = useState(false);

    const cosineSimilarity = (a, b) => {
        if (!a || !b || a.length !== b.length) return 0;
        let dotProduct = 0, normA = 0, normB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    };

    const runPolicyMatching = async (policies, challenges, t) => {
        setIsMatching(true);
        try {
            toast.info(t({ en: 'Running AI policy analysis...', ar: 'تشغيل تحليل السياسات الذكي...' }));

            let matchCount = 0;

            // For each policy, find relevant entities
            for (const policy of policies) {
                if (!policy.embedding) continue;

                // Match with challenges
                for (const challenge of challenges.filter(c => c.embedding)) {
                    const similarity = cosineSimilarity(policy.embedding, challenge.embedding);
                    const score = Math.round(similarity * 100);

                    if (score >= 70 && !policy.source_entity_id) {
                        await updatePolicy.mutateAsync({
                            id: policy.id,
                            data: {
                                source_entity_id: challenge.id,
                                source_entity_type: 'challenge'
                            },
                            metadata: {
                                change_reason: `AI Auto-match (Score: ${score}%)`,
                                matched_with: challenge.title_en || challenge.code
                            }
                        });
                        matchCount++;
                    }
                }
            }

            await invalidatePolicies();
            if (matchCount > 0) {
                toast.success(t({ en: `Policy matching complete. Matched ${matchCount} policies.`, ar: `اكتمل تطابق السياسات. تم مطابقة ${matchCount} سياسة.` }));
            } else {
                toast.info(t({ en: 'Analysis complete. No new matches found.', ar: 'اكتمل التحليل. لم يتم العثور على مطابقات جديدة.' }));
            }
        } catch (error) {
            console.error('Matching failed:', error);
            toast.error(t({ en: 'Matching failed', ar: 'فشل التطابق' }));
        } finally {
            setIsMatchingPolicies(false); // Note: Fix this state variable name in return
            setIsMatching(false);
        }
    };

    return {
        runPolicyMatching,
        isMatching
    };
}
