import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { TestTube } from 'lucide-react';
import { createPageUrl } from '@/utils';

/**
 * SolutionPilotsTab - Displays related pilots for a solution
 * @param {Object} props - Component props
 * @param {Array} props.pilots - Array of pilot data
 */
export default function SolutionPilotsTab({ pilots }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Related Pilots | التجارب المرتبطة</CardTitle>
            </CardHeader>
            <CardContent>
                {pilots.length > 0 ? (
                    <div className="space-y-3">
                        {pilots.map((pilot) => (
                            <Link
                                key={pilot.id}
                                to={createPageUrl(`PilotDetail?id=${pilot.id}`)}
                                className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-slate-900">{pilot.title_en}</p>
                                        <p className="text-sm text-slate-600 mt-1">{pilot.municipality_id}</p>
                                    </div>
                                    <Badge variant="outline">{pilot.status}</Badge>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <TestTube className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No related pilots found</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
