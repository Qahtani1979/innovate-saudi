import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sparkles, Loader2, Plus, X, Target, ChevronDown, ChevronUp, Wand2, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../../../LanguageContext';
import { MOMAH_SECTORS } from '../StrategyWizardSteps';

export default function Step3Objectives({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating,
  onGenerateSingleObjective // New prop for single objective generation
}) {
  const { language, t, isRTL } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposedObjective, setProposedObjective] = useState(null);
  const [differentiationScore, setDifferentiationScore] = useState(null);
  const [isGeneratingSingle, setIsGeneratingSingle] = useState(false);
  const [targetSector, setTargetSector] = useState('_any'); // Sector to target for regeneration ('_any' = AI chooses)
  
  const objectives = data.objectives || [];
  
  // Get sectors with lowest coverage for suggestions
  const getSectorCoverage = () => {
    const coverage = MOMAH_SECTORS.map(sector => ({
      ...sector,
      count: objectives.filter(o => o.sector_code === sector.code).length
    }));
    return coverage.sort((a, b) => a.count - b.count);
  };

  const addObjective = () => {
    onChange({
      objectives: [...objectives, {
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        sector_code: '',
        priority: 'medium',
        target_year: data.end_year
      }]
    });
    setExpandedIndex(objectives.length);
  };

  const updateObjective = (index, updates) => {
    const updated = objectives.map((obj, i) => 
      i === index ? { ...obj, ...updates } : obj
    );
    onChange({ objectives: updated });
  };

  const removeObjective = (index) => {
    onChange({ objectives: objectives.filter((_, i) => i !== index) });
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-muted';
    }
  };

  const getDifferentiationColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getDifferentiationLabel = (score) => {
    if (score >= 80) return t({ en: 'Highly Unique', ar: 'فريد للغاية' });
    if (score >= 60) return t({ en: 'Moderately Unique', ar: 'فريد بشكل معتدل' });
    return t({ en: 'Low Uniqueness', ar: 'تفرد منخفض' });
  };

  // Generate a single new objective using AI
  const handleGenerateSingleObjective = async (sectorOverride = null) => {
    setIsGeneratingSingle(true);
    setShowProposalModal(true);
    setProposedObjective(null);
    setDifferentiationScore(null);

    try {
      if (onGenerateSingleObjective) {
        // Use sector override, or the selected target sector, or let AI choose
        const selectedSector = sectorOverride || (targetSector !== '_any' ? targetSector : null);
        const result = await onGenerateSingleObjective(objectives, selectedSector);
        if (result?.objective) {
          setProposedObjective(result.objective);
          setDifferentiationScore(result.differentiation_score || 75);
          // Auto-set target sector to the generated one for easy regeneration in same sector
          if (result.objective.sector_code) {
            setTargetSector(result.objective.sector_code);
          }
        }
      }
    } catch (error) {
      console.error('Error generating single objective:', error);
    } finally {
      setIsGeneratingSingle(false);
    }
  };

  // Regenerate with specific sector
  const handleRegenerateWithSector = () => {
    handleGenerateSingleObjective(targetSector !== '_any' ? targetSector : null);
  };

  // Approve and add the proposed objective
  const handleApproveObjective = () => {
    if (proposedObjective) {
      onChange({
        objectives: [...objectives, {
          ...proposedObjective,
          target_year: data.end_year
        }]
      });
      setShowProposalModal(false);
      setProposedObjective(null);
      setDifferentiationScore(null);
      setExpandedIndex(objectives.length);
    }
  };

  // Reject and close modal
  const handleRejectObjective = () => {
    setShowProposalModal(false);
    setProposedObjective(null);
    setDifferentiationScore(null);
  };

  // Update proposed objective field
  const updateProposedField = (field, value) => {
    setProposedObjective(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* AI Generation */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold">{t({ en: 'AI-Powered Objectives Generation', ar: 'إنشاء الأهداف بالذكاء الاصطناعي' })}</h4>
              <p className="text-sm text-muted-foreground">
                {t({ en: 'Generate 12-15 sector-specific objectives based on your context and SWOT', ar: 'إنشاء 12-15 هدفاً قطاعياً محدداً بناءً على سياقك وتحليل SWOT' })}
              </p>
            </div>
            <Button onClick={onGenerateAI} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'Generate Objectives', ar: 'إنشاء الأهداف' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Objectives Count and Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <span className="font-semibold">
            {objectives.length} {t({ en: 'Strategic Objectives', ar: 'الأهداف الاستراتيجية' })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* AI Add Single Objective Button */}
          <Button 
            onClick={handleGenerateSingleObjective} 
            variant="outline" 
            size="sm"
            disabled={isGeneratingSingle}
            className="border-primary/50 text-primary hover:bg-primary/10"
          >
            {isGeneratingSingle ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'AI Add Objective', ar: 'إضافة هدف بالذكاء الاصطناعي' })}
          </Button>
          {/* Manual Add Button */}
          <Button onClick={addObjective} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Add Objective', ar: 'إضافة هدف' })}
          </Button>
        </div>
      </div>

      {/* Objectives List */}
      <div className="space-y-3">
        {objectives.map((obj, index) => (
          <Card key={index} className={expandedIndex === index ? 'ring-2 ring-primary' : ''}>
            <Collapsible open={expandedIndex === index} onOpenChange={(open) => setExpandedIndex(open ? index : null)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                      {obj.sector_code && (
                        <Badge className="text-xs bg-primary/10 text-primary">
                          {MOMAH_SECTORS.find(s => s.code === obj.sector_code)?.[language === 'ar' ? 'name_ar' : 'name_en'] || obj.sector_code}
                        </Badge>
                      )}
                      <span className="font-medium text-sm line-clamp-1">
                        {language === 'ar' ? (obj.name_ar || obj.name_en || t({ en: 'New Objective', ar: 'هدف جديد' })) : (obj.name_en || t({ en: 'New Objective', ar: 'هدف جديد' }))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getPriorityColor(obj.priority)}`}>
                        {obj.priority || 'medium'}
                      </Badge>
                      {expandedIndex === index ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t({ en: 'Objective Name (English)', ar: 'اسم الهدف (إنجليزي)' })}</Label>
                      <Input
                        value={obj.name_en}
                        onChange={(e) => updateObjective(index, { name_en: e.target.value })}
                        placeholder={t({ en: 'Clear, actionable objective', ar: 'هدف واضح وقابل للتنفيذ' })}
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Objective Name (Arabic)', ar: 'اسم الهدف (عربي)' })}</Label>
                      <Input
                        value={obj.name_ar}
                        onChange={(e) => updateObjective(index, { name_ar: e.target.value })}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
                      <Textarea
                        value={obj.description_en}
                        onChange={(e) => updateObjective(index, { description_en: e.target.value })}
                        rows={3}
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</Label>
                      <Textarea
                        value={obj.description_ar}
                        onChange={(e) => updateObjective(index, { description_ar: e.target.value })}
                        rows={3}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{t({ en: 'Sector', ar: 'القطاع' })}</Label>
                      <Select 
                        value={obj.sector_code} 
                        onValueChange={(v) => updateObjective(index, { sector_code: v })}
                      >
                        <SelectTrigger><SelectValue placeholder={t({ en: 'Select sector', ar: 'اختر القطاع' })} /></SelectTrigger>
                        <SelectContent>
                          {MOMAH_SECTORS.map(s => (
                            <SelectItem key={s.code} value={s.code}>
                              {language === 'ar' ? s.name_ar : s.name_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Priority', ar: 'الأولوية' })}</Label>
                      <Select 
                        value={obj.priority} 
                        onValueChange={(v) => updateObjective(index, { priority: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">{t({ en: 'High', ar: 'عالي' })}</SelectItem>
                          <SelectItem value="medium">{t({ en: 'Medium', ar: 'متوسط' })}</SelectItem>
                          <SelectItem value="low">{t({ en: 'Low', ar: 'منخفض' })}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Target Year', ar: 'السنة المستهدفة' })}</Label>
                      <Select 
                        value={String(obj.target_year)} 
                        onValueChange={(v) => updateObjective(index, { target_year: parseInt(v) })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="destructive" size="sm" onClick={() => removeObjective(index)}>
                      <X className="h-4 w-4 mr-2" />
                      {t({ en: 'Remove Objective', ar: 'حذف الهدف' })}
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}

        {objectives.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {t({ en: 'No objectives yet. Use AI generation or add manually.', ar: 'لا توجد أهداف بعد. استخدم الإنشاء بالذكاء الاصطناعي أو أضف يدوياً.' })}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sector Coverage Summary */}
      {objectives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Sector Coverage', ar: 'تغطية القطاعات' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {MOMAH_SECTORS.map(sector => {
                const count = objectives.filter(o => o.sector_code === sector.code).length;
                return (
                  <Badge 
                    key={sector.code} 
                    variant={count > 0 ? 'default' : 'outline'}
                    className={count === 0 ? 'opacity-50' : ''}
                  >
                    {language === 'ar' ? sector.name_ar : sector.name_en} ({count})
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Single Objective Proposal Modal */}
      <Dialog open={showProposalModal} onOpenChange={setShowProposalModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              {t({ en: 'AI-Proposed Objective', ar: 'هدف مقترح بالذكاء الاصطناعي' })}
            </DialogTitle>
            <DialogDescription>
              {t({ 
                en: 'Review the AI-generated objective. You can edit fields before approving.', 
                ar: 'راجع الهدف المُنشأ بالذكاء الاصطناعي. يمكنك تعديل الحقول قبل الموافقة.' 
              })}
            </DialogDescription>
          </DialogHeader>

          {isGeneratingSingle ? (
            <div className="py-12 text-center">
              <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">
                {t({ en: 'Generating a unique objective...', ar: 'جارٍ إنشاء هدف فريد...' })}
              </p>
            </div>
          ) : proposedObjective ? (
            <div className="space-y-4">
              {/* Differentiation Score */}
              <Card className={`border-2 ${differentiationScore >= 60 ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {t({ en: 'Uniqueness Score', ar: 'درجة التفرد' })}
                    </span>
                    <span className={`font-bold ${getDifferentiationColor(differentiationScore)}`}>
                      {differentiationScore}% - {getDifferentiationLabel(differentiationScore)}
                    </span>
                  </div>
                  <Progress value={differentiationScore} className="h-2" />
                  {differentiationScore < 60 && (
                    <div className="flex items-center gap-2 mt-2 text-amber-700 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      {t({ en: 'Consider regenerating for a more unique objective', ar: 'فكر في إعادة الإنشاء للحصول على هدف أكثر تفرداً' })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Objective Name (English)', ar: 'اسم الهدف (إنجليزي)' })}</Label>
                  <Input
                    value={proposedObjective.name_en || ''}
                    onChange={(e) => updateProposedField('name_en', e.target.value)}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Objective Name (Arabic)', ar: 'اسم الهدف (عربي)' })}</Label>
                  <Input
                    value={proposedObjective.name_ar || ''}
                    onChange={(e) => updateProposedField('name_ar', e.target.value)}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
                  <Textarea
                    value={proposedObjective.description_en || ''}
                    onChange={(e) => updateProposedField('description_en', e.target.value)}
                    rows={4}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</Label>
                  <Textarea
                    value={proposedObjective.description_ar || ''}
                    onChange={(e) => updateProposedField('description_ar', e.target.value)}
                    rows={4}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Sector', ar: 'القطاع' })}</Label>
                  <Select 
                    value={proposedObjective.sector_code || ''} 
                    onValueChange={(v) => updateProposedField('sector_code', v)}
                  >
                    <SelectTrigger><SelectValue placeholder={t({ en: 'Select sector', ar: 'اختر القطاع' })} /></SelectTrigger>
                    <SelectContent>
                      {MOMAH_SECTORS.map(s => (
                        <SelectItem key={s.code} value={s.code}>
                          {language === 'ar' ? s.name_ar : s.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Priority', ar: 'الأولوية' })}</Label>
                  <Select 
                    value={proposedObjective.priority || 'medium'} 
                    onValueChange={(v) => updateProposedField('priority', v)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">{t({ en: 'High', ar: 'عالي' })}</SelectItem>
                      <SelectItem value="medium">{t({ en: 'Medium', ar: 'متوسط' })}</SelectItem>
                      <SelectItem value="low">{t({ en: 'Low', ar: 'منخفض' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              {t({ en: 'Failed to generate objective. Please try again.', ar: 'فشل في إنشاء الهدف. يرجى المحاولة مرة أخرى.' })}
            </div>
          )}

          <DialogFooter className="flex-col gap-3">
            {/* Sector Selection for Regeneration */}
            {proposedObjective && (
              <div className="w-full border rounded-lg p-3 bg-muted/30">
                <Label className="text-sm font-medium mb-2 block">
                  {t({ en: 'Target Sector for Regeneration', ar: 'القطاع المستهدف لإعادة الإنشاء' })}
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {getSectorCoverage().slice(0, 6).map(sector => (
                    <Badge 
                      key={sector.code}
                      variant={targetSector === sector.code ? 'default' : 'outline'}
                      className={`cursor-pointer transition-colors ${
                        targetSector === sector.code 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-primary/10'
                      } ${sector.count === 0 ? 'border-amber-400' : ''}`}
                      onClick={() => setTargetSector(targetSector === sector.code ? '_any' : sector.code)}
                    >
                      {language === 'ar' ? sector.name_ar : sector.name_en}
                      <span className="ml-1 opacity-70">({sector.count})</span>
                    </Badge>
                  ))}
                </div>
                <Select 
                  value={targetSector} 
                  onValueChange={(v) => setTargetSector(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t({ en: 'Or select any sector...', ar: 'أو اختر أي قطاع...' })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_any">{t({ en: 'Any Sector (AI chooses)', ar: 'أي قطاع (الذكاء الاصطناعي يختار)' })}</SelectItem>
                    {MOMAH_SECTORS.map(s => {
                      const count = objectives.filter(o => o.sector_code === s.code).length;
                      return (
                        <SelectItem key={s.code} value={s.code}>
                          {language === 'ar' ? s.name_ar : s.name_en} ({count} {t({ en: 'existing', ar: 'موجود' })})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {targetSector && targetSector !== '_any' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t({ 
                      en: `Will generate an objective specifically for: ${MOMAH_SECTORS.find(s => s.code === targetSector)?.name_en}`, 
                      ar: `سيتم إنشاء هدف خاص بـ: ${MOMAH_SECTORS.find(s => s.code === targetSector)?.name_ar}` 
                    })}
                  </p>
                )}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button
                variant="outline"
                onClick={handleRejectObjective}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                {t({ en: 'Reject', ar: 'رفض' })}
              </Button>
              <Button
                variant="outline"
                onClick={handleRegenerateWithSector}
                disabled={isGeneratingSingle}
                className="w-full sm:w-auto"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isGeneratingSingle ? 'animate-spin' : ''}`} />
                {targetSector && targetSector !== '_any'
                  ? t({ en: 'Regenerate in Sector', ar: 'إعادة الإنشاء في القطاع' })
                  : t({ en: 'Regenerate', ar: 'إعادة الإنشاء' })
                }
              </Button>
              <Button
                onClick={handleApproveObjective}
                disabled={!proposedObjective || isGeneratingSingle}
                className="w-full sm:w-auto"
              >
                <Check className="h-4 w-4 mr-2" />
                {t({ en: 'Approve & Add', ar: 'الموافقة والإضافة' })}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
