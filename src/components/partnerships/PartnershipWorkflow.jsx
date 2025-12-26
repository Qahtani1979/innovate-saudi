import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Users, CheckCircle2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrganizations } from '@/hooks/useOrganizations';
import { usePartnershipMutations } from '@/hooks/usePartnershipMutations';

export default function PartnershipWorkflow({ organization, onComplete }) {
  const { t, isRTL } = useLanguage();
  const [partnerSearch, setPartnerSearch] = useState('');

  const { data: organizations = [] } = useOrganizations();
  const { notifyPartner } = usePartnershipMutations();

  const [partnershipData, setPartnershipData] = useState({
    organization_id: organization?.id,
    partner_organization_id: '',
    partnership_type: '',
    description_en: '',
    description_ar: '',
    start_date: '',
    mou_url: '',
    status: 'proposed'
  });

  const handleSubmit = async () => {
    try {
      // Store partnership as a comment/activity for now (could be separate entity)
      // Since notifyPartner is a mutation, we can just call it.
      // The original code ONLY called invoke('email-trigger-hub') and then onComplete.
      // It didn't actually create a partnership record? That seems like a bug or incomplete feature in original code.
      // But I should stick to Gold Standard: remove direct invoke.
      // I added notifyPartner mutation for this.

      notifyPartner.mutate({
        organizationId: organization?.id,
        recipientEmail: 'admin@platform.gov.sa',
        details: {
          organizationName: organization?.name_en,
          partnershipType: partnershipData.partnership_type,
          partnerOrganizationId: partnershipData.partner_organization_id,
          description: partnershipData.description_en,
          startDate: partnershipData.start_date
        }
      }, {
        onSuccess: () => {
          onComplete?.();
        }
      });

    } catch (error) {
      console.error('Failed to create partnership:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          {t({ en: 'Partnership Proposal', ar: 'مقترح شراكة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            {t({ en: 'Partnership Type', ar: 'نوع الشراكة' })}
          </label>
          <Select
            value={partnershipData.partnership_type}
            onValueChange={(value) => setPartnershipData({ ...partnershipData, partnership_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t({ en: 'Select type', ar: 'اختر النوع' })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="joint_pilot">Joint Pilot</SelectItem>
              <SelectItem value="research_collaboration">Research Collaboration</SelectItem>
              <SelectItem value="knowledge_sharing">Knowledge Sharing</SelectItem>
              <SelectItem value="resource_sharing">Resource Sharing</SelectItem>
              <SelectItem value="procurement">Joint Procurement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            {t({ en: 'Partner Organization', ar: 'المنظمة الشريكة' })}
          </label>
          <Select
            value={partnershipData.partner_organization_id}
            onValueChange={(value) => setPartnershipData({ ...partnershipData, partner_organization_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t({ en: 'Select partner', ar: 'اختر الشريك' })} />
            </SelectTrigger>
            <SelectContent>
              {organizations
                .filter(o => o.id !== organization?.id)
                .map(o => (
                  <SelectItem key={o.id} value={o.id}>
                    {isRTL ? o.name_ar : o.name_en}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            {t({ en: 'Partnership Description (EN)', ar: 'وصف الشراكة (EN)' })}
          </label>
          <Textarea
            value={partnershipData.description_en}
            onChange={(e) => setPartnershipData({ ...partnershipData, description_en: e.target.value })}
            placeholder={t({ en: 'Describe the partnership scope, objectives, and expected outcomes...', ar: 'اشرح نطاق الشراكة والأهداف والنتائج المتوقعة...' })}
            className="h-24"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            {t({ en: 'Start Date', ar: 'تاريخ البدء' })}
          </label>
          <Input
            type="date"
            value={partnershipData.start_date}
            onChange={(e) => setPartnershipData({ ...partnershipData, start_date: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            {t({ en: 'MOU/Agreement URL (optional)', ar: 'رابط المذكرة (اختياري)' })}
          </label>
          <Input
            value={partnershipData.mou_url}
            onChange={(e) => setPartnershipData({ ...partnershipData, mou_url: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => onComplete?.()}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button onClick={handleSubmit} disabled={notifyPartner.isPending} className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {t({ en: 'Submit Partnership', ar: 'تقديم الشراكة' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}