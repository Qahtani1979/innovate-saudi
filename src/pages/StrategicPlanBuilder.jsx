import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { 
  Target, 
  Plus, 
  Save, 
  Sparkles, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  FileSearch,
  Layers,
  BarChart3,
  Lightbulb,
  X
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useStrategyContext, buildStrategyContextPrompt, checkObjectiveSimilarity } from '@/hooks/strategy/useStrategyContext';
import { toast } from 'sonner';

function StrategicPlanBuilder() {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [plan, setPlan] = useState({
    name_en: '',
    name_ar: '',
    vision_en: '',
    vision_ar: '',
    objectives: []
  });
  const [activeTab, setActiveTab] = useState('context');
  const [duplicateWarnings, setDuplicateWarnings] = useState([]);
  
  const { invokeAI, status, isLoading: generating, isAvailable, rateLimitInfo } = useAIWithFallback();
  
  // Fetch strategic context for informed plan creation
  const strategyContext = useStrategyContext();
  const { 
    existingPlans, 
    existingObjectives,
    gaps, 
    unresolvedChallenges, 
    uncoveredSectors,
    pestleSummary,
    swotSummary,
    stats,
    isLoading: contextLoading 
  } = strategyContext;

  // Check for duplicate title
  const duplicateTitleWarning = useMemo(() => {
    if (!plan.name_en) return null;
    const duplicate = existingPlans.find(p => 
      p.name_en?.toLowerCase() === plan.name_en.toLowerCase()
    );
    return duplicate ? `A plan with this title already exists: "${duplicate.name_en}"` : null;
  }, [plan.name_en, existingPlans]);

  // Check for similar vision
  const similarVisionWarning = useMemo(() => {
    if (!plan.vision_en || plan.vision_en.length < 20) return null;
    const planVision = plan.vision_en.toLowerCase();
    const similar = existingPlans.find(p => {
      if (!p.vision_en) return false;
      const existingVision = p.vision_en.toLowerCase();
      // Simple word overlap check
      const planWords = new Set(planVision.split(/\s+/).filter(w => w.length > 3));
      const existingWords = new Set(existingVision.split(/\s+/).filter(w => w.length > 3));
      const overlap = [...planWords].filter(w => existingWords.has(w)).length;
      return overlap > 5 && overlap / planWords.size > 0.5;
    });
    return similar ? `Similar vision exists in plan: "${similar.name_en}"` : null;
  }, [plan.vision_en, existingPlans]);

  const savePlan = useMutation({
    mutationFn: (data) => base44.entities.StrategicPlan.create({
      name_en: data.name_en,
      name_ar: data.name_ar,
      vision_en: data.vision_en,
      vision_ar: data.vision_ar,
      objectives: data.objectives,
      status: 'draft'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['strategic-plans']);
      queryClient.invalidateQueries(['strategic-plans-global']);
      queryClient.invalidateQueries(['strategy-context-plans']);
      setPlan({ name_en: '', name_ar: '', vision_en: '', vision_ar: '', objectives: [] });
      setDuplicateWarnings([]);
      toast.success(t({ en: 'Strategic plan saved successfully', ar: 'تم حفظ الخطة الاستراتيجية بنجاح' }));
    },
    onError: (error) => {
      toast.error(t({ en: 'Failed to save plan', ar: 'فشل في حفظ الخطة' }));
      console.error('Save error:', error);
    }
  });

  const generateWithAI = async () => {
    // Build context-aware prompt
    const contextPrompt = buildStrategyContextPrompt(strategyContext);
    
    // Define MoMAH sectors for sector-specific objectives
    const momahSectors = `
MOMAH KEY SECTORS (Generate at least one objective per sector):
1. URBAN_PLANNING: Urban planning, master plans, zoning, building codes, land use
2. HOUSING: Sakani program, affordable housing, real estate regulation, rental market
3. INFRASTRUCTURE: Roads, utilities, public facilities, bridges, tunnels
4. ENVIRONMENT: Waste management, recycling, green initiatives, pollution control
5. SMART_CITIES: IoT, AI, digital infrastructure, sensors, smart traffic
6. DIGITAL_SERVICES: E-services, Baladi platform, permits, licenses, digital government
7. CITIZEN_SERVICES: Customer service, complaints, public engagement, service centers
8. RURAL_DEVELOPMENT: Rural communities, agricultural areas, village services
9. PUBLIC_SPACES: Parks, gardens, plazas, recreational facilities, sports venues
10. WATER_RESOURCES: Water supply, irrigation, desalination, water conservation
11. TRANSPORTATION: Public transit, parking, traffic management, roads
12. HERITAGE: Heritage preservation, historical sites, cultural buildings
`;

    const saudiContext = `
SAUDI ARABIA MOMAH CONTEXT:
- Ministry of Municipalities and Housing (MoMAH) mandate
- 13 Administrative Regions: Riyadh, Makkah, Madinah, Eastern Province, Asir, Tabuk, Hail, Northern Borders, Jazan, Najran, Al-Baha, Al-Jouf, Qassim
- Major Cities: Riyadh, Jeddah, Makkah Al-Mukarramah, Madinah Al-Munawwarah, Dammam, Khobar, Tabuk, Abha, Buraidah, Taif
- 285+ municipalities and 17 major Amanats
- Vision 2030 Programs: Quality of Life, Housing (Sakani - 70% ownership target), National Transformation, Thriving Cities
- Focus Areas: Smart Cities, Sustainable Development, Citizen Services (Baladi), Urban Planning, Housing, Infrastructure, Rural Development, Innovation
- MEGAPROJECTS: NEOM, The Line, Oxagon, King Abdullah Financial District (KAFD)

INNOVATION & EMERGING TECHNOLOGY PRIORITY:
- Emerging Technologies: AI/ML, IoT, Blockchain, Digital Twins, Drones, 5G/6G, Autonomous Systems, Robotics, AR/VR
- GovTech: Digital permits, AI chatbots, automated compliance, predictive analytics
- PropTech: Smart buildings, BIM, construction automation, smart homes
- CleanTech: Renewable energy, smart waste management, water recycling, carbon capture
- R&D Ecosystem: Innovation labs, PoC programs, KAUST/KACST partnerships, startup collaboration
- Smart City Platforms: Integrated city management, digital twins, real-time monitoring

${momahSectors}
`;

    const result = await invokeAI({
      system_prompt: `You are a senior bilingual strategic planning and innovation expert within Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You have deep expertise in Vision 2030, Saudi municipal governance, government strategic planning, and EMERGING TECHNOLOGIES.

${saudiContext}

Your role is to analyze the existing strategic landscape and create comprehensive NEW strategic plans that:
- Fill identified gaps in Saudi municipal innovation WITH TECHNOLOGY-DRIVEN SOLUTIONS
- Leverage emerging technologies: AI, IoT, Blockchain, Digital Twins, Drones, Robotics, 5G/6G
- Align with Vision 2030 and MoMAH's extensive mandate
- Consider all 13 Saudi regions and major cities
- Support the Kingdom's transformation objectives through INNOVATION
- Address citizen needs and improve quality of life with SMART SOLUTIONS
- Include R&D, pilot programs, and proof-of-concept approaches
- Consider partnerships with startups, universities (KAUST, KACST), and tech companies

CRITICAL: Generate SECTOR-SPECIFIC objectives with INNOVATION FOCUS. Each objective MUST focus on ONE specific sector only and incorporate relevant emerging technologies. Do NOT mix multiple sectors in a single objective.

You MUST provide ALL content in BOTH English and formal Arabic. Arabic content should be professional, official, and culturally appropriate for Saudi government documentation.`,
      prompt: `${contextPrompt}

Based on the strategic context above, generate a COMPREHENSIVE and INNOVATION-FOCUSED strategic plan for Saudi municipalities that:
1. Addresses ALL identified gaps with TECHNOLOGY-DRIVEN SOLUTIONS
2. Incorporates emerging technologies: AI, IoT, Blockchain, Digital Twins, Drones, Smart Sensors
3. Aligns with Vision 2030, MoMAH priorities, and INNOVATION AGENDA
4. Avoids duplicating existing plans
5. Focuses on uncovered sectors and unresolved challenges across Saudi regions
6. Considers all major Saudi cities and their unique technology needs
7. Builds on SWOT strengths and opportunities for INNOVATION
8. Supports smart city, digital transformation, and R&D initiatives
9. Includes innovation KPIs, technology adoption metrics, and pilot approaches
10. References relevant startups, university partnerships, and tech providers

CRITICAL REQUIREMENTS:
- Generate content in BOTH English AND formal Arabic (professional government language)
- Generate 12-15 strategic objectives to fully cover MoMAH's extensive mandate
- EACH objective MUST focus on ONE specific sector (from the list above)
- Include the sector code in each objective for tracking
- Do NOT combine multiple sectors in one objective
- Each objective should address a specific gap, sector, or opportunity
- Reference relevant Vision 2030 programs where applicable
- Consider Saudi cultural context and government protocols

Format as JSON with:
- title_en: Unique, descriptive title reflecting MoMAH mandate (English)
- title_ar: Professional Arabic title suitable for official documents
- vision_en: Compelling vision statement aligned with Vision 2030 (2-3 sentences, English)
- vision_ar: Same vision in formal Arabic suitable for government documents
- objectives: Array of 12-15 SECTOR-SPECIFIC objectives, each with:
  - name_en: Clear, actionable objective name in English (focus on ONE sector)
  - name_ar: Objective name in formal Arabic
  - description_en: Detailed description with scope, expected outcomes, and Vision 2030 alignment (2-3 sentences)
  - description_ar: Same description in formal Arabic
  - sector_code: One of: URBAN_PLANNING, HOUSING, INFRASTRUCTURE, ENVIRONMENT, SMART_CITIES, DIGITAL_SERVICES, CITIZEN_SERVICES, RURAL_DEVELOPMENT, PUBLIC_SPACES, WATER_RESOURCES, TRANSPORTATION, HERITAGE`,
      response_json_schema: {
        type: "object",
        properties: {
          title_en: { type: "string" },
          title_ar: { type: "string" },
          vision_en: { type: "string" },
          vision_ar: { type: "string" },
          objectives: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name_en: { type: "string" },
                name_ar: { type: "string" },
                description_en: { type: "string" },
                description_ar: { type: "string" },
                sector_code: { type: "string" }
              },
              required: ["name_en", "name_ar", "description_en", "description_ar", "sector_code"]
            }
          }
        },
        required: ["title_en", "title_ar", "vision_en", "vision_ar", "objectives"]
      }
    });
    
    if (result.success && result.data?.response) {
      const generatedPlan = result.data.response;
      
      // Map the generated plan to correct field names
      const mappedPlan = {
        name_en: generatedPlan.title_en,
        name_ar: generatedPlan.title_ar,
        vision_en: generatedPlan.vision_en,
        vision_ar: generatedPlan.vision_ar,
        objectives: generatedPlan.objectives || []
      };
      
      // Check generated objectives for duplicates
      const warnings = [];
      mappedPlan.objectives?.forEach((obj, index) => {
        const duplicates = checkObjectiveSimilarity(obj, existingObjectives);
        if (duplicates.length > 0) {
          warnings.push({
            index,
            objective: obj.name_en,
            duplicates: duplicates.slice(0, 2)
          });
        }
      });
      
      setDuplicateWarnings(warnings);
      setPlan({ ...plan, ...mappedPlan });
      
      if (warnings.length > 0) {
        toast.warning(t({ 
          en: `${warnings.length} objectives may be similar to existing ones. Review below.`,
          ar: `${warnings.length} أهداف قد تكون مشابهة للأهداف الحالية. راجع أدناه.`
        }));
      } else {
        toast.success(t({ 
          en: `Strategic plan generated with ${mappedPlan.objectives.length} sector-specific objectives`, 
          ar: `تم إنشاء الخطة الاستراتيجية مع ${mappedPlan.objectives.length} هدف قطاعي محدد`
        }));
      }
    } else {
      toast.error(t({ en: 'Failed to generate plan. Please try again.', ar: 'فشل في إنشاء الخطة. يرجى المحاولة مرة أخرى.' }));
    }
  };

  const removeObjective = (index) => {
    setPlan({ 
      ...plan, 
      objectives: plan.objectives.filter((_, i) => i !== index) 
    });
    setDuplicateWarnings(duplicateWarnings.filter(w => w.index !== index));
  };

  const handleSave = () => {
    if (duplicateTitleWarning) {
      toast.error(t({ en: 'Please use a unique plan title', ar: 'يرجى استخدام عنوان خطة فريد' }));
      return;
    }
    savePlan.mutate(plan);
  };

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            {t({ en: 'Strategic Plan Builder', ar: 'بناء الخطة الاستراتيجية' })}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t({ en: 'Create context-aware strategic plans that fill identified gaps', ar: 'إنشاء خطط استراتيجية مدركة للسياق تسد الفجوات المحددة' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
          <Button onClick={generateWithAI} disabled={generating || !isAvailable || contextLoading}>
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'Generate with AI', ar: 'إنشاء بالذكاء الاصطناعي' })}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="context" className="flex items-center gap-2">
            <FileSearch className="h-4 w-4" />
            {t({ en: 'Context', ar: 'السياق' })}
          </TabsTrigger>
          <TabsTrigger value="gaps" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {t({ en: 'Gaps', ar: 'الفجوات' })}
            {gaps.length > 0 && <Badge variant="destructive" className="ml-1">{gaps.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            {t({ en: 'Create', ar: 'إنشاء' })}
          </TabsTrigger>
        </TabsList>

        {/* Context Tab - Shows existing strategic landscape */}
        <TabsContent value="context" className="space-y-4">
          {contextLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.totalPlans}</p>
                        <p className="text-sm text-muted-foreground">{t({ en: 'Strategic Plans', ar: 'الخطط الاستراتيجية' })}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.unresolvedChallenges}</p>
                        <p className="text-sm text-muted-foreground">{t({ en: 'Unlinked Challenges', ar: 'التحديات غير المرتبطة' })}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.coveredSectorCount}</p>
                        <p className="text-sm text-muted-foreground">{t({ en: 'Covered Sectors', ar: 'القطاعات المغطاة' })}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/10 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.uncoveredSectorCount}</p>
                        <p className="text-sm text-muted-foreground">{t({ en: 'Uncovered Sectors', ar: 'القطاعات غير المغطاة' })}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Existing Plans */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {t({ en: 'Existing Strategic Plans', ar: 'الخطط الاستراتيجية الحالية' })}
                  </CardTitle>
                  <CardDescription>
                    {t({ en: 'Review existing plans to avoid duplication', ar: 'راجع الخطط الحالية لتجنب التكرار' })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-3">
                      {existingPlans.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                          {t({ en: 'No existing plans found', ar: 'لم يتم العثور على خطط حالية' })}
                        </p>
                      ) : (
                        existingPlans.map((p) => (
                          <div key={p.id} className="p-3 border rounded-lg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium">{language === 'ar' ? p.name_ar || p.name_en : p.name_en}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {language === 'ar' ? p.vision_ar || p.vision_en : p.vision_en}
                                </p>
                              </div>
                              <Badge variant={p.status === 'active' ? 'default' : 'secondary'}>
                                {p.status === 'active' ? t({ en: 'Active', ar: 'نشط' }) : 
                                 p.status === 'draft' ? t({ en: 'Draft', ar: 'مسودة' }) : 
                                 p.status || t({ en: 'Draft', ar: 'مسودة' })}
                              </Badge>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {(p.objectives || []).length} {t({ en: 'objectives', ar: 'أهداف' })}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {(p.pillars || []).length} {t({ en: 'pillars', ar: 'ركائز' })}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* PESTLE & SWOT Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      {t({ en: 'PESTLE Summary', ar: 'ملخص PESTLE' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600">{t({ en: 'Opportunities', ar: 'الفرص' })}</span>
                        <Badge variant="secondary">{pestleSummary.opportunities.length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-red-600">{t({ en: 'Threats', ar: 'التهديدات' })}</span>
                        <Badge variant="secondary">{pestleSummary.threats.length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-amber-600">{t({ en: 'High Impact', ar: 'تأثير عالي' })}</span>
                        <Badge variant="secondary">{pestleSummary.highImpact.length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      {t({ en: 'SWOT Summary', ar: 'ملخص SWOT' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600">{t({ en: 'Strengths', ar: 'نقاط القوة' })}</span>
                        <Badge variant="secondary">{swotSummary.strengths.length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-red-600">{t({ en: 'Weaknesses', ar: 'نقاط الضعف' })}</span>
                        <Badge variant="secondary">{swotSummary.weaknesses.length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-600">{t({ en: 'Opportunities', ar: 'الفرص' })}</span>
                        <Badge variant="secondary">{swotSummary.opportunities.length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-amber-600">{t({ en: 'Threats', ar: 'التهديدات' })}</span>
                        <Badge variant="secondary">{swotSummary.threats.length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Gaps Tab - Shows identified gaps */}
        <TabsContent value="gaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                {t({ en: 'Identified Strategic Gaps', ar: 'الفجوات الاستراتيجية المحددة' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'These gaps should be addressed in new strategic plans', ar: 'يجب معالجة هذه الفجوات في الخطط الاستراتيجية الجديدة' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gaps.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-3" />
                  <p className="text-muted-foreground">
                    {t({ en: 'No critical gaps identified', ar: 'لم يتم تحديد فجوات حرجة' })}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gaps.map((gap, index) => (
                    <Alert key={index} variant={gap.severity === 'high' ? 'destructive' : 'default'} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{language === 'ar' ? gap.title_ar || gap.title : gap.title}</p>
                            <p className="text-sm mt-1">{language === 'ar' ? gap.description_ar || gap.description : gap.description}</p>
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>{t({ en: 'Recommendation:', ar: 'التوصية:' })}</strong> {language === 'ar' ? gap.recommendation_ar || gap.recommendation : gap.recommendation}
                            </p>
                          </div>
                          <Badge variant={gap.severity === 'high' ? 'destructive' : 'secondary'}>
                            {gap.severity === 'high' ? t({ en: 'High', ar: 'عالي' }) : 
                             gap.severity === 'medium' ? t({ en: 'Medium', ar: 'متوسط' }) : 
                             t({ en: 'Low', ar: 'منخفض' })}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Uncovered Sectors */}
          {uncoveredSectors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t({ en: 'Uncovered Sectors', ar: 'القطاعات غير المغطاة' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {uncoveredSectors.map((sector) => (
                    <Badge key={sector.id} variant="outline" className="text-sm">
                      {language === 'ar' ? sector.name_ar : sector.name_en}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unresolved Challenges */}
          {unresolvedChallenges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t({ en: 'Unlinked Challenges', ar: 'التحديات غير المرتبطة' })}</CardTitle>
                <CardDescription>
                  {t({ en: 'These challenges are not linked to any strategic plan', ar: 'هذه التحديات غير مرتبطة بأي خطة استراتيجية' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {unresolvedChallenges.slice(0, 10).map((challenge) => (
                      <div key={challenge.id} className="p-2 border rounded-lg flex items-center justify-between" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        <span className="text-sm">{language === 'ar' ? challenge.title_ar || challenge.title_en : challenge.title_en}</span>
                        <Badge variant="outline">{challenge.priority || t({ en: 'Not set', ar: 'غير محدد' })}</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Create Tab - Plan creation form */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Plan Details', ar: 'تفاصيل الخطة' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title fields - English and Arabic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })}</label>
                  <Input
                    value={plan.name_en}
                    onChange={(e) => setPlan({ ...plan, name_en: e.target.value })}
                    placeholder={t({ en: 'Enter title in English...', ar: 'أدخل العنوان بالإنجليزية...' })}
                    className={duplicateTitleWarning ? 'border-red-500' : ''}
                    dir="ltr"
                  />
                  {duplicateTitleWarning && (
                    <p className="text-sm text-red-500 mt-1">{duplicateTitleWarning}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}</label>
                  <Input
                    value={plan.name_ar}
                    onChange={(e) => setPlan({ ...plan, name_ar: e.target.value })}
                    placeholder={t({ en: 'Enter title in Arabic...', ar: 'أدخل العنوان بالعربية...' })}
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Vision fields - English and Arabic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Vision (English)', ar: 'الرؤية (إنجليزي)' })}</label>
                  <Textarea
                    value={plan.vision_en}
                    onChange={(e) => setPlan({ ...plan, vision_en: e.target.value })}
                    placeholder={t({ en: 'Enter vision statement in English...', ar: 'أدخل بيان الرؤية بالإنجليزية...' })}
                    rows={4}
                    className={similarVisionWarning ? 'border-amber-500' : ''}
                    dir="ltr"
                  />
                  {similarVisionWarning && (
                    <p className="text-sm text-amber-500 mt-1">{similarVisionWarning}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Vision (Arabic)', ar: 'الرؤية (عربي)' })}</label>
                  <Textarea
                    value={plan.vision_ar}
                    onChange={(e) => setPlan({ ...plan, vision_ar: e.target.value })}
                    placeholder={t({ en: 'Enter vision statement in Arabic...', ar: 'أدخل بيان الرؤية بالعربية...' })}
                    rows={4}
                    dir="rtl"
                  />
                </div>
              </div>
              
              {/* Objectives */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">{t({ en: 'Strategic Objectives', ar: 'الأهداف الاستراتيجية' })}</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPlan({ ...plan, objectives: [...plan.objectives, { name_en: '', name_ar: '', description_en: '', description_ar: '' }] })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t({ en: 'Add', ar: 'إضافة' })}
                  </Button>
                </div>
                <div className="space-y-3">
                  {plan.objectives.map((obj, i) => {
                    const warning = duplicateWarnings.find(w => w.index === i);
                    return (
                      <div key={i} className={`p-3 border rounded-lg space-y-3 ${warning ? 'border-amber-500 bg-amber-50' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            {/* Sector badge */}
                            {obj.sector_code && (
                              <Badge variant="outline" className="text-xs bg-primary/10">
                                {obj.sector_code.replace(/_/g, ' ')}
                              </Badge>
                            )}
                            {/* Objective names - English and Arabic */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Input
                                placeholder={t({ en: 'Objective name (English)', ar: 'اسم الهدف (إنجليزي)' })}
                                value={obj.name_en}
                                onChange={(e) => {
                                  const newObjs = [...plan.objectives];
                                  newObjs[i].name_en = e.target.value;
                                  setPlan({ ...plan, objectives: newObjs });
                                }}
                                dir="ltr"
                              />
                              <Input
                                placeholder={t({ en: 'Objective name (Arabic)', ar: 'اسم الهدف (عربي)' })}
                                value={obj.name_ar || ''}
                                onChange={(e) => {
                                  const newObjs = [...plan.objectives];
                                  newObjs[i].name_ar = e.target.value;
                                  setPlan({ ...plan, objectives: newObjs });
                                }}
                                dir="rtl"
                              />
                            </div>
                            {/* Objective descriptions - English and Arabic */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Textarea
                                placeholder={t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}
                                value={obj.description_en}
                                onChange={(e) => {
                                  const newObjs = [...plan.objectives];
                                  newObjs[i].description_en = e.target.value;
                                  setPlan({ ...plan, objectives: newObjs });
                                }}
                                rows={2}
                                dir="ltr"
                              />
                              <Textarea
                                placeholder={t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}
                                value={obj.description_ar || ''}
                                onChange={(e) => {
                                  const newObjs = [...plan.objectives];
                                  newObjs[i].description_ar = e.target.value;
                                  setPlan({ ...plan, objectives: newObjs });
                                }}
                                rows={2}
                                dir="rtl"
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2 text-destructive"
                            onClick={() => removeObjective(i)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {warning && (
                          <Alert variant="default" className="bg-amber-100 border-amber-300">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800 text-sm">
                              <strong>{t({ en: 'Potential duplicate:', ar: 'تكرار محتمل:' })}</strong>
                              {warning.duplicates.map((d, di) => (
                                <div key={di} className="mt-1">
                                  "{language === 'ar' ? d.existing.name_ar || d.existing.name_en : d.existing.name_en}" ({d.similarity}% {t({ en: 'similar', ar: 'متشابه' })}) - {d.existing.planName}
                                </div>
                              ))}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button 
                onClick={handleSave} 
                className="w-full" 
                disabled={!plan.name_en || duplicateTitleWarning || savePlan.isPending}
              >
                {savePlan.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {t({ en: 'Save Strategic Plan', ar: 'حفظ الخطة الاستراتيجية' })}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(StrategicPlanBuilder, { requiredPermissions: ['strategy_manage'] });
