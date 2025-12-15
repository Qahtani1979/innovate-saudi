// Strategy Wizard Steps Configuration
import { 
  FileText, Target, BarChart3, Lightbulb, Link, Activity, Calendar, CheckCircle2,
  Eye, Users, Globe, TrendingUp, AlertTriangle, GitBranch, Shield, Building2,
  Megaphone, RefreshCw, DollarSign, Network
} from 'lucide-react';

// Organized into 4 phases with 18 total steps
export const WIZARD_PHASES = [
  { 
    key: 'foundation', 
    title: { en: 'Foundation', ar: 'التأسيس' },
    steps: [1, 2, 3, 4]
  },
  { 
    key: 'analysis', 
    title: { en: 'Analysis', ar: 'التحليل' },
    steps: [5, 6, 7, 8]
  },
  { 
    key: 'strategy', 
    title: { en: 'Strategy', ar: 'الاستراتيجية' },
    steps: [9, 10, 11, 12, 13]
  },
  { 
    key: 'implementation', 
    title: { en: 'Implementation', ar: 'التنفيذ' },
    steps: [14, 15, 16, 17, 18]
  }
];

export const WIZARD_STEPS = [
  // === PHASE A: FOUNDATION (1-4) ===
  { 
    num: 1, 
    key: 'context',
    phase: 'foundation',
    title: { en: 'Context & Discovery', ar: 'السياق والاستكشاف' },
    description: { en: 'Foundation, scope, and situational analysis', ar: 'الأساس والنطاق وتحليل الوضع' },
    icon: FileText,
    required: true  // Plan name required
  },
  { 
    num: 2, 
    key: 'vision',
    phase: 'foundation',
    title: { en: 'Vision & Mission', ar: 'الرؤية والرسالة' },
    description: { en: 'Define strategic vision and mission statements', ar: 'تحديد الرؤية والرسالة الاستراتيجية' },
    icon: Eye,
    required: true  // Vision & mission required
  },
  { 
    num: 3, 
    key: 'stakeholders',
    phase: 'foundation',
    title: { en: 'Stakeholder Analysis', ar: 'تحليل أصحاب المصلحة' },
    description: { en: 'Map stakeholders with power/interest matrix', ar: 'تحليل أصحاب المصلحة بمصفوفة القوة/الاهتمام' },
    icon: Users,
    required: false  // Recommended but optional
  },
  { 
    num: 4, 
    key: 'pestel',
    phase: 'foundation',
    title: { en: 'PESTEL Analysis', ar: 'تحليل PESTEL' },
    description: { en: 'Political, Economic, Social, Tech, Environmental, Legal', ar: 'التحليل السياسي والاقتصادي والاجتماعي والتقني والبيئي والقانوني' },
    icon: Globe,
    required: false
  },

  // === PHASE B: ANALYSIS (5-8) ===
  { 
    num: 5, 
    key: 'swot',
    phase: 'analysis',
    title: { en: 'SWOT Analysis', ar: 'تحليل SWOT' },
    description: { en: 'Strengths, Weaknesses, Opportunities, Threats', ar: 'نقاط القوة والضعف والفرص والتهديدات' },
    icon: BarChart3,
    required: false  // Recommended but optional
  },
  { 
    num: 6, 
    key: 'scenarios',
    phase: 'analysis',
    title: { en: 'Scenario Planning', ar: 'تخطيط السيناريوهات' },
    description: { en: 'Best case, worst case, and most likely scenarios', ar: 'أفضل حالة، أسوأ حالة، والسيناريو الأكثر احتمالاً' },
    icon: TrendingUp,
    required: false
  },
  { 
    num: 7, 
    key: 'risks',
    phase: 'analysis',
    title: { en: 'Risk Assessment', ar: 'تقييم المخاطر' },
    description: { en: 'Identify risks and mitigation strategies', ar: 'تحديد المخاطر واستراتيجيات التخفيف' },
    icon: AlertTriangle,
    required: false  // Recommended but optional
  },
  { 
    num: 8, 
    key: 'dependencies',
    phase: 'analysis',
    title: { en: 'Dependencies & Constraints', ar: 'التبعيات والقيود' },
    description: { en: 'Map dependencies and define constraints', ar: 'تحديد التبعيات وتعريف القيود' },
    icon: GitBranch,
    required: false
  },

  // === PHASE C: STRATEGY (9-13) ===
  { 
    num: 9, 
    key: 'objectives',
    phase: 'strategy',
    title: { en: 'Strategic Objectives', ar: 'الأهداف الاستراتيجية' },
    description: { en: 'Define goals and outcomes', ar: 'تحديد الأهداف والنتائج' },
    icon: Target,
    required: true  // At least one objective required
  },
  { 
    num: 10, 
    key: 'national',
    phase: 'strategy',
    title: { en: 'National Alignment', ar: 'التوافق الوطني' },
    description: { en: 'Link to Vision 2030 and national goals', ar: 'الربط برؤية 2030 والأهداف الوطنية' },
    icon: Link,
    required: false  // Optional
  },
  { 
    num: 11, 
    key: 'kpis',
    phase: 'strategy',
    title: { en: 'KPIs & Metrics', ar: 'مؤشرات الأداء' },
    description: { en: 'Define success measurements', ar: 'تحديد قياسات النجاح' },
    icon: Activity,
    required: false  // Recommended but optional
  },
  { 
    num: 12, 
    key: 'actions',
    phase: 'strategy',
    title: { en: 'Action Plans', ar: 'خطط العمل' },
    description: { en: 'Initiatives and programs', ar: 'المبادرات والبرامج' },
    icon: Lightbulb,
    required: false  // Recommended but optional
  },
  { 
    num: 13, 
    key: 'resources',
    phase: 'strategy',
    title: { en: 'Resource Planning', ar: 'تخطيط الموارد' },
    description: { en: 'HR, technology, infrastructure, and budget allocation', ar: 'الموارد البشرية والتقنية والبنية التحتية وتخصيص الميزانية' },
    icon: DollarSign,
    required: false  // Optional
  },

  // === PHASE D: IMPLEMENTATION (14-18) ===
  { 
    num: 14, 
    key: 'timeline',
    phase: 'implementation',
    title: { en: 'Timeline & Milestones', ar: 'الجدول الزمني' },
    description: { en: 'Schedule and key dates', ar: 'الجدول والتواريخ الرئيسية' },
    icon: Calendar,
    required: false  // Recommended but optional
  },
  { 
    num: 15, 
    key: 'governance',
    phase: 'implementation',
    title: { en: 'Governance Structure', ar: 'هيكل الحوكمة' },
    description: { en: 'Oversight, committees, and reporting lines', ar: 'الإشراف واللجان وخطوط التقارير' },
    icon: Building2,
    required: false  // Optional
  },
  { 
    num: 16, 
    key: 'communication',
    phase: 'implementation',
    title: { en: 'Communication Plan', ar: 'خطة التواصل' },
    description: { en: 'Internal and external communication strategy', ar: 'استراتيجية التواصل الداخلي والخارجي' },
    icon: Megaphone,
    required: false
  },
  { 
    num: 17, 
    key: 'change',
    phase: 'implementation',
    title: { en: 'Change Management', ar: 'إدارة التغيير' },
    description: { en: 'Organizational readiness and change approach', ar: 'جاهزية المنظمة ونهج التغيير' },
    icon: RefreshCw,
    required: false
  },
  { 
    num: 18, 
    key: 'review',
    phase: 'implementation',
    title: { en: 'Review & Submit', ar: 'المراجعة والإرسال' },
    description: { en: 'Final review and submission', ar: 'المراجعة النهائية والإرسال' },
    icon: CheckCircle2,
    required: true  // Final step always required
  }
];

