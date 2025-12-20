import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/components/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { STRATEGY_TEMPLATE_TYPES } from '@/constants/strategyTemplateTypes';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart3, CheckCircle2, AlertTriangle, Sparkles, Loader2,
  Building2, Home, Leaf, Globe, Users, FileText, Target,
  MapPin, Cpu, Shield, Heart, Truck, TreeDeciduous, Building,
  RefreshCcw
} from 'lucide-react';

/**
 * MoMAH Taxonomy - Service Domains & Innovation Areas
 * Aligned with Saudi Vision 2030 and MoMAH mandate
 */
const MOMAH_TAXONOMY = {
  serviceDomains: [
    { id: 'urban_planning', name_en: 'Urban Planning & Development', name_ar: 'التخطيط والتطوير الحضري', icon: MapPin, keywords: ['GIS', 'urban', 'planning', 'zoning', 'land use', 'digital twins'] },
    { id: 'housing', name_en: 'Housing & Real Estate', name_ar: 'الإسكان والعقارات', icon: Home, keywords: ['housing', 'sakani', 'proptech', 'real estate', 'smart homes', 'construction'] },
    { id: 'infrastructure', name_en: 'Infrastructure & Utilities', name_ar: 'البنية التحتية والمرافق', icon: Building, keywords: ['infrastructure', 'utilities', 'roads', 'bridges', 'IoT', 'sensors', 'maintenance'] },
    { id: 'environment', name_en: 'Environment & Sustainability', name_ar: 'البيئة والاستدامة', icon: Leaf, keywords: ['environment', 'waste', 'recycling', 'sustainability', 'carbon', 'cleantech', 'green'] },
    { id: 'citizen_services', name_en: 'Citizen Services', name_ar: 'خدمات المواطنين', icon: Users, keywords: ['citizen', 'services', 'digital', 'permits', 'licenses', 'balady'] },
    { id: 'smart_city', name_en: 'Smart City Technologies', name_ar: 'تقنيات المدن الذكية', icon: Cpu, keywords: ['smart city', 'IoT', 'AI', 'sensors', 'connected', 'automation'] },
    { id: 'rural_development', name_en: 'Rural Development', name_ar: 'التنمية الريفية', icon: TreeDeciduous, keywords: ['rural', 'village', 'inclusion', 'connectivity', 'remote'] },
    { id: 'public_health', name_en: 'Public Health & Safety', name_ar: 'الصحة والسلامة العامة', icon: Heart, keywords: ['health', 'safety', 'inspection', 'food safety', 'public health'] }
  ],
  innovationAreas: [
    { id: 'ai_ml', name_en: 'AI & Machine Learning', name_ar: 'الذكاء الاصطناعي والتعلم الآلي', icon: Sparkles, keywords: ['AI', 'ML', 'machine learning', 'artificial intelligence', 'neural', 'deep learning'] },
    { id: 'iot', name_en: 'IoT & Connected Systems', name_ar: 'إنترنت الأشياء والأنظمة المتصلة', icon: Cpu, keywords: ['IoT', 'sensors', 'connected', 'smart devices', 'edge computing'] },
    { id: 'blockchain', name_en: 'Blockchain & DLT', name_ar: 'البلوك تشين والسجلات الموزعة', icon: Shield, keywords: ['blockchain', 'distributed ledger', 'smart contracts', 'verification'] },
    { id: 'digital_twins', name_en: 'Digital Twins & Simulation', name_ar: 'التوائم الرقمية والمحاكاة', icon: Globe, keywords: ['digital twin', 'simulation', '3D modeling', 'BIM', 'virtual'] },
    { id: 'drones_robotics', name_en: 'Drones & Robotics', name_ar: 'الطائرات المسيرة والروبوتات', icon: Truck, keywords: ['drone', 'robotics', 'autonomous', 'UAV', 'automation'] },
    { id: 'cleantech', name_en: 'CleanTech & Renewable', name_ar: 'التقنيات النظيفة والمتجددة', icon: Leaf, keywords: ['cleantech', 'renewable', 'solar', 'wind', 'carbon capture', 'recycling'] },
    { id: 'proptech', name_en: 'PropTech & ConTech', name_ar: 'تقنيات العقار والبناء', icon: Building2, keywords: ['proptech', 'contech', 'construction tech', 'modular', 'prefab', 'BIM'] },
    { id: 'govtech', name_en: 'GovTech & RegTech', name_ar: 'التقنية الحكومية والتنظيمية', icon: Shield, keywords: ['govtech', 'regtech', 'permits', 'compliance', 'automation', 'e-government'] }
  ],
  visionPrograms: [
    { id: 'quality_of_life', name_en: 'Quality of Life Program', name_ar: 'برنامج جودة الحياة', keywords: ['quality of life', 'livability', 'urban amenities', 'entertainment'] },
    { id: 'housing_program', name_en: 'Housing Program (Sakani)', name_ar: 'برنامج الإسكان (سكني)', keywords: ['sakani', 'housing program', 'home ownership', '70%'] },
    { id: 'national_transformation', name_en: 'National Transformation', name_ar: 'التحول الوطني', keywords: ['transformation', 'digitization', 'modernization', 'efficiency'] }
  ],
  regions: [
    { id: 'riyadh', name_en: 'Riyadh Region', name_ar: 'منطقة الرياض' },
    { id: 'makkah', name_en: 'Makkah Region', name_ar: 'منطقة مكة المكرمة' },
    { id: 'madinah', name_en: 'Madinah Region', name_ar: 'منطقة المدينة المنورة' },
    { id: 'eastern', name_en: 'Eastern Province', name_ar: 'المنطقة الشرقية' },
    { id: 'asir', name_en: 'Asir Region', name_ar: 'منطقة عسير' },
    { id: 'tabuk', name_en: 'Tabuk Region', name_ar: 'منطقة تبوك' },
    { id: 'hail', name_en: 'Hail Region', name_ar: 'منطقة حائل' },
    { id: 'northern_borders', name_en: 'Northern Borders', name_ar: 'منطقة الحدود الشمالية' },
    { id: 'jazan', name_en: 'Jazan Region', name_ar: 'منطقة جازان' },
    { id: 'najran', name_en: 'Najran Region', name_ar: 'منطقة نجران' },
    { id: 'al_baha', name_en: 'Al-Baha Region', name_ar: 'منطقة الباحة' },
    { id: 'al_jouf', name_en: 'Al-Jouf Region', name_ar: 'منطقة الجوف' },
    { id: 'qassim', name_en: 'Qassim Region', name_ar: 'منطقة القصيم' }
  ]
};

