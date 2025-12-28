import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { createPageUrl } from '@/utils';

/**
 * PendingReviewsAlert - Alert banner for pending reviews
 * @param {Object} props - Component props
 * @param {Array} props.pendingReviews - Array of pending reviews
 * @param {Function} props.t - Translation function
 */
export default function PendingReviewsAlert({ pendingReviews, t }) {
    if (pendingReviews.length === 0) return null;

    return (
        <Card className="border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50">
            <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-yellow-600 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-yellow-900">
                            {pendingReviews.length} {t({ en: 'Challenge(s) Awaiting Your Review', ar: 'تحديات تنتظر مراجعتك' })}
                        </p>
                        <p className="text-sm text-yellow-700">
                            {t({ en: 'You have been assigned as reviewer', ar: 'تم تعيينك كمراجع' })}
                        </p>
                    </div>
                    <Link to={createPageUrl('ChallengeReviewQueue')}>
                        <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                            {t({ en: 'Review Queue', ar: 'قائمة المراجعة' })}
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
