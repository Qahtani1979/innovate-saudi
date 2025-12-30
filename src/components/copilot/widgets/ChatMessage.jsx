import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageContext';
import ReactMarkdown from 'react-markdown';
import { 
    Check, Circle, Loader2, ChevronDown, ChevronUp, 
    FileEdit, Wrench, ExternalLink 
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

/**
 * Lovable-style chat message with inline widgets
 * Supports: flowing text, embedded tasks, tool indicators, file editing badges
 */
export function ChatMessage({ content, widgets = [], onAction }) {
    const { isRTL } = useLanguage();
    
    return (
        <div 
            className={cn(
                "space-y-3 text-sm leading-relaxed",
                isRTL ? "text-right font-arabic" : "text-left"
            )}
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* Main text content - plain markdown */}
            {content && (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-p:leading-relaxed">
                    <ReactMarkdown
                        components={{
                            a: ({ href, children }) => (
                                <a 
                                    href={href} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-primary hover:underline inline-flex items-center gap-1"
                                >
                                    {children}
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            ),
                            code: ({ inline, children, ...props }) => 
                                inline ? (
                                    <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono" {...props}>
                                        {children}
                                    </code>
                                ) : (
                                    <code {...props}>{children}</code>
                                ),
                            p: ({ children }) => <p className="my-1.5">{children}</p>
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            )}
            
            {/* Inline widgets */}
            {widgets.map((widget, idx) => (
                <InlineWidget key={idx} widget={widget} onAction={onAction} />
            ))}
        </div>
    );
}

/**
 * Renders individual inline widgets based on type
 */
function InlineWidget({ widget, onAction }) {
    switch (widget.type) {
        case 'tools_used':
            return <ToolsUsedWidget {...widget} />;
        case 'tasks':
            return <TasksWidget {...widget} onAction={onAction} />;
        case 'editing':
            return <EditingWidget {...widget} />;
        case 'actions':
            return <ActionsWidget {...widget} onAction={onAction} />;
        default:
            return null;
    }
}

/**
 * "X tools used" - collapsible indicator
 */
function ToolsUsedWidget({ tools = [], count }) {
    const [isOpen, setIsOpen] = useState(false);
    const toolCount = count || tools.length;
    
    if (toolCount === 0) return null;
    
    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{toolCount} tools used</span>
                    <span className="px-1.5 py-0.5 rounded border text-[10px] group-hover:bg-muted transition-colors">
                        {isOpen ? 'Hide' : 'Show all'}
                    </span>
                </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
                <div className="space-y-1 text-xs text-muted-foreground pl-5 border-l-2 border-muted">
                    {tools.map((tool, idx) => (
                        <div key={idx} className="flex items-center gap-2 py-0.5">
                            <Check className="w-3 h-3 text-green-500" />
                            <span className="font-mono">{tool}</span>
                        </div>
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

/**
 * Tasks card - shows task progress like Lovable
 */
function TasksWidget({ title = 'Tasks', items = [], onAction }) {
    return (
        <Card className="border bg-card/50 shadow-none">
            <CardContent className="p-3">
                <div className="font-medium text-sm mb-2">{title}</div>
                <div className="space-y-1.5">
                    {items.map((task, idx) => (
                        <TaskItem 
                            key={idx} 
                            task={task} 
                            onAction={onAction}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Individual task item with status indicator
 */
function TaskItem({ task, onAction }) {
    const { label, status = 'pending', prompt } = task;
    
    const handleClick = () => {
        if (onAction && prompt) {
            onAction({ type: 'task', prompt, label });
        }
    };
    
    return (
        <div 
            className={cn(
                "flex items-start gap-2 py-1 rounded transition-colors",
                prompt && "cursor-pointer hover:bg-muted/50 px-1 -mx-1"
            )}
            onClick={handleClick}
        >
            <div className="mt-0.5 shrink-0">
                {status === 'in_progress' && (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                )}
                {status === 'done' && (
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                )}
                {status === 'pending' && (
                    <Circle className="w-4 h-4 text-muted-foreground/50" />
                )}
            </div>
            <span className={cn(
                "text-sm",
                status === 'done' && "text-muted-foreground",
                status === 'in_progress' && "font-medium"
            )}>
                {label}
            </span>
        </div>
    );
}

/**
 * Editing indicator - shows file being edited
 */
function EditingWidget({ files = [] }) {
    if (files.length === 0) return null;
    
    return (
        <div className="flex flex-wrap gap-2">
            {files.map((file, idx) => (
                <div 
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                    <FileEdit className="w-3 h-3" />
                    <span>Editing</span>
                    <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">
                        {file}
                    </code>
                </div>
            ))}
        </div>
    );
}

/**
 * Action buttons - quick actions the user can take
 */
function ActionsWidget({ items = [], onAction }) {
    return (
        <div className="flex flex-wrap gap-2 pt-1">
            {items.map((action, idx) => (
                <Button
                    key={idx}
                    variant={action.variant || 'outline'}
                    size="sm"
                    className="h-7 text-xs gap-1.5"
                    onClick={() => onAction?.(action)}
                >
                    {action.label}
                </Button>
            ))}
        </div>
    );
}

export default ChatMessage;