export const MOMAH_SECTORS = [
  { code: 'URBAN_PLANNING', name_en: 'Urban Planning', name_ar: 'التخطيط الحضري' },
  { code: 'HOUSING', name_en: 'Housing', name_ar: 'الإسكان' },
  { code: 'INFRASTRUCTURE', name_en: 'Infrastructure', name_ar: 'البنية التحتية' },
  { code: 'ENVIRONMENT', name_en: 'Environment', name_ar: 'البيئة' },
  { code: 'SMART_CITIES', name_en: 'Smart Cities', name_ar: 'المدن الذكية' },
  { code: 'DIGITAL_SERVICES', name_en: 'Digital Services', name_ar: 'الخدمات الرقمية' },
  { code: 'CITIZEN_SERVICES', name_en: 'Citizen Services', name_ar: 'خدمات المواطنين' },
  { code: 'RURAL_DEVELOPMENT', name_en: 'Rural Development', name_ar: 'التنمية الريفية' },
  { code: 'PUBLIC_SPACES', name_en: 'Public Spaces', name_ar: 'الأماكن العامة' },
  { code: 'WATER_RESOURCES', name_en: 'Water Resources', name_ar: 'الموارد المائية' },
  { code: 'TRANSPORTATION', name_en: 'Transportation', name_ar: 'النقل' },
  { code: 'HERITAGE', name_en: 'Heritage', name_ar: 'التراث' }
];

