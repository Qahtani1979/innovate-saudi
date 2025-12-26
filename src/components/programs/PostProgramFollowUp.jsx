import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, Send, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { useProgramApplications } from '@/hooks/useProgramDetails';
import { useFollowUpMutations } from '@/hooks/useFollowUp';

export default function PostProgramFollowUp({ program }) {
  const { t, isRTL } = useLanguage();
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [followUpData, setFollowUpData] = useState({
    months_after: 3,
    pilots_launched: 0,
    jobs_created: 0,
    funding_raised: 0,
    still_active: true,
    feedback: '',
    impact_story: ''
  });

  // Fetch accepted applications
  const { data: applications = [] } = useProgramApplications(program.id);
  // Note: Original code filtered by status='accepted', useProgramApplications fetches all?
  // Checking useProgramDetails hook logic might be needed, but usually it fetches all.
  // We can filter here.
  const acceptedApplications = applications.filter(app => app.status === 'accepted');

  const { updateFollowUp } = useFollowUpMutations(program.id);

  const handleUpdate = () => {
    updateFollowUp.mutate({
      program,
      followUpData,
      selectedParticipant
    }, {
      onSuccess: () => {
        setSelectedParticipant(null);
      }
    });
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          {t({ en: 'Post-Program Impact Tracking', ar: 'تتبع الأثر بعد البرنامج' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Program Outcomes Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">{program.outcomes?.pilots_generated || 0}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Pilots Launched', ar: 'تجارب أطلقت' })}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">{program.outcomes?.partnerships_formed || 0}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Partnerships', ar: 'شراكات' })}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-600">{program.outcomes?.solutions_deployed || 0}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Solutions', ar: 'حلول' })}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-amber-600">{applications.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Participants', ar: 'مشاركون' })}</p>
          </div>
        </div>

        {/* Participant List for Follow-up */}
        <div>
          <h4 className="font-semibold text-sm mb-3">{t({ en: 'Participant Follow-Up', ar: 'متابعة المشاركين' })}</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {acceptedApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-900">{app.organization_name}</p>
                  <p className="text-xs text-slate-500">{app.contact_email}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedParticipant(app)}
                >
                  {t({ en: 'Follow Up', ar: 'متابعة' })}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-up Form */}
        {selectedParticipant && (
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-blue-900">
                {t({ en: 'Follow-up Form', ar: 'نموذج المتابعة' })}: {selectedParticipant.organization_name}
              </h4>
              <Button variant="ghost" size="icon" onClick={() => setSelectedParticipant(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600">{t({ en: 'Months After Program', ar: 'أشهر بعد البرنامج' })}</label>
                <Input
                  type="number"
                  value={followUpData.months_after}
                  onChange={(e) => setFollowUpData({ ...followUpData, months_after: parseInt(e.target.value) })}
                  className="bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">{t({ en: 'Pilots Launched', ar: 'تجارب أطلقت' })}</label>
                <Input
                  type="number"
                  value={followUpData.pilots_launched}
                  onChange={(e) => setFollowUpData({ ...followUpData, pilots_launched: parseInt(e.target.value) })}
                  className="bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">{t({ en: 'Jobs Created', ar: 'وظائف أُنشئت' })}</label>
                <Input
                  type="number"
                  value={followUpData.jobs_created}
                  onChange={(e) => setFollowUpData({ ...followUpData, jobs_created: parseInt(e.target.value) })}
                  className="bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">{t({ en: 'Funding Raised (SAR)', ar: 'تمويل حُصِّل' })}</label>
                <Input
                  type="number"
                  value={followUpData.funding_raised}
                  onChange={(e) => setFollowUpData({ ...followUpData, funding_raised: parseInt(e.target.value) })}
                  className="bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 mb-1 block">{t({ en: 'Impact Story', ar: 'قصة الأثر' })}</label>
              <Textarea
                value={followUpData.impact_story}
                onChange={(e) => setFollowUpData({ ...followUpData, impact_story: e.target.value })}
                rows={3}
                className="bg-white"
                placeholder={t({ en: 'Share success story...', ar: 'شارك قصة النجاح...' })}
              />
            </div>

            <Button
              onClick={handleUpdate}
              disabled={updateFollowUp.isPending}
              className="w-full gap-2"
            >
              {updateFollowUp.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t({ en: 'Save & Send Follow-Up', ar: 'حفظ وإرسال المتابعة' })}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}