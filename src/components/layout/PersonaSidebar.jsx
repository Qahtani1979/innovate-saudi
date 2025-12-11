import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../LanguageContext';
import { usePersonaRouting } from '@/hooks/usePersonaRouting';
import { SIDEBAR_MENUS } from '@/config/sidebarMenus';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
        className={cn(
          "fixed top-16 bottom-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out",
          isRTL ? "right-0 border-l border-r-0" : "left-0",
          isOpen 
            ? "translate-x-0" 
            : isRTL ? "translate-x-full" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Persona Badge */}
        <div className={cn(
          "p-4 border-b border-slate-100",
          `bg-gradient-to-r ${menuConfig.color} text-white`
        )}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <MenuIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">{t(menuConfig.label)}</p>
              <p className="text-xs text-white/80">
                {language === 'en' ? 'Navigation' : 'التنقل'}
              </p>
            </div>
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
                  active
                    ? `bg-gradient-to-r ${menuConfig.color} text-white shadow-md`
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  active ? "text-white" : "text-slate-400"
                )} />
                <span className="truncate">{t(item.label)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Close button for desktop (toggle) */}
        <button
          onClick={onClose}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-6 h-12 bg-white border border-slate-200 rounded-full shadow-sm hidden lg:flex items-center justify-center hover:bg-slate-50 transition-colors",
            isRTL ? "-left-3" : "-right-3"
          )}
        >
          {isRTL ? (
            isOpen ? <ChevronRight className="h-4 w-4 text-slate-400" /> : <ChevronLeft className="h-4 w-4 text-slate-400" />
          ) : (
            isOpen ? <ChevronLeft className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </button>
      </aside>
    </>
  );
}
