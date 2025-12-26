import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Paperclip, Send, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useCommunicationHub } from '@/hooks/useCommunicationHub';
import { useSupabaseFileUpload } from '@/hooks/useSupabaseFileUpload';

export default function MessagingEnhancements({ threadId, onSend }) {
  const { t } = useLanguage();
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const { sendMessage } = useCommunicationHub();
  const { upload, isUploading } = useSupabaseFileUpload();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const publicUrl = await upload({ file, bucket: 'communications' });
      setAttachments(prev => [...prev, { name: file.name, url: publicUrl }]);
    } catch (error) {
      console.error('File upload failed:', error);
    }
  };

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;

    // @ts-ignore
    sendMessage.mutate({
      thread_id: threadId,
      content: message,
      metadata: { attachments },
      is_read: false
    }, {
      onSuccess: () => {
        setMessage('');
        setAttachments([]);
        if (onSend) onSend();
      }
    });
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((att, i) => (
                <Badge key={i} variant="outline" className="text-xs flex items-center gap-1 bg-slate-50">
                  <Paperclip className="h-3 w-3" />
                  <span className="max-w-[100px] truncate">{att.name}</span>
                  <button
                    onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                    className="ml-1 text-slate-400 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t({ en: 'Type your message...', ar: 'اكتب رسالتك...' })}
            rows={3}
            className="resize-none"
          />

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <input
                type="file"
                id="file-attach"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <label htmlFor="file-attach">
                <Button variant="outline" size="sm" asChild disabled={isUploading}>
                  <span>
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="h-4 w-4" />
                    )}
                  </span>
                </Button>
              </label>
            </div>

            <Button
              onClick={handleSend}
              disabled={sendMessage.isPending || isUploading || (!message.trim() && attachments.length === 0)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {(sendMessage.isPending || isUploading) ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Send', ar: 'إرسال' })}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}