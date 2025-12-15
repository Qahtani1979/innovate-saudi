import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  Users, 
  Target, 
  BarChart3, 
  CheckCircle2, 
  Calendar,
  FileText,
  Loader2,
  Copy
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function TemplatePreviewDialog({ 
  template, 
  open, 
  onOpenChange, 
  onApply,
  isApplying 
}) {
  const { t, language, isRTL } = useLanguage();

  if (!template) return null;

  const contentSections = [
    { 
      icon: FileText, 
      label: { en: 'Vision & Mission', ar: 'الرؤية والرسالة' },
      included: !!(template.vision_en || template.mission_en)
    },
    { 
      icon: Target, 
      label: { en: 'Strategic Objectives', ar: 'الأهداف الاستراتيجية' },
      count: template.objectives?.length || 0,
      included: template.objectives?.length > 0
    },
    { 
      icon: BarChart3, 
      label: { en: 'KPIs & Metrics', ar: 'مؤشرات الأداء' },
      count: template.kpis?.length || 0,
      included: template.kpis?.length > 0
    },
    { 
      icon: Users, 
      label: { en: 'Stakeholder Analysis', ar: 'تحليل أصحاب المصلحة' },
      count: template.stakeholders?.length || 0,
      included: template.stakeholders?.length > 0
    },
    { 
      icon: CheckCircle2, 
      label: { en: 'SWOT Analysis', ar: 'تحليل SWOT' },
      included: !!(template.swot && Object.keys(template.swot).length > 0)
    },
    { 
      icon: Calendar, 
      label: { en: 'Action Plans', ar: 'خطط العمل' },
      count: template.action_plans?.length || 0,
      included: template.action_plans?.length > 0
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span>{language === 'ar' ? template.name_ar : template.name_en}</span>
              {template.is_featured && (
                <Badge className="ml-2" variant="secondary">
                  <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                  {t({ en: 'Featured', ar: 'مميز' })}
                </Badge>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            {language === 'ar' ? template.description_ar : template.description_en}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-6 py-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {template.usage_count || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t({ en: 'Times Used', ar: 'مرات الاستخدام' })}
                </div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-amber-500 flex items-center justify-center gap-1">
                  <Star className="h-5 w-5 fill-current" />
                  {template.template_rating || '-'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t({ en: 'Rating', ar: 'التقييم' })}
                </div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">
                  {template.objectives?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t({ en: 'Objectives', ar: 'الأهداف' })}
                </div>
              </div>
            </div>

            <Separator />

            {/* Included Content */}
            <div>
              <h4 className="font-medium mb-3">
                {t({ en: 'Included Content', ar: 'المحتوى المتضمن' })}
              </h4>
              <div className="space-y-2">
                {contentSections.map((section, idx) => {
                  const Icon = section.icon;
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        section.included ? 'bg-green-50 dark:bg-green-900/20' : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${section.included ? 'text-green-600' : 'text-muted-foreground'}`} />
                        <span className={section.included ? 'text-foreground' : 'text-muted-foreground'}>
                          {t(section.label)}
                        </span>
                      </div>
                      {section.included ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                          {section.count !== undefined ? `${section.count} ${t({ en: 'items', ar: 'عناصر' })}` : '✓'}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {t({ en: 'Not included', ar: 'غير متضمن' })}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tags */}
            {template.template_tags?.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">
                    {t({ en: 'Tags', ar: 'العلامات' })}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {template.template_tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Creator Info */}
            <Separator />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {t({ en: 'Created by', ar: 'تم الإنشاء بواسطة' })}: {template.owner_email || 'System'}
              </span>
              <span>
                {new Date(template.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t({ en: 'Close', ar: 'إغلاق' })}
          </Button>
          <Button onClick={onApply} disabled={isApplying}>
            {isApplying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Applying...', ar: 'جاري التطبيق...' })}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                {t({ en: 'Apply Template', ar: 'تطبيق القالب' })}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
