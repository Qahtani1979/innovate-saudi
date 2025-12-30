import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageContext';
import { 
    Info, AlertTriangle, CheckCircle, XCircle, Lightbulb, Sparkles, 
    ChevronRight, TrendingUp, TrendingDown, Minus, LayoutList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';

// Icon mapping for dynamic icons
const ICON_MAP = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    danger: XCircle,
    lightbulb: Lightbulb,
    sparkles: Sparkles,
    chart: LayoutList,
    default: Info
};

// Variant styles
const VARIANT_STYLES = {
    default: 'bg-muted/50 border-border text-foreground',
    primary: 'bg-primary/10 border-primary/30 text-primary',
    secondary: 'bg-secondary/50 border-secondary text-secondary-foreground',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-200',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200',
    danger: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-200',
    highlight: 'bg-violet-50 border-violet-200 text-violet-800 dark:bg-violet-950/30 dark:border-violet-800 dark:text-violet-200'
};

const BUTTON_VARIANTS = {
    primary: 'default',
    secondary: 'secondary',
    outline: 'outline',
    ghost: 'ghost',
    danger: 'destructive'
};

/**
 * Renders structured response sections from the LLM
 */
export function StructuredResponseRenderer({ sections, language, onAction }) {
    const { isRTL } = useLanguage();
    const dir = language === 'ar' || isRTL ? 'rtl' : 'ltr';

    if (!sections || !Array.isArray(sections)) {
        return null;
    }

    return (
        <div className="space-y-3" dir={dir}>
            {sections.map((section, index) => (
                <SectionRenderer 
                    key={index} 
                    section={section} 
                    isRTL={dir === 'rtl'} 
                    onAction={onAction}
                />
            ))}
        </div>
    );
}

/**
 * Renders individual section based on type
 */
function SectionRenderer({ section, isRTL, onAction }) {
    const { type, content, metadata = {} } = section;

    switch (type) {
        case 'header':
            return <HeaderSection content={content} metadata={metadata} isRTL={isRTL} />;
        
        case 'paragraph':
            return <ParagraphSection content={content} isRTL={isRTL} />;
        
        case 'bullet_list':
            return <BulletListSection content={content} metadata={metadata} isRTL={isRTL} />;
        
        case 'numbered_list':
            return <NumberedListSection content={content} metadata={metadata} isRTL={isRTL} />;
        
        case 'table':
            return <TableSection content={content} metadata={metadata} isRTL={isRTL} />;
        
        case 'stats':
            return <StatsSection content={content} metadata={metadata} isRTL={isRTL} />;
        
        case 'card':
            return <CardSection content={content} metadata={metadata} isRTL={isRTL} />;
        
        case 'info_box':
            return <InfoBoxSection content={content} metadata={metadata} isRTL={isRTL} />;
        
        case 'highlight':
            return <HighlightSection content={content} metadata={metadata} isRTL={isRTL} />;
        
        case 'action_buttons':
            return <ActionButtonsSection content={content} metadata={metadata} isRTL={isRTL} onAction={onAction} />;
        
        case 'code':
            return <CodeSection content={content} metadata={metadata} />;
        
        case 'divider':
            return <Separator className="my-4" />;
        
        default:
            console.warn(`Unknown section type: ${type}`);
            return <ParagraphSection content={content || JSON.stringify(section)} isRTL={isRTL} />;
    }
}

// Header Section
function HeaderSection({ content, metadata, isRTL }) {
    const { level = 2, icon } = metadata;
    const IconComponent = icon ? (ICON_MAP[icon] || ICON_MAP.default) : null;
    
    const HeadingTag = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
    const sizeClasses = {
        1: 'text-xl font-bold',
        2: 'text-lg font-semibold',
        3: 'text-base font-medium'
    };

    return (
        <HeadingTag className={cn(
            sizeClasses[level] || sizeClasses[2],
            'flex items-center gap-2',
            isRTL ? 'text-right' : 'text-left'
        )}>
            {IconComponent && <IconComponent className="w-5 h-5 text-primary shrink-0" />}
            <span>{content}</span>
        </HeadingTag>
    );
}

