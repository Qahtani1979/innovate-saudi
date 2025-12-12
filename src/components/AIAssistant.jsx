// AI Assistant component with fallback support
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from './LanguageContext';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function AIAssistant({ context = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const { language, isRTL, t } = useLanguage();
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const quickActions = [
    { 
      label: { en: 'Summarize this page', ar: 'لخص هذه الصفحة' },
      prompt: 'Summarize the current page content'
    },
    { 
      label: { en: 'Suggest improvements', ar: 'اقترح تحسينات' },
      prompt: 'Suggest improvements for this item'
    },
    { 
      label: { en: 'Find similar items', ar: 'ابحث عن مشابهات' },
      prompt: 'Find similar challenges or solutions'
    },
    { 
      label: { en: 'Generate report', ar: 'أنشئ تقرير' },
      prompt: 'Generate a summary report'
    }
  ];

  const handleSend = async () => {
    if (!prompt.trim() || isLoading || !isAvailable) return;

    const userMessage = { role: 'user', content: prompt };
    setMessages([...messages, userMessage]);
    setPrompt('');

    try {
      // Semantic search across platform entities
      const [challenges, pilots, solutions, rdProjects, programs] = await Promise.all([
        base44.entities.Challenge.list(),
        base44.entities.Pilot.list(),
        base44.entities.Solution.list(),
        base44.entities.RDProject.list(),
        base44.entities.Program.list()
      ]);

      const platformContext = {
        page: context.page,
        total_challenges: challenges.length,
        total_pilots: pilots.length,
        total_solutions: solutions.length,
        total_rd_projects: rdProjects.length,
        total_programs: programs.length,
        recent_items: {
          challenges: challenges.slice(0, 3).map(c => ({ code: c.code, title: c.title_en, sector: c.sector })),
          pilots: pilots.slice(0, 3).map(p => ({ code: p.code, title: p.title_en, stage: p.stage })),
          solutions: solutions.slice(0, 3).map(s => ({ name: s.name_en, provider: s.provider_name }))
        }
      };

      const response = await invokeAI({
        prompt: `You are the Saudi Innovates Platform AI Assistant with semantic search.
Context: User is on page "${context.page}".
Platform Data: ${JSON.stringify(platformContext)}

User question: ${prompt}

Provide:
- Context-aware, actionable guidance
- Search platform data when relevant
- Suggest specific pages or entities
- Be concise and bilingual when helpful (AR/EN)`
      });

      if (response.success && response.data) {
        const aiMessage = { role: 'assistant', content: typeof response.data === 'string' ? response.data : JSON.stringify(response.data) };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleQuickAction = (action) => {
    setPrompt(action.prompt);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-teal-600 hover:scale-110 transition-transform z-50"
        size="icon"
      >
        <Sparkles className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} w-96 h-[600px] shadow-2xl z-50 flex flex-col`}>
      <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-teal-600 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5" />
            {t({ en: 'AI Assistant', ar: 'المساعد الذكي' })}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="px-4 pt-2" />
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-blue-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600">
                {t({ en: 'How can I help you today?', ar: 'كيف يمكنني مساعدتك اليوم؟' })}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-6">
                {quickActions.map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action)}
                    className="text-xs h-auto py-2"
                  >
                    {action.label[language]}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-lg p-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={t({ en: 'Ask me anything...', ar: 'اسألني أي شيء...' })}
              className="resize-none"
              rows={2}
            />
            <Button
              onClick={handleSend}
              disabled={!prompt.trim() || isLoading}
              className="bg-gradient-to-r from-blue-600 to-teal-600"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}