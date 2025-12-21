import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from 'lucide-react';

/**
 * Solution Pricing Tab Component
 * Displays pricing model and cost details
 * 
 * @param {Object} props
 * @param {Object} props.solution - Solution data object
 * @param {Function} props.t - Translation function
 * @returns {JSX.Element}
 */
export default function SolutionPricingTab({ solution, t }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    {t({ en: 'Pricing Details', ar: 'تفاصيل التسعير' })}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {solution.pricing_model && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-900">Model: {solution.pricing_model}</p>
                    </div>
                )}
                {solution.pricing_details && (
                    <div className="space-y-3">
                        {solution.pricing_details.setup_cost && (
                            <div className="flex justify-between p-3 border rounded-lg">
                                <span className="text-sm text-slate-600">Setup Cost:</span>
                                <span className="text-sm font-medium">{solution.pricing_details.setup_cost} SAR</span>
                            </div>
                        )}
                        {solution.pricing_details.monthly_cost && (
                            <div className="flex justify-between p-3 border rounded-lg">
                                <span className="text-sm text-slate-600">Monthly Cost:</span>
                                <span className="text-sm font-medium">{solution.pricing_details.monthly_cost} SAR</span>
                            </div>
                        )}
                        {solution.pricing_details.per_user_cost && (
                            <div className="flex justify-between p-3 border rounded-lg">
                                <span className="text-sm text-slate-600">Per User:</span>
                                <span className="text-sm font-medium">{solution.pricing_details.per_user_cost} SAR</span>
                            </div>
                        )}
                        {solution.pricing_details.custom_pricing && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-900">Custom pricing available for enterprise deployments</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
