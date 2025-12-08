import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ProtectedPage from '../components/permissions/ProtectedPage';

function StrategicAdvisorChat() {
  const { language, isRTL, t } = useLanguage();
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initConversation = async () => {
      const conversation = await base44.agents.createConversation({
        agent_name: 'strategicAdvisor',
        metadata: {
          name: 'Strategic Planning Session',
          description: 'AI strategic advisor conversation'
        }
      });
      setConversationId(conversation.id);
      setMessages(conversation.messages || []);
    };

    initConversation();
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const handleSend = async () => {
    if (!input.trim() || !conversationId) return;

    setLoading(true);
    setInput('');

    const conversations = await base44.agents.listConversations({
      agent_name: 'strategicAdvisor'
    });
    const conversation = conversations.find(c => c.id === conversationId);

    await base44.agents.addMessage(conversation, {
      role: 'user',
      content: input
    });
  };

  const quickActions = [
    { label: t({ en: 'Weekly Portfolio Digest', ar: 'ملخص المحفظة الأسبوعي' }), prompt: 'Provide a weekly digest of portfolio health: gaps detected, pilots at risk, new opportunities, and priority recommendations for this week.' },
    { label: t({ en: 'Gap Analysis', ar: 'تحليل الفجوات' }), prompt: 'Analyze the current portfolio and identify strategic gaps by sector, municipality type, and innovation stage. Suggest what initiatives to launch.' },
    { label: t({ en: 'Risk Assessment', ar: 'تقييم المخاطر' }), prompt: 'Identify high-risk pilots and challenges that need intervention. Provide specific recommendations for each.' },
    { label: t({ en: 'Generate Draft Plan', ar: 'توليد مسودة خطة' }), prompt: 'Generate a draft strategic plan for 2026 based on current portfolio gaps, emerging trends, and municipal priorities.' }
  ];

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
                    handleSend();
                  }}
                  className="text-xs"
                >
                  {action.label}
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
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user' 
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