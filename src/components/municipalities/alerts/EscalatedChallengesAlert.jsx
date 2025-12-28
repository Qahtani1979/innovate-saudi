import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { createPageUrl } from '@/utils';

/**
 * EscalatedChallengesAlert - Alert banner for escalated challenges
 * @param {Object} props - Component props
 * @param {Array} props.escalatedChallenges - Array of escalated challenges
 * @param {Function} props.t - Translation function
 */
export default function EscalatedChallengesAlert({ escalatedChallenges, t }) {
    if (escalatedChallenges.length === 0) return null;

    return (
        <Card className="border-2 border-red-400 bg-gradient-to-r from-red-50 to-orange-50">
            <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                        <Bell className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-red-900">
                            {escalatedChallenges.length} {t({ en: 'Escalated Challenge(s) Need Attention', ar: 'تحديات متصاعدة تحتاج انتباه' })}
                        </p>
                        <p className="text-sm text-red-700">
                            {t({ en: 'SLA violations detected - immediate action required', ar: 'انتهاكات SLA - مطلوب إجراء فوري' })}
                        </p>
                    </div>
                    <Link to={createPageUrl('MyChallenges') + '?filter=escalated'}>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                            {t({ en: 'Review Now', ar: 'مراجعة الآن' })}
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
