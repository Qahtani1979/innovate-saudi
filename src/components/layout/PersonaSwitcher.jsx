import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageContext';
import { useActivePersona } from '@/hooks/useActivePersona';
import { SIDEBAR_MENUS } from '@/config/sidebarMenus';
import { cn } from '@/lib/utils';
import { ChevronDown, Check, RefreshCw, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Error boundary wrapper for PersonaSwitcher
 */
class PersonaSwitcherErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PersonaSwitcher error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Return null to hide the component on error instead of crashing
      return null;
    }
    return this.props.children;
  }
}

/**
 * PersonaSwitcher - Allows users with multiple roles to switch between personas
 * 
 * Features:
 * - Shows current active persona
 * - Dropdown to switch between available personas
 * - Indicates primary role with badge
 * - Persists selection in session storage
 */
function PersonaSwitcherContent({ compact = false, showLabel = true }) {
  const languageContext = useLanguage();
  const navigate = useNavigate();
  
  // Safe access to language context
  const language = languageContext?.language || 'en';
  const isRTL = languageContext?.isRTL || false;
  
  // Call hook unconditionally (hooks must not be in try-catch)
  const personaData = useActivePersona();
  
  // Safe destructure with defaults
  const {
    activePersona = 'user',
    setActivePersona = () => {},
    availablePersonas = [],
    primaryPersona = 'user',
    activePersonaDetails = null,
    hasMultiplePersonas = false,
  } = personaData || {};

  // Don't render if user has no personas or only one
  if (!hasMultiplePersonas) {
    if (!activePersonaDetails) return null;
    
    // Show single persona badge (non-interactive)
    const Icon = activePersonaDetails.icon;
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg",
        `bg-gradient-to-r ${activePersonaDetails.color || 'from-gray-500 to-gray-600'} text-white`,
        isRTL && "flex-row-reverse"
      )}>
        {Icon && <Icon className="h-4 w-4" />}
        {showLabel && (
          <span className="text-sm font-medium">
            {language === 'en' ? activePersonaDetails.label?.en : activePersonaDetails.label?.ar}
          </span>
        )}
      </div>
    );
  }

  const handlePersonaSwitch = (persona) => {
    if (typeof setActivePersona === 'function') {
      setActivePersona(persona);
    }
    
    // Navigate to the default dashboard for the selected persona
    const menu = SIDEBAR_MENUS?.[persona];
    if (menu && menu.items) {
      // Find the dashboard item (usually the first non-home item)
      const dashboardItem = menu.items.find(item => 
        item?.name?.toLowerCase().includes('dashboard') && item.name !== 'PublicPortal'
      );
      if (dashboardItem) {
        const path = dashboardItem.path || `/${dashboardItem.name.toLowerCase().replace(/([A-Z])/g, '-$1').slice(1)}`;
        navigate(path);
      }
    }
  };

  const ActiveIcon = activePersonaDetails?.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          className={cn(
            "gap-2 border-2 transition-all",
            `hover:bg-gradient-to-r hover:${activePersonaDetails?.color || 'from-gray-500 to-gray-600'} hover:text-white hover:border-transparent`,
            isRTL && "flex-row-reverse"
          )}
        >
          <div className={cn(
            "flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <div className={cn(
              "p-1 rounded-md bg-gradient-to-r",
              activePersonaDetails?.color || 'from-gray-500 to-gray-600'
            )}>
              {ActiveIcon && <ActiveIcon className="h-3.5 w-3.5 text-white" />}
            </div>
            {showLabel && (
              <span className="text-sm font-medium">
                {language === 'en' 
                  ? activePersonaDetails?.label?.en 
                  : activePersonaDetails?.label?.ar
                }
              </span>
            )}
          </div>
          <RefreshCw className="h-3.5 w-3.5 opacity-50" />
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align={isRTL ? "start" : "end"} 
        className="w-64"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <DropdownMenuLabel className={cn("text-xs text-muted-foreground", isRTL && "text-right")}>
          {language === 'en' ? 'Switch Role Context' : 'تبديل سياق الدور'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {(availablePersonas || []).map((personaItem) => {
          const Icon = personaItem?.icon;
          const isActive = personaItem?.persona === activePersona;
          const isPrimary = personaItem?.persona === primaryPersona;
          
          return (
            <DropdownMenuItem
              key={personaItem?.persona || Math.random()}
              onClick={() => handlePersonaSwitch(personaItem?.persona)}
              className={cn(
                "flex items-center gap-3 py-2.5 cursor-pointer",
                isActive && "bg-muted",
                isRTL && "flex-row-reverse"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg bg-gradient-to-r",
                personaItem?.color || 'from-gray-500 to-gray-600'
              )}>
                {Icon && <Icon className="h-4 w-4 text-white" />}
              </div>
              
              <div className={cn("flex-1", isRTL && "text-right")}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {language === 'en' ? personaItem?.label?.en : personaItem?.label?.ar}
                  </span>
                  {isPrimary && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {language === 'en' ? 'Primary' : 'رئيسي'}
                    </Badge>
                  )}
                </div>
              </div>
              
              {isActive && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        <div className={cn("px-2 py-1.5 text-xs text-muted-foreground", isRTL && "text-right")}>
          {language === 'en' 
            ? 'Primary role has highest privileges' 
            : 'الدور الرئيسي له أعلى الصلاحيات'
          }
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Main export with error boundary wrapper
 */
export default function PersonaSwitcher(props) {
  return (
    <PersonaSwitcherErrorBoundary>
      <PersonaSwitcherContent {...props} />
    </PersonaSwitcherErrorBoundary>
  );
}
