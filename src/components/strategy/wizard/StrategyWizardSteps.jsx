import React from 'react';
import { 
  FileText, Target, BarChart3, Lightbulb, Link, Activity, Calendar, CheckCircle2 
} from 'lucide-react';

export const WIZARD_STEPS = [
  { 
    num: 1, 
    key: 'context',
    title: { en: 'Context & Discovery', ar: 'السياق والاستكشاف' },
    description: { en: 'Foundation and situational analysis', ar: 'الأساس وتحليل الوضع' },
    icon: FileText 
  },
  { 
    num: 2, 
    key: 'swot',
    title: { en: 'SWOT Analysis', ar: 'تحليل SWOT' },
    description: { en: 'Strengths, Weaknesses, Opportunities, Threats', ar: 'نقاط القوة والضعف والفرص والتهديدات' },
    icon: BarChart3 
  },
  { 
    num: 3, 
    key: 'objectives',
    title: { en: 'Strategic Objectives', ar: 'الأهداف الاستراتيجية' },
    description: { en: 'Define goals and outcomes', ar: 'تحديد الأهداف والنتائج' },
    icon: Target 
  },
  { 
    num: 4, 
    key: 'national',
    title: { en: 'National Alignment', ar: 'التوافق الوطني' },
    description: { en: 'Link to Vision 2030 and national goals', ar: 'الربط برؤية 2030 والأهداف الوطنية' },
    icon: Link 
  },
  { 
    num: 5, 
    key: 'kpis',
    title: { en: 'KPIs & Metrics', ar: 'مؤشرات الأداء' },
    description: { en: 'Define success measurements', ar: 'تحديد قياسات النجاح' },
    icon: Activity 
  },
  { 
    num: 6, 
    key: 'actions',
    title: { en: 'Action Plans', ar: 'خطط العمل' },
    description: { en: 'Initiatives and programs', ar: 'المبادرات والبرامج' },
    icon: Lightbulb 
  },
  { 
    num: 7, 
    key: 'timeline',
    title: { en: 'Timeline & Milestones', ar: 'الجدول الزمني' },
    description: { en: 'Schedule and key dates', ar: 'الجدول والتواريخ الرئيسية' },
    icon: Calendar 
  },
  { 
    num: 8, 
    key: 'review',
    title: { en: 'Review & Submit', ar: 'المراجعة والإرسال' },
    description: { en: 'Final review and submission', ar: 'المراجعة النهائية والإرسال' },
    icon: CheckCircle2 
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

export const initialWizardData = {
  // Step 1: Context & Discovery
  name_en: '',
  name_ar: '',
  vision_en: '',
  vision_ar: '',
  mission_en: '',
  mission_ar: '',
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
  stakeholders: [],
  key_challenges: '',
  available_resources: '',
  constraints: '',
  
  // Step 2: SWOT
  swot: {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  },
  
  // Step 3: Objectives
  objectives: [],
  
  // Step 4: National Alignment
  national_alignments: [],
  
  // Step 5: KPIs
  kpis: [],
  
  // Step 6: Action Plans
  action_plans: [],
  
  // Step 7: Timeline
  milestones: [],
  phases: [],
  
  // Metadata
  status: 'draft',
  created_at: new Date().toISOString()
};