/**
 * AI-generated template recommendations based on gaps
 * These are pre-defined to ensure consistency with MoMAH context
 */
const GAP_RECOMMENDATIONS = {
  'public_health': {
    name_en: 'Public Health Innovation & Food Safety Tech Strategy',
    name_ar: 'استراتيجية الابتكار في الصحة العامة وتقنيات سلامة الغذاء',
    description_en: 'Strategic framework for AI-powered health inspections, food safety monitoring, and public health analytics in Saudi municipalities.',
    template_type: 'innovation',
    priority: 'high',
    keywords: ['AI inspection', 'food safety', 'health monitoring', 'predictive analytics']
  },
  'drones_robotics': {
    name_en: 'Autonomous Systems & Drone Innovation Strategy',
    name_ar: 'استراتيجية الأنظمة الذاتية وابتكار الطائرات المسيرة',
    description_en: 'Strategic framework for drone-based inspections, autonomous delivery, and robotics integration in municipal operations.',
    template_type: 'smart_city',
    priority: 'medium',
    keywords: ['drones', 'robotics', 'autonomous inspection', 'delivery']
  },
  'blockchain': {
    name_en: 'Blockchain & Digital Trust Infrastructure Strategy',
    name_ar: 'استراتيجية البلوك تشين والبنية التحتية للثقة الرقمية',
    description_en: 'Strategic framework for blockchain-based land registry, smart contracts for permits, and decentralized verification systems.',
    template_type: 'digital_transformation',
    priority: 'medium',
    keywords: ['blockchain', 'smart contracts', 'land registry', 'verification']
  },
  'quality_of_life': {
    name_en: 'Quality of Life Enhancement & Urban Amenities Innovation',
    name_ar: 'استراتيجية تحسين جودة الحياة وابتكار المرافق الحضرية',
    description_en: 'Strategic framework for smart parks, entertainment facilities, and livability enhancements aligned with Vision 2030 Quality of Life Program.',
    template_type: 'citizen_services',
    priority: 'high',
    keywords: ['parks', 'entertainment', 'livability', 'urban amenities']
  }
};

