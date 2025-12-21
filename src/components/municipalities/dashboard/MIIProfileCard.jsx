
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { createPageUrl } from '@/utils';

/**
 * MIIProfileCard - Displays the municipality's MII score and performance.
 * @param {Object} props - Component props
 * @param {Object} props.myMunicipality - Municipality data
 * @param {Array} props.challenges - Challenges array for resolution rate
 * @param {Function} props.t - Translation function
 */
export default function MIIProfileCard({ myMunicipality, challenges, t }) {
    if (!myMunicipality) return null;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        {t({ en: 'Performance', ar: 'الأداء' })}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-slate-700">{t({ en: 'MII Score', ar: 'مؤشر الابتكار' })}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-600">{myMunicipality.mii_score || 0}</span>
                        <span className="text-xs text-slate-500">/ 100</span>
                    </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">{t({ en: 'National Rank', ar: 'الترتيب الوطني' })}</span>
                    <span className="text-xl font-bold text-teal-600">#{myMunicipality.mii_rank || '-'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-slate-700">{t({ en: 'Resolution Rate', ar: 'معدل الحل' })}</span>
                    <span className="text-xl font-bold text-green-600">
                        {challenges.length > 0
                            ? Math.round((challenges.filter(c => c.status === 'resolved').length / challenges.length) * 100)
                            : 0}%
                    </span>
                </div>
                <Link to={createPageUrl('MII')}>
                    <Button size="sm" variant="outline" className="w-full">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        {t({ en: 'View MII Details', ar: 'تفاصيل المؤشر' })}
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
