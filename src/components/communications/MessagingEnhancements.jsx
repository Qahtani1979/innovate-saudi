import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tantml:react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Paperclip, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function MessagingEnhancements({ threadId, onSend }) {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);

  const sendMutation = useMutation({
    mutationFn: async (data) => {
      const newMessage = await base44.entities.Message.create({
        thread_id: threadId,
        content: data.content,
        attachments: data.attachments,
        read_status: false
      });
      return newMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages', threadId]);
      setMessage('');
      setAttachments([]);
      if (onSend) onSend();
      toast.success(t({ en: 'Message sent', ar: 'الرسالة أُرسلت' }));
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAttachments(prev => [...prev, { name: file.name, url: file_url }]);
      toast.success(t({ en: 'File attached', ar: 'الملف مُرفق' }));
    } catch (error) {
      toast.error(t({ en: 'Upload failed', ar: 'فشل الرفع' }));
    }
  };

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;
    sendMutation.mutate({ content: message, attachments });
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((att, i) => (
                <Badge key={i} variant="outline" className="text-xs flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  {att.name}
                  <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="ml-1 text-red-600">×</button>
                </Badge>
              ))}
            </div>
          )}

          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t({ en: 'Type your message...', ar: 'اكتب رسالتك...' })}
            rows={3}
          />

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <input
                type="file"
                id="file-attach"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-attach">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Paperclip className="h-4 w-4" />
                  </span>
                </Button>
              </label>
            </div>

            <Button onClick={handleSend} disabled={sendMutation.isPending || (!message.trim() && attachments.length === 0)} className="bg-blue-600">
              <Send className="h-4 w-4 mr-2" />
              {t({ en: 'Send', ar: 'إرسال' })}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}