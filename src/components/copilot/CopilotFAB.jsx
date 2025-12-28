import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, MessageSquare, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageContext';

export default function CopilotFAB() {
    const { isAuthenticated } = useAuth();
    const { t, language, isRTL } = useLanguage();
    const location = useLocation();
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Entrance animation
    useEffect(() => {
        if (isAuthenticated) {
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated]);

    // Don't show if not authenticated
    if (!isAuthenticated) return null;

    // Don't show if already on the Copilot page
    if (location.pathname === '/copilot') return null;

    return (
        <div
            className={cn(
                "fixed bottom-8 z-50 transition-all duration-700 ease-out transform",
                isRTL ? "left-8" : "right-8",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link to="/copilot" className="relative block group">

                {/* Pulse Effect Rings */}
                <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping group-hover:animate-none" />
                <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] delay-700 group-hover:animate-none" />

                {/* Main Button */}
                <div className={cn(
                    "relative flex items-center bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-full shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-white/20 overflow-hidden backdrop-blur-md",
                    isHovered ? "pl-4 pr-6 h-14 w-auto" : "h-14 w-14 justify-center"
                )}>

                    {/* Glass Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Icon Container */}
                    <div className="relative z-10 flex items-center justify-center">
                        <Brain className={cn(
                            "h-6 w-6 text-white transition-transform duration-500",
                            isHovered ? "rotate-12 scale-110" : ""
                        )} />
                        <Sparkles className={cn(
                            "absolute -top-1 -right-1 h-3 w-3 text-yellow-300 animate-pulse transition-opacity duration-300",
                            isHovered ? "opacity-100" : "opacity-70"
                        )} />
                    </div>

                    {/* Expanding Text Label */}
                    <div className={cn(
                        "flex flex-col items-start ml-3 overflow-hidden transition-all duration-500",
                        isHovered ? "w-32 opacity-100" : "w-0 opacity-0"
                    )}>
                        <span className="text-sm font-bold text-white whitespace-nowrap leading-none">
                            Super Copilot
                        </span>
                        <span className="text-[10px] text-purple-200 whitespace-nowrap leading-tight mt-0.5">
                            {language === 'en' ? 'Click to Ask AI' : 'اضغط واسأل الذكاء'}
                        </span>
                    </div>

                    {/* Arrow Indicator */}
                    <ChevronRight className={cn(
                        "h-4 w-4 text-white/70 ml-1 transition-all duration-300 delay-100",
                        isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 w-0"
                    )} />

                </div>

                {/* Floating Tooltip (Only visible when NOT hovered, enticing click) */}
                {!isHovered && (
                    <div className={cn(
                        "absolute bottom-full mb-3 py-1.5 px-3 bg-white text-purple-900 text-xs font-bold rounded-xl shadow-lg border border-purple-100 whitespace-nowrap pointer-events-none transition-all duration-500 delay-1000",
                        isRTL ? "left-1/2 translate-x-1/2" : "right-1/2 translate-x-1/2",
                        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    )}>
                        <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-b border-r border-purple-100"></div>
                        <span className="relative z-10 flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-purple-600" />
                            {language === 'en' ? 'Ask me anything!' : 'اسألني أي شيء!'}
                        </span>
                    </div>
                )}
            </Link>
        </div>
    );
}
