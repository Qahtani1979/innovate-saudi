import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../LanguageContext';
import { usePersonaRouting } from '@/hooks/usePersonaRouting';
import { SIDEBAR_MENUS } from '@/config/sidebarMenus';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function PersonaSidebar({ isOpen, onClose }) {
  const { t, language, isRTL } = useLanguage();
  const { persona } = usePersonaRouting();
  const location = useLocation();

  const menuConfig = SIDEBAR_MENUS[persona] || SIDEBAR_MENUS.user;
  const MenuIcon = menuConfig.icon;

  const isActive = (pageName) => {
    const pageUrl = createPageUrl(pageName);
    return location.pathname === pageUrl;
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        dir={isRTL ? 'rtl' : 'ltr'}
        className={cn(
          "fixed top-16 bottom-0 z-40 w-64 bg-background border-border transition-transform duration-300 ease-in-out",
          isRTL ? "right-0 border-l" : "left-0 border-r",
          isOpen 
            ? "translate-x-0" 
            : isRTL ? "translate-x-full" : "-translate-x-full"
        )}
      >
        {/* Persona Badge */}
        <div className={cn(
          "p-4 border-b border-border",
          `bg-gradient-to-r ${menuConfig.color} text-white`
        )}>
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="p-2 bg-white/20 rounded-lg">
              <MenuIcon className="h-5 w-5" />
            </div>
            <div className={cn(isRTL && "text-right")}>
              <p className="font-semibold text-sm">{t(menuConfig.label)}</p>
              <p className="text-xs text-white/80">
                {language === 'en' ? 'Navigation' : 'التنقل'}
              </p>
            </div>
            {/* Mobile close button */}
            <button 
              onClick={onClose}
              className={cn(
                "lg:hidden p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors",
                isRTL ? "mr-auto" : "ml-auto"
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-80px)]">
          {menuConfig.items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.name);
            
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.name)}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isRTL && "flex-row-reverse",
                  active
                    ? `bg-gradient-to-r ${menuConfig.color} text-white shadow-md`
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  active ? "text-white" : "text-muted-foreground"
                )} />
                <span className={cn("truncate", isRTL && "text-right")}>{t(item.label)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Toggle button for desktop */}
        <button
          onClick={onClose}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-6 h-12 bg-background border border-border rounded-full shadow-sm hidden lg:flex items-center justify-center hover:bg-muted transition-colors",
            isRTL ? "-left-3" : "-right-3"
          )}
        >
          {isRTL ? (
            isOpen ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          ) : (
            isOpen ? <ChevronLeft className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </aside>
    </>
  );
}
