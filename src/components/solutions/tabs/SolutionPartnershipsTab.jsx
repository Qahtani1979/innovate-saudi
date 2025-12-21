import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Handshake } from 'lucide-react';

/**
 * SolutionPartnershipsTab - Displays partnerships for a solution
 * @param {Object} props - Component props
 * @param {Object} props.solution - Solution data
 * @param {Function} props.t - Translation function
 */
export default function SolutionPartnershipsTab({ solution, t }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Handshake className="h-5 w-5 text-blue-600" />
                    {t({ en: 'Strategic Partnerships', ar: 'الشراكات الاستراتيجية' })}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {solution.partnerships && solution.partnerships.length > 0 ? (
                    <div className="space-y-3">
                        {solution.partnerships.map((partnership, i) => (
                            <div key={i} className="p-4 border rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-900">{partnership.partner}</p>
                                        <Badge variant="outline" className="text-xs mt-1">{partnership.type}</Badge>
                                    </div>
                                </div>
                                {partnership.description && (
                                    <p className="text-sm text-slate-600 mt-2">{partnership.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 text-sm text-center py-8">No partnerships listed</p>
                )}
            </CardContent>
        </Card>
    );
}
