import React from 'react';
import { GenUICard } from './GenUICard';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Check, X } from 'lucide-react';

/**
 * The "Safety Valve" UI.
 * Shows a Proposed Action and asks for User Confirmation.
 */
export function ProposalCard({
    toolName,
    args,
    onConfirm,
    onCancel
}) {
    return (
        <GenUICard
            title="Action Required"
            subtitle="The Copilot needs your permission"
            variant="highlight"
            className="border-amber-400/50 bg-amber-50/10"
        >
            <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg dark:bg-amber-900/40">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                    <p className="text-sm font-medium">Proposed Operation:</p>
                    <code className="block mt-1 text-xs bg-muted p-2 rounded border font-mono">
                        {toolName}({JSON.stringify(args, null, 2)})
                    </code>
                </div>
            </div>

            <div className="flex gap-2 justify-end w-full mt-2">
                <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4 mr-1" />
                    Reject
                </Button>
                <Button size="sm" onClick={onConfirm} className="bg-primary text-primary-foreground">
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                </Button>
            </div>
        </GenUICard>
    );
}
