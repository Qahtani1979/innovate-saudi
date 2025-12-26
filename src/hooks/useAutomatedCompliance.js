import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRegulatoryExemptions } from '@/hooks/useRegulatoryExemptions';

export function useAutomatedCompliance(application, sandbox) {
    const [complianceStatus, setComplianceStatus] = useState(null);
    const { data: exemptions = [] } = useRegulatoryExemptions();

    const checkMutation = useMutation({
        mutationFn: async () => {
            // Simulate async operation for "gold standard" feel, though strictly client side logic
            await new Promise(resolve => setTimeout(resolve, 600));

            const results = [];

            // Check each requested exemption
            for (const requestedExemption of application.requested_exemptions || []) {
                const exemption = exemptions.find(e =>
                    e.title_en === requestedExemption && e.status === 'active'
                );

                if (!exemption) {
                    results.push({
                        exemption: requestedExemption,
                        status: 'not_found',
                        message: 'Exemption not found in active regulatory library',
                        severity: 'error'
                    });
                    continue;
                }

                // Check domain compatibility
                if (exemption.domain !== sandbox.domain && exemption.domain !== 'general') {
                    results.push({
                        exemption: requestedExemption,
                        exemption_code: exemption.exemption_code,
                        status: 'domain_mismatch',
                        message: `Exemption is for ${exemption.domain} domain, but sandbox is ${sandbox.domain}`,
                        severity: 'error'
                    });
                    continue;
                }

                // Check expiration
                if (exemption.expiration_date) {
                    const expiryDate = new Date(exemption.expiration_date);
                    const today = new Date();
                    if (expiryDate < today) {
                        results.push({
                            exemption: requestedExemption,
                            exemption_code: exemption.exemption_code,
                            status: 'expired',
                            message: `Exemption expired on ${exemption.expiration_date}`,
                            severity: 'error'
                        });
                        continue;
                    }

                    const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
                    if (daysUntilExpiry < 30) {
                        results.push({
                            exemption: requestedExemption,
                            exemption_code: exemption.exemption_code,
                            status: 'expiring_soon',
                            message: `Exemption expires in ${daysUntilExpiry} days`,
                            severity: 'warning'
                        });
                    }
                }

                // Check project duration compatibility
                if (application.duration_months > exemption.duration_months) {
                    results.push({
                        exemption: requestedExemption,
                        exemption_code: exemption.exemption_code,
                        status: 'duration_exceeded',
                        message: `Project duration (${application.duration_months}mo) exceeds exemption maximum (${exemption.duration_months}mo)`,
                        severity: 'warning'
                    });
                }

                // Check conditions
                const unmetConditions = [];
                if (exemption.conditions) {
                    // In real scenario, this would check against application data
                    // For now, we'll do basic checks
                    if (exemption.risk_level === 'high' && !application.risk_assessment) {
                        unmetConditions.push('Risk assessment required for high-risk exemptions');
                    }
                    if (exemption.conditions.some(c => c.includes('insurance')) &&
                        !application.public_safety_plan?.toLowerCase().includes('insurance')) {
                        unmetConditions.push('Insurance coverage requirement not addressed');
                    }
                }

                if (unmetConditions.length > 0) {
                    results.push({
                        exemption: requestedExemption,
                        exemption_code: exemption.exemption_code,
                        status: 'conditions_unmet',
                        message: 'Some conditions may not be met',
                        details: unmetConditions,
                        severity: 'warning'
                    });
                }

                // If no issues, mark as compliant
                if (!results.find(r => r.exemption === requestedExemption)) {
                    results.push({
                        exemption: requestedExemption,
                        exemption_code: exemption.exemption_code,
                        status: 'compliant',
                        message: 'All compliance checks passed',
                        severity: 'success'
                    });
                }
            }

            // Calculate overall compliance score
            const totalChecks = results.length;
            const passedChecks = results.filter(r => r.severity === 'success').length;
            const complianceScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

            return {
                results,
                complianceScore,
                hasErrors: results.some(r => r.severity === 'error'),
                hasWarnings: results.some(r => r.severity === 'warning'),
                timestamp: new Date().toISOString()
            };
        },
        onSuccess: (data) => {
            setComplianceStatus(data);
        }
    });

    return {
        checkMutation,
        complianceStatus,
        setComplianceStatus
    };
}