const TemplateCoverageAnalysis = ({ templates = [], onRefresh }) => {
  const { t, isRTL, language } = useLanguage();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analysisTab, setAnalysisTab] = useState('coverage');
  const [analysisVersion, setAnalysisVersion] = useState(0);

  // Refresh analysis handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      setAnalysisVersion(v => v + 1);
      toast({
        title: t({ en: 'Analysis Refreshed', ar: 'تم تحديث التحليل' }),
        description: t({ en: 'Coverage analysis has been updated with latest data.', ar: 'تم تحديث تحليل التغطية بأحدث البيانات.' })
      });
    } catch (error) {
      toast({
        title: t({ en: 'Refresh Failed', ar: 'فشل التحديث' }),
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, toast, t]);

  // Analyze template coverage against taxonomy
  const coverageAnalysis = useMemo(() => {
    const analysis = {
      serviceDomains: {},
      innovationAreas: {},
      visionPrograms: {},
      templateTypes: {},
      overallScore: 0
    };

    // Initialize coverage tracking
    MOMAH_TAXONOMY.serviceDomains.forEach(domain => {
      analysis.serviceDomains[domain.id] = { ...domain, templates: [], covered: false };
    });
    MOMAH_TAXONOMY.innovationAreas.forEach(area => {
      analysis.innovationAreas[area.id] = { ...area, templates: [], covered: false };
    });
    MOMAH_TAXONOMY.visionPrograms.forEach(program => {
      analysis.visionPrograms[program.id] = { ...program, templates: [], covered: false };
    });
    STRATEGY_TEMPLATE_TYPES.forEach(type => {
      analysis.templateTypes[type.id] = { ...type, templates: [], count: 0 };
    });

    // Analyze each template
    templates.forEach(template => {
      const searchText = [
        template.name_en,
        template.name_ar,
        template.description_en,
        template.description_ar,
        ...(template.template_tags || []),
        ...(template.target_sectors || [])
      ].join(' ').toLowerCase();

      // Check service domain coverage
      MOMAH_TAXONOMY.serviceDomains.forEach(domain => {
        const matches = domain.keywords.some(kw => searchText.includes(kw.toLowerCase()));
        if (matches) {
          analysis.serviceDomains[domain.id].templates.push(template);
          analysis.serviceDomains[domain.id].covered = true;
        }
      });

      // Check innovation area coverage
      MOMAH_TAXONOMY.innovationAreas.forEach(area => {
        const matches = area.keywords.some(kw => searchText.includes(kw.toLowerCase()));
        if (matches) {
          analysis.innovationAreas[area.id].templates.push(template);
          analysis.innovationAreas[area.id].covered = true;
        }
      });

      // Check vision program alignment
      MOMAH_TAXONOMY.visionPrograms.forEach(program => {
        const matches = program.keywords.some(kw => searchText.includes(kw.toLowerCase()));
        if (matches) {
          analysis.visionPrograms[program.id].templates.push(template);
          analysis.visionPrograms[program.id].covered = true;
        }
      });

      // Count by template type
      if (template.template_type && analysis.templateTypes[template.template_type]) {
        analysis.templateTypes[template.template_type].templates.push(template);
        analysis.templateTypes[template.template_type].count++;
      }
    });

    // Calculate overall coverage score
    const domainsCovered = Object.values(analysis.serviceDomains).filter(d => d.covered).length;
    const areasCovered = Object.values(analysis.innovationAreas).filter(a => a.covered).length;
    const programsCovered = Object.values(analysis.visionPrograms).filter(p => p.covered).length;
    
    const totalItems = MOMAH_TAXONOMY.serviceDomains.length + MOMAH_TAXONOMY.innovationAreas.length + MOMAH_TAXONOMY.visionPrograms.length;
    const coveredItems = domainsCovered + areasCovered + programsCovered;
    analysis.overallScore = Math.round((coveredItems / totalItems) * 100);

    return analysis;
  }, [templates, analysisVersion]);

  // Identify gaps
  const gaps = useMemo(() => {
    const uncoveredDomains = Object.values(coverageAnalysis.serviceDomains).filter(d => !d.covered);
    const uncoveredAreas = Object.values(coverageAnalysis.innovationAreas).filter(a => !a.covered);
    const uncoveredPrograms = Object.values(coverageAnalysis.visionPrograms).filter(p => !p.covered);
    
    return {
      domains: uncoveredDomains,
      areas: uncoveredAreas,
      programs: uncoveredPrograms,
      total: uncoveredDomains.length + uncoveredAreas.length + uncoveredPrograms.length
    };
  }, [coverageAnalysis]);

  // AI Recommendations based on gaps
  const recommendations = useMemo(() => {
    const recs = [];
    
    // Add recommendations for uncovered service domains
    gaps.domains.forEach(domain => {
      if (GAP_RECOMMENDATIONS[domain.id]) {
        recs.push({
          ...GAP_RECOMMENDATIONS[domain.id],
          gapType: 'service_domain',
          gapId: domain.id,
          gapName: domain.name_en
        });
      }
    });

    // Add recommendations for uncovered innovation areas
    gaps.areas.forEach(area => {
      if (GAP_RECOMMENDATIONS[area.id]) {
        recs.push({
          ...GAP_RECOMMENDATIONS[area.id],
          gapType: 'innovation_area',
          gapId: area.id,
          gapName: area.name_en
        });
      }
    });

    // Add recommendations for uncovered vision programs
    gaps.programs.forEach(program => {
      if (GAP_RECOMMENDATIONS[program.id]) {
        recs.push({
          ...GAP_RECOMMENDATIONS[program.id],
          gapType: 'vision_program',
          gapId: program.id,
          gapName: program.name_en
        });
      }
    });

    return recs;
  }, [gaps]);

  // Generate template from AI recommendation
  const handleGenerateTemplate = async (recommendation) => {
    setIsGenerating(true);
    try {
      // Create a new strategic plan template based on the recommendation
      const templateData = {
        name_en: recommendation.name_en,
        name_ar: recommendation.name_ar,
        description_en: recommendation.description_en,
        description_ar: recommendation.description_en, // Use EN as fallback for AR description
        is_template: true,
        is_public: false,
        status: 'draft',
        template_type: recommendation.template_type,
        template_tags: recommendation.keywords,
        target_sectors: [recommendation.gapId],
        vision_en: `Strategic framework addressing ${recommendation.gapName} with innovative solutions aligned with Saudi Vision 2030.`,
        vision_ar: `إطار استراتيجي يعالج ${recommendation.gapName} بحلول مبتكرة متوافقة مع رؤية السعودية 2030.`,
        objectives: [
          {
            id: crypto.randomUUID(),
            title_en: `Establish ${recommendation.gapName} Innovation Framework`,
            title_ar: `تأسيس إطار الابتكار لـ ${recommendation.gapName}`,
            description_en: recommendation.description_en,
            target_value: 100,
            baseline_value: 0,
            weight: 100
          }
        ],
        pillars: [
          {
            id: crypto.randomUUID(),
            title_en: 'Innovation & Technology',
            title_ar: 'الابتكار والتقنية',
            description_en: `Leverage ${recommendation.keywords.join(', ')} for municipal excellence.`
          }
        ]
      };

      const { data, error } = await supabase
        .from('strategic_plans')
        .insert([templateData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: t({ en: 'Template Created', ar: 'تم إنشاء القالب' }),
        description: t({ 
          en: `Template "${recommendation.name_en}" has been created as a draft. You can now edit and customize it.`, 
          ar: `تم إنشاء قالب "${recommendation.name_ar}" كمسودة. يمكنك الآن تعديله وتخصيصه.` 
        })
      });

      // Refresh analysis after creating template
      if (onRefresh) {
        await onRefresh();
      }
      setAnalysisVersion(v => v + 1);

    } catch (error) {
      console.error('Error generating template:', error);
      toast({
        title: t({ en: 'Generation Failed', ar: 'فشل الإنشاء' }),
        description: error.message || t({ en: 'Failed to create template. Please try again.', ar: 'فشل إنشاء القالب. يرجى المحاولة مرة أخرى.' }),
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderCoverageItem = (item, showTemplates = true) => {
    const ItemIcon = item.icon || FileText;
    const templateCount = item.templates?.length || 0;
    const isCovered = item.covered || templateCount > 0;

    return (
      <div key={item.id} className={`p-3 rounded-lg border ${isCovered ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ItemIcon className={`h-4 w-4 ${isCovered ? 'text-green-600' : 'text-amber-600'}`} />
            <span className="text-sm font-medium">
              {language === 'ar' ? item.name_ar : item.name_en}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isCovered ? (
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {templateCount} {t({ en: 'template(s)', ar: 'قوالب' })}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {t({ en: 'Gap', ar: 'فجوة' })}
              </Badge>
            )}
          </div>
        </div>
        {showTemplates && templateCount > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.templates.slice(0, 3).map(tmpl => (
              <Badge key={tmpl.id} variant="secondary" className="text-xs">
                {tmpl.name_en?.substring(0, 30)}...
              </Badge>
            ))}
            {templateCount > 3 && (
              <Badge variant="outline" className="text-xs">
                +{templateCount - 3} {t({ en: 'more', ar: 'المزيد' })}
              </Badge>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-950 dark:to-background">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Overall Coverage', ar: 'التغطية الإجمالية' })}</p>
                <p className="text-2xl font-bold text-cyan-600">{coverageAnalysis.overallScore}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-cyan-500" />
            </div>
            <Progress value={coverageAnalysis.overallScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Total Templates', ar: 'إجمالي القوالب' })}</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className={gaps.total > 0 ? 'border-amber-200' : 'border-green-200'}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Coverage Gaps', ar: 'فجوات التغطية' })}</p>
                <p className="text-2xl font-bold">{gaps.total}</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${gaps.total > 0 ? 'text-amber-500' : 'text-green-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'AI Recommendations', ar: 'توصيات الذكاء الاصطناعي' })}</p>
                <p className="text-2xl font-bold text-purple-600">{recommendations.length}</p>
              </div>
              <Sparkles className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Tabs */}
      <Tabs value={analysisTab} onValueChange={setAnalysisTab}>
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
          <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-muted/50 p-1">
            <TabsTrigger value="coverage" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Target className="h-4 w-4" />
              <span>{t({ en: 'Coverage Matrix', ar: 'مصفوفة التغطية' })}</span>
            </TabsTrigger>
            <TabsTrigger value="gaps" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>{t({ en: 'Gap Analysis', ar: 'تحليل الفجوات' })}</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Sparkles className="h-4 w-4" />
              <span>{t({ en: 'AI Recommendations', ar: 'توصيات الذكاء الاصطناعي' })}</span>
            </TabsTrigger>
            <TabsTrigger value="distribution" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BarChart3 className="h-4 w-4" />
              <span>{t({ en: 'Distribution', ar: 'التوزيع' })}</span>
            </TabsTrigger>
          </TabsList>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="shrink-0"
          >
            <RefreshCcw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t({ en: 'Refresh All', ar: 'تحديث الكل' })}
          </Button>
        </div>

        {/* Coverage Matrix */}
        <TabsContent value="coverage" className="mt-4 space-y-4">
          <div className="flex justify-end mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t({ en: 'Refresh Coverage', ar: 'تحديث التغطية' })}
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t({ en: 'MoMAH Service Domains', ar: 'مجالات خدمات وزارة البلديات' })}</CardTitle>
              <CardDescription>{t({ en: 'Template coverage across municipal service areas', ar: 'تغطية القوالب عبر مجالات الخدمات البلدية' })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.values(coverageAnalysis.serviceDomains).map(domain => renderCoverageItem(domain))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t({ en: 'Innovation & Technology Areas', ar: 'مجالات الابتكار والتقنية' })}</CardTitle>
              <CardDescription>{t({ en: 'Template coverage for emerging technologies', ar: 'تغطية القوالب للتقنيات الناشئة' })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.values(coverageAnalysis.innovationAreas).map(area => renderCoverageItem(area))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t({ en: 'Vision 2030 Program Alignment', ar: 'التوافق مع برامج رؤية 2030' })}</CardTitle>
              <CardDescription>{t({ en: 'Template alignment with national programs', ar: 'توافق القوالب مع البرامج الوطنية' })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.values(coverageAnalysis.visionPrograms).map(program => renderCoverageItem(program, false))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gap Analysis */}
        <TabsContent value="gaps" className="mt-4 space-y-4">
          <div className="flex justify-end mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t({ en: 'Refresh Gaps', ar: 'تحديث الفجوات' })}
            </Button>
          </div>
          {gaps.total === 0 ? (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950">
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <h3 className="font-semibold text-green-700">
                  {t({ en: 'Excellent Coverage!', ar: 'تغطية ممتازة!' })}
                </h3>
                <p className="text-sm text-green-600 mt-2">
                  {t({ en: 'All MoMAH service domains and innovation areas are covered by existing templates.', ar: 'جميع مجالات خدمات الوزارة ومجالات الابتكار مغطاة بالقوالب الحالية.' })}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {gaps.domains.length > 0 && (
                <Card className="border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-amber-700">
                      <AlertTriangle className="h-5 w-5" />
                      {t({ en: 'Uncovered Service Domains', ar: 'مجالات الخدمة غير المغطاة' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {gaps.domains.map(domain => {
                        const DomainIcon = domain.icon;
                        return (
                          <div key={domain.id} className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                            <DomainIcon className="h-5 w-5 text-amber-600" />
                            <div className="flex-1">
                              <p className="font-medium">{language === 'ar' ? domain.name_ar : domain.name_en}</p>
                              <p className="text-xs text-muted-foreground">
                                {t({ en: 'Keywords:', ar: 'كلمات مفتاحية:' })} {domain.keywords.slice(0, 4).join(', ')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {gaps.areas.length > 0 && (
                <Card className="border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-amber-700">
                      <AlertTriangle className="h-5 w-5" />
                      {t({ en: 'Uncovered Innovation Areas', ar: 'مجالات الابتكار غير المغطاة' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {gaps.areas.map(area => {
                        const AreaIcon = area.icon;
                        return (
                          <div key={area.id} className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                            <AreaIcon className="h-5 w-5 text-amber-600" />
                            <div className="flex-1">
                              <p className="font-medium">{language === 'ar' ? area.name_ar : area.name_en}</p>
                              <p className="text-xs text-muted-foreground">
                                {t({ en: 'Keywords:', ar: 'كلمات مفتاحية:' })} {area.keywords.slice(0, 4).join(', ')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {gaps.programs.length > 0 && (
                <Card className="border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-amber-700">
                      <AlertTriangle className="h-5 w-5" />
                      {t({ en: 'Uncovered Vision 2030 Programs', ar: 'برامج رؤية 2030 غير المغطاة' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {gaps.programs.map(program => (
                        <div key={program.id} className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                          <Target className="h-5 w-5 text-amber-600" />
                          <div className="flex-1">
                            <p className="font-medium">{language === 'ar' ? program.name_ar : program.name_en}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* AI Recommendations */}
        <TabsContent value="recommendations" className="mt-4 space-y-4">
          {recommendations.length === 0 ? (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950">
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <h3 className="font-semibold text-green-700">
                  {t({ en: 'No Recommendations Needed', ar: 'لا توجد توصيات' })}
                </h3>
                <p className="text-sm text-green-600 mt-2">
                  {t({ en: 'Your template library has comprehensive coverage. Great job!', ar: 'مكتبة القوالب لديك تتمتع بتغطية شاملة. عمل رائع!' })}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  {t({ en: 'AI-Generated Template Recommendations', ar: 'توصيات القوالب المولدة بالذكاء الاصطناعي' })}
                </CardTitle>
                <CardDescription>
                  {t({ en: 'Based on gap analysis, these templates would improve MoMAH service coverage', ar: 'بناءً على تحليل الفجوات، هذه القوالب ستحسن تغطية خدمات الوزارة' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-white dark:from-purple-950 dark:to-background">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                              {rec.priority === 'high' ? t({ en: 'High Priority', ar: 'أولوية عالية' }) : t({ en: 'Medium Priority', ar: 'أولوية متوسطة' })}
                            </Badge>
                            <Badge variant="outline">
                              {t({ en: 'Fills gap:', ar: 'يسد فجوة:' })} {rec.gapName}
                            </Badge>
                          </div>
                          <h4 className="font-semibold mb-1">
                            {language === 'ar' ? rec.name_ar : rec.name_en}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {rec.description_en}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {rec.keywords.map((kw, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleGenerateTemplate(rec)}
                          disabled={isGenerating}
                          className="shrink-0"
                        >
                          {isGenerating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-1" />
                              {t({ en: 'Generate', ar: 'إنشاء' })}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Distribution */}
        <TabsContent value="distribution" className="mt-4 space-y-4">
          <div className="flex justify-end mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t({ en: 'Refresh Distribution', ar: 'تحديث التوزيع' })}
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t({ en: 'Templates by Type', ar: 'القوالب حسب النوع' })}</CardTitle>
              <CardDescription>
                {t({ en: 'Distribution of templates across different strategy types', ar: 'توزيع القوالب عبر أنواع الاستراتيجيات المختلفة' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {STRATEGY_TEMPLATE_TYPES.map(type => {
                  const typeData = coverageAnalysis.templateTypes[type.id];
                  const count = typeData?.count || 0;
                  const percentage = templates.length > 0 ? Math.round((count / templates.length) * 100) : 0;
                  const TypeIcon = type.icon;
                  const templateNames = typeData?.templates?.slice(0, 3).map(t => t.name_en?.substring(0, 25)) || [];
                  
                  return (
                    <div key={type.id} className="p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${type.color || 'bg-muted'}`}>
                            <TypeIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <span className="font-medium">{language === 'ar' ? type.name_ar : type.name_en}</span>
                            <p className="text-xs text-muted-foreground">{type.description_en?.substring(0, 50) || ''}</p>
                          </div>
                        </div>
                        <Badge variant={count > 0 ? 'default' : 'secondary'}>
                          {count} {t({ en: 'templates', ar: 'قوالب' })} ({percentage}%)
                        </Badge>
                      </div>
                      <Progress value={percentage} className="h-2 mb-2" />
                      {templateNames.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {templateNames.map((name, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {name}...
                            </Badge>
                          ))}
                          {count > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{count - 3} {t({ en: 'more', ar: 'المزيد' })}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TemplateCoverageAnalysis;
