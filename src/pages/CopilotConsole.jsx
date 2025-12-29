import { useRef, useEffect, useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from 'react-resizable-panels';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCopilotStore } from '@/lib/store/copilotStore';
import { CopilotOrchestrator } from '@/lib/ai/orchestrator';
import { GenUICard } from '@/components/copilot/widgets/GenUICard';
import { ProposalCard } from '@/components/copilot/widgets/ProposalCard';
import { ActionChip } from '@/components/copilot/widgets/ActionChip';
import { TypingEffect } from '@/components/ui/TypingEffect';
import { Loader2, Send, Bot, User, LayoutDashboard, History, Sparkles } from 'lucide-react';
import { useCopilotHistory } from '@/hooks/useCopilotHistory';
import { useToolExecutor } from '@/hooks/useToolExecutor';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { useReferenceDataTools } from '@/hooks/tools/useReferenceDataTools';
import { usePilotTools } from '@/hooks/tools/usePilotTools';
import { useCopilotTools } from '@/contexts/CopilotToolsContext';

import { useContextTools } from '@/hooks/tools/useContextTools';

const orchestrator = new CopilotOrchestrator();

export default function CopilotConsole() {
    // Mount Feature Plugins
    useReferenceDataTools();
    usePilotTools();
    useContextTools(); // Mount Context Router

    // Access Registry
    const { getAllTools } = useCopilotTools();

    const {
        isOpen,
        toggleConsole,
        activeSessionId, // Get real session ID
        isThinking,
        toolStatus,
        pendingToolCall,
        confirmAction,
        cancelAction
    } = useCopilotStore();

    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);
    const { useSessionMessages } = useCopilotHistory();

    // -- Real History --
    const { data: historyMessages } = useSessionMessages(activeSessionId);

    // -- Resume Execution on Confirmation --
    useEffect(() => {
        if (toolStatus === 'executing' && pendingToolCall) {
            // Re-fetch tools for resuming execution context if needed
            const tools = getAllTools();
            // Pass specific handler or just rely on global executor
            orchestrator.executor(pendingToolCall.name, pendingToolCall.args)
                .then(result => {
                    // Result handling is inside executor, but we can add UI feedback here if needed
                })
                .catch(err => console.error("Resumed execution failed", err));
        }
    }, [toolStatus, pendingToolCall]);

    // -- CRITICAL: Wire Orchestrator to Executor --
    const { requestExecution } = useToolExecutor();
    useEffect(() => {
        orchestrator.setExecutor(requestExecution);
    }, [requestExecution]);

    // -- CRITICAL: Wire Orchestrator to AI Backend --
    const { invokeAI } = useAIWithFallback({ showToasts: false });
    useEffect(() => {
        // Adapt invokeAI to match Orchestrator's expected signature
        orchestrator.setCaller(async ({ system, user, tools }) => {
            const { success, data } = await invokeAI({
                prompt: user, // Core user message
                system_prompt: system, // The Schema/Persona we built
                // Note: invokeAI internal logic might handle tools differently, 
                // but passing system prompt is key.
            });
            if (success) return data;
            throw new Error("AI Invoke Failed");
        });
    }, [invokeAI]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        // Optimistic UI
        const newMsg = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, newMsg]);
        setInputValue('');

        // Call Brain with Dynamic Tools
        const currentTools = getAllTools();
        const response = await orchestrator.processMessage(newMsg.content, { tools: currentTools });

        // Handle Response
        // Handle Response
        if (response.type === 'confirmation_request') {
            // UI State handles the specific card via `toolStatus`
        } else if (response.type === 'data_list') {
            // Generative UI Response
            const ContentWidget = (
                <GenUICard title={`Found ${response.items.length} ${response.entity}s`} variant="highlight">
                    <div className="max-h-60 overflow-y-auto space-y-1 mt-2">
                        {response.items.map((item, i) => (
                            <div key={i} className="p-2 hover:bg-white/50 rounded flex justify-between cursor-pointer border border-transparent hover:border-violet-100 transition-colors"
                                onClick={() => setInputValue(`Create pilot in ${item.name_en || item.name} sector`)}>
                                <span>{item.name_en || item.name}</span>
                            </div>
                        ))}
                    </div>
                </GenUICard>
            );

            setMessages(prev => [...prev, { role: 'assistant', content: "Here are the sectors you asked for:", ui: ContentWidget }]);

        } else if (response.success && response.draft) {
            // Context/Draft Update Response
            const ContentWidget = (
                <GenUICard title="Context Updated" subtitle={`${response.draft.type || 'Draft'} modified`} variant="default">
                    <div className="text-sm space-y-2">
                        {/* Data Fields */}
                        {Object.entries(response.draft.data).map(([k, v]) => (
                            <div key={k} className="flex justify-between border-b border-dashed pb-1">
                                <span className="text-muted-foreground capitalize">{k}:</span>
                                <span className="font-medium">{String(v)}</span>
                            </div>
                        ))}

                        {/* Intelligence Layer: Missing Fields or Action */}
                        {response.draft.analysis?.isValid ? (
                            <div className="pt-2 flex justify-end animate-in fade-in">
                                <ActionChip label="Execute Pilot" icon={Sparkles} onClick={() => setInputValue('Create pilot now')} />
                            </div>
                        ) : (
                            response.draft.analysis?.missingFields?.length > 0 && (
                                <div className="mt-3 p-2 bg-amber-50 rounded border border-amber-100 text-amber-700 text-xs">
                                    <span className="font-bold block mb-1">Missing Parameters:</span>
                                    <div className="flex gap-1 flex-wrap">
                                        {response.draft.analysis.missingFields.map(f => (
                                            <span key={f} className="px-1.5 py-0.5 bg-amber-100 rounded-full capitalize">{f}</span>
                                        ))}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </GenUICard>
            );
            setMessages(prev => [...prev, { role: 'assistant', content: response.message, ui: ContentWidget }]);

        } else {
            // Default Text
            setMessages(prev => [...prev, { role: 'assistant', content: response.content || JSON.stringify(response) }]);
        }
    };

    return (
        <div className="h-screen w-full bg-background flex flex-col">
            <header className="h-16 border-b flex items-center px-6 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-md z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/10 shadow-inner">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg flex items-center gap-2">
                            Super Copilot
                            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold tracking-wider border border-white/10">
                                BETA
                            </span>
                        </h1>
                        <p className="text-xs text-purple-100/80 font-medium">
                            Powered by Innovate Saudi AI
                        </p>
                    </div>
                </div>
            </header>

            <ResizablePanelGroup direction="horizontal" className="flex-1">

                {/* LEFT RAIL: Context / Navigation */}
                <ResizablePanel defaultSize={20} minSize={15} maxSize={25} className="bg-muted/10 border-r hidden md:block">
                    <div className="p-4 space-y-4">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Context</div>
                        <div className="space-y-2">
                            <ActionChip label="Project Dashboard" icon={LayoutDashboard} className="w-full justify-start" />
                            <ActionChip label="Recent Chats" icon={History} className="w-full justify-start" />
                        </div>
                    </div>
                </ResizablePanel>

                <ResizableHandle />

                {/* CENTER: Active Workspace / Chat Stream */}
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
                                            How can I help you govern today?
                                        </h2>
                                        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
                                            I have access to your dashboard, pilots, and challenges. Ask me anything or choose a starter command below.
                                        </p>
                                        <div className="flex gap-3 justify-center">
                                            <ActionChip label=" Create Pilot" icon={Sparkles} onClick={() => setInputValue('Create a new pilot')} />
                                            <ActionChip label="Navigate Dashboard" icon={LayoutDashboard} onClick={() => setInputValue('Navigate to dashboard')} />
                                        </div>
                                    </div>
                                )}

                                {/* Message Stream */}
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Bot className="w-4 h-4 text-primary" /></div>}

                                        <div className={`p-3 rounded-lg max-w-[80%] text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                            {msg.role === 'assistant' && idx === messages.length - 1 && !msg.ui ? (
                                                <TypingEffect text={msg.content} />
                                            ) : (
                                                <div className="flex flex-col gap-3">
                                                    <div>{msg.content}</div>
                                                    {msg.ui && (
                                                        <div className="mt-1 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                            {msg.ui}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><User className="w-4 h-4" /></div>}
                                    </div>
                                ))}

                                {/* Safety Valve Card */}
                                {toolStatus === 'requiring_confirmation' && pendingToolCall && (
                                    <div className="ml-11">
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
                                    <div className="ml-11 flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Thinking...
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 border-t bg-background/95 backdrop-blur z-10 w-full max-w-3xl mx-auto">
                            <div className="relative">
                                <Input
                                    className="pr-10"
                                    placeholder="Type a command or ask a question..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-8 w-8" onClick={handleSend}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </ResizablePanel>

                <ResizableHandle />

                {/* RIGHT: HUD (Heads Up Display) */}
                <ResizablePanel defaultSize={30} minSize={20} maxSize={40} className="bg-muted/5 border-l hidden lg:block">
                    <div className="p-4">
                        <GenUICard title="Active Stats" subtitle="Real-time Ecosystem Metrics">
                            <div className="text-center py-8 text-muted-foreground text-xs">
                                Select a pilot to view deeper analytics here.
                            </div>
                        </GenUICard>
                    </div>
                </ResizablePanel>

            </ResizablePanelGroup>
        </div>
    );
}
