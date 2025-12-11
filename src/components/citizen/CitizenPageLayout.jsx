import React from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { usePersonaRouting } from '@/hooks/usePersonaRouting';
import { SIDEBAR_MENUS } from '@/config/sidebarMenus';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal, LayoutGrid, List, X } from 'lucide-react';

// Hook to get persona-based colors
export function usePersonaColors() {
  const { persona } = usePersonaRouting();
  const menuConfig = SIDEBAR_MENUS[persona] || SIDEBAR_MENUS.citizen;
  const gradientColor = menuConfig.color || 'from-slate-600 to-gray-500';
  
  // Map persona gradients to color names for styling
  const colorMap = {
    'from-red-600 to-rose-500': { name: 'red', gradient: gradientColor, bgGradient: 'from-red-500/10 via-rose-500/5 to-transparent', iconColor: 'text-red-500', buttonGradient: 'from-red-600 to-rose-500' },
    'from-purple-600 to-violet-500': { name: 'purple', gradient: gradientColor, bgGradient: 'from-purple-500/10 via-violet-500/5 to-transparent', iconColor: 'text-purple-500', buttonGradient: 'from-purple-600 to-violet-500' },
    'from-indigo-600 to-blue-500': { name: 'indigo', gradient: gradientColor, bgGradient: 'from-indigo-500/10 via-blue-500/5 to-transparent', iconColor: 'text-indigo-500', buttonGradient: 'from-indigo-600 to-blue-500' },
    'from-emerald-600 to-green-500': { name: 'emerald', gradient: gradientColor, bgGradient: 'from-emerald-500/10 via-green-500/5 to-transparent', iconColor: 'text-emerald-500', buttonGradient: 'from-emerald-600 to-green-500' },
    'from-orange-600 to-amber-500': { name: 'orange', gradient: gradientColor, bgGradient: 'from-orange-500/10 via-amber-500/5 to-transparent', iconColor: 'text-orange-500', buttonGradient: 'from-orange-600 to-amber-500' },
    'from-amber-600 to-yellow-500': { name: 'amber', gradient: gradientColor, bgGradient: 'from-amber-500/10 via-yellow-500/5 to-transparent', iconColor: 'text-amber-500', buttonGradient: 'from-amber-600 to-yellow-500' },
    'from-teal-600 to-cyan-500': { name: 'teal', gradient: gradientColor, bgGradient: 'from-teal-500/10 via-cyan-500/5 to-transparent', iconColor: 'text-teal-500', buttonGradient: 'from-teal-600 to-cyan-500' },
    'from-slate-600 to-gray-500': { name: 'slate', gradient: gradientColor, bgGradient: 'from-slate-500/10 via-gray-500/5 to-transparent', iconColor: 'text-slate-500', buttonGradient: 'from-slate-600 to-gray-500' },
    'from-gray-600 to-slate-500': { name: 'gray', gradient: gradientColor, bgGradient: 'from-gray-500/10 via-slate-500/5 to-transparent', iconColor: 'text-gray-500', buttonGradient: 'from-gray-600 to-slate-500' },
  };
  
  return {
    ...colorMap[gradientColor] || colorMap['from-slate-600 to-gray-500'],
    persona,
    label: menuConfig.label,
    PersonaIcon: menuConfig.icon
  };
}

/**
 * Standardized layout wrapper for all citizen-facing pages
 * Provides consistent header, search/filters, and grid layout with persona-aware colors
 */
export function CitizenPageHeader({ 
  icon: Icon, 
  title, 
  description, 
  stats = [],
  action 
}) {
  const { isRTL } = useLanguage();
  const { bgGradient, iconColor, buttonGradient } = usePersonaColors();
  
  return (
    <div 
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${bgGradient} border border-border/50 p-6 md:p-8`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className={`p-3 rounded-xl bg-background/80 backdrop-blur-sm shadow-sm ${iconColor}`}>
              <Icon className="h-7 w-7" />
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1 max-w-xl">{description}</p>
            )}
          </div>
        </div>
        
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      {/* Stats row */}
      {stats.length > 0 && (
        <div className="relative flex flex-wrap gap-4 mt-6 pt-6 border-t border-border/50">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-background/60 backdrop-blur-sm rounded-lg px-4 py-2">
              {stat.icon && <stat.icon className={`h-4 w-4 ${iconColor}`} />}
              <span className="text-lg font-semibold text-foreground">{stat.value}</span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CitizenSearchFilter({
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  viewMode,
  onViewModeChange,
  activeFilters = 0,
  onClearFilters
}) {
  const { isRTL, t } = useLanguage();

  return (
    <div 
      className="flex flex-col md:flex-row gap-3 items-stretch md:items-center"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
        <Input
          placeholder={searchPlaceholder || t({ en: 'Search...', ar: 'بحث...' })}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`${isRTL ? 'pr-10' : 'pl-10'} bg-background/80 backdrop-blur-sm border-border/50 focus:border-primary/50`}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {filters.map((filter, idx) => (
          <Select 
            key={idx} 
            value={filter.value} 
            onValueChange={filter.onChange}
          >
            <SelectTrigger className="w-[140px] bg-background/80 backdrop-blur-sm border-border/50">
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg">
              <SelectItem value="all">{t({ en: 'All', ar: 'الكل' })} {filter.label}</SelectItem>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {/* Active filters indicator */}
        {activeFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            {t({ en: 'Clear', ar: 'مسح' })} ({activeFilters})
          </Button>
        )}

        {/* View mode toggle */}
        {onViewModeChange && (
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onViewModeChange('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onViewModeChange('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function CitizenCardGrid({ 
  children, 
  viewMode = 'grid',
  columns = { sm: 1, md: 2, lg: 3 },
  emptyState 
}) {
  const isEmpty = React.Children.count(children) === 0;

  if (isEmpty && emptyState) {
    return emptyState;
  }

  const gridCols = `grid-cols-1 ${columns.sm > 1 ? `sm:grid-cols-${columns.sm}` : ''} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg}`;

  return (
    <div className={viewMode === 'grid' 
      ? `grid gap-4 md:gap-6 ${gridCols}`
      : 'flex flex-col gap-3'
    }>
      {children}
    </div>
  );
}

export function CitizenEmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}) {
  const { isRTL } = useLanguage();

  return (
    <div 
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {Icon && (
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <Icon className="h-10 w-10 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground max-w-md mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}

export function CitizenPageLayout({ children, className = '' }) {
  const { isRTL } = useLanguage();

  return (
    <div 
      className={`space-y-6 ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {children}
    </div>
  );
}

export default CitizenPageLayout;