// Paragraph Section
function ParagraphSection({ content, isRTL }) {
    return (
        <p className={cn(
            'text-sm leading-relaxed',
            isRTL ? 'text-right font-arabic' : 'text-left'
        )}>
            {content}
        </p>
    );
}

// Bullet List Section
function BulletListSection({ content, metadata, isRTL }) {
    const { items = [] } = metadata;
    
    return (
        <div className="space-y-2">
            {content && (
                <p className={cn(
                    'text-sm font-medium text-muted-foreground',
                    isRTL ? 'text-right' : 'text-left'
                )}>
                    {content}
                </p>
            )}
            <ul className={cn(
                'space-y-1.5',
                isRTL ? 'pr-4' : 'pl-4'
            )}>
                {items.map((item, idx) => (
                    <li key={idx} className={cn(
                        'text-sm flex items-start gap-2',
                        isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'
                    )}>
                        <span className="text-primary mt-1.5 shrink-0">•</span>
                        <span className={isRTL ? 'font-arabic' : ''}>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Numbered List Section
function NumberedListSection({ content, metadata, isRTL }) {
    const { items = [] } = metadata;
    
    return (
        <div className="space-y-2">
            {content && (
                <p className={cn(
                    'text-sm font-medium text-muted-foreground',
                    isRTL ? 'text-right' : 'text-left'
                )}>
                    {content}
                </p>
            )}
            <ol className={cn(
                'space-y-1.5',
                isRTL ? 'pr-4' : 'pl-4'
            )}>
                {items.map((item, idx) => (
                    <li key={idx} className={cn(
                        'text-sm flex items-start gap-2',
                        isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'
                    )}>
                        <span className="text-primary font-medium shrink-0 min-w-[1.5rem]">
                            {isRTL ? `${idx + 1}.` : `${idx + 1}.`}
                        </span>
                        <span className={isRTL ? 'font-arabic' : ''}>{item}</span>
                    </li>
                ))}
            </ol>
        </div>
    );
}

// Table Section
function TableSection({ content, metadata, isRTL }) {
    const { columns = [], rows = [] } = metadata;
    
    return (
        <div className="space-y-2">
            {content && (
                <p className={cn(
                    'text-sm font-medium',
                    isRTL ? 'text-right' : 'text-left'
                )}>
                    {content}
                </p>
            )}
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col, idx) => (
                                <TableHead 
                                    key={idx} 
                                    className={cn(
                                        'text-xs',
                                        isRTL ? 'text-right' : 'text-left'
                                    )}
                                >
                                    {col.label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row, rowIdx) => (
                            <TableRow key={rowIdx}>
                                {columns.map((col, colIdx) => (
                                    <TableCell 
                                        key={colIdx}
                                        className={cn(
                                            'text-sm',
                                            isRTL ? 'text-right' : 'text-left'
                                        )}
                                    >
                                        {row[col.key]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

// Stats Section
function StatsSection({ content, metadata, isRTL }) {
    const { items = [] } = metadata;
    
    const TrendIcon = ({ trend }) => {
        if (trend === 'up') return <TrendingUp className="w-3 h-3 text-green-500" />;
        if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-500" />;
        return <Minus className="w-3 h-3 text-muted-foreground" />;
    };

    return (
        <div className="space-y-2">
            {content && (
                <p className={cn(
                    'text-sm font-medium text-muted-foreground',
                    isRTL ? 'text-right' : 'text-left'
                )}>
                    {content}
                </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {items.map((item, idx) => {
                    const IconComponent = item.icon ? (ICON_MAP[item.icon] || ICON_MAP.default) : null;
                    return (
                        <div 
                            key={idx} 
                            className={cn(
                                'p-3 rounded-lg border bg-card',
                                isRTL ? 'text-right' : 'text-left'
                            )}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {IconComponent && <IconComponent className="w-3 h-3 text-muted-foreground" />}
                                <span className="text-xs text-muted-foreground">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-lg font-bold">{item.value}</span>
                                {item.trend && <TrendIcon trend={item.trend} />}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Card Section
function CardSection({ content, metadata, isRTL }) {
    const { title, variant = 'default', icon } = metadata;
    const IconComponent = icon ? (ICON_MAP[icon] || ICON_MAP.default) : null;
    
    return (
        <Card className={cn('border', VARIANT_STYLES[variant] || VARIANT_STYLES.default)}>
            {title && (
                <CardHeader className="pb-2">
                    <CardTitle className={cn(
                        'text-sm font-semibold flex items-center gap-2',
                        isRTL ? 'flex-row-reverse' : 'flex-row'
                    )}>
                        {IconComponent && <IconComponent className="w-4 h-4" />}
                        <span>{title}</span>
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent className={cn(
                'text-sm',
                isRTL ? 'text-right font-arabic' : 'text-left',
                !title && 'pt-4'
            )}>
                {content}
            </CardContent>
        </Card>
    );
}

// Info Box Section
function InfoBoxSection({ content, metadata, isRTL }) {
    const { variant = 'info', title } = metadata;
    const IconComponent = ICON_MAP[variant] || ICON_MAP.info;
    
    return (
        <div className={cn(
            'p-3 rounded-lg border flex gap-3',
            VARIANT_STYLES[variant] || VARIANT_STYLES.info,
            isRTL ? 'flex-row-reverse' : 'flex-row'
        )}>
            <IconComponent className="w-5 h-5 shrink-0 mt-0.5" />
            <div className={cn('flex-1', isRTL ? 'text-right' : 'text-left')}>
                {title && <p className="font-semibold text-sm mb-1">{title}</p>}
                <p className={cn('text-sm', isRTL && 'font-arabic')}>{content}</p>
            </div>
        </div>
    );
}

// Highlight Section
function HighlightSection({ content, metadata, isRTL }) {
    const { variant = 'primary' } = metadata;
    
    return (
        <div className={cn(
            'p-3 rounded-lg border-l-4',
            variant === 'primary' ? 'border-l-primary bg-primary/5' : 
            variant === 'success' ? 'border-l-green-500 bg-green-50 dark:bg-green-950/20' :
            variant === 'warning' ? 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/20' :
            'border-l-muted bg-muted/30',
            isRTL ? 'border-l-0 border-r-4 text-right' : 'text-left'
        )}>
            <p className={cn('text-sm font-medium', isRTL && 'font-arabic')}>{content}</p>
        </div>
    );
}

// Action Buttons Section
function ActionButtonsSection({ content, metadata, isRTL, onAction }) {
    const { actions = [] } = metadata;
    
    const handleClick = (action) => {
        if (onAction) {
            onAction(action);
        }
    };

    return (
        <div className="space-y-2">
            {content && (
                <p className={cn(
                    'text-sm text-muted-foreground',
                    isRTL ? 'text-right' : 'text-left'
                )}>
                    {content}
                </p>
            )}
            <div className={cn(
                'flex flex-wrap gap-2',
                isRTL ? 'justify-end' : 'justify-start'
            )}>
                {actions.map((action, idx) => (
                    <Button
                        key={idx}
                        variant={BUTTON_VARIANTS[action.variant] || 'default'}
                        size="sm"
                        onClick={() => handleClick(action)}
                        className="gap-1"
                    >
                        {action.label}
                        <ChevronRight className={cn('w-3 h-3', isRTL && 'rotate-180')} />
                    </Button>
                ))}
            </div>
        </div>
    );
}

// Code Section
function CodeSection({ content, metadata }) {
    const { language = 'text' } = metadata;
    
    return (
        <div className="rounded-lg overflow-hidden border bg-muted/50">
            <div className="px-3 py-1.5 border-b bg-muted/80 text-xs text-muted-foreground">
                {language}
            </div>
            <pre className="p-3 overflow-x-auto">
                <code className="text-xs font-mono">{content}</code>
            </pre>
        </div>
    );
}

export default StructuredResponseRenderer;
