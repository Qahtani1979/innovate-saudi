import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Loader2, X, CheckCircle, Bot, User } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from './LanguageContext';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildFormAssistantPrompt, FORM_ASSISTANT_SCHEMA } from '@/lib/ai/prompts/forms';

export default function AIFormAssistant({ onDataExtracted, entityType = 'Challenge', municipalities = [], challenges = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const scrollRef = useRef(null);
  const { language, t } = useLanguage();
  const { invokeAI, status, isLoading: isProcessing, isAvailable, rateLimitInfo } = useAIWithFallback();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initialPrompt = language === 'ar' 
    ? "مرحباً! أنا مساعدك الذكي. أخبرني عن التحدي الذي تواجهه - صِفه بكلماتك الخاصة، وسأساعدك في تنظيمه كتقديم تحدي رسمي."
    : "Hi! I'm your AI assistant. Tell me about the challenge you're facing - describe it in your own words, and I'll help structure it into a proper challenge submission.";

  const startConversation = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: initialPrompt,
        timestamp: new Date()
      }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Build conversation history
    const conversationHistory = messages.map(m => 
      `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
    ).join('\n') + `\nUser: ${input}`;

    // Detect user's language from their last message
    const userLanguage = /[\u0600-\u06FF]/.test(input) ? 'ar' : 'en';

    // Enhanced municipality mapping for Challenge entity
    const municipalityMapping = municipalities.length > 0 ? `
    Available municipalities (use ID for municipality_id field):
    ${municipalities.map(m => `- ${m.name_en} (ID: ${m.id})`).join('\n')}
    ` : '';

    // Enhanced challenge matching for Solution entity
    const challengeContext = challenges.length > 0 && entityType === 'Solution' ? `
    
    Available Challenges (analyze and match to this solution):
    ${challenges.slice(0, 20).map(c => `
    - Code: ${c.code}
      Title: ${c.title_en}
      Sector: ${c.sector}
      Description: ${c.description_en?.substring(0, 200)}
    `).join('\n')}
    
    Task: Analyze the solution and identify which challenges it could address.
    Return an array of challenge codes that match.
    ` : '';

    const prompt = buildFormAssistantPrompt(conversationHistory, entityType, userLanguage, municipalityMapping, challengeContext);

    const response = await invokeAI({
      prompt,
      response_json_schema: FORM_ASSISTANT_SCHEMA
    });

    const response = await invokeAI({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          response: { type: 'string' },
          has_enough_data: { type: 'boolean' },
          extracted_data: {
            type: 'object',
            properties: {
              title_en: { type: 'string' },
              title_ar: { type: 'string' },
              tagline_en: { type: 'string' },
              tagline_ar: { type: 'string' },
              description_en: { type: 'string' },
              description_ar: { type: 'string' },
              problem_statement_en: { type: 'string' },
              problem_statement_ar: { type: 'string' },
              current_situation_en: { type: 'string' },
              current_situation_ar: { type: 'string' },
              desired_outcome_en: { type: 'string' },
              desired_outcome_ar: { type: 'string' },
              root_cause_en: { type: 'string' },
              root_cause_ar: { type: 'string' },
              root_causes: { type: 'array', items: { type: 'string' } },
              theme: { type: 'string' },
              sector: { type: 'string', enum: ['urban_design', 'transport', 'environment', 'digital_services', 'health', 'education', 'safety', 'economic_development', 'social_services', 'other'] },
              sub_sector: { type: 'string' },
              challenge_type: { type: 'string', enum: ['service_quality', 'infrastructure', 'efficiency', 'innovation', 'safety', 'environmental', 'digital_transformation', 'other'] },
              category: { type: 'string' },
              municipality_id: { type: 'string' },
              city_id: { type: 'string' },
              region_id: { type: 'string' },
              service_id: { type: 'string' },
              affected_services: { type: 'array', items: { type: 'string' } },
              ministry_service: { type: 'string' },
              responsible_agency: { type: 'string' },
              department: { type: 'string' },
              challenge_owner: { type: 'string' },
              challenge_owner_email: { type: 'string' },
              reviewer: { type: 'string' },
              source: { type: 'string' },
              strategic_goal: { type: 'string' },
              entry_date: { type: 'string' },
              processing_date: { type: 'string' },
              priority: { type: 'string', enum: ['tier_1', 'tier_2', 'tier_3', 'tier_4'] },
              track: { type: 'string', enum: ['pilot', 'r_and_d', 'program', 'procurement', 'policy', 'none'] },
              severity_score: { type: 'number' },
              impact_score: { type: 'number' },
              overall_score: { type: 'number' },
              affected_population: { 
                type: 'object',
                properties: {
                  size: { type: 'number' },
                  demographics: { type: 'string' },
                  location: { type: 'string' }
                }
              },
              affected_population_size: { type: 'number' },
              coordinates: {
                type: 'object',
                properties: {
                  latitude: { type: 'number' },
                  longitude: { type: 'number' }
                }
              },
              kpis: { 
                type: 'array', 
                items: { 
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    baseline: { type: 'string' },
                    target: { type: 'string' }
                  }
                }
              },
              stakeholders: { 
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    role: { type: 'string' },
                    involvement: { type: 'string' }
                  }
                }
              },
              data_evidence: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    source: { type: 'string' },
                    value: { type: 'string' },
                    date: { type: 'string' },
                    url: { type: 'string' }
                  }
                }
              },
              constraints: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    description: { type: 'string' }
                  }
                }
              },
              keywords: { type: 'array', items: { type: 'string' } },
              budget_estimate: { type: 'number' },
              timeline_estimate: { type: 'string' },
              related_questions_count: { type: 'number' },
              matched_challenge_codes: { type: 'array', items: { type: 'string' } }
            },
            required: ['title_en', 'title_ar', 'description_en', 'description_ar', 'sector']
          },
          next_questions: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    if (response.success) {
      const result = response.data;
      const assistantMessage = {
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        suggestions: result.next_questions
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update extracted data
      if (result.extracted_data) {
        setExtractedData(prev => ({
          ...(prev || {}),
          ...result.extracted_data
        }));
      }

      // If we have enough data, show completion option
      if (result.has_enough_data) {
        setMessages(prev => [...prev, {
          role: 'system',
          content: 'data_ready',
          timestamp: new Date()
        }]);
      }
    } else {
      toast.error('AI assistant error');
    }
  };

  const handleApplyData = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      toast.success(t({
        en: 'Form auto-filled with AI data!',
        ar: 'تم ملء النموذج تلقائياً بالبيانات الذكية!'
      }));
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={startConversation}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {t({ en: 'Create with AI Chat', ar: 'إنشاء بمحادثة ذكية' })}
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[450px] h-[600px] shadow-2xl z-50 flex flex-col">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {t({ en: 'AI Form Assistant', ar: 'المساعد الذكي للنموذج' })}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx}>
                {msg.role === 'system' && msg.content === 'data_ready' ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-900 mb-3">
                      {t({ en: 'Great! I have enough information to fill the form.', ar: 'رائع! لدي معلومات كافية لملء النموذج.' })}
                    </p>
                    <Button onClick={handleApplyData} className="bg-green-600 hover:bg-green-700">
                      {t({ en: 'Apply to Form', ar: 'تطبيق على النموذج' })}
                    </Button>
                  </div>
                ) : msg.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="bg-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]">
                      <div className="flex items-start gap-2">
                        <Bot className="h-4 w-4 mt-1 text-purple-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-slate-900">{msg.content}</p>
                          {msg.suggestions?.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {msg.suggestions.map((sug, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleSuggestionClick(sug)}
                                  className="block text-xs text-purple-600 hover:text-purple-800 bg-white border border-purple-200 rounded px-2 py-1 w-full text-left"
                                >
                                  {sug}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSend()}
              placeholder={t({ en: 'Type your message...', ar: 'اكتب رسالتك...' })}
              disabled={isProcessing}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}