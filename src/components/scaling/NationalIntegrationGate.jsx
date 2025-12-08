import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Shield, CheckCircle2, Circle, FileText, Scale, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function NationalIntegrationGate({ scalingPlan, onApproved, onClose }) {
  const { t, isRTL } = useLanguage();
  const [checklist, setChecklist] = useState({
    policyAlignment: false,
    standardsDocumented: false,
    procurementReady: false,
    regulatoryCompliance: false,
    nationalBudgetApproved: false,
    stakeholderConsensus: false
  });
  const [notes, setNotes] = useState('');

  const allChecked = Object.values(checklist).every(v => v);
  const progress = (Object.values(checklist).filter(v => v).length / Object.keys(checklist).length) * 100;

  const handleApprove = () => {
    if (!allChecked) {
      toast.error(t({ en: 'Please complete all checklist items', ar: 'الرجاء إكمال جميع عناصر القائمة' }));
      return;
    }
    toast.success(t({ en: 'National integration approved', ar: 'تمت الموافقة على التكامل الوطني' }));
    onApproved?.({
      checklist,
      notes,
      approved_date: new Date().toISOString()
    });
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          {t({ en: 'National Integration Gate', ar: 'بوابة التكامل الوطني' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            {t({ 
              en: 'This gate ensures the scaled solution is ready for national policy integration, procurement, and institutional adoption.',
              ar: 'تضمن هذه البوابة أن الحل الموسع جاهز للتكامل مع السياسات الوطنية والشراء والاعتماد المؤسسي.'
            })}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-900">{t({ en: 'Integration Checklist', ar: 'قائمة التكامل' })}</h4>
            <Badge className={allChecked ? 'bg-green-600' : 'bg-slate-400'}>
              {Math.round(progress)}% {t({ en: 'Complete', ar: 'مكتمل' })}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Checkbox
                checked={checklist.policyAlignment}
                onCheckedChange={(checked) => setChecklist({...checklist, policyAlignment: checked})}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {t({ en: 'Policy Alignment Verified', ar: 'تم التحقق من التوافق مع السياسات' })}
                </p>
                <p className="text-xs text-slate-500">
                  {t({ en: 'Solution aligns with national policies and strategic plans', ar: 'الحل يتماشى مع السياسات والخطط الاستراتيجية الوطنية' })}
                </p>
              </div>
              <Scale className="h-4 w-4 text-blue-600" />
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Checkbox
                checked={checklist.standardsDocumented}
                onCheckedChange={(checked) => setChecklist({...checklist, standardsDocumented: checked})}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {t({ en: 'Standards & Guidelines Published', ar: 'تم نشر المعايير والإرشادات' })}
                </p>
                <p className="text-xs text-slate-500">
                  {t({ en: 'Implementation standards and best practices documented', ar: 'معايير التنفيذ وأفضل الممارسات موثقة' })}
                </p>
              </div>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Checkbox
                checked={checklist.procurementReady}
                onCheckedChange={(checked) => setChecklist({...checklist, procurementReady: checked})}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {t({ en: 'Procurement Framework Ready', ar: 'إطار الشراء جاهز' })}
                </p>
                <p className="text-xs text-slate-500">
                  {t({ en: 'Procurement specifications and vendor qualification defined', ar: 'مواصفات الشراء ومؤهلات الموردين محددة' })}
                </p>
              </div>
              <FileText className="h-4 w-4 text-blue-600" />
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Checkbox
                checked={checklist.regulatoryCompliance}
                onCheckedChange={(checked) => setChecklist({...checklist, regulatoryCompliance: checked})}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {t({ en: 'Regulatory Compliance Cleared', ar: 'التوافق التنظيمي مؤكد' })}
                </p>
                <p className="text-xs text-slate-500">
                  {t({ en: 'All regulatory requirements met for national deployment', ar: 'جميع المتطلبات التنظيمية مستوفاة للنشر الوطني' })}
                </p>
              </div>
              <Shield className="h-4 w-4 text-blue-600" />
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Checkbox
                checked={checklist.nationalBudgetApproved}
                onCheckedChange={(checked) => setChecklist({...checklist, nationalBudgetApproved: checked})}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {t({ en: 'National Budget Secured', ar: 'الميزانية الوطنية مؤمنة' })}
                </p>
                <p className="text-xs text-slate-500">
                  {t({ en: 'Full funding approved for nationwide implementation', ar: 'تمت الموافقة على التمويل الكامل للتنفيذ الوطني' })}
                </p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Checkbox
                checked={checklist.stakeholderConsensus}
                onCheckedChange={(checked) => setChecklist({...checklist, stakeholderConsensus: checked})}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {t({ en: 'Stakeholder Consensus Achieved', ar: 'تم تحقيق توافق أصحاب المصلحة' })}
                </p>
                <p className="text-xs text-slate-500">
                  {t({ en: 'Buy-in from all key stakeholders and ministries', ar: 'دعم من جميع أصحاب المصلحة والوزارات الرئيسية' })}
                </p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-900 mb-2 block">
            {t({ en: 'Integration Notes', ar: 'ملاحظات التكامل' })}
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder={t({ en: 'Document integration approach, timelines, and responsibilities...', ar: 'وثق نهج التكامل والجداول الزمنية والمسؤوليات...' })}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={onClose} variant="outline" className="flex-1">
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button onClick={handleApprove} disabled={!allChecked} className="flex-1 bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {t({ en: 'Approve Integration', ar: 'الموافقة على التكامل' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}