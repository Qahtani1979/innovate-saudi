import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, TestTube, Target, Lightbulb, Sparkles } from 'lucide-react';
import { createPageUrl } from '@/utils';

/**
 * QuickActionsWidget - Displays quick action buttons for common tasks
 * @param {Object} props - Component props
 * @param {Object} props.myMunicipality - Municipality data
 * @param {Function} props.t - Translation function
 */
export default function QuickActionsWidget({ myMunicipality, t }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{t({ en: 'Quick Actions', ar: 'إجراءات سريعة' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Link to={createPageUrl('ChallengeCreate')}>
                    <Button className="w-full justify-start bg-gradient-to-r from-red-600 to-orange-600">
                        <Plus className="h-4 w-4 mr-2" />
                        {t({ en: 'Submit Challenge', ar: 'تقديم تحدي' })}
                    </Button>
                </Link>
                <Link to={createPageUrl('PilotCreate')}>
                    <Button variant="outline" className="w-full justify-start">
                        <TestTube className="h-4 w-4 mr-2" />
                        {t({ en: 'Design Pilot', ar: 'تصميم تجربة' })}
                    </Button>
                </Link>
                <Link to={createPageUrl('Solutions')}>
                    <Button variant="outline" className="w-full justify-start">
                        <Target className="h-4 w-4 mr-2" />
                        {t({ en: 'Find Solutions', ar: 'البحث عن حلول' })}
                    </Button>
                </Link>
                <Link to={createPageUrl('IdeasManagement') + `?municipality=${myMunicipality?.id}`}>
                    <Button variant="outline" className="w-full justify-start">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        {t({ en: 'Review Ideas', ar: 'مراجعة الأفكار' })}
                    </Button>
                </Link>
                <Link to={createPageUrl('ChallengeSolutionMatching')}>
                    <Button variant="outline" className="w-full justify-start">
                        <Sparkles className="h-4 w-4 mr-2" />
                        {t({ en: 'AI Matching', ar: 'المطابقة الذكية' })}
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
