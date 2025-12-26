import { useState } from 'react';
// import { supabase } from '@/integrations/supabase/client';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRDMutations } from '@/hooks/useRDMutations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { Award, Plus, DollarSign, Shield, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function IPManagementWidget({ project }) {
  const { language, isRTL, t } = useLanguage();
  const { updateProject } = useRDMutations();
  // const queryClient = useQueryClient();
  const [showAddPatent, setShowAddPatent] = useState(false);
  const [showAddLicense, setShowAddLicense] = useState(false);
  const [editingPatent, setEditingPatent] = useState(null);
  const [patentData, setPatentData] = useState({
    title: '',
    number: '',
    status: 'filed',
    filing_date: '',
    grant_date: '',
    jurisdiction: 'Saudi Arabia'
  });
  const [licenseData, setLicenseData] = useState({
    licensee: '',
    patent_title: '',
    license_type: 'exclusive',
    start_date: '',
    end_date: '',
    royalty_rate: 0,
    agreement_url: ''
  });

  const handleUpdateSuccess = () => {
    setShowAddPatent(false);
    setShowAddLicense(false);
    setEditingPatent(null);
    setPatentData({ title: '', number: '', status: 'filed', filing_date: '', grant_date: '', jurisdiction: 'Saudi Arabia' });
    setLicenseData({ licensee: '', patent_title: '', license_type: 'exclusive', start_date: '', end_date: '', royalty_rate: 0, agreement_url: '' });
  };

  const handleAddPatent = () => {
    const patents = [...(project.patents || []), patentData];
    updateProject.mutate({ id: project.id, data: { patents } }, { onSuccess: handleUpdateSuccess });
  };

  const handleUpdatePatent = () => {
    const patents = project.patents.map((p, i) =>
      i === editingPatent ? patentData : p
    );
    updateProject.mutate({ id: project.id, data: { patents } }, { onSuccess: handleUpdateSuccess });
  };

  const handleDeletePatent = (index) => {
    const patents = project.patents.filter((_, i) => i !== index);
    updateProject.mutate({ id: project.id, data: { patents } }, { onSuccess: handleUpdateSuccess });
  };

  const handleAddLicense = () => {
    const licenses = [...(project.ip_licenses || []), licenseData];
    updateProject.mutate({ id: project.id, data: { ip_licenses: licenses } }, { onSuccess: handleUpdateSuccess });
  };

  const patents = project.patents || [];
  const licenses = project.ip_licenses || [];

  const statusColors = {
    filed: 'bg-blue-100 text-blue-700',
    pending: 'bg-yellow-100 text-yellow-700',
    granted: 'bg-green-100 text-green-700',
    expired: 'bg-slate-100 text-slate-700',
    rejected: 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Patents Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-amber-600" />
            {t({ en: 'Patents Portfolio', ar: 'محفظة براءات الاختراع' })}
          </CardTitle>
          <Button onClick={() => setShowAddPatent(true)} size="sm" className="bg-amber-600">
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Add Patent', ar: 'إضافة براءة' })}
          </Button>
        </CardHeader>
        <CardContent>
          {patents.length > 0 ? (
            <div className="space-y-3">
              {patents.map((patent, i) => (
                <div key={i} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{patent.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{patent.number}</Badge>
                        <Badge className={statusColors[patent.status]}>{patent.status}</Badge>
                        {patent.jurisdiction && <Badge variant="outline">{patent.jurisdiction}</Badge>}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        {patent.filing_date && <span>{t({ en: 'Filed', ar: 'مودع' })}: {patent.filing_date}</span>}
                        {patent.grant_date && <span className="ml-3">{t({ en: 'Granted', ar: 'ممنوح' })}: {patent.grant_date}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => {
                        setPatentData(patent);
                        setEditingPatent(i);
                        setShowAddPatent(true);
                      }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeletePatent(i)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">{t({ en: 'No patents filed yet', ar: 'لا توجد براءات بعد' })}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patent Form Modal */}
      {showAddPatent && (
        <Card className="border-2 border-amber-200">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingPatent !== null ? t({ en: 'Edit Patent', ar: 'تعديل البراءة' }) : t({ en: 'Add Patent', ar: 'إضافة براءة' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t({ en: 'Patent Title', ar: 'عنوان البراءة' })}</Label>
              <Input value={patentData.title} onChange={(e) => setPatentData({ ...patentData, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t({ en: 'Patent Number', ar: 'رقم البراءة' })}</Label>
                <Input value={patentData.number} onChange={(e) => setPatentData({ ...patentData, number: e.target.value })} />
              </div>
              <div>
                <Label>{t({ en: 'Jurisdiction', ar: 'النطاق القضائي' })}</Label>
                <Input value={patentData.jurisdiction} onChange={(e) => setPatentData({ ...patentData, jurisdiction: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t({ en: 'Filing Date', ar: 'تاريخ الإيداع' })}</Label>
                <Input type="date" value={patentData.filing_date} onChange={(e) => setPatentData({ ...patentData, filing_date: e.target.value })} />
              </div>
              <div>
                <Label>{t({ en: 'Grant Date', ar: 'تاريخ المنح' })}</Label>
                <Input type="date" value={patentData.grant_date} onChange={(e) => setPatentData({ ...patentData, grant_date: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>{t({ en: 'Status', ar: 'الحالة' })}</Label>
              <Select value={patentData.status} onValueChange={(v) => setPatentData({ ...patentData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="filed">{t({ en: 'Filed', ar: 'مودع' })}</SelectItem>
                  <SelectItem value="pending">{t({ en: 'Pending Review', ar: 'قيد المراجعة' })}</SelectItem>
                  <SelectItem value="granted">{t({ en: 'Granted', ar: 'ممنوح' })}</SelectItem>
                  <SelectItem value="expired">{t({ en: 'Expired', ar: 'منتهي' })}</SelectItem>
                  <SelectItem value="rejected">{t({ en: 'Rejected', ar: 'مرفوض' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => {
                setShowAddPatent(false);
                setEditingPatent(null);
                setPatentData({ title: '', number: '', status: 'filed', filing_date: '', grant_date: '', jurisdiction: 'Saudi Arabia' });
              }} className="flex-1">
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              <Button onClick={editingPatent !== null ? handleUpdatePatent : handleAddPatent} className="flex-1 bg-amber-600" disabled={!patentData.title}>
                {editingPatent !== null ? t({ en: 'Update', ar: 'تحديث' }) : t({ en: 'Add', ar: 'إضافة' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Licensing Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-blue-600" />
            {t({ en: 'Active Licenses', ar: 'التراخيص النشطة' })}
          </CardTitle>
          <Button onClick={() => setShowAddLicense(true)} size="sm" className="bg-blue-600">
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Add License', ar: 'إضافة ترخيص' })}
          </Button>
        </CardHeader>
        <CardContent>
          {licenses.length > 0 ? (
            <div className="space-y-3">
              {licenses.map((license, i) => (
                <div key={i} className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{license.licensee}</p>
                      <p className="text-sm text-slate-600 mt-1">{license.patent_title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-blue-100 text-blue-700">{license.license_type}</Badge>
                        {license.royalty_rate && (
                          <Badge variant="outline">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {license.royalty_rate}% royalty
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        {license.start_date} - {license.end_date}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">{t({ en: 'No licenses issued yet', ar: 'لا توجد تراخيص بعد' })}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* License Form Modal */}
      {showAddLicense && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">{t({ en: 'Add License Agreement', ar: 'إضافة اتفاقية ترخيص' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t({ en: 'Licensee Organization', ar: 'المنظمة المرخصة' })}</Label>
              <Input value={licenseData.licensee} onChange={(e) => setLicenseData({ ...licenseData, licensee: e.target.value })} />
            </div>
            <div>
              <Label>{t({ en: 'Patent/Technology', ar: 'البراءة/التقنية' })}</Label>
              <Input value={licenseData.patent_title} onChange={(e) => setLicenseData({ ...licenseData, patent_title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t({ en: 'License Type', ar: 'نوع الترخيص' })}</Label>
                <Select value={licenseData.license_type} onValueChange={(v) => setLicenseData({ ...licenseData, license_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exclusive">{t({ en: 'Exclusive', ar: 'حصري' })}</SelectItem>
                    <SelectItem value="non_exclusive">{t({ en: 'Non-Exclusive', ar: 'غير حصري' })}</SelectItem>
                    <SelectItem value="sole">{t({ en: 'Sole License', ar: 'ترخيص وحيد' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t({ en: 'Royalty Rate (%)', ar: 'نسبة العائد (%)' })}</Label>
                <Input type="number" min="0" max="100" value={licenseData.royalty_rate} onChange={(e) => setLicenseData({ ...licenseData, royalty_rate: parseFloat(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t({ en: 'Start Date', ar: 'تاريخ البداية' })}</Label>
                <Input type="date" value={licenseData.start_date} onChange={(e) => setLicenseData({ ...licenseData, start_date: e.target.value })} />
              </div>
              <div>
                <Label>{t({ en: 'End Date', ar: 'تاريخ النهاية' })}</Label>
                <Input type="date" value={licenseData.end_date} onChange={(e) => setLicenseData({ ...licenseData, end_date: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>{t({ en: 'Agreement URL', ar: 'رابط الاتفاقية' })}</Label>
              <Input value={licenseData.agreement_url} onChange={(e) => setLicenseData({ ...licenseData, agreement_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowAddLicense(false)} className="flex-1">
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              <Button onClick={handleAddLicense} className="flex-1 bg-blue-600" disabled={!licenseData.licensee || !licenseData.patent_title}>
                {t({ en: 'Add License', ar: 'إضافة ترخيص' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* IP Summary Stats */}
      {(patents.length > 0 || licenses.length > 0) && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-600">{patents.length}</p>
                <p className="text-sm text-slate-600 mt-1">{t({ en: 'Total Patents', ar: 'إجمالي البراءات' })}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {patents.filter(p => p.status === 'granted').length}
                </p>
                <p className="text-sm text-slate-600 mt-1">{t({ en: 'Granted', ar: 'ممنوحة' })}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{licenses.length}</p>
                <p className="text-sm text-slate-600 mt-1">{t({ en: 'Active Licenses', ar: 'تراخيص نشطة' })}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
