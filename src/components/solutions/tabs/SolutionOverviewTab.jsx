import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Solution Overview Tab Component
 * Displays solution description and applicable sectors
 * 
 * @param {Object} props
 * @param {Object} props.solution - Solution data object
 * @returns {JSX.Element}
 */
export default function SolutionOverviewTab({ solution }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Description | الوصف</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                            {solution.description_en || 'No description provided'}
                        </p>
                    </div>
                    {solution.description_ar && (
                        <div className="pt-4 border-t" dir="rtl">
                            <p className="text-sm text-slate-700 leading-relaxed">
                                {solution.description_ar}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {solution.sectors && solution.sectors.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Applicable Sectors | القطاعات المطبقة</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {solution.sectors.map((sector, i) => (
                                <Badge key={i} variant="outline" className="capitalize">
                                    {sector.replace(/_/g, ' ')}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
