import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function WhatsAppNotifier({ challenge }) {
  const [phoneNumber, setPhoneNumber] = useState(challenge.owner_phone || '');
  const [isSending, setIsSending] = useState(false);

  const sendWhatsAppUpdate = async () => {
    setIsSending(true);
    try {
      const message = `🚨 Challenge Update\n\n${challenge.code}: ${challenge.title_en}\n\nStatus: ${challenge.status}\nPriority: ${challenge.priority}\n\nView: ${window.location.origin}/ChallengeDetail?id=${challenge.id}`;
      
      // In production, this would call WhatsApp Business API
      // For now, open WhatsApp web with pre-filled message
      const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      toast.success('WhatsApp opened with pre-filled message');
    } catch (error) {
      toast.error('Failed to send WhatsApp notification');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="border-2 border-green-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          WhatsApp Notification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            Phone Number
          </label>
          <Input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+966 50 123 4567"
          />
        </div>

        <Button
          onClick={sendWhatsAppUpdate}
          disabled={!phoneNumber || isSending}
          className="w-full bg-green-600"
        >
          {isSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <MessageCircle className="h-4 w-4 mr-2" />
          Send WhatsApp Update
        </Button>
      </CardContent>
    </Card>
  );
}
