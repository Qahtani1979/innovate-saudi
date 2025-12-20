import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { ArrowLeft, ArrowRight, CheckCircle2, Plus, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProgramApplicationWizard() {
  const { language, isRTL, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    program_id: '',
    challenge_id: '',
    solution_id: '',
    proposal_summary: '',
    team_members: [{ name: '', role: '', email: '' }]
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['open-programs'],
    queryFn: async () => {
      const all = await base44.entities.Program.list();
      return all.filter(p => p.status === 'open');
    }
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions'],
    queryFn: () => base44.entities.Solution.list()
  });

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.ProgramApplication.create(data),
    onSuccess: () => setStep(4)
  });

  const addTeamMember = () => {
    setFormData({
      ...formData,
      team_members: [...formData.team_members, { name: '', role: '', email: '' }]
    });
  };

  const removeTeamMember = (index) => {
    setFormData({
      ...formData,
      team_members: formData.team_members.filter((_, i) => i !== index)
    });
  };

  const updateTeamMember = (index, field, value) => {
    const updated = [...formData.team_members];
    updated[index][field] = value;
    setFormData({ ...formData, team_members: updated });
  };

  const handleSubmit = () => {
    submitMutation.mutate({ ...formData, status: 'submitted' });
  };

  const progress = (step / 4) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Apply to Program', ar: 'التقديم على برنامج' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Join innovation programs and accelerators', ar: 'انضم للبرامج ومسرعات الابتكار' })}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t({ en: `Step ${step} of 4`, ar: `الخطوة ${step} من 4` })}</span>
              <span className="text-sm text-slate-600">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{t({ en: 'Select Program', ar: 'اختر البرنامج' })}</h2>
              <Select value={formData.program_id} onValueChange={(v) => setFormData({ ...formData, program_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Choose a program...', ar: 'اختر برنامج...' })} />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name_en} ({program.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{t({ en: 'Link Your Work', ar: 'اربط عملك' })}</h2>
              <div>
                <label className="text-sm font-medium">{t({ en: 'Challenge (Optional)', ar: 'التحدي (اختياري)' })}</label>
                <Select value={formData.challenge_id} onValueChange={(v) => setFormData({ ...formData, challenge_id: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t({ en: 'Select challenge...', ar: 'اختر تحدي...' })} />
                  </SelectTrigger>
                  <SelectContent>
                    {challenges.slice(0, 20).map((challenge) => (
                      <SelectItem key={challenge.id} value={challenge.id}>
                        {challenge.code} - {challenge.title_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">{t({ en: 'Solution (Optional)', ar: 'الحل (اختياري)' })}</label>
                <Select value={formData.solution_id} onValueChange={(v) => setFormData({ ...formData, solution_id: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t({ en: 'Select solution...', ar: 'اختر حل...' })} />
                  </SelectTrigger>
                  <SelectContent>
                    {solutions.slice(0, 20).map((solution) => (
                      <SelectItem key={solution.id} value={solution.id}>
                        {solution.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">{t({ en: 'Proposal Summary', ar: 'ملخص المقترح' })}</label>
                <Textarea
                  value={formData.proposal_summary}
                  onChange={(e) => setFormData({ ...formData, proposal_summary: e.target.value })}
                  rows={5}
                  className="mt-1"
                  placeholder={t({ en: 'Describe your approach...', ar: 'اشرح نهجك...' })}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{t({ en: 'Team Members', ar: 'أعضاء الفريق' })}</h2>
                <Button variant="outline" size="sm" onClick={addTeamMember}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t({ en: 'Add', ar: 'إضافة' })}
                </Button>
              </div>
              {formData.team_members.map((member, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t({ en: `Member ${index + 1}`, ar: `عضو ${index + 1}` })}</span>
                    {formData.team_members.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeTeamMember(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder={t({ en: 'Name', ar: 'الاسم' })}
                    value={member.name}
                    onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder={t({ en: 'Role', ar: 'الدور' })}
                    value={member.role}
                    onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                  />
                  <Input
                    type="email"
                    placeholder={t({ en: 'Email', ar: 'البريد' })}
                    value={member.email}
                    onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-12">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {t({ en: 'Application Submitted!', ar: 'تم تقديم الطلب!' })}
              </h2>
              <p className="text-slate-600">
                {t({ en: 'We will review your application and contact you', ar: 'سنراجع طلبك ونتواصل معك' })}
              </p>
            </div>
          )}

          {step < 4 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t({ en: 'Back', ar: 'السابق' })}
              </Button>
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)}>
                  {t({ en: 'Next', ar: 'التالي' })}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-gradient-to-r from-blue-600 to-teal-600">
                  {t({ en: 'Submit Application', ar: 'تقديم الطلب' })}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}