import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

/**
 * SolutionCasesTab - Displays case studies for a solution
 * @param {Object} props - Component props
 * @param {Object} props.solution - Solution data
 * @param {Function} props.t - Translation function
 */
export default function SolutionCasesTab({ solution, t }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    {t({ en: 'Case Studies', ar: 'دراسات الحالة' })}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {solution.case_studies && solution.case_studies.length > 0 ? (
                    <div className="space-y-4">
                        {solution.case_studies.map((caseStudy, i) => (
                            <div key={i} className="p-4 border rounded-lg">
                                <h4 className="font-semibold text-slate-900 mb-2">{caseStudy.title}</h4>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-slate-500">Client:</span> {caseStudy.client}
                                    </div>
                                    {caseStudy.challenge && (
                                        <div>
                                            <span className="text-slate-500">Challenge:</span> {caseStudy.challenge}
                                        </div>
                                    )}
                                    {caseStudy.solution && (
                                        <div>
                                            <span className="text-slate-500">Solution:</span> {caseStudy.solution}
                                        </div>
                                    )}
                                    {caseStudy.results && (
                                        <div className="mt-2 p-3 bg-green-50 rounded">
                                            <span className="text-slate-700 font-medium">Results:</span>
                                            <p className="text-slate-700 mt-1">{caseStudy.results}</p>
                                        </div>
                                    )}
                                    {caseStudy.metrics && caseStudy.metrics.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {caseStudy.metrics.map((metric, j) => (
                                                <Badge key={j} className="bg-purple-100 text-purple-700">
                                                    {metric}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No case studies available</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
