import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useCopilotHistory } from '@/hooks/useCopilotHistory';
import { useCopilotStore } from '@/lib/store/copilotStore';
import { useLanguage } from '@/components/LanguageContext';
import { History, Plus, MessageSquare, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export function HistorySidebar() {
    const { t, isRTL, language } = useLanguage();
    const { activeSessionId, setActiveSessionId } = useCopilotStore();
    const { useSessions } = useCopilotHistory();
    const { data: sessions, isLoading } = useSessions();

    const formatTime = (date) => {
        try {
            return formatDistanceToNow(new Date(date), { 
                addSuffix: true,
                locale: language === 'ar' ? ar : undefined 
            });
        } catch {
            return '';
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t({ en: 'Chat History', ar: 'سجل المحادثات' })}
                        </span>
                    </div>
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 w-7 p-0"
                        onClick={() => setActiveSessionId(null)}
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Sessions List */}
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : sessions?.length === 0 ? (
                        <div className="text-center py-8 px-4">
                            <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">
                                {t({ en: 'No conversations yet', ar: 'لا توجد محادثات بعد' })}
                            </p>
                        </div>
                    ) : (
                        sessions?.map((session) => (
                            <button
                                key={session.id}
                                onClick={() => setActiveSessionId(session.id)}
                                className={`w-full text-start p-2.5 rounded-lg transition-colors group ${
                                    activeSessionId === session.id
                                        ? 'bg-primary/10 border border-primary/20'
                                        : 'hover:bg-muted/50'
                                }`}
                            >
                                <div className="flex items-start gap-2">
                                    <MessageSquare className={`w-4 h-4 mt-0.5 shrink-0 ${
                                        activeSessionId === session.id 
                                            ? 'text-primary' 
                                            : 'text-muted-foreground'
                                    }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {session.title || t({ en: 'New Chat', ar: 'محادثة جديدة' })}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">
                                            {formatTime(session.updated_at)}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </ScrollArea>

            {/* Footer Stats */}
            <div className="p-3 border-t bg-muted/5">
                <div className="text-[10px] text-muted-foreground text-center">
                    {sessions?.length || 0} {t({ en: 'conversations', ar: 'محادثة' })}
                </div>
            </div>
        </div>
    );
}
