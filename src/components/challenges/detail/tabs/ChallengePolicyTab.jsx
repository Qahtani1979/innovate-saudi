import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/components/LanguageContext';
import { Sparkles } from 'lucide-react';
import { createPageUrl } from '@/utils';
import PolicyRecommendationManager from '@/components/challenges/PolicyRecommendationManager';
import { usePoliciesWithVisibility } from '@/hooks/usePoliciesWithVisibility';

export default function ChallengePolicyTab({ challenge }) {
    const { t } = useLanguage();
    const challengeId = challenge?.id;

    const { data: policyRecommendations = [], isLoading } = usePoliciesWithVisibility({
        entityType: 'challenge',
        entityId: challengeId
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-end mb-4">
                <Link to={createPageUrl(`PolicyCreate?challenge_id=${challengeId}&entity_type=challenge`)}>
                    <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600">
                        <Sparkles className="h-4 w-4" />
                        {t({ en: 'Generate Policy Recommendation', ar: 'إنشاء توصية سياسية' })}
                    </Button>
                </Link>
            </div>
            <PolicyRecommendationManager
                challengeId={challengeId}
                policies={policyRecommendations}
                challenge={challenge}
            />
        </div>
    );
}
