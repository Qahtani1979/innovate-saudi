
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { createPageUrl } from '@/utils';

/**
 * MunicipalityHighlightCard - Displays high-level municipality stats and profile link.
 * @param {Object} props - Component props
 * @param {Object} props.myMunicipality - Municipality data
 * @param {Function} props.t - Translation function
 * @param {String} props.language - Current language ('en' or 'ar')
 */
export default function MunicipalityHighlightCard({ myMunicipality, t, language }) {
    if (!myMunicipality) return null;

    return (
        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-teal-50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        {language === 'ar' && myMunicipality.name_ar ? myMunicipality.name_ar : myMunicipality.name_en}
                    </CardTitle>
                    <Link to={createPageUrl('MunicipalityProfile') + `?id=${myMunicipality.id}`}>
                        <Button size="sm" variant="outline">
                            {t({ en: 'View Profile', ar: 'عرض الملف' })}
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-600">{t({ en: 'MII Score', ar: 'مؤشر الابتكار' })}</p>
                        <div className="text-4xl font-bold text-blue-600">{myMunicipality.mii_score || 0}</div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-600">{t({ en: 'National Rank', ar: 'الترتيب الوطني' })}</p>
                        <div className="text-3xl font-bold text-teal-600">#{myMunicipality.mii_rank || '-'}</div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{myMunicipality.active_challenges || 0}</div>
                        <div className="text-xs text-slate-600">{t({ en: 'Challenges', ar: 'تحديات' })}</div>
                    </div>
                    <div className="p-2 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{myMunicipality.active_pilots || 0}</div>
                        <div className="text-xs text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</div>
                    </div>
                    <div className="p-2 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{myMunicipality.completed_pilots || 0}</div>
                        <div className="text-xs text-slate-600">{t({ en: 'Complete', ar: 'مكتمل' })}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
