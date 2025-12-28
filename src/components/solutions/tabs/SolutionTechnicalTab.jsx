import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Shield } from 'lucide-react';

/**
 * Solution Technical Tab Component
 * Displays technical specifications and deployment options
 * 
 * @param {Object} props
 * @param {Object} props.solution - Solution data object
 * @param {Function} props.t - Translation function
 * @returns {JSX.Element}
 */
export default function SolutionTechnicalTab({ solution, t }) {
    return (
        <div className="space-y-6">
            {solution.technical_specifications && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code className="h-5 w-5 text-blue-600" />
                            {t({ en: 'Technical Specifications', ar: 'المواصفات التقنية' })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {solution.technical_specifications.technology_stack?.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Technology Stack:</p>
                                <div className="flex flex-wrap gap-2">
                                    {solution.technical_specifications.technology_stack.map((tech, i) => (
                                        <Badge key={i} variant="outline">{tech}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        {solution.technical_specifications.integration_requirements && (
                            <div>
                                <p className="text-sm font-medium text-slate-700">Integration:</p>
                                <p className="text-sm text-slate-600">{solution.technical_specifications.integration_requirements}</p>
                            </div>
                        )}
                        {solution.technical_specifications.scalability && (
                            <div>
                                <p className="text-sm font-medium text-slate-700">Scalability:</p>
                                <p className="text-sm text-slate-600">{solution.technical_specifications.scalability}</p>
                            </div>
                        )}
                        {solution.technical_specifications.security_features?.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Security Features:</p>
                                <div className="space-y-2">
                                    {solution.technical_specifications.security_features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-slate-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {solution.deployment_options?.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t({ en: 'Deployment Options', ar: 'خيارات النشر' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {solution.deployment_options.map((option, i) => (
                                <Badge key={i} variant="outline" className="capitalize">{option}</Badge>
                            ))}
                        </div>
                        {solution.implementation_timeline && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-slate-700">Implementation Timeline:</p>
                                <p className="text-sm text-slate-600">{solution.implementation_timeline}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