export const STRATEGIC_THEMES = [
  { code: 'DIGITAL_TRANSFORMATION', name_en: 'Digital Transformation', name_ar: 'التحول الرقمي' },
  { code: 'SUSTAINABILITY', name_en: 'Sustainability & Green', name_ar: 'الاستدامة والبيئة' },
  { code: 'CITIZEN_EXPERIENCE', name_en: 'Citizen Experience', name_ar: 'تجربة المواطن' },
  { code: 'INNOVATION', name_en: 'Innovation & R&D', name_ar: 'الابتكار والبحث' },
  { code: 'GOVERNANCE', name_en: 'Governance & Compliance', name_ar: 'الحوكمة والامتثال' },
  { code: 'ECONOMIC_ENABLEMENT', name_en: 'Economic Enablement', name_ar: 'التمكين الاقتصادي' },
  { code: 'QUALITY_OF_LIFE', name_en: 'Quality of Life', name_ar: 'جودة الحياة' },
  { code: 'OPERATIONAL_EXCELLENCE', name_en: 'Operational Excellence', name_ar: 'التميز التشغيلي' }
];

export const VISION_2030_PROGRAMS = [
  { code: 'QUALITY_OF_LIFE', name_en: 'Quality of Life Program', name_ar: 'برنامج جودة الحياة' },
  { code: 'HOUSING', name_en: 'Housing Program (Sakani)', name_ar: 'برنامج الإسكان (سكني)' },
  { code: 'NTP', name_en: 'National Transformation Program', name_ar: 'برنامج التحول الوطني' },
  { code: 'THRIVING_CITIES', name_en: 'Thriving Cities', name_ar: 'المدن المزدهرة' },
  { code: 'FISCAL_BALANCE', name_en: 'Fiscal Balance Program', name_ar: 'برنامج التوازن المالي' },
  { code: 'PRIVATIZATION', name_en: 'Privatization Program', name_ar: 'برنامج التخصيص' },
  { code: 'DARP', name_en: 'Digital Government', name_ar: 'الحكومة الرقمية' }
];

