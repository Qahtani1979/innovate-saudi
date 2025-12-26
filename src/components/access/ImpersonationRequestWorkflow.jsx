import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { UserCog, Send } from 'lucide-react';

export default function ImpersonationRequestWorkflow({ onSubmit }) {
  const { language, isRTL, t } = useLanguage();
  const [request, setRequest] = useState({
    target_user: '',
    reason: '',
    duration_minutes: 30
  });

  const pendingRequests = [
    { id: 1, requester: 'admin@example.com', target: 'user@example.com', reason: 'Support ticket', status: 'pending', requested: '2025-01-20 10:30' },
    { id: 2, requester: 'admin2@example.com', target: 'user2@example.com', reason: 'Investigation', status: 'approved', requested: '2025-01-19 14:00' }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-2 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-indigo-600" />
            {t({ en: 'Request Impersonation', ar: 'طلب انتحال' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">{t({ en: 'Target User Email', ar: 'بريد المستخدم المستهدف' })}</label>
            <Input
              value={request.target_user}
              onChange={(e) => setRequest({...request, target_user: e.target.value})}
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t({ en: 'Reason', ar: 'السبب' })}</label>
            <Textarea
              value={request.reason}
              onChange={(e) => setRequest({...request, reason: e.target.value})}
              placeholder={t({ en: 'Why do you need to impersonate this user?', ar: 'لماذا تحتاج لانتحال هذا المستخدم؟' })}
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t({ en: 'Duration (minutes)', ar: 'المدة (دقائق)' })}</label>
            <Select 
              value={request.duration_minutes.toString()} 
              onValueChange={(v) => setRequest({...request, duration_minutes: parseInt(v)})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => onSubmit?.(request)} className="w-full bg-indigo-600">
            <Send className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Submit Request', ar: 'إرسال الطلب' })}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Pending Requests', ar: 'الطلبات المعلقة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div key={req.id} className="p-3 bg-slate-50 rounded-lg border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{req.requester} → {req.target}</p>
                    <p className="text-xs text-slate-600 mt-1">{req.reason}</p>
                    <p className="text-xs text-slate-500 mt-2">{req.requested}</p>
                  </div>
                  <Badge className={
                    req.status === 'approved' ? 'bg-green-600' :
                    req.status === 'denied' ? 'bg-red-600' : 'bg-amber-600'
                  }>
                    {req.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
