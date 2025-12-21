import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

/**
 * SolutionSupportTab - Displays support services for a solution
 * @param {Object} props - Component props
 * @param {Object} props.solution - Solution data
 * @param {Function} props.t - Translation function
 */
export default function SolutionSupportTab({ solution, t }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    {t({ en: 'Support Services', ar: 'خدمات الدعم' })}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {solution.support_services && solution.support_services.length > 0 ? (
                    <div className="space-y-3">
                        {solution.support_services.map((service, i) => (
                            <div key={i} className="p-3 border rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-slate-900">{service.service}</p>
                                        {service.description && (
                                            <p className="text-sm text-slate-600 mt-1">{service.description}</p>
                                        )}
                                    </div>
                                    {service.included && (
                                        <Badge className="bg-green-100 text-green-700 text-xs">Included</Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 text-sm text-center py-8">No support services listed</p>
                )}
            </CardContent>
        </Card>
    );
}
