import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { CheckCircle2, XCircle, Clock, TestTube, Calendar, Microscope } from 'lucide-react';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { useProgramsWithVisibility } from '@/hooks/useProgramsWithVisibility';
import { useRDCalls } from '@/hooks/useRDCalls';
import { useInitiativeLaunchMutations } from '@/hooks/useInitiativeLaunchMutations';

export default function InitiativeLaunchGate() {
  const { language, isRTL, t } = useLanguage();
  const [selectedItem, setSelectedItem] = useState(null);
  const [comments, setComments] = useState('');

  const { data: pilots = [] } = usePilotsWithVisibility();
  const { data: programs = [] } = useProgramsWithVisibility();
  const { data: rdCalls = [] } = useRDCalls();

  const { launchMutation } = useInitiativeLaunchMutations();

  const pendingPilots = pilots.filter(p => p.launch_status === 'pending_approval');
  const pendingPrograms = programs.filter(p => p.launch_status === 'pending_approval');
  const pendingCalls = rdCalls.filter(c => c.launch_status === 'pending_approval');

  const allPending = [
    ...pendingPilots.map(p => ({ type: 'pilot', data: p, icon: TestTube })),
    ...pendingPrograms.map(p => ({ type: 'program', data: p, icon: Calendar })),
    ...pendingCalls.map(c => ({ type: 'rd_call', data: c, icon: Microscope }))
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '🚀 Initiative Launch Gate', ar: '🚀 بوابة إطلاق المبادرات' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Final approval before launching pilots, programs, and R&D calls', ar: 'الموافقة النهائية قبل إطلاق التجارب والبرامج ودعوات البحث' })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-10 w-10 text-yellow-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-yellow-600">{allPending.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Pending Launch', ar: 'معلق للإطلاق' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {[...pilots, ...programs, ...rdCalls].filter(i => i.launch_status === 'approved').length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Launched', ar: 'تم الإطلاق' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <XCircle className="h-10 w-10 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">
              {[...pilots, ...programs, ...rdCalls].filter(i => i.launch_status === 'rejected').length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Rejected', ar: 'مرفوض' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Pending Launch Approvals', ar: 'موافقات الإطلاق المعلقة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          {allPending.length === 0 ? (
            <p className="text-center text-slate-500 py-8">{t({ en: 'No pending launches', ar: 'لا توجد إطلاقات معلقة' })}</p>
          ) : (
            <div className="space-y-4">
              {allPending.map((item, idx) => {
                const Icon = item.icon;
                const title = item.type === 'pilot' ? item.data.title_en : item.data.name_en;
                const titleAr = item.type === 'pilot' ? item.data.title_ar : item.data.name_ar;

                return (
                  <Card key={idx} className="border-2 border-yellow-200">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="h-5 w-5 text-blue-600" />
                            <Badge>{item.type}</Badge>
                            <Badge variant="outline">{item.data.code}</Badge>
                          </div>
                          <h3 className="font-bold text-lg">{language === 'ar' ? titleAr : title}</h3>
                          {selectedItem === `${item.type}-${item.data.id}` && (
                            <div className="mt-4 space-y-3">
                              <Textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder={t({ en: 'Comments...', ar: 'تعليقات...' })}
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    launchMutation.mutate(
                                      { entity_type: item.type, entity_id: item.data.id, action: 'approve', comments },
                                      {
                                        onSuccess: () => {
                                          setSelectedItem(null);
                                          setComments('');
                                        }
                                      }
                                    );
                                  }}
                                  className="bg-green-600"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  {t({ en: 'Approve Launch', ar: 'موافقة الإطلاق' })}
                                </Button>
                                <Button
                                  onClick={() => {
                                    launchMutation.mutate(
                                      { entity_type: item.type, entity_id: item.data.id, action: 'reject', comments },
                                      {
                                        onSuccess: () => {
                                          setSelectedItem(null);
                                          setComments('');
                                        }
                                      }
                                    );
                                  }}
                                  variant="destructive"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  {t({ en: 'Reject', ar: 'رفض' })}
                                </Button>
                                <Button variant="outline" onClick={() => { setSelectedItem(null); setComments(''); }}>
                                  {t({ en: 'Cancel', ar: 'إلغاء' })}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        {!selectedItem && (
                          <Button onClick={() => setSelectedItem(`${item.type}-${item.data.id}`)} variant="outline">
                            {t({ en: 'Review', ar: 'مراجعة' })}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
