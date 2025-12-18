import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { MessageSquare, Send, Sparkles, Loader2, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function StrategyCopilotChat() {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { invokeAI, status: aiStatus, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Import centralized prompt module
    const { STRATEGY_COPILOT_PROMPT_TEMPLATE } = await import('@/lib/ai/prompts/strategy/copilot');
    
    const result = await invokeAI({
      prompt: STRATEGY_COPILOT_PROMPT_TEMPLATE(input)
    });

    if (result.success) {
      setMessages(prev => [...prev, { role: 'assistant', content: result.data }]);
    } else {
      setMessages(prev => [...prev, { role: 'assistant', content: t({ en: 'Sorry, I encountered an error. Please try again.', ar: 'عذراً، واجهت خطأ. يرجى المحاولة مرة أخرى.' }) }]);
    }
  };

  const suggestedQuestions = [
    { en: 'How should I allocate my innovation budget?', ar: 'كيف يجب أن أخصص ميزانية الابتكار؟' },
    { en: 'Which sectors are underperforming?', ar: 'أي القطاعات أداؤها ضعيف؟' },
    { en: 'What are the top 3 priority areas for my municipality?', ar: 'ما أفضل 3 مجالات ذات أولوية لبلديتي؟' }
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <Card className="flex-1 flex flex-col border-2 border-purple-300">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            {t({ en: 'Strategy Copilot', ar: 'مساعد الاستراتيجية' })}
          </CardTitle>
          <p className="text-sm text-white/90">
            {t({ en: 'AI-powered strategic advisor', ar: 'المستشار الاستراتيجي الذكي' })}
          </p>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col pt-6 space-y-4 overflow-hidden">
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-2xl">
                <Bot className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {t({ en: 'Ask me anything about strategy', ar: 'اسألني أي شيء عن الاستراتيجية' })}
                </h3>
                <p className="text-sm text-slate-600 mb-6">
                  {t({ en: 'I can help with budget allocation, portfolio analysis, and strategic planning', ar: 'يمكنني المساعدة في توزيع الميزانية وتحليل المحفظة والتخطيط الاستراتيجي' })}
                </p>
                
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 mb-2">{t({ en: 'Try asking:', ar: 'جرب السؤال:' })}</p>
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q[language])}
                      className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
                    >
                      <p className="text-sm text-slate-700">{q[language]}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.length > 0 && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      msg.role === 'user' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-white border border-slate-200'
                    }`}>
                      {msg.role === 'user' ? (
                        <p className="text-sm">{msg.content}</p>
                      ) : (
                        <ReactMarkdown className="prose prose-sm max-w-none">
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div className="h-8 w-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                    <p className="text-sm text-slate-600">{t({ en: 'Thinking...', ar: 'أفكر...' })}</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={t({ en: 'Ask about strategy, budget, or portfolio...', ar: 'اسأل عن الاستراتيجية أو الميزانية أو المحفظة...' })}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!input.trim() || loading} className="bg-purple-600">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(StrategyCopilotChat, { requiredPermissions: ['strategy_view'] });