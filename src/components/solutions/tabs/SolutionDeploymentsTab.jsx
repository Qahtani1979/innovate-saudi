import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

/**
 * SolutionDeploymentsTab - Displays deployment history for a solution
 * @param {Object} props - Component props
 * @param {Object} props.solution - Solution data
 * @param {Function} props.t - Translation function
 */
export default function SolutionDeploymentsTab({ solution, t }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    {t({ en: 'Deployment History', ar: 'سجل النشر' })}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {solution.deployments && solution.deployments.length > 0 ? (
                    <div className="space-y-3">
                        {solution.deployments.map((deployment, i) => (
                            <div key={i} className="p-4 border rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-semibold text-slate-900">{deployment.organization}</p>
                                        <p className="text-sm text-slate-600">{deployment.location}</p>
                                    </div>
                                    <Badge variant="outline">{deployment.status}</Badge>
                                </div>
                                {deployment.start_date && (
                                    <p className="text-xs text-slate-500">Since {deployment.start_date}</p>
                                )}
                                {deployment.results && (
                                    <p className="text-sm text-slate-700 mt-2">{deployment.results}</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No deployments recorded yet</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
