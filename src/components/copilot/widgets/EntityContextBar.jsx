/**
 * EntityContextBar
 * 
 * Displays and controls the currently focused entity in Copilot.
 * Shows entity info badge when focused, allows clearing and switching context.
 */

import { useState, useCallback } from 'react';
import { useCopilotStore } from '@/lib/store/copilotStore';
import { useLanguage } from '@/components/LanguageContext';
import { ENTITY_TYPES } from '@/lib/copilot/entityContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { 
    Target, 
    Rocket, 
    Lightbulb, 
    LayoutGrid, 
    Map, 
    FlaskConical,
    X,
    Focus,
    ChevronDown,
    ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Icon mapping
const ICON_MAP = {
    target: Target,
    rocket: Rocket,
    lightbulb: Lightbulb,
    'layout-grid': LayoutGrid,
    map: Map,
    'flask-conical': FlaskConical,
};

export function EntityContextBar({ onOpenSelector }) {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { focusEntity, clearFocusEntity } = useCopilotStore();

    if (!focusEntity?.type) {
        // No entity focused - show subtle hint
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-md border border-dashed border-muted-foreground/20">
                <Focus className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                    {language === 'ar' ? 'لا يوجد سياق محدد' : 'No focus context'}
                </span>
                {onOpenSelector && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        onClick={onOpenSelector}
                    >
                        {language === 'ar' ? 'تحديد' : 'Set'}
                    </Button>
                )}
            </div>
        );
    }

    const config = ENTITY_TYPES[focusEntity.type];
    if (!config) return null;

    const IconComponent = ICON_MAP[config.icon] || Target;
    const titleField = language === 'ar' ? config.titleFieldAr : config.titleField;
    const title = focusEntity.data?.[titleField] || focusEntity.data?.[config.titleField] || focusEntity.id;
    const label = config.label[language] || config.label.en;

    const handleViewEntity = () => {
        const path = config.detailPath.replace(':id', focusEntity.id);
        navigate(path);
    };

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${config.bgColor} ${config.borderColor}`}>
            <IconComponent className={`w-4 h-4 ${config.color}`} />
            
            <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {language === 'ar' ? 'السياق' : 'Focus'}
                </span>
                <span className="text-sm font-medium truncate max-w-[200px]" title={title}>
                    {title}
                </span>
            </div>

            <Badge variant="secondary" className="text-[10px] shrink-0">
                {label}
            </Badge>

            <div className="flex items-center gap-1 ml-auto">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleViewEntity}
                    title={language === 'ar' ? 'عرض التفاصيل' : 'View details'}
                >
                    <ExternalLink className="w-3 h-3" />
                </Button>
                
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={clearFocusEntity}
                    title={language === 'ar' ? 'مسح السياق' : 'Clear context'}
                >
                    <X className="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
    );
}

/**
 * EntitySelector - Popover for selecting entity to focus
 */
export function EntitySelector({ 
    entities = [], 
    isLoading = false,
    onSelect,
    trigger 
}) {
    const { language } = useLanguage();
    const [open, setOpen] = useState(false);

    const handleSelect = useCallback((entity) => {
        onSelect?.(entity);
        setOpen(false);
    }, [onSelect]);

    // Group entities by type
    const grouped = entities.reduce((acc, entity) => {
        const type = entity._type || 'unknown';
        if (!acc[type]) acc[type] = [];
        acc[type].push(entity);
        return acc;
    }, {});

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-1">
                        <Focus className="w-3.5 h-3.5" />
                        {language === 'ar' ? 'تحديد السياق' : 'Set Focus'}
                        <ChevronDown className="w-3 h-3" />
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" align="start">
                <Command>
                    <CommandInput 
                        placeholder={language === 'ar' ? 'بحث عن كيان...' : 'Search entities...'} 
                    />
                    <CommandList>
                        {isLoading ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                            </div>
                        ) : (
                            <>
                                <CommandEmpty>
                                    {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                                </CommandEmpty>
                                {Object.entries(grouped).map(([type, items]) => {
                                    const config = ENTITY_TYPES[type];
                                    if (!config) return null;
                                    
                                    const IconComponent = ICON_MAP[config.icon] || Target;
                                    const label = config.label[language] || config.label.en;

                                    return (
                                        <CommandGroup key={type} heading={label}>
                                            {items.map((entity) => {
                                                const titleField = language === 'ar' ? config.titleFieldAr : config.titleField;
                                                const title = entity[titleField] || entity[config.titleField] || entity.id;

                                                return (
                                                    <CommandItem
                                                        key={entity.id}
                                                        value={`${type}-${entity.id}-${title}`}
                                                        onSelect={() => handleSelect({ 
                                                            type, 
                                                            id: entity.id, 
                                                            data: entity 
                                                        })}
                                                        className="gap-2"
                                                    >
                                                        <IconComponent className={`w-4 h-4 ${config.color}`} />
                                                        <span className="truncate flex-1">{title}</span>
                                                        {entity.status && (
                                                            <Badge variant="outline" className="text-[10px]">
                                                                {entity.status}
                                                            </Badge>
                                                        )}
                                                    </CommandItem>
                                                );
                                            })}
                                        </CommandGroup>
                                    );
                                })}
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
