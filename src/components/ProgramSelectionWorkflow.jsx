import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from './LanguageContext';
import { Award, CheckCircle2, X, Loader2, Mail, XCircle } from 'lucide-react';

import { useProgramApplications } from '@/hooks/useProgramDetails';
import { useProgramMutations } from '@/hooks/useProgramMutations';

export default function ProgramSelectionWorkflow({ program, onClose }) {
  const { t, isRTL } = useLanguage();

  const { data: applications = [] } = useProgramApplications(program?.id);
  const { finalizeSelection, isFinalizing } = useProgramMutations();

  const [selected, setSelected] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [rejectionMessage, setRejectionMessage] = useState('');

  const handleFinalize = async () => {
    try {
      await finalizeSelection.mutateAsync({
        programId: program.id,
        selectedIds: selected,
        rejectedIds: rejected,
        rejectionMessage
      });
      onClose();
    } catch (error) {
      // toast is handled by hook
    }
  };

  const toggleSelect = (appId) => {
    if (selected.includes(appId)) {
      setSelected(selected.filter(id => id !== appId));
    } else {
      setSelected([...selected, appId]);
      setRejected(rejected.filter(id => id !== appId));
    }
  };

  const toggleReject = (appId) => {
    if (rejected.includes(appId)) {
      setRejected(rejected.filter(id => id !== appId));
    } else {
      setRejected([...rejected, appId]);
      setSelected(selected.filter(id => id !== appId));
    }
  };

  const sortedApplications = [...applications].sort((a, b) =>
    (b.ai_score || 0) - (a.ai_score || 0)
  );

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-green-600" />
          {t({ en: 'Program Selection', ar: 'اختيار البرنامج' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">{program?.name_en}</p>
              <p className="text-xs text-slate-600 mt-1">
                {applications.length} applications • Max: {program?.target_participants?.max_participants || 'N/A'}
              </p>
            </div>
            <div className="text-right">
              <Badge className="bg-green-100 text-green-700">{selected.length} accepted</Badge>
              <Badge className="bg-red-100 text-red-700 ml-2">{rejected.length} rejected</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedApplications.map((app) => (
            <div key={app.id} className={`p-4 border rounded-lg ${selected.includes(app.id) ? 'border-green-400 bg-green-50' :
              rejected.includes(app.id) ? 'border-red-400 bg-red-50' :
                'bg-white'
              }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{app.applicant_name}</p>
                  <p className="text-xs text-slate-600">{app.organization_name} • {app.organization_type}</p>
                  {app.ai_score && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-purple-100 text-purple-700 text-xs">
                        AI Score: {app.ai_score}
                      </Badge>
                      <Badge className={`text-xs ${app.ai_recommendation === 'accept' ? 'bg-green-100 text-green-700' :
                        app.ai_recommendation === 'waitlist' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {app.ai_recommendation}
                      </Badge>
                    </div>
                  )}
                  {app.ai_reasoning && (
                    <p className="text-xs text-slate-600 italic mt-1">{app.ai_reasoning}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selected.includes(app.id) ? 'default' : 'outline'}
                    onClick={() => toggleSelect(app.id)}
                    className={selected.includes(app.id) ? 'bg-green-600' : ''}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {t({ en: 'Accept', ar: 'قبول' })}
                  </Button>
                  <Button
                    size="sm"
                    variant={rejected.includes(app.id) ? 'default' : 'outline'}
                    onClick={() => toggleReject(app.id)}
                    className={rejected.includes(app.id) ? 'bg-red-600' : ''}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    {t({ en: 'Reject', ar: 'رفض' })}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {rejected.length > 0 && (
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              {t({ en: 'Rejection Message (sent to all rejected)', ar: 'رسالة الرفض (ترسل لجميع المرفوضين)' })}
            </label>
            <Textarea
              placeholder={t({ en: 'Optional message...', ar: 'رسالة اختيارية...' })}
              value={rejectionMessage}
              onChange={(e) => setRejectionMessage(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleFinalize}
            disabled={selected.length === 0 || isFinalizing}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isFinalizing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Finalize & Notify', ar: 'إنهاء وإخطار' })}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
