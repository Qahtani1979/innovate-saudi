import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { Send, Search, User } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function Messaging() {
  const { language, isRTL, t } = useLanguage();
  const [selectedThread, setSelectedThread] = useState(null);
  const [messageText, setMessageText] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const { data } = await supabase.from('messages').select('*');
      return data || [];
    }
  });

  const sendMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from('messages').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      setMessageText('');
    }
  });

  const threads = {};
  messages.forEach(msg => {
    const threadKey = msg.thread_id || msg.recipient_email || 'general';
    if (!threads[threadKey]) threads[threadKey] = [];
    threads[threadKey].push(msg);
  });

  return (
    <div className="h-[calc(100vh-8rem)]" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Messages', ar: 'الرسائل' })}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">{t({ en: 'Conversations', ar: 'المحادثات' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input placeholder={t({ en: 'Search...', ar: 'بحث...' })} className={isRTL ? 'pr-10' : 'pl-10'} />
            </div>
            <div className="space-y-2">
              {Object.keys(threads).map((threadKey) => (
                <div
                  key={threadKey}
                  onClick={() => setSelectedThread(threadKey)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedThread === threadKey ? 'bg-blue-100 border-2 border-blue-300' : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 truncate">{threadKey}</p>
                      <p className="text-xs text-slate-500 truncate">{threads[threadKey][0]?.content?.substring(0, 30)}...</p>
                    </div>
                    {threads[threadKey].some(m => !m.read && m.recipient_email === user?.email) && (
                      <div className="h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedThread || t({ en: 'Select a conversation', ar: 'اختر محادثة' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {selectedThread && threads[selectedThread]?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_email === user?.email ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] p-3 rounded-lg ${
                    msg.sender_email === user?.email
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.created_date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {selectedThread && (
              <div className="flex gap-2">
                <Textarea
                  placeholder={t({ en: 'Type a message...', ar: 'اكتب رسالة...' })}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                <Button
                  onClick={() => sendMutation.mutate({
                    thread_id: selectedThread,
                    content: messageText,
                    sender_email: user?.email
                  })}
                  disabled={!messageText}
                  className="bg-blue-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProtectedPage(Messaging, { requiredPermissions: [] });