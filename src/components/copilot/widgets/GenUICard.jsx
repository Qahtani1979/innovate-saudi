import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * The base container for "Generative UI" widgets.
 * Displays structured data (Entities) or Analysis results.
 */
export function GenUICard({
    title,
    subtitle,
    children,
    footer,
    variant = 'default', // 'default' | 'highlight' | 'danger'
    className
}) {
    const borderColor = {
        default: 'border-border',
        highlight: 'border-primary/50',
        danger: 'border-destructive/50'
    }[variant];

    const bgColor = {
        default: 'bg-card',
        highlight: 'bg-primary/5',
        danger: 'bg-destructive/5'
    }[variant];

    return (
        <Card className={cn("w-full max-w-md overflow-hidden transition-all", borderColor, bgColor, className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center justify-between">
                    {title}
                    {subtitle && <span className="text-xs font-normal text-muted-foreground">{subtitle}</span>}
                </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
                {children}
            </CardContent>
            {footer && (
                <CardFooter className="pt-2 bg-muted/20 border-t">
                    {footer}
                </CardFooter>
            )}
        </Card>
    );
}
