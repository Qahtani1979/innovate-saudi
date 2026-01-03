import { GenUICard } from './GenUICard';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Check, X } from 'lucide-react';

/**
 * The "Safety Valve" UI.
 * Shows a Proposed Action and asks for User Confirmation.
 */
export const ProposalCard = ({ toolName, args, onConfirm, onCancel }) => {
    return (
        <GenUICard
            title="Action Verification"
            subtitle="Security Protocol"
            variant="default"
            className="border-primary/20 shadow-sm"
        >
            <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="shrink-0 mt-0.5">
                        <AlertTriangle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <div>
                            <p className="text-sm font-semibold text-foreground">Proposed {toolName} Operation</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                This action is part of the automated workflow manager. Manual approval is required for all write operations to ensure data integrity.
                            </p>
                        </div>
                        <div className="bg-background rounded border px-3 py-2">
                            <code className="text-[10px] font-mono whitespace-pre-wrap text-muted-foreground">
                                {JSON.stringify(args, null, 2)}
                            </code>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-2 border-t border-border/50">
                    <Button variant="outline" size="sm" onClick={onCancel} className="h-8">
                        Cancel
                    </Button>
                    <Button
                        variant="default"
                        onClick={onConfirm}
                        className="flex-1 bg-primary hover:bg-primary/90"
                    >
                        <Check className="w-3.5 h-3.5" />
                        Confirm Action
                    </Button>
                </div>
            </div>
        </GenUICard>
    );
}
