import React, { useState, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCopilotStore } from '@/lib/store/copilotStore';
import { orchestrator } from '@/lib/ai/orchestrator';
import { GenUICard } from '@/components/copilot/widgets/GenUICard';
import { ProposalCard } from '@/components/copilot/widgets/ProposalCard';
import { ActionChip } from '@/components/copilot/widgets/ActionChip';
import { TypingEffect } from '@/components/copilot/widgets/TypingEffect';
import { Loader2, Send, Bot, User, LayoutDashboard, History } from 'lucide-react';
import { useCopilotHistory } from '@/hooks/useCopilotHistory';

export default function CopilotConsole() {
    const {
        isThinking,
        toolStatus,
        pendingToolCall,
        confirmAction,
        cancelAction
    } = useCopilotStore();

    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);
    const { useSessionMessages } = useCopilotHistory();

    // -- Mock History for UI Development --
    const { data: historyMessages } = useSessionMessages('mock-session-id');

    // -- Resume Execution on Confirmation --
    useEffect(() => {
        if (toolStatus === 'executing' && pendingToolCall) {
            orchestrator.executor(pendingToolCall.name, pendingToolCall.args)
                .then(result => {
                    // Result handling is inside executor, but we can add UI feedback here if needed
                })
                .catch(err => console.error("Resumed execution failed", err));
        }
    }, [toolStatus, pendingToolCall]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        // Optimistic UI
        const newMsg = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, newMsg]);
        setInputValue('');

        // Call Brain
        const response = await orchestrator.processMessage(newMsg.content);

        // Handle Response
        if (response.type === 'confirmation_request') {
            // UI State handles the specific card via `toolStatus`
        } else if (response.type === 'text') {
            setMessages(prev => [...prev, { role: 'assistant', content: response.content }]);
        }
    };

    return (
        <div className="h-screen w-full bg-background flex flex-col">
            <header className="h-14 border-b flex items-center px-4 bg-muted/20">
                <span className="font-semibold text-sm flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary" />
                    Super Copilot
                </span>
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
                                    <div className="text-center py-20 text-muted-foreground">
                                        <Bot className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <h2 className="text-lg font-medium text-foreground">How can I help you govern today?</h2>
                                        <div className="flex gap-2 justify-center mt-4">
                                            <ActionChip label="Create Pilot" onClick={() => setInputValue('Create a new pilot')} />
                                            <ActionChip label="Navigate Dashboard" onClick={() => setInputValue('Navigate to dashboard')} />
                                        </div>
                                    </div>
                                )}

                                {/* Message Stream */}
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Bot className="w-4 h-4 text-primary" /></div>}

                                        <div className={`p-3 rounded-lg max-w-[80%] text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                            {msg.role === 'assistant' && idx === messages.length - 1 ? (
                                                <TypingEffect text={msg.content} />
                                            ) : (
                                                msg.content
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
