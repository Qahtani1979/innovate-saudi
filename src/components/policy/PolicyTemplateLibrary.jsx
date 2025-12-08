import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { FileText, ArrowRight, Shield, Building2, Zap, Globe, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function PolicyTemplateLibrary({ onTemplateSelect }) {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();

  const templates = [
    {
      id: 'municipal_service_regulation',
      name: { en: 'Municipal Service Regulation', ar: 'تنظيم الخدمة البلدية' },
      description: { en: 'Template for regulating new municipal services', ar: 'قالب لتنظيم الخدمات البلدية الجديدة' },
      icon: Building2,
      category: 'regulation',
      fields: {
        title_ar: 'قالب تنظيم الخدمة البلدية',
        policy_type: 'new_regulation',
        implementation_complexity: 'medium',
        timeline_months: 12,
        regulatory_change_needed: true,
        implementation_steps: [
          { ar: 'صياغة نص التنظيم مع الفريق القانوني' },
          { ar: 'استشارة أصحاب المصلحة (30 يوم)' },
          { ar: 'موافقة المجلس البلدي' },
          { ar: 'مراجعة وتأييد الوزارة' },
          { ar: 'نشر في الجريدة الرسمية' },
          { ar: 'فترة سماح (60 يوم)' },
          { ar: 'بدء التطبيق' }
        ],
        stakeholder_involvement_ar: 'وزارة الشؤون البلدية، المجلس البلدي، اللجنة القانونية، مقدمي الخدمات، المواطنين'
      }
    },
    {
      id: 'amendment_existing_law',
      name: { en: 'Amendment to Existing Law', ar: 'تعديل قانون قائم' },
      description: { en: 'Template for amending municipal regulations', ar: 'قالب لتعديل الأنظمة البلدية' },
      icon: Shield,
      category: 'amendment',
      fields: {
        title_ar: 'قالب تعديل القانون البلدي',
        policy_type: 'amendment',
        implementation_complexity: 'high',
        timeline_months: 18,
        regulatory_change_needed: true,
        implementation_steps: [
          { ar: 'تحليل قانوني للقانون الحالي' },
          { ar: 'صياغة نص التعديل' },
          { ar: 'تقييم الأثر على الأنظمة الحالية' },
          { ar: 'استشارة عامة وأصحاب المصلحة' },
          { ar: 'مراجعة وموافقة تشريعية' },
          { ar: 'خطة انتقالية للامتثال' },
          { ar: 'النشر الرسمي' }
        ]
      }
    },
    {
      id: 'operational_guideline',
      name: { en: 'Operational Guideline', ar: 'دليل تشغيلي' },
      description: { en: 'Non-regulatory operational guidance', ar: 'إرشادات تشغيلية غير تنظيمية' },
      icon: FileText,
      category: 'guideline',
      fields: {
        title_ar: 'قالب الدليل التشغيلي',
        policy_type: 'guideline',
        implementation_complexity: 'low',
        timeline_months: 6,
        regulatory_change_needed: false,
        implementation_steps: [
          { ar: 'صياغة وثيقة الدليل' },
          { ar: 'مراجعة الخبراء' },
          { ar: 'اختبار تجريبي (اختياري)' },
          { ar: 'المراجعة النهائية والنشر' },
          { ar: 'التدريب والنشر' }
        ]
      }
    },
    {
      id: 'pilot_based_policy',
      name: { en: 'Pilot-Based Policy', ar: 'سياسة مبنية على تجربة' },
      description: { en: 'Policy from successful pilot learnings', ar: 'سياسة من نتائج تجربة ناجحة' },
      icon: Zap,
      category: 'standard',
      fields: {
        title_ar: 'قالب سياسة مبنية على تجربة',
        policy_type: 'standard',
        implementation_complexity: 'medium',
        timeline_months: 9,
        regulatory_change_needed: false,
        implementation_steps: [
          { ar: 'تحليل نتائج ودروس التجربة' },
          { ar: 'استخراج التوصيات السياسية' },
          { ar: 'تطوير المعيار التشغيلي' },
          { ar: 'موافقة البلدية' },
          { ar: 'خطة الطرح' }
        ]
      }
    },
    {
      id: 'international_adaptation',
      name: { en: 'International Best Practice Adaptation', ar: 'تكييف أفضل الممارسات الدولية' },
      description: { en: 'Adapt international policy to Saudi context', ar: 'تكييف سياسة دولية للسياق السعودي' },
      icon: Globe,
      category: 'other',
      fields: {
        title_ar: 'قالب أفضل الممارسات الدولية',
        policy_type: 'new_regulation',
        implementation_complexity: 'high',
        timeline_months: 15,
        regulatory_change_needed: true,
        implementation_steps: [
          { ar: 'دراسة السابقة الدولية' },
          { ar: 'التكييف الثقافي والقانوني' },
          { ar: 'التحقق مع أصحاب المصلحة' },
          { ar: 'تجربة التكييف (إن أمكن)' },
          { ar: 'الموافقة التشريعية الكاملة' }
        ]
      }
    }
  ];

  const categoryColors = {
    regulation: 'bg-red-100 text-red-700',
    amendment: 'bg-orange-100 text-orange-700',
    guideline: 'bg-blue-100 text-blue-700',
    standard: 'bg-purple-100 text-purple-700',
    other: 'bg-slate-100 text-slate-700'
  };

  const handleSelectTemplate = (template) => {
    if (onTemplateSelect) {
      onTemplateSelect(template.fields);
    } else {
      // Navigate to create page with pre-filled data
      const params = new URLSearchParams();
      params.set('template', template.id);
      navigate(createPageUrl(`PolicyCreate?${params.toString()}`));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          {t({ en: 'Policy Template Library', ar: 'مكتبة قوالب السياسات' })}
        </CardTitle>
        <p className="text-xs text-slate-600 mt-1">
          {t({ en: 'Start with proven templates', ar: 'ابدأ بقوالب مجربة' })}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {templates.map(template => {
          const Icon = template.icon;
          return (
            <div
              key={template.id}
              className="p-4 border-2 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
              onClick={() => handleSelectTemplate(template)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-slate-900 mb-1">
                      {template.name[language]}
                    </h3>
                    <p className="text-xs text-slate-600 mb-2">
                      {template.description[language]}
                    </p>
                    <div className="flex gap-2">
                      <Badge className={categoryColors[template.category]}>
                        {template.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.fields.timeline_months} {t({ en: 'months', ar: 'شهر' })}
                      </Badge>
                      {template.fields.regulatory_change_needed && (
                        <Badge className="text-xs bg-orange-100 text-orange-700">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {t({ en: 'Regulatory', ar: 'تنظيمي' })}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}