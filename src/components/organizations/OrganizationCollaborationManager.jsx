import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Users, Send, FileText, CheckCircle2, Clock, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function OrganizationCollaborationManager({ organizationId }) {
  const { language, isRTL, t } = useLanguage();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    partner: '',
    initiative: '',
    description: '',
    role: ''
  });

  // Mock data
  const collaborations = [
    {
      id: 1,
      initiative_en: 'Smart City Data Platform',
      initiative_ar: 'منصة بيانات المدينة الذكية',
      partner_en: 'Riyadh Municipality',
      partner_ar: 'أمانة الرياض',
      status: 'active',
      role_en: 'Technology Provider',
      role_ar: 'مزود التقنية',
      startDate: '2024-06-15',
      mou: true
    },
    {
      id: 2,
      initiative_en: 'Urban Forestry Research',
      initiative_ar: 'بحث التحريج الحضري',
      partner_en: 'King Abdullah University',
      partner_ar: 'جامعة الملك عبدالله',
      status: 'active',
      role_en: 'Implementation Partner',
      role_ar: 'شريك التنفيذ',
      startDate: '2024-08-01',
      mou: true
    },
    {
      id: 3,
      initiative_en: 'Public Transport Optimization',
      initiative_ar: 'تحسين النقل العام',
      partner_en: 'Jeddah Municipality',
      partner_ar: 'أمانة جدة',
      status: 'proposal',
      role_en: 'AI Solution Provider',
      role_ar: 'مزود حلول الذكاء الاصطناعي',
      proposalDate: '2025-01-10'
    }
  ];

  const invitations = [
    {
      id: 1,
      from_en: 'Dammam Municipality',
      from_ar: 'أمانة الدمام',
      initiative_en: 'Waste Management Innovation',
      initiative_ar: 'ابتكار إدارة النفايات',
      date: '2025-01-20',
      status: 'pending'
    },
    {
      id: 2,
      from_en: 'Innovation Lab Riyadh',
      from_ar: 'مختبر الابتكار الرياض',
      initiative_en: 'Civic Tech Accelerator',
      initiative_ar: 'مسرع التقنية المدنية',
      date: '2025-01-18',
      status: 'pending'
    }
  ];

  const handleSendInvite = () => {
    toast.success(t({ en: 'Invitation sent successfully', ar: 'تم إرسال الدعوة بنجاح' }));
    setShowInviteForm(false);
    setInviteData({ partner: '', initiative: '', description: '', role: '' });
  };

  const handleAcceptInvitation = (id) => {
    toast.success(t({ en: 'Invitation accepted', ar: 'تم قبول الدعوة' }));
  };

  const handleRejectInvitation = (id) => {
    toast.success(t({ en: 'Invitation declined', ar: 'تم رفض الدعوة' }));
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with Action */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {t({ en: 'Collaboration Management', ar: 'إدارة التعاون' })}
        </h2>
        <Button onClick={() => setShowInviteForm(!showInviteForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {t({ en: 'Invite Partner', ar: 'دعوة شريك' })}
        </Button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <Card className="border-2 border-blue-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              {t({ en: 'New Collaboration Invitation', ar: 'دعوة تعاون جديدة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t({ en: 'Partner Organization', ar: 'المنظمة الشريكة' })}</label>
                <Input
                  value={inviteData.partner}
                  onChange={(e) => setInviteData({ ...inviteData, partner: e.target.value })}
                  placeholder={t({ en: 'Select or search partner...', ar: 'اختر أو ابحث عن شريك...' })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t({ en: 'Initiative Name', ar: 'اسم المبادرة' })}</label>
                <Input
                  value={inviteData.initiative}
                  onChange={(e) => setInviteData({ ...inviteData, initiative: e.target.value })}
                  placeholder={t({ en: 'Enter initiative name...', ar: 'أدخل اسم المبادرة...' })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t({ en: 'Partner Role', ar: 'دور الشريك' })}</label>
                <Input
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  placeholder={t({ en: 'e.g., Technology Provider', ar: 'مثال: مزود التقنية' })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t({ en: 'Description', ar: 'الوصف' })}</label>
                <Textarea
                  value={inviteData.description}
                  onChange={(e) => setInviteData({ ...inviteData, description: e.target.value })}
                  placeholder={t({ en: 'Describe the collaboration opportunity...', ar: 'اشرح فرصة التعاون...' })}
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSendInvite} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  {t({ en: 'Send Invitation', ar: 'إرسال الدعوة' })}
                </Button>
                <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                  {t({ en: 'Cancel', ar: 'إلغاء' })}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              {t({ en: 'Pending Invitations', ar: 'دعوات معلقة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invite) => (
                <div key={invite.id} className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{language === 'ar' ? invite.initiative_ar : invite.initiative_en}</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {t({ en: 'From', ar: 'من' })}: {language === 'ar' ? invite.from_ar : invite.from_en}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(invite.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAcceptInvitation(invite.id)}>
                        {t({ en: 'Accept', ar: 'قبول' })}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRejectInvitation(invite.id)}>
                        {t({ en: 'Decline', ar: 'رفض' })}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Collaborations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            {t({ en: 'Active Collaborations', ar: 'التعاونات النشطة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {collaborations.filter(c => c.status === 'active').map((collab) => (
              <div key={collab.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{language === 'ar' ? collab.initiative_ar : collab.initiative_en}</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      {t({ en: 'Partner', ar: 'الشريك' })}: {language === 'ar' ? collab.partner_ar : collab.partner_en}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {t({ en: 'Active', ar: 'نشط' })}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">{t({ en: 'Role', ar: 'الدور' })}:</span>
                    <span className="font-medium ml-2">{language === 'ar' ? collab.role_ar : collab.role_en}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">{t({ en: 'Since', ar: 'منذ' })}:</span>
                    <span className="font-medium ml-2">{new Date(collab.startDate).toLocaleDateString()}</span>
                  </div>
                  {collab.mou && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      MOU
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Proposals */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Collaboration Proposals', ar: 'مقترحات التعاون' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {collaborations.filter(c => c.status === 'proposal').map((collab) => (
              <div key={collab.id} className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{language === 'ar' ? collab.initiative_ar : collab.initiative_en}</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      {language === 'ar' ? collab.partner_ar : collab.partner_en} • {language === 'ar' ? collab.role_ar : collab.role_en}
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    {t({ en: 'Proposal', ar: 'مقترح' })}
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
