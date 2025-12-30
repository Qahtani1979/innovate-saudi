import { useRef, useEffect } from 'react';
import { PanelResizeHandle as ResizableHandle, Panel as ResizablePanel, PanelGroup as ResizablePanelGroup } from 'react-resizable-panels';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCopilotStore } from '@/lib/store/copilotStore';
import { ProposalCard } from '@/components/copilot/widgets/ProposalCard';
import { ActionChip } from '@/components/copilot/widgets/ActionChip';
import { TypingEffect } from '@/components/copilot/widgets/TypingEffect';
import { ChatMessage } from '@/components/copilot/widgets/ChatMessage';
import { Loader2, Send, Bot, User, LayoutDashboard, History, Sparkles } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { COPILOT_UI_TEXT, ENTITY_CONFIG } from '@/lib/copilot/uiConfig';
import { GenUICard } from '@/components/copilot/widgets/GenUICard';

import { useCopilotChat } from '@/hooks/ui/useCopilotChat';
import { useCopilotPlugins } from '@/hooks/ui/useCopilotPlugins';

export default function CopilotConsole() {
    const { t, isRTL } = useLanguage();

    // Mount Feature Plugins
    // Mount Feature Plugins
    useCopilotPlugins();

    const {
        isOpen,
        isThinking,
        toolStatus,
        pendingToolCall,
        confirmAction,
        cancelAction
    } = useCopilotStore();

    // Use Logic Hook
    const {
        inputValue,
        setInputValue,
        messages,
        handleSend
    } = useCopilotChat();

    useEffect(() => {
        console.log('[CopilotConsole] Mounted');
        return () => console.log('[CopilotConsole] Unmounted');
    }, []);

    return (
        <div className="h-screen w-full bg-background flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
            <header className="h-20 border-b flex items-center px-6 bg-background text-foreground shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <Bot className="w-8 h-8 text-primary" />
                    <div>
                        <h1 className="font-bold text-2xl flex items-center gap-2">
                            Strategy Copilot
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wider border border-primary/20">
                                BETA
                            </span>
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium">
                            AI-Powered Strategic Planning Assistant
                        </p>
                    </div>
                </div>
            </header>

            <ResizablePanelGroup direction="horizontal" className="flex-1">

                {/* SIDEBAR: Context / Navigation */}
                <ResizablePanel defaultSize={20} minSize={15} maxSize={25} className={`bg-muted/10 hidden md:block ${isRTL ? 'border-l' : 'border-r'}`}>
                    <div className="p-4 space-y-4">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t(COPILOT_UI_TEXT.context_title)}</div>
                        <div className="space-y-2">
                            <ActionChip label={t(COPILOT_UI_TEXT.recent_chats)} icon={History} className="w-full justify-start" />
                        </div>
                    </div>
                </ResizablePanel>

                <ResizableHandle />

                {/* CENTER: Chat Stream */}
                <ResizablePanel defaultSize={50} minSize={30}>
                    <div className="flex flex-col h-full relative">
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-6 max-w-3xl mx-auto pb-20">

                                {/* Introduction */}
                                {messages.length === 0 && (
                                    <div className="text-center py-20">
                                        <div className="w-20 h-20 bg-gradient-to-tr from-purple-100 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                            <Bot className="w-10 h-10 text-purple-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-2">
                                            {t(COPILOT_UI_TEXT.greeting)}
                                        </h2>
                                        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
                                            {t(COPILOT_UI_TEXT.subtitle)}
                                        </p>
                                        <div className="flex gap-3 justify-center">
                                            <ActionChip label={t(COPILOT_UI_TEXT.starter_create_pilot)} icon={Sparkles} onClick={() => setInputValue('Create a new pilot')} />
                                        </div>
                                    </div>
                                )}

                                {/* Message Stream */}
                                {messages.map((msg, idx) => {
                                    // Local Helper for Widget Rendering
                                    const renderMessageUI = (uiData) => {
                                        if (!uiData) return null;

                                        if (uiData.type === 'data_list') {
                                            const entityType = uiData.entity || 'default';
                                            const config = ENTITY_CONFIG[entityType] || ENTITY_CONFIG['default'];
                                            const Icon = config.icon;

                                            return (
                                                <GenUICard title={`${t(COPILOT_UI_TEXT.found_items)} (${uiData.items.length})`} variant="highlight">
                                                    <div className="max-h-60 overflow-y-auto space-y-1 mt-2">
                                                        {uiData.items.map((item, i) => (
                                                            <div key={i}
                                                                className="p-2 hover:bg-white/50 rounded flex justify-between items-center cursor-pointer border border-transparent hover:border-violet-100 transition-colors"
                                                                onClick={() => setInputValue(`${t(COPILOT_UI_TEXT.view_details)} ${item.title || item.name_en || item.name}`)}>

                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                    <Icon className={`w-4 h-4 shrink-0 ${config.color}`} />
                                                                    <span className="truncate text-sm">{item.title || item.name_en || item.name || item.id}</span>
                                                                </div>
                                                                {item.status && <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded-full opacity-70">{item.status}</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </GenUICard>
                                            );
                                        }

                                        if (uiData.type === 'draft_summary') {
                                            const { draft } = uiData;
                                            return (
                                                <GenUICard title={t(COPILOT_UI_TEXT.context_updated)} subtitle={`${draft.type || 'Draft'} modified`} variant="default">
                                                    <div className="text-sm space-y-2">
                                                        {Object.entries(draft.data).map(([k, v]) => (
                                                            <div key={k} className="flex justify-between border-b border-dashed pb-1">
                                                                <span className="text-muted-foreground capitalize">{k}:</span>
                                                                <span className="font-medium text-end">{String(v)}</span>
                                                            </div>
                                                        ))}
                                                        {draft.analysis?.isValid ? (
                                                            <div className="pt-2 flex justify-end animate-in fade-in">
                                                                <ActionChip label={t(COPILOT_UI_TEXT.execute_pilot)} icon={Sparkles} onClick={() => setInputValue(t(COPILOT_UI_TEXT.create_pilot_now))} />
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </GenUICard>
                                            );
                                        }
                                        return null;
                                    };

                                    return (
                                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {/* Avatar Logic */}
                                            {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-primary" /></div>}

                                            <div className={`max-w-[80%] text-sm ${msg.role === 'user' ? 'p-3 rounded-lg bg-primary text-primary-foreground' : ''}`}>
                                                {msg.role === 'assistant' ? (
                                                    <ChatMessage 
                                                        content={msg.content}
                                                        widgets={msg.widgets || []}
                                                        onAction={(action) => {
                                                            const prompt = action.prompt || action.label;
                                                            setInputValue(prompt);
                                                            setTimeout(() => handleSend(prompt), 150);
                                                        }}
                                                    />
                                                ) : msg.role === 'assistant' && idx === messages.length - 1 ? (
                                                    <TypingEffect text={msg.content} />
                                                ) : (
                                                    <span>{msg.content}</span>
                                                )}
                                            </div>

                                            {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0"><User className="w-4 h-4" /></div>}
                                        </div>
                                    );
                                })}

                                {/* Safety Valve Card */}
                                {toolStatus === 'requiring_confirmation' && pendingToolCall && (
                                    <div className={isRTL ? "mr-11" : "ml-11"}>
                                        <ProposalCard
                                            toolName={pendingToolCall.name}
                                            args={pendingToolCall.args}
                                            onConfirm={confirmAction}
                                            onCancel={cancelAction}
                                        />
                                    </div>
                                )}

                                {/* Thinking Indicator */}
                                {isThinking && (
                                    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? "mr-11" : "ml-11"}`}>
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        {t(COPILOT_UI_TEXT.thinking)}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 border-t bg-background/95 backdrop-blur z-10 w-full max-w-3xl mx-auto">
                            <div className="relative">
                                <Input
                                    className={isRTL ? "pl-10" : "pr-10"}
                                    placeholder={t(COPILOT_UI_TEXT.placeholder)}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <Button size="icon" variant="ghost" className={`absolute top-1 h-8 w-8 ${isRTL ? 'left-1' : 'right-1'}`} onClick={handleSend}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </ResizablePanel>

                <ResizableHandle />

                {/* RIGHT: HUD (Stats) */}
                <ResizablePanel defaultSize={30} minSize={20} maxSize={40} className={`bg-muted/5 hidden lg:block ${isRTL ? 'border-r' : 'border-l'}`}>
                    <div className="p-4">
                        <GenUICard title={t(COPILOT_UI_TEXT.active_stats)} subtitle={t(COPILOT_UI_TEXT.stats_subtitle)}>
                            <div className="text-center py-8 text-muted-foreground text-xs">
                                {t(COPILOT_UI_TEXT.stats_placeholder)}
                            </div>
                        </GenUICard>
                    </div>
                </ResizablePanel>

            </ResizablePanelGroup>
        </div>
    );
}
