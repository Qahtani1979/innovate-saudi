import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Lightbulb } from 'lucide-react';
import { createPageUrl } from '@/utils';

/**
 * CitizenIdeasAlert - Alert banner for citizen ideas ready to convert
 * @param {Object} props - Component props
 * @param {Array} props.citizenIdeas - Array of citizen ideas
 * @param {Object} props.myMunicipality - Municipality data
 * @param {Function} props.t - Translation function
 */
export default function CitizenIdeasAlert({ citizenIdeas, myMunicipality, t }) {
    if (citizenIdeas.length === 0) return null;

    return (
        <Card className="border-2 border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                        <Lightbulb className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-purple-900">
                            {citizenIdeas.length} {t({ en: 'Citizen Idea(s) Ready to Convert', ar: 'أفكار مواطنين جاهزة للتحويل' })}
                        </p>
                        <p className="text-sm text-purple-700">
                            {t({ en: 'Approved ideas from your municipality', ar: 'أفكار معتمدة من بلديتك' })}
                        </p>
                    </div>
                    <Link to={createPageUrl('IdeasManagement') + `?municipality=${myMunicipality?.id}`}>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            {t({ en: 'View Ideas', ar: 'عرض الأفكار' })}
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