export const REGIONS = [
  { code: 'RIYADH', name_en: 'Riyadh Region', name_ar: 'منطقة الرياض' },
  { code: 'MAKKAH', name_en: 'Makkah Region', name_ar: 'منطقة مكة المكرمة' },
  { code: 'MADINAH', name_en: 'Madinah Region', name_ar: 'منطقة المدينة المنورة' },
  { code: 'EASTERN', name_en: 'Eastern Province', name_ar: 'المنطقة الشرقية' },
  { code: 'ASIR', name_en: 'Asir Region', name_ar: 'منطقة عسير' },
  { code: 'TABUK', name_en: 'Tabuk Region', name_ar: 'منطقة تبوك' },
  { code: 'HAIL', name_en: 'Hail Region', name_ar: 'منطقة حائل' },
  { code: 'NORTHERN_BORDERS', name_en: 'Northern Borders', name_ar: 'منطقة الحدود الشمالية' },
  { code: 'JAZAN', name_en: 'Jazan Region', name_ar: 'منطقة جازان' },
  { code: 'NAJRAN', name_en: 'Najran Region', name_ar: 'منطقة نجران' },
  { code: 'AL_BAHA', name_en: 'Al-Baha Region', name_ar: 'منطقة الباحة' },
  { code: 'AL_JOUF', name_en: 'Al-Jouf Region', name_ar: 'منطقة الجوف' },
  { code: 'QASSIM', name_en: 'Qassim Region', name_ar: 'منطقة القصيم' }
];

export const EMERGING_TECHNOLOGIES = [
  { code: 'AI_ML', name_en: 'AI & Machine Learning', name_ar: 'الذكاء الاصطناعي' },
  { code: 'IOT', name_en: 'Internet of Things', name_ar: 'إنترنت الأشياء' },
  { code: 'BLOCKCHAIN', name_en: 'Blockchain', name_ar: 'البلوكتشين' },
  { code: 'DIGITAL_TWINS', name_en: 'Digital Twins', name_ar: 'التوائم الرقمية' },
  { code: 'DRONES', name_en: 'Drones & UAVs', name_ar: 'الطائرات المسيرة' },
  { code: '5G_6G', name_en: '5G/6G Networks', name_ar: 'شبكات الجيل الخامس' },
  { code: 'ROBOTICS', name_en: 'Robotics & Automation', name_ar: 'الروبوتات والأتمتة' },
  { code: 'AR_VR', name_en: 'AR/VR/XR', name_ar: 'الواقع المعزز والافتراضي' },
  { code: 'BIM', name_en: 'BIM & GIS', name_ar: 'نمذجة معلومات البناء' },
  { code: 'CLEANTECH', name_en: 'CleanTech', name_ar: 'التقنيات النظيفة' }
];

export const STAKEHOLDER_TYPES = [
  { code: 'INTERNAL', name_en: 'Internal', name_ar: 'داخلي' },
  { code: 'GOVERNMENT', name_en: 'Government Entity', name_ar: 'جهة حكومية' },
  { code: 'PRIVATE', name_en: 'Private Sector', name_ar: 'القطاع الخاص' },
  { code: 'CITIZEN', name_en: 'Citizens', name_ar: 'المواطنون' },
  { code: 'VENDOR', name_en: 'Vendors/Suppliers', name_ar: 'الموردون' },
  { code: 'NGO', name_en: 'NGO/Non-profit', name_ar: 'منظمات غير ربحية' },
  { code: 'ACADEMIA', name_en: 'Academia/Research', name_ar: 'الأكاديميا والبحث' },
  { code: 'MEDIA', name_en: 'Media', name_ar: 'الإعلام' }
];

export const RISK_CATEGORIES = [
  { code: 'STRATEGIC', name_en: 'Strategic', name_ar: 'استراتيجي' },
  { code: 'OPERATIONAL', name_en: 'Operational', name_ar: 'تشغيلي' },
  { code: 'FINANCIAL', name_en: 'Financial', name_ar: 'مالي' },
  { code: 'REGULATORY', name_en: 'Regulatory/Compliance', name_ar: 'تنظيمي/امتثال' },
  { code: 'TECHNOLOGY', name_en: 'Technology', name_ar: 'تقني' },
  { code: 'REPUTATIONAL', name_en: 'Reputational', name_ar: 'سمعة' },
  { code: 'POLITICAL', name_en: 'Political', name_ar: 'سياسي' },
  { code: 'ENVIRONMENTAL', name_en: 'Environmental', name_ar: 'بيئي' }
];

