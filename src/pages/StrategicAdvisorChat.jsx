import { useState, useEffect } from 'react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ProtectedPage from '../components/permissions/ProtectedPage';

import { STRATEGY_SYSTEM_PROMPT, strategyPrompts } from '@/lib/ai/prompts/ecosystem/strategyPrompts';
import { getAdvisorActions } from '@/lib/ai/prompts/ecosystem/advisorActions';
import { buildPrompt } from '@/lib/ai/promptBuilder';

function StrategicAdvisorChat() {
  const { language, isRTL, t } = useLanguage();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  /*
   * Local chat state management
   */
  const { invokeAI, isLoading: aiLoading } = useAIWithFallback();

  // Load initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: t({
            en: 'Hello! I am your Strategic Advisor AI. How can I help you analyze your portfolio or identify gaps today?',
            ar: 'مرحباً! أنا مستشارك الاستراتيجي الذكي. كيف يمكنني مساعدتك في تحليل محفظتك أو تحديد الفجوات اليوم؟'
          })
        }
      ]);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading || aiLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Construct prompt with context from previous messages
      const history = messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');

      const { prompt } = buildPrompt(strategyPrompts.advisorChat, {
        history,
        input
      });

      const result = await invokeAI({
        prompt,
        system_prompt: STRATEGY_SYSTEM_PROMPT
      });

      if (result.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: typeof result.data === 'string' ? result.data : JSON.stringify(result.data)
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: t({ en: 'Sorry, I encountered an error. Please try again.', ar: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.' })
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get user context for permission-aware actions
  const { user } = useAuth();
  // Pass user context to filter actions
  const quickActions = getAdvisorActions(user);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="flex-1 flex flex-col">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            {t({ en: 'Strategic Advisor AI', ar: 'المستشار الاستراتيجي الذكي' })}
          </CardTitle>
          <p className="text-sm text-white/90">
            {t({ en: '24/7 AI monitoring with strategic guidance and insights', ar: 'مراقبة ذكية على مدار الساعة مع إرشادات ورؤى استراتيجية' })}
          </p>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Quick Actions */}
          <div className="p-4 border-b bg-slate-50">
            <p className="text-xs font-medium text-slate-600 mb-2">
              {t({ en: 'Quick Actions', ar: 'إجراءات سريعة' })}
            </p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setInput(action.prompt);
                  }}
                  className="text-xs"
                >
                  {t(action.label)}
                </Button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-purple-600" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200'
                  }`}>
                  {msg.role === 'user' ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <ReactMarkdown className="text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                  <p className="text-sm text-slate-600">Thinking...</p>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t({ en: 'Ask about strategy, gaps, risks, or request analysis...', ar: 'اسأل عن الاستراتيجية، الفجوات، المخاطر، أو اطلب التحليل...' })}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={!input.trim() || loading} className="bg-purple-600">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(StrategicAdvisorChat, { requiredPermissions: [] });
