import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Loader2, X } from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { 
  MOMAH_SECTORS, STRATEGIC_THEMES, VISION_2030_PROGRAMS, 
  REGIONS, EMERGING_TECHNOLOGIES 
} from '../StrategyWizardSteps';

export default function Step1Context({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating 
}) {
  const { language, t, isRTL } = useLanguage();

  const toggleItem = (field, code) => {
    const current = data[field] || [];
    const updated = current.includes(code) 
      ? current.filter(c => c !== code)
      : [...current, code];
    onChange({ [field]: updated });
  };

  const addQuickStakeholder = (stakeholder) => {
    if (stakeholder.trim()) {
      onChange({ quick_stakeholders: [...(data.quick_stakeholders || []), stakeholder.trim()] });
    }
  };

  const removeQuickStakeholder = (index) => {
    const updated = [...(data.quick_stakeholders || [])];
    updated.splice(index, 1);
    onChange({ quick_stakeholders: updated });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* AI Generation Button */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold">{t({ en: 'AI-Powered Context Generation', ar: 'إنشاء السياق بالذكاء الاصطناعي' })}</h4>
              <p className="text-sm text-muted-foreground">
                {t({ en: 'Fill in basic details and let AI suggest vision, mission, and themes', ar: 'أدخل التفاصيل الأساسية ودع الذكاء الاصطناعي يقترح الرؤية والرسالة والمحاور' })}
              </p>
            </div>
            <Button onClick={onGenerateAI} disabled={isGenerating || !data.name_en}>
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'Generate', ar: 'إنشاء' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Plan Identity', ar: 'هوية الخطة' })}</CardTitle>
          <CardDescription>{t({ en: 'Core information about the strategic plan', ar: 'المعلومات الأساسية عن الخطة الاستراتيجية' })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Plan Title (English) *', ar: 'عنوان الخطة (إنجليزي) *' })}</Label>
              <Input
                value={data.name_en}
                onChange={(e) => onChange({ name_en: e.target.value })}
                placeholder={t({ en: 'e.g., MoMAH Digital Transformation Strategy 2025-2030', ar: 'مثال: استراتيجية التحول الرقمي لوزارة الشؤون البلدية' })}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Plan Title (Arabic) *', ar: 'عنوان الخطة (عربي) *' })}</Label>
              <Input
                value={data.name_ar}
                onChange={(e) => onChange({ name_ar: e.target.value })}
                placeholder={t({ en: 'Enter Arabic title', ar: 'أدخل العنوان بالعربية' })}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Vision Statement (English)', ar: 'بيان الرؤية (إنجليزي)' })}</Label>
              <Textarea
                value={data.vision_en}
                onChange={(e) => onChange({ vision_en: e.target.value })}
                rows={3}
                placeholder={t({ en: 'What future state do you aspire to achieve?', ar: 'ما هو المستقبل الذي تطمح لتحقيقه؟' })}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Vision Statement (Arabic)', ar: 'بيان الرؤية (عربي)' })}</Label>
              <Textarea
                value={data.vision_ar}
                onChange={(e) => onChange({ vision_ar: e.target.value })}
                rows={3}
                placeholder={t({ en: 'Enter Arabic vision', ar: 'أدخل الرؤية بالعربية' })}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Mission Statement (English)', ar: 'بيان المهمة (إنجليزي)' })}</Label>
              <Textarea
                value={data.mission_en}
                onChange={(e) => onChange({ mission_en: e.target.value })}
                rows={2}
                placeholder={t({ en: 'How will you achieve the vision?', ar: 'كيف ستحقق الرؤية؟' })}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Mission Statement (Arabic)', ar: 'بيان المهمة (عربي)' })}</Label>
              <Textarea
                value={data.mission_ar}
                onChange={(e) => onChange({ mission_ar: e.target.value })}
                rows={2}
                dir="rtl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Duration & Budget */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Duration & Resources', ar: 'المدة والموارد' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Start Year', ar: 'سنة البداية' })}</Label>
              <Select value={String(data.start_year)} onValueChange={(v) => onChange({ start_year: parseInt(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026, 2027].map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'End Year', ar: 'سنة النهاية' })}</Label>
              <Select value={String(data.end_year)} onValueChange={(v) => onChange({ end_year: parseInt(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2027, 2028, 2029, 2030, 2031, 2035].map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Budget Range', ar: 'نطاق الميزانية' })}</Label>
              <Select value={data.budget_range} onValueChange={(v) => onChange({ budget_range: v })}>
                <SelectTrigger><SelectValue placeholder={t({ en: 'Select range', ar: 'اختر النطاق' })} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="<10M">{'< 10M SAR'}</SelectItem>
                  <SelectItem value="10-50M">10-50M SAR</SelectItem>
                  <SelectItem value="50-100M">50-100M SAR</SelectItem>
                  <SelectItem value="100-500M">100-500M SAR</SelectItem>
                  <SelectItem value=">500M">{'>500M SAR'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Duration', ar: 'المدة' })}</Label>
              <div className="h-10 px-3 flex items-center border rounded-md bg-muted">
                {data.end_year - data.start_year} {t({ en: 'years', ar: 'سنوات' })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Sectors */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Target Sectors', ar: 'القطاعات المستهدفة' })}</CardTitle>
          <CardDescription>{t({ en: 'Select MoMAH sectors this plan will address', ar: 'اختر قطاعات الوزارة التي ستتناولها هذه الخطة' })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {MOMAH_SECTORS.map(sector => (
              <Badge 
                key={sector.code}
                variant={data.target_sectors?.includes(sector.code) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => toggleItem('target_sectors', sector.code)}
              >
                {language === 'ar' ? sector.name_ar : sector.name_en}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategic Themes */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Strategic Themes', ar: 'المحاور الاستراتيجية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {STRATEGIC_THEMES.map(theme => (
              <Badge 
                key={theme.code}
                variant={data.strategic_themes?.includes(theme.code) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => toggleItem('strategic_themes', theme.code)}
              >
                {language === 'ar' ? theme.name_ar : theme.name_en}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emerging Technologies */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Focus Technologies', ar: 'التقنيات المركزة' })}</CardTitle>
          <CardDescription>{t({ en: 'Innovation and emerging tech priorities', ar: 'أولويات الابتكار والتقنيات الناشئة' })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {EMERGING_TECHNOLOGIES.map(tech => (
              <Badge 
                key={tech.code}
                variant={data.focus_technologies?.includes(tech.code) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => toggleItem('focus_technologies', tech.code)}
              >
                {language === 'ar' ? tech.name_ar : tech.name_en}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vision 2030 Programs */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Vision 2030 Programs', ar: 'برامج رؤية 2030' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {VISION_2030_PROGRAMS.map(program => (
              <Badge 
                key={program.code}
                variant={data.vision_2030_programs?.includes(program.code) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => toggleItem('vision_2030_programs', program.code)}
              >
                {language === 'ar' ? program.name_ar : program.name_en}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Target Regions */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Target Regions', ar: 'المناطق المستهدفة' })}</CardTitle>
          <CardDescription>{t({ en: 'Leave empty for kingdom-wide scope', ar: 'اتركها فارغة للنطاق على مستوى المملكة' })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map(region => (
              <Badge 
                key={region.code}
                variant={data.target_regions?.includes(region.code) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/20 transition-colors text-xs"
                onClick={() => toggleItem('target_regions', region.code)}
              >
                {language === 'ar' ? region.name_ar : region.name_en}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stakeholders (simple list for discovery) */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Key Stakeholders (Quick List)', ar: 'أصحاب المصلحة الرئيسيون (قائمة سريعة)' })}</CardTitle>
          <CardDescription>{t({ en: 'Add stakeholder names here. Detailed analysis is in Step 3.', ar: 'أضف أسماء أصحاب المصلحة هنا. التحليل التفصيلي في الخطوة 3.' })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              id="new-stakeholder"
              placeholder={t({ en: 'Add stakeholder (e.g., MOMRA, RCRC, SDAIA)', ar: 'أضف صاحب مصلحة (مثال: وزارة الموارد البشرية)' })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addQuickStakeholder(e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <Button variant="outline" onClick={() => {
              const input = document.getElementById('new-stakeholder');
              addQuickStakeholder(input.value);
              input.value = '';
            }}>
              {t({ en: 'Add', ar: 'إضافة' })}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data.quick_stakeholders || []).map((s, i) => (
              <Badge key={i} variant="secondary" className="gap-1">
                {s}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeQuickStakeholder(i)} />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Challenges & Constraints */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Discovery Inputs', ar: 'مدخلات الاستكشاف' })}</CardTitle>
          <CardDescription>{t({ en: 'Current situation analysis', ar: 'تحليل الوضع الحالي' })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t({ en: 'Key Challenges', ar: 'التحديات الرئيسية' })}</Label>
            <Textarea
              value={data.key_challenges || ''}
              onChange={(e) => onChange({ key_challenges: e.target.value })}
              rows={3}
              placeholder={t({ en: 'What are the main challenges to address?', ar: 'ما هي التحديات الرئيسية التي يجب معالجتها؟' })}
            />
          </div>
          <div className="space-y-2">
            <Label>{t({ en: 'Available Resources', ar: 'الموارد المتاحة' })}</Label>
            <Textarea
              value={data.available_resources || ''}
              onChange={(e) => onChange({ available_resources: e.target.value })}
              rows={2}
              placeholder={t({ en: 'Human resources, technology, partnerships, etc.', ar: 'الموارد البشرية، التقنية، الشراكات، إلخ' })}
            />
          </div>
          <div className="space-y-2">
            <Label>{t({ en: 'Initial Constraints & Limitations', ar: 'القيود والحدود الأولية' })}</Label>
            <Textarea
              value={data.initial_constraints || ''}
              onChange={(e) => onChange({ initial_constraints: e.target.value })}
              rows={2}
              placeholder={t({ en: 'Budget limits, regulatory constraints, timeline pressures', ar: 'حدود الميزانية، القيود التنظيمية، ضغوط الجدول الزمني' })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