export const GOVERNANCE_ROLES = [
  { code: 'STEERING_COMMITTEE', name_en: 'Steering Committee', name_ar: 'اللجنة التوجيهية' },
  { code: 'EXECUTIVE_SPONSOR', name_en: 'Executive Sponsor', name_ar: 'الراعي التنفيذي' },
  { code: 'PROGRAM_MANAGER', name_en: 'Program Manager', name_ar: 'مدير البرنامج' },
  { code: 'WORKSTREAM_LEAD', name_en: 'Workstream Lead', name_ar: 'قائد مسار العمل' },
  { code: 'PMO', name_en: 'PMO', name_ar: 'مكتب إدارة المشاريع' },
  { code: 'QUALITY_ASSURANCE', name_en: 'Quality Assurance', name_ar: 'ضمان الجودة' },
  { code: 'CHANGE_BOARD', name_en: 'Change Control Board', name_ar: 'لجنة التحكم بالتغيير' }
];

export const initialWizardData = {
  // Step 1: Context & Discovery
  name_en: '',
  name_ar: '',
  description_en: '',
  description_ar: '',
  duration_years: 5,
  start_year: new Date().getFullYear(),
  end_year: new Date().getFullYear() + 5,
  target_sectors: [],
  target_regions: [],
  strategic_themes: [],
  focus_technologies: [],
  vision_2030_programs: [],
  budget_range: '',
  currency: 'SAR',
  quick_stakeholders: [], // Simple list for quick discovery
  key_challenges: '',
  available_resources: '',
  initial_constraints: '',
  
  // Step 2: Vision & Mission
  vision_en: '',
  vision_ar: '',
  mission_en: '',
  mission_ar: '',
  core_values: [],
  strategic_pillars: [],
  
  // Step 3: Stakeholder Analysis
  stakeholders: [],
  stakeholder_engagement_plan: '',
  
  // Step 4: PESTEL
  pestel: {
    political: [],
    economic: [],
    social: [],
    technological: [],
    environmental: [],
    legal: []
  },
  
  // Step 5: SWOT
  swot: {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  },
  
  // Step 6: Scenario Planning
  scenarios: {
    best_case: { description_en: '', description_ar: '', assumptions: [], outcomes: [], probability: '' },
    worst_case: { description_en: '', description_ar: '', assumptions: [], outcomes: [], probability: '' },
    most_likely: { description_en: '', description_ar: '', assumptions: [], outcomes: [], probability: '' }
  },
  
  // Step 7: Risk Assessment
  risks: [],
  risk_appetite: 'moderate',
  
  // Step 8: Dependencies & Constraints
  dependencies: [],
  constraints: [],
  assumptions: [],
  
  // Step 9: Objectives
  objectives: [],
  
  // Step 10: National Alignment
  national_alignments: [],
  
  // Step 11: KPIs
  kpis: [],
  
  // Step 12: Action Plans
  action_plans: [],
  
  // Step 13: Resource Planning
  resource_plan: {
    hr_requirements: [],
    technology_requirements: [],
    infrastructure_requirements: [],
    budget_allocation: []
  },
  
  // Step 14: Timeline
  milestones: [],
  phases: [],
  
  // Step 15: Governance
  governance: {
    structure: [],
    committees: [],
    reporting_frequency: 'monthly',
    escalation_path: []
  },
  
  // Step 16: Communication
  communication_plan: {
    internal_channels: [],
    external_channels: [],
    key_messages: [],
    frequency: {}
  },
  
  // Step 17: Change Management
  change_management: {
    readiness_assessment_en: '',
    readiness_assessment_ar: '',
    change_approach_en: '',
    change_approach_ar: '',
    training_plan: [],
    resistance_management_en: '',
    resistance_management_ar: ''
  },
  
  // Metadata
  status: 'draft',
  created_at: new Date().toISOString()
};
