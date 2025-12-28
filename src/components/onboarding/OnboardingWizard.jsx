import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// import { useQuery } from '@tanstack/react-query'; // Removed unused import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';
import FileUploader from '../FileUploader';
import { useAutoRoleAssignment } from '@/hooks/useAutoRoleAssignment';
import {
  CheckCircle2, ArrowRight, ArrowLeft, Sparkles,
  Building2, Lightbulb, FlaskConical, Users, Eye,
  Rocket, Target, BookOpen, X, Loader2,
  User, Briefcase, GraduationCap, Wand2, RefreshCw,
  Upload, FileText, Linkedin, Globe, Award, AlertTriangle, Bot, Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import {
  buildTranslationPrompt,
  TRANSLATION_SCHEMA,
  buildLinkedInImportPrompt,
  LINKEDIN_IMPORT_SCHEMA,
  buildProfileSuggestionsPrompt,
  PROFILE_SUGGESTIONS_SCHEMA
} from '@/lib/ai/prompts/onboarding';
import { useSectors } from '@/hooks/useSectors';
import { useRegions, useCities as useRegionCities } from '@/hooks/useRegions';
import { useOnboardingMutations } from '@/hooks/useOnboardingMutations';

// Email logic moved to mutation

// Send role request notification via unified rbac-manager
const sendRoleRequestNotification = async (type, requestData) => {
  try {
    const rbacService = (await import('@/services/rbac/rbacService')).default;
    await rbacService.sendRoleNotification({
      type,
      ...requestData
    });

  } catch (err) {
    console.warn('Failed to send role notification:', err);
  }
};

// Roles that require approval vs auto-approved
const AUTO_APPROVED_ROLES = ['citizen', 'viewer'];
const REQUIRES_APPROVAL_ROLES = ['municipality_staff', 'provider', 'researcher', 'expert', 'deputyship'];

// MoMAH (Ministry of Municipalities and Housing) domain for auto-detecting deputyship users
const MOMAH_DOMAINS = ['momah.gov.sa', 'housing.gov.sa'];

// Helper to detect if email belongs to MoMAH
const isMoMAHEmail = (email) => {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return MOMAH_DOMAINS.some(d => domain === d || domain?.endsWith('.' + d));
};

const PERSONAS = [
  {
    id: 'deputyship',
    icon: Shield,
    color: 'from-indigo-500 to-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    title: { en: 'MoMAH / Deputyship', ar: 'وزارة البلديات والإسكان / الوكالة' },
    description: { en: 'I work at MoMAH and oversee municipal innovation nationally', ar: 'أعمل في وزارة البلديات والإسكان وأشرف على الابتكار البلدي وطنياً' },
    landingPage: 'ExecutiveDashboard',
    requiresApproval: true,
    domainHint: MOMAH_DOMAINS
  },
  {
    id: 'municipality_staff',
    icon: Building2,
    color: 'from-purple-500 to-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    title: { en: 'Municipality Staff', ar: 'موظف بلدية' },
    description: { en: 'I work at a municipality and want to solve urban challenges', ar: 'أعمل في بلدية وأريد حل التحديات الحضرية' },
    landingPage: 'MunicipalityDashboard',
    requiresApproval: true
  },
  {
    id: 'provider',
    icon: Rocket,
    color: 'from-blue-500 to-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    title: { en: 'Solution Provider / Startup', ar: 'مزود حلول / شركة ناشئة' },
    description: { en: 'I have solutions to offer and want to find opportunities', ar: 'لدي حلول أريد تقديمها وأبحث عن فرص' },
    landingPage: 'StartupDashboard',
    requiresApproval: true
  },
  {
    id: 'researcher',
    icon: FlaskConical,
    color: 'from-green-500 to-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    title: { en: 'Researcher / Academic', ar: 'باحث / أكاديمي' },
    description: { en: 'I conduct R&D and want to collaborate with municipalities', ar: 'أقوم بالبحث والتطوير وأريد التعاون مع البلديات' },
    landingPage: 'ResearcherDashboard',
    requiresApproval: true
  },
  {
    id: 'expert',
    icon: Award,
    color: 'from-amber-500 to-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    title: { en: 'Expert / Evaluator', ar: 'خبير / مُقيّم' },
    description: { en: 'I provide expert evaluation and advisory services', ar: 'أقدم خدمات التقييم والاستشارات المتخصصة' },
    landingPage: 'ExpertAssignmentQueue',
    requiresApproval: true
  },
  {
    id: 'citizen',
    icon: Users,
    color: 'from-orange-500 to-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    title: { en: 'Citizen / Community Member', ar: 'مواطن / عضو مجتمع' },
    description: { en: 'I want to contribute ideas and participate in pilots', ar: 'أريد المساهمة بأفكار والمشاركة في التجارب' },
    landingPage: 'CitizenDashboard',
    requiresApproval: false
  },
  {
    id: 'viewer',
    icon: Eye,
    color: 'from-slate-500 to-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    title: { en: 'Explorer / Observer', ar: 'مستكشف / مراقب' },
    description: { en: 'I want to explore and learn about innovation initiatives', ar: 'أريد استكشاف ومعرفة المزيد عن مبادرات الابتكار' },
    landingPage: 'Home',
    requiresApproval: false
  }
];

const STEPS = [
  { id: 1, title: { en: 'Welcome', ar: 'مرحباً' }, icon: Sparkles },
  { id: 2, title: { en: 'Import', ar: 'استيراد' }, icon: Upload },
  { id: 3, title: { en: 'Profile', ar: 'الملف' }, icon: User },
  { id: 4, title: { en: 'AI Assist', ar: 'مساعد ذكي' }, icon: Wand2 },
  { id: 5, title: { en: 'Role', ar: 'الدور' }, icon: Briefcase },
  { id: 6, title: { en: 'Complete', ar: 'اكتمال' }, icon: CheckCircle2 }
];

// AI Disclaimer component
const AIDisclaimer = ({ language }) => (
  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
    <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
    <span>
      {language === 'ar'
        ? 'يتم إنشاء هذا المحتوى بواسطة الذكاء الاصطناعي ويجب مراجعته للتأكد من دقته.'
        : 'This content is AI-generated and should be reviewed for accuracy.'}
    </span>
  </div>
);

// Approval Notice component
const ApprovalNotice = ({ language, roleName }) => (
  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
    <span>
      {language === 'ar'
        ? `سيتطلب دور "${roleName}" موافقة المسؤول. ستتلقى إشعاراً بالبريد الإلكتروني عند المراجعة.`
        : `The "${roleName}" role requires admin approval. You'll receive an email notification once reviewed.`}
    </span>
  </div>
);

export default function OnboardingWizard({ onComplete, onSkip }) {
  const { language, isRTL, t, toggleLanguage } = useLanguage();
  const { user, userProfile, checkAuth, userRoles } = useAuth();

  const navigate = useNavigate();
  const { checkAndAssignRole, assignRole } = useAutoRoleAssignment();
  const { upsertProfile, sendOnboardingEmail } = useOnboardingMutations();

  const { invokeAI, status: aiStatus, isLoading: isGeneratingAI, isAvailable, rateLimitInfo } = useAIWithFallback();




  // Fetch sectors
  const { data: sectors = [] } = useSectors();

  // Fetch regions
  const { data: regions = [] } = useRegions();

  // Fetch cities based on selected region
  const selectedRegionId = React.useMemo(() => {
    // Current form data region id
    // We access formData later, but hooks must be top level.
    // We can just fetch all or rely on the fact that useRegionCities re-fetches when regionId changes.
    // However, hooks cannot conditionalize on state inside `useQuery` easily if we pass variable.
    // Let's defer formData usage or just assume we use the hook with parameters.
    return null; // Initial state, will update when we pass regionId dynamically if hook supported it.
    // Actually useRegionCities takes options.
  }, []);

  // We need current region ID state for the hook if we want to filter at hook level
  // But formData is defined BELOW. 
  // Custom hooks should arguably be at the top.
  // I will move formData definition UP or use a separate state variable for regionId that syncs with formData.
  // OR simpler: useRegionCities({ regionId: formData.region_id }) calls.
  // But formData is state.

  // Let's keep formData here and assume I can pass variables to hook.
  // But wait, the hook call must be valid.
  // I can't access `formData` before it's defined.

  // I'll define hooks after formData or use default props. 
  // React Hooks must be top level. `formData` is state. 
  // So I can declare hooks, but I need to pass `formData.region_id` to `useRegionCities`.
  // This means I MUST declare `formData` BEFORE calling `useRegionCities`.

  // BUT the original code defined state first, then queries. 
  // Let's modify the order in this chunk if needed, or just replace the queries section.
  // Currently file line 257 defines `currentStep` and `formData`.
  // I should remove the queries here and put them AFTER formData definition?
  // No, queries were BEFORE `formData` in original code (lines 212-254).
  // But `formData` (line 265) was used in `filteredCities` (line 311).
  // The original `cities` query (lines 242-253) fetched ALL active cities (no filter in query).
  // Then `filteredCities` (line 311) filtered them in memory.

  // So I should fetch ALL cities if I want to maintain behavior, OR fetch by region if I want optimization.
  // useRegionCities supports `regionId` filter. If `regionId` is undefined, does it fetch all?
  // Looking at useRegions.js: `if (regionId) query = query.eq...`
  // So if no regionId, it fetches all limited by limit (200).
  // The original component fetched all active cities.
  // I'll use `useRegionCities({ limit: 1000 })` to fetch all and let client filter, 
  // OR even better, use the hook efficiently.

  // I'll stick to fetching all for now to minimize refactoring risk of moving state.
  const { data: cities = [] } = useRegionCities({ limit: 1000 });


  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtractingCV, setIsExtractingCV] = useState(false);
  const [isExtractingLinkedIn, setIsExtractingLinkedIn] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [customExpertise, setCustomExpertise] = useState('');
  const [isValidatingCustomExpertise, setIsValidatingCustomExpertise] = useState(false);

  const [formData, setFormData] = useState({
    // Bilingual fields
    full_name_en: '',
    full_name_ar: '',
    job_title_en: '',
    job_title_ar: '',
    department_en: '',
    department_ar: '',
    organization_en: '',
    organization_ar: '',
    bio_en: '',
    bio_ar: '',
    // Single language fields
    selectedPersona: null,
    expertise_areas: [],
    interests: [],
    requestRole: false,
    roleJustification: '',
    cv_url: '',
    linkedin_url: '',
    years_of_experience: 0,
    work_phone: '',
    // New fields
    national_id: '',
    date_of_birth: '',
    gender: '',
    education_level: '',
    degree: '',
    certifications: [],
    languages: [],
    region: '',
    city: '',
    region_id: '',
    city_id: '',
    // Additional tracking/logic fields
    persona_type: null,
    municipality_id: null,
    organization_id: null,
    preferred_language: language,
    // Mobile number with country code
    mobile_number: '',
    mobile_country_code: '+966',
    // Avatar
    avatar_url: ''
  });

  const [isTranslating, setIsTranslating] = useState(/** @type {Record<string, boolean>} */({}));
  const [validationErrors, setValidationErrors] = useState(/** @type {Record<string, string>} */({}));

  // Filter cities based on selected region
  const filteredCities = formData.region_id
    ? cities.filter(city => city.region_id === formData.region_id)
    : cities;

  const validateEmail = (email) => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobileNumber = (number) => {
    if (!number) return true;
    // Remove all non-digit characters for validation
    const digitsOnly = number.replace(/\D/g, '');
    return digitsOnly.length >= 7 && digitsOnly.length <= 15;
  };

  const validateNationalId = (id) => {
    if (!id) return true;
    // Saudi National ID/Iqama: 10 digits, starts with 1 or 2
    const regex = /^[12]\d{9}$/;
    return regex.test(id);
  };

  const validateDateOfBirth = (dob) => {
    if (!dob) return true;
    const date = new Date(dob);
    const now = new Date();
    const minAge = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate());
    const maxAge = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());
    return date <= minAge && date >= maxAge;
  };

  const validateLinkedInUrl = (url) => {
    if (!url) return true;
    const regex = /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[\w-]+\/?$/i;
    return regex.test(url);
  };

  const validateField = (field, value) => {
    switch (field) {
      case 'national_id':
        return validateNationalId(value) ? '' : t({ en: 'Invalid National ID format (10 digits starting with 1 or 2)', ar: 'صيغة الهوية غير صحيحة (10 أرقام تبدأ بـ 1 أو 2)' });
      case 'mobile_number':
        return validateMobileNumber(value) ? '' : t({ en: 'Invalid mobile number (7-15 digits)', ar: 'رقم الجوال غير صحيح (7-15 رقم)' });
      case 'date_of_birth':
        return validateDateOfBirth(value) ? '' : t({ en: 'Invalid date of birth (age must be 13-100)', ar: 'تاريخ الميلاد غير صحيح (العمر يجب أن يكون 13-100)' });
      case 'linkedin_url':
        return validateLinkedInUrl(value) ? '' : t({ en: 'Invalid LinkedIn URL format', ar: 'صيغة رابط LinkedIn غير صحيحة' });
      default:
        return '';
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Validate on change for specific fields
    if (['national_id', 'mobile_number', 'date_of_birth', 'linkedin_url'].includes(field)) {
      const error = validateField(field, value);
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  // Format mobile number for display
  const formatMobileNumber = (value) => {
    // Allow only digits, spaces, and dashes
    return value.replace(/[^\d\s-]/g, '');
  };

  // Initialize form data from existing profile and sync preferred language
  useEffect(() => {
    if (userProfile || user) {
      const profileLang = userProfile?.preferred_language;

      // Sync language context with stored profile preference
      if (profileLang && profileLang !== language) {
        toggleLanguage();
      }

      setFormData(prev => ({
        ...prev,
        full_name_en: userProfile?.full_name_en || userProfile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || '',
        full_name_ar: userProfile?.full_name_ar || '',
        job_title_en: userProfile?.job_title_en || userProfile?.job_title || '',
        job_title_ar: userProfile?.job_title_ar || '',
        department_en: userProfile?.department_en || userProfile?.department || '',
        department_ar: userProfile?.department_ar || '',
        organization_en: userProfile?.organization_en || '',
        organization_ar: userProfile?.organization_ar || '',
        bio_en: userProfile?.bio_en || userProfile?.bio || '',
        bio_ar: userProfile?.bio_ar || '',
        expertise_areas: userProfile?.expertise_areas || [],
        interests: userProfile?.interests || [],
        linkedin_url: userProfile?.linkedin_url || '',
        cv_url: userProfile?.cv_url || '',
        national_id: userProfile?.national_id || '',
        date_of_birth: userProfile?.date_of_birth || '',
        gender: userProfile?.gender || '',
        education_level: userProfile?.education_level || '',
        degree: userProfile?.degree || '',
        certifications: userProfile?.certifications || [],
        languages: userProfile?.languages || [],
        location_city: userProfile?.location_city || '',
        location_region: userProfile?.location_region || '',
        region_id: userProfile?.region_id || '',
        city_id: userProfile?.city_id || '',
        preferred_language: profileLang || language,
        mobile_number: userProfile?.mobile_number || '',
        mobile_country_code: userProfile?.mobile_country_code || '+966',
        years_of_experience: userProfile?.years_experience || 0,
        work_phone: userProfile?.work_phone || '',
        avatar_url: userProfile?.avatar_url || '',
      }));
    }
  }, [userProfile, user]);

  // Auto-translate function
  const autoTranslate = async (field, sourceText, sourceLang) => {
    if (!sourceText?.trim()) return;

    const targetLang = sourceLang === 'en' ? 'ar' : 'en';
    const targetField = field.replace(`_${sourceLang}`, `_${targetLang}`);

    setIsTranslating(prev => ({ ...prev, [targetField]: true }));

    try {
      const result = await invokeAI({
        prompt: buildTranslationPrompt(sourceText, sourceLang),
        response_json_schema: TRANSLATION_SCHEMA
      });

      if (result.success && result.data?.translation) {
        setFormData(prev => ({ ...prev, [targetField]: result.data.translation }));
        toast.success(t({ en: 'Translation complete', ar: 'اكتملت الترجمة' }));
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error(t({ en: 'Translation failed', ar: 'فشلت الترجمة' }));
    } finally {
      setIsTranslating(prev => ({ ...prev, [targetField]: false }));
    }
  };

  const progress = (currentStep / STEPS.length) * 100;
  const selectedPersona = PERSONAS.find(p => p.id === formData.selectedPersona);

  const calculateProfileCompletion = (data) => {
    let score = 0;
    if (data.full_name_en || data.full_name_ar) score += 15;
    if (data.full_name_en && data.full_name_ar) score += 5; // Bonus for both languages
    if (data.job_title_en || data.job_title_ar) score += 10;
    if (data.bio_en || data.bio_ar) score += 10;
    if (data.selectedPersona) score += 15;
    if (data.expertise_areas?.length > 0) score += 10;
    if (data.cv_url || data.linkedin_url) score += 10;
    if (data.national_id) score += 5;
    if (data.education_level) score += 5;
    if (data.location_city || data.location_region) score += 5;
    if (data.languages?.length > 0) score += 5;
    if (data.years_of_experience > 0) score += 5;
    return Math.min(score, 100);
  };

  // Get role-based landing page
  const getLandingPage = () => {
    if (userRoles?.length > 0) {
      const role = userRoles[0]?.role;
      if (role === 'admin') return 'AdminPortal';
      if (role === 'municipality_admin' || role === 'municipality_staff') return 'MunicipalityDashboard';
      if (role === 'provider') return 'StartupDashboard';
      if (role === 'researcher') return 'ResearcherDashboard';
      if (role === 'citizen') return 'CitizenDashboard';
    }
    if (selectedPersona) {
      return selectedPersona.landingPage;
    }
    return 'Home';
  };

  // Handle CV upload and extraction with bilingual support
  const handleCVUpload = async (fileUrl) => {
    if (!fileUrl) {
      setFormData(prev => ({ ...prev, cv_url: '' }));
      return;
    }

    setFormData(prev => ({ ...prev, cv_url: fileUrl }));
    setIsExtractingCV(true);

    try {
      // Use AI to extract CV data via the invoke-llm edge function
      const result = await invokeAI({
        prompt: `Analyze this uploaded CV file and extract the following information in JSON format. The CV is at: ${fileUrl}

Extract:
- full_name_en: Full name in English
- full_name_ar: Full name in Arabic if present  
- job_title_en: Current job title in English
- job_title_ar: Job title in Arabic if present
- organization_en: Current organization in English
- organization_ar: Organization in Arabic if present
- department_en: Department in English
- department_ar: Department in Arabic if present
- bio_en: Professional summary in English (2-3 sentences)
- bio_ar: Professional summary in Arabic if present
- years_of_experience: Number of years of experience
- expertise_areas: Array of 3-5 key expertise areas
- linkedin_url: LinkedIn URL if found
- mobile_number: Phone number if found
- education_level: One of 'high_school', 'diploma', 'bachelors', 'masters', 'phd'
- degree: Field of study
- certifications: Array of certifications
- languages: Array of languages
- location_city: City
- location_region: Region
- detected_language: 'en', 'ar', or 'mixed'

Note: This is a file URL reference. Please analyze what information can be inferred from the context and any metadata available.`,
        response_json_schema: {
          type: 'object',
          properties: {
            full_name_en: { type: 'string' },
            full_name_ar: { type: 'string' },
            job_title_en: { type: 'string' },
            job_title_ar: { type: 'string' },
            organization_en: { type: 'string' },
            organization_ar: { type: 'string' },
            department_en: { type: 'string' },
            department_ar: { type: 'string' },
            bio_en: { type: 'string' },
            bio_ar: { type: 'string' },
            years_of_experience: { type: 'number' },
            expertise_areas: { type: 'array', items: { type: 'string' } },
            linkedin_url: { type: 'string' },
            mobile_number: { type: 'string' },
            education_level: { type: 'string' },
            degree: { type: 'string' },
            certifications: { type: 'array', items: { type: 'string' } },
            languages: { type: 'array', items: { type: 'string' } },
            location_city: { type: 'string' },
            location_region: { type: 'string' },
            detected_language: { type: 'string' }
          }
        }
      });

      const extracted = result.success ? { status: 'success', output: result.data } : { status: 'error' };

      if (extracted.status === 'success' && extracted.output) {
        const output = extracted.output;
        const isArabicCV = output.detected_language === 'ar';

        setFormData(prev => ({
          ...prev,
          // Bilingual fields - use detected language appropriately
          full_name_en: output.full_name_en || (isArabicCV ? prev.full_name_en : output.full_name_ar) || prev.full_name_en,
          full_name_ar: output.full_name_ar || (isArabicCV ? output.full_name_en : prev.full_name_ar) || prev.full_name_ar,
          job_title_en: output.job_title_en || prev.job_title_en,
          job_title_ar: output.job_title_ar || prev.job_title_ar,
          organization_en: output.organization_en || prev.organization_en,
          organization_ar: output.organization_ar || prev.organization_ar,
          department_en: output.department_en || prev.department_en,
          department_ar: output.department_ar || prev.department_ar,
          bio_en: output.bio_en || prev.bio_en,
          bio_ar: output.bio_ar || prev.bio_ar,
          // Other fields
          years_of_experience: output.years_of_experience || prev.years_of_experience,
          expertise_areas: output.expertise_areas?.length > 0 ? output.expertise_areas : prev.expertise_areas,
          linkedin_url: output.linkedin_url || prev.linkedin_url,
          mobile_number: output.mobile_number || prev.mobile_number,
          education_level: output.education_level || prev.education_level,
          degree: output.degree || prev.degree,
          certifications: output.certifications?.length > 0 ? output.certifications : prev.certifications,
          languages: output.languages?.length > 0 ? output.languages : prev.languages,
          location_city: output.location_city || prev.location_city,
          location_region: output.location_region || prev.location_region,
        }));

        const missingTranslations = [];
        if (output.full_name_en && !output.full_name_ar) missingTranslations.push('name');
        if (output.job_title_en && !output.job_title_ar) missingTranslations.push('job title');

        if (missingTranslations.length > 0) {
          toast.success(t({
            en: `CV data extracted! Use translate buttons to add ${isArabicCV ? 'English' : 'Arabic'} versions.`,
            ar: `تم استخراج البيانات! استخدم أزرار الترجمة لإضافة النسخة ${isArabicCV ? 'الإنجليزية' : 'العربية'}.`
          }));
        } else {
          toast.success(t({ en: 'CV data extracted successfully!', ar: 'تم استخراج بيانات السيرة بنجاح!' }));
        }
      }
    } catch (error) {
      console.error('CV extraction error:', error);
      toast.error(t({ en: 'Could not extract CV data automatically', ar: 'تعذر استخراج بيانات السيرة الذاتية تلقائياً' }));
    } finally {
      setIsExtractingCV(false);
    }
  };

  // Handle LinkedIn URL import with bilingual support
  const handleLinkedInImport = async () => {
    if (!formData.linkedin_url) {
      toast.error(t({ en: 'Please enter your LinkedIn profile URL', ar: 'يرجى إدخال رابط ملفك الشخصي على LinkedIn' }));
      return;
    }

    setIsExtractingLinkedIn(true);

    try {
      // Use AI to suggest profile based on LinkedIn URL pattern with bilingual output
      const result = await invokeAI({
        prompt: buildLinkedInImportPrompt(formData.linkedin_url),
        response_json_schema: LINKEDIN_IMPORT_SCHEMA
      });

      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          full_name_en: result.data.full_name_en || prev.full_name_en,
          full_name_ar: result.data.full_name_ar || prev.full_name_ar,
          job_title_en: result.data.job_title_en || prev.job_title_en,
          job_title_ar: result.data.job_title_ar || prev.job_title_ar,
          expertise_areas: result.data.expertise_areas?.length > 0
            ? [...new Set([...prev.expertise_areas, ...result.data.expertise_areas])].slice(0, 5)
            : prev.expertise_areas,
          bio_en: result.data.bio_en || prev.bio_en,
          bio_ar: result.data.bio_ar || prev.bio_ar
        }));
        toast.success(t({ en: 'LinkedIn profile analyzed! Review and adjust the suggestions.', ar: 'تم تحليل ملف LinkedIn! راجع وعدّل الاقتراحات.' }));
      }
    } catch (error) {
      console.error('LinkedIn import error:', error);
      toast.info(t({ en: 'LinkedIn URL saved. Please fill in details manually.', ar: 'تم حفظ رابط LinkedIn. يرجى إدخال التفاصيل يدوياً.' }));
    } finally {
      setIsExtractingLinkedIn(false);
    }
  };

  // AI-powered profile suggestions with bilingual input and comprehensive field filling
  const generateAISuggestions = async () => {
    const hasNameInput = formData.full_name_en || formData.full_name_ar;
    const hasTitleInput = formData.job_title_en || formData.job_title_ar;
    const hasBioInput = formData.bio_en || formData.bio_ar;
    const hasCV = !!formData.cv_url;
    const hasLinkedIn = !!formData.linkedin_url;

    // Allow AI generation if we have ANY input
    if (!hasNameInput && !hasTitleInput && !hasBioInput && !hasCV && !hasLinkedIn) {
      toast.error(t({ en: 'Please fill in some profile information first', ar: 'يرجى ملء بعض معلومات الملف الشخصي أولاً' }));
      return;
    }

    // Get available sector names for AI to use
    const availableSectors = sectors.map(s => s.name_en).join(', ') || 'Urban Planning, Smart City, Sustainability, Transportation, Public Services, AI & Technology, Energy, Healthcare, Education, Environment';

    try {
      const result = await invokeAI({
        prompt: buildProfileSuggestionsPrompt(formData, availableSectors),
        response_json_schema: PROFILE_SUGGESTIONS_SCHEMA
      });

      if (result.success && result.data) {
        setAiSuggestions(result.data);
        toast.success(t({ en: 'AI suggestions generated! Review and apply them.', ar: 'تم إنشاء الاقتراحات الذكية! راجعها وطبقها.' }));
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error(t({ en: 'Failed to generate suggestions', ar: 'فشل في إنشاء الاقتراحات' }));
    }
  };

  // Apply all AI suggestions at once
  const applyAllAISuggestions = () => {
    if (!aiSuggestions) return;

    setFormData(prev => ({
      ...prev,
      // Only apply if current value is empty
      full_name_ar: prev.full_name_ar || aiSuggestions.full_name_ar || prev.full_name_ar,
      full_name_en: prev.full_name_en || aiSuggestions.full_name_en || prev.full_name_en,
      bio_en: aiSuggestions.improved_bio_en || prev.bio_en,
      bio_ar: aiSuggestions.improved_bio_ar || prev.bio_ar,
      job_title_en: prev.job_title_en || aiSuggestions.job_title_en || prev.job_title_en,
      job_title_ar: prev.job_title_ar || aiSuggestions.job_title_ar || prev.job_title_ar,
      organization_en: prev.organization_en || aiSuggestions.organization_en || prev.organization_en,
      organization_ar: prev.organization_ar || aiSuggestions.organization_ar || prev.organization_ar,
      department_en: prev.department_en || aiSuggestions.department_en || prev.department_en,
      department_ar: prev.department_ar || aiSuggestions.department_ar || prev.department_ar,
      years_of_experience: prev.years_of_experience || aiSuggestions.years_of_experience || prev.years_of_experience,
      education_level: prev.education_level || aiSuggestions.education_level || prev.education_level,
      degree: prev.degree || aiSuggestions.degree || prev.degree,
      location_city: prev.location_city || aiSuggestions.location_city || prev.location_city,
      location_region: prev.location_region || aiSuggestions.location_region || prev.location_region,
      languages: prev.languages?.length > 0 ? prev.languages : aiSuggestions.languages || prev.languages,
      expertise_areas: aiSuggestions.suggested_expertise || prev.expertise_areas,
      selectedPersona: aiSuggestions.recommended_persona || prev.selectedPersona,
    }));

    toast.success(t({ en: 'All suggestions applied!', ar: 'تم تطبيق جميع الاقتراحات!' }));
  };

  const applyAISuggestion = (field, value) => {
    if (field === 'bio') {
      // Apply to the appropriate language field
      if (language === 'ar') {
        setFormData(prev => ({ ...prev, bio_ar: value }));
      } else {
        setFormData(prev => ({ ...prev, bio_en: value }));
      }
    } else if (field === 'persona') {
      setFormData(prev => ({ ...prev, selectedPersona: value }));
    } else if (field === 'expertise') {
      setFormData(prev => ({ ...prev, expertise_areas: value }));
    }
    toast.success(t({ en: 'Applied!', ar: 'تم التطبيق!' }));
  };

  // Check if specialized wizard is needed
  const needsSpecializedWizard = (persona) => {
    return ['municipality_staff', 'provider', 'researcher', 'citizen', 'expert', 'deputyship'].includes(persona);
  };

  // Get specialized wizard page
  const getSpecializedWizardPage = (persona) => {
    const wizardMap = {
      municipality_staff: 'MunicipalityStaffOnboarding',
      provider: 'ProviderOnboarding',
      researcher: 'ResearcherOnboarding',
      citizen: 'CitizenOnboarding',
      expert: 'ExpertOnboarding',
      deputyship: 'DeputyshipOnboarding'
    };
    return wizardMap[persona] || null;
  };

  // Auto-suggest persona based on email domain
  const getSuggestedPersona = () => {
    if (user?.email && isMoMAHEmail(user.email)) {
      return 'deputyship';
    }
    return null;
  };

  const handleComplete = async () => {
    if (!user?.id) {
      toast.error(t({ en: 'User not found. Please try logging in again.', ar: 'المستخدم غير موجود. يرجى تسجيل الدخول مرة أخرى.' }));
      return;
    }

    setIsSubmitting(true);

    try {
      // If specialized wizard needed, mark basic onboarding complete but redirect to specialized wizard
      const redirectToSpecialized = needsSpecializedWizard(formData.selectedPersona);

      const updatePayload = {
        // Bilingual fields
        full_name: formData.full_name_en || formData.full_name_ar || null,
        full_name_en: formData.full_name_en || null,
        full_name_ar: formData.full_name_ar || null,
        job_title: formData.job_title_en || formData.job_title_ar || null,
        job_title_en: formData.job_title_en || null,
        job_title_ar: formData.job_title_ar || null,
        department: formData.department_en || formData.department_ar || null,
        department_en: formData.department_en || null,
        department_ar: formData.department_ar || null,
        organization_en: formData.organization_en || null,
        organization_ar: formData.organization_ar || null,
        bio: formData.bio_en || formData.bio_ar || null,
        bio_en: formData.bio_en || null,
        bio_ar: formData.bio_ar || null,
        // Arrays and other fields
        expertise_areas: formData.expertise_areas?.length > 0 ? formData.expertise_areas : null,
        interests: formData.interests?.length > 0 ? formData.interests : null,
        cv_url: formData.cv_url || null,
        linkedin_url: formData.linkedin_url || null,
        work_phone: formData.work_phone || null,
        // New fields
        national_id: formData.national_id || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        education_level: formData.education_level || null,
        degree: formData.degree || null,
        certifications: formData.certifications?.length > 0 ? formData.certifications : [],
        languages: formData.languages?.length > 0 ? formData.languages : [],
        location_city: formData.location_city || null,
        location_region: formData.location_region || null,
        region_id: formData.region_id || null,
        city_id: formData.city_id || null,
        years_experience: formData.years_of_experience || 0,
        preferred_language: formData.preferred_language || language,
        mobile_number: formData.mobile_number || null,
        mobile_country_code: formData.mobile_country_code || '+966',
        avatar_url: formData.avatar_url || null,
        // Only mark complete if no specialized wizard needed
        onboarding_completed: !redirectToSpecialized,
        onboarding_completed_at: redirectToSpecialized ? null : new Date().toISOString(),
        profile_completion_percentage: calculateProfileCompletion(formData),
        // New tracking columns
        onboarding_step: 6, // Completed main wizard
        selected_persona: formData.selectedPersona || null,
        persona_onboarding_completed: !redirectToSpecialized, // Only true if no specialized wizard needed
        extracted_data: {
          years_of_experience: formData.years_of_experience,
          imported_from_cv: !!formData.cv_url,
          imported_from_linkedin: !!formData.linkedin_url,
          selected_persona: formData.selectedPersona
        },
        updated_at: new Date().toISOString()
      };





      const updateData = await upsertProfile.mutateAsync({
        table: 'user_profiles',
        data: { user_id: user.id, ...updatePayload }
      });



      // Handle role assignment based on persona type
      const selectedPersona = formData.selectedPersona;

      if (selectedPersona === 'viewer') {
        // Viewer is always auto-approved - assign directly
        await assignRole({
          userId: user.id,
          userEmail: user.email,
          role: 'viewer'
        });

      } else if (selectedPersona && !redirectToSpecialized) {
        // Non-specialized persona that doesn't have a stage 2 wizard
        // Check auto-approval and assign or create request
        const roleResult = await checkAndAssignRole({
          userId: user.id,
          userEmail: user.email,
          personaType: formData.persona_type,
          municipalityId: formData.municipality_id || null, // Pass if available
          organizationId: formData.organization_id || null, // Pass if available
          justification: 'Onboarding completed via Wizard',
          language
        });

        if (roleResult.autoApproved) {
          toast.success(t({ en: 'Role automatically approved!', ar: 'تمت الموافقة على الدور تلقائياً!' }));
        } else {
          toast.info(t({ en: 'Role request submitted for approval.', ar: 'تم تقديم طلب الدور للموافقة.' }));
        }
      } else if (selectedPersona && redirectToSpecialized) {
        // For specialized personas redirecting to stage 2:
        // Pre-check auto-approval and create pending request if not auto-approved
        // The stage 2 wizard will finalize the role assignment
        const roleResult = await checkAndAssignRole({
          userId: user.id,
          userEmail: user.email,
          personaType: selectedPersona,
          justification: `Stage 1 onboarding completed, proceeding to ${selectedPersona} setup`,
          language
        });

        if (roleResult.autoApproved) {

        } else {

        }
      }

      // Invalidate queries and refresh auth


      if (checkAuth) {
        await checkAuth();
      }

      // Redirect to specialized wizard or landing page
      if (redirectToSpecialized) {
        const specializedPage = getSpecializedWizardPage(formData.selectedPersona);
        toast.success(t({ en: 'Great! Now let\'s complete your specialized profile.', ar: 'رائع! الآن دعنا نكمل ملفك المتخصص.' }));
        onComplete?.(formData);
        setTimeout(() => {
          navigate(createPageUrl(specializedPage));
        }, 300);
      } else {
        // Send welcome email
        sendOnboardingEmail.mutate({ // Fire and forget
          trigger: 'auth.signup',
          email: user.email,
          recipient_user_id: user.id,
          variables: {
            userName: formData.full_name_en || user.email.split('@')[0],
            persona: formData.selectedPersona,
            language,
            loginUrl: `${window.location.origin}/auth`
          }
        });

        toast.success(t({ en: 'Welcome aboard! Your profile is set up.', ar: 'مرحباً بك! تم إعداد ملفك الشخصي.' }));
        const landingPage = getLandingPage();

        onComplete?.(formData);
        setTimeout(() => {
          navigate(createPageUrl(landingPage));
        }, 300);
      }

    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error(t({ en: 'Failed to save profile. Please try again.', ar: 'فشل في حفظ الملف الشخصي. يرجى المحاولة مرة أخرى.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    // Skip just dismisses the onboarding for this session
    // It does NOT mark onboarding_completed as true
    // User will see onboarding again on next login until they complete it

    onSkip?.();

    // Only navigate if we're on the dedicated onboarding page
    const isOnOnboardingPage = window.location.pathname.toLowerCase().includes('/onboarding');
    if (isOnOnboardingPage) {
      navigate(createPageUrl('Home'));
    }
  };

  const toggleExpertise = (item) => {
    const current = formData.expertise_areas || [];
    if (current.includes(item)) {
      setFormData({ ...formData, expertise_areas: current.filter(i => i !== item) });
    } else if (current.length < 5) {
      setFormData({ ...formData, expertise_areas: [...current, item] });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true;
      case 2: return true; // Import step is optional
      case 3: return (formData.full_name_en?.trim().length > 0 || formData.full_name_ar?.trim().length > 0);
      case 4: return true;
      case 5: return formData.selectedPersona !== null;
      case 6: return true;
      default: return true;
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length && canProceed()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/95 via-slate-900/95 to-blue-900/95 backdrop-blur-sm z-50 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-400" />
                {t({ en: 'Saudi Innovates', ar: 'الابتكار السعودي' })}
              </h1>
              <p className="text-white/60 text-sm mt-1">
                {t({ en: 'Personalize your experience', ar: 'خصص تجربتك' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="text-white/70 hover:text-white hover:bg-white/10 font-medium"
              >
                <Globe className="h-4 w-4 mr-1" />
                {language === 'en' ? 'عربي' : 'English'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4 mr-1" />
                {t({ en: 'Skip', ar: 'تخطي' })}
              </Button>
            </div>
          </div>

          {/* Step Progress */}
          <Card className="border-0 bg-white/10 backdrop-blur-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-wrap items-center gap-2 justify-center">
                {STEPS.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = currentStep === step.id;
                  const isComplete = currentStep > step.id;

                  return (
                    <React.Fragment key={step.id}>
                      <Badge
                        className={`
                          px-3 py-2 text-sm transition-all cursor-default border-0
                          ${isActive ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105' : ''}
                          ${isComplete ? 'bg-green-600 text-white' : ''}
                          ${!isActive && !isComplete ? 'bg-white/10 text-white/60' : ''}
                        `}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                        ) : (
                          <StepIcon className="h-4 w-4 mr-1" />
                        )}
                        {step.id}. {step.title[language]}
                      </Badge>
                      {index < STEPS.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-white/30 hidden sm:block" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              <Progress value={progress} className="h-2 mt-4 bg-white/10" />
            </CardContent>
          </Card>

          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white shadow-2xl">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-6">
                  <div className="text-8xl mb-4">🚀</div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {t({ en: 'Welcome to Saudi Innovates!', ar: 'مرحباً في الابتكار السعودي!' })}
                  </h2>
                  <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                    {t({
                      en: "Let's personalize your experience with AI-powered suggestions. Upload your CV or LinkedIn for smart profile building.",
                      ar: 'دعنا نخصص تجربتك باستخدام الاقتراحات الذكية. ارفع سيرتك الذاتية أو LinkedIn لبناء ملف ذكي.'
                    })}
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 pt-4">
                    <div className="flex items-center gap-2 px-4 py-3 bg-purple-100 rounded-lg">
                      <Upload className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium">{t({ en: 'CV/Resume Import', ar: 'استيراد السيرة الذاتية' })}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 bg-blue-100 rounded-lg">
                      <Linkedin className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">{t({ en: 'LinkedIn Import', ar: 'استيراد LinkedIn' })}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 bg-green-100 rounded-lg">
                      <Wand2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">{t({ en: 'AI Profile Builder', ar: 'منشئ الملف الذكي' })}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Import CV/LinkedIn */}
          {currentStep === 2 && (
            <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Upload className="h-5 w-5 text-blue-600" />
                  {t({ en: 'Smart Import (Optional)', ar: 'استيراد ذكي (اختياري)' })}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Upload your CV or enter LinkedIn URL to auto-fill your profile', ar: 'ارفع سيرتك الذاتية أو أدخل رابط LinkedIn لملء ملفك تلقائياً' })}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* CV Upload */}
                <div className="p-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/50">
                  <div className="flex items-start gap-4">
                    <FileText className="h-10 w-10 text-blue-500 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-1">
                        {t({ en: 'Upload CV/Resume', ar: 'رفع السيرة الذاتية' })}
                      </h3>
                      <p className="text-sm text-blue-700 mb-3">
                        {t({ en: 'AI will extract your name, experience, skills automatically', ar: 'سيستخرج الذكاء الاصطناعي اسمك وخبرتك ومهاراتك تلقائياً' })}
                      </p>
                      <FileUploader
                        onUploadComplete={handleCVUpload}
                        type="document"
                        label={t({ en: 'Upload CV (PDF, DOCX)', ar: 'رفع السيرة الذاتية (PDF, DOCX)' })}
                        maxSize={10}
                        description={t({ en: 'PDF or Word document', ar: 'ملف PDF أو Word' })}
                      />
                      {isExtractingCV && (
                        <div className="flex items-center gap-2 mt-3 text-blue-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">{t({ en: 'AI is extracting your information...', ar: 'الذكاء الاصطناعي يستخرج معلوماتك...' })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">{t({ en: 'OR', ar: 'أو' })}</span>
                  </div>
                </div>

                {/* LinkedIn Import */}
                <div className="p-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/50">
                  <div className="flex items-start gap-4">
                    <Linkedin className="h-10 w-10 text-blue-700 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-1">
                        {t({ en: 'LinkedIn Profile', ar: 'ملف LinkedIn' })}
                      </h3>
                      <p className="text-sm text-blue-700 mb-3">
                        {t({ en: 'Enter your LinkedIn URL for profile suggestions', ar: 'أدخل رابط LinkedIn الخاص بك للحصول على اقتراحات الملف الشخصي' })}
                      </p>
                      <div className="flex gap-2">
                        <div className="flex-1 space-y-1">
                          <Input
                            value={formData.linkedin_url}
                            onChange={(e) => handleFieldChange('linkedin_url', e.target.value)}
                            placeholder="https://linkedin.com/in/yourprofile"
                            className={validationErrors.linkedin_url ? 'border-red-500' : ''}
                          />
                          {validationErrors.linkedin_url && (
                            <p className="text-xs text-red-500">{validationErrors.linkedin_url}</p>
                          )}
                        </div>
                        <Button
                          onClick={handleLinkedInImport}
                          disabled={isExtractingLinkedIn || !formData.linkedin_url}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isExtractingLinkedIn ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Globe className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Import Status */}
                {(formData.cv_url || formData.linkedin_url) && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">{t({ en: 'Profile data imported!', ar: 'تم استيراد بيانات الملف!' })}</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      {t({ en: 'Review and edit in the next step', ar: 'راجع وحرر في الخطوة التالية' })}
                    </p>
                  </div>
                )}

                <p className="text-xs text-center text-muted-foreground">
                  {t({ en: 'You can skip this step and fill in details manually', ar: 'يمكنك تخطي هذه الخطوة وملء التفاصيل يدوياً' })}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Profile */}
          {currentStep === 3 && (
            <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5 text-blue-600" />
                  {t({ en: 'Your Profile', ar: 'ملفك الشخصي' })}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formData.cv_url || formData.linkedin_url
                    ? t({ en: 'Review and edit the imported data. Fields are bilingual.', ar: 'راجع وحرر البيانات المستوردة. الحقول ثنائية اللغة.' })
                    : t({ en: 'Tell us about yourself in both languages', ar: 'أخبرنا عن نفسك باللغتين' })
                  }
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Avatar Upload */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 border-2 border-slate-200 rounded-lg">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center overflow-hidden">
                      {formData.avatar_url ? (
                        <img src={formData.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-10 w-10 text-slate-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-slate-700 block mb-1">
                      {t({ en: 'Profile Photo', ar: 'صورة الملف الشخصي' })}
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      {t({ en: 'Optional - Add a profile picture', ar: 'اختياري - أضف صورة شخصية' })}
                    </p>
                    <FileUploader
                      onUploadComplete={(url) => setFormData({ ...formData, avatar_url: url })}
                      description={t({ en: 'Upload a professional profile picture', ar: 'ارفع صورة شخصية مهنية' })}
                      accept="image/*"
                      trigger={
                        <Button type="button" variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          {formData.avatar_url
                            ? t({ en: 'Change Photo', ar: 'تغيير الصورة' })
                            : t({ en: 'Upload Photo', ar: 'رفع صورة' })
                          }
                        </Button>
                      }
                    />
                  </div>
                </div>

                {/* Full Name - Bilingual */}
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg space-y-3">
                  <Label className="text-base font-semibold text-blue-900 block">
                    {t({ en: 'Full Name *', ar: 'الاسم الكامل *' })}
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">English</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => autoTranslate('full_name_en', formData.full_name_en, 'en')}
                          disabled={!formData.full_name_en || isTranslating.full_name_ar}
                        >
                          {isTranslating.full_name_ar ? <Loader2 className="h-3 w-3 animate-spin" /> : '→ عربي'}
                        </Button>
                      </div>
                      <Input
                        value={formData.full_name_en}
                        onChange={(e) => setFormData({ ...formData, full_name_en: e.target.value })}
                        placeholder="Your full name"
                        className="h-11 text-base border-2"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">العربية</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => autoTranslate('full_name_ar', formData.full_name_ar, 'ar')}
                          disabled={!formData.full_name_ar || isTranslating.full_name_en}
                        >
                          {isTranslating.full_name_en ? <Loader2 className="h-3 w-3 animate-spin" /> : 'EN ←'}
                        </Button>
                      </div>
                      <Input
                        value={formData.full_name_ar}
                        onChange={(e) => setFormData({ ...formData, full_name_ar: e.target.value })}
                        placeholder="اسمك الكامل"
                        className="h-11 text-base border-2"
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>

                {/* Job Title - Bilingual */}
                <div className="space-y-2">
                  <Label>{t({ en: 'Job Title', ar: 'المسمى الوظيفي' })}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">English</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => autoTranslate('job_title_en', formData.job_title_en, 'en')}
                          disabled={!formData.job_title_en || isTranslating.job_title_ar}
                        >
                          {isTranslating.job_title_ar ? <Loader2 className="h-3 w-3 animate-spin" /> : '→ عربي'}
                        </Button>
                      </div>
                      <Input
                        value={formData.job_title_en}
                        onChange={(e) => setFormData({ ...formData, job_title_en: e.target.value })}
                        placeholder="e.g., Innovation Manager"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">العربية</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => autoTranslate('job_title_ar', formData.job_title_ar, 'ar')}
                          disabled={!formData.job_title_ar || isTranslating.job_title_en}
                        >
                          {isTranslating.job_title_en ? <Loader2 className="h-3 w-3 animate-spin" /> : 'EN ←'}
                        </Button>
                      </div>
                      <Input
                        value={formData.job_title_ar}
                        onChange={(e) => setFormData({ ...formData, job_title_ar: e.target.value })}
                        placeholder="مثال: مدير الابتكار"
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>

                {/* Organization - Bilingual */}
                <div className="space-y-2">
                  <Label>{t({ en: 'Organization', ar: 'المنظمة' })}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      value={formData.organization_en}
                      onChange={(e) => setFormData({ ...formData, organization_en: e.target.value })}
                      placeholder="Organization name (English)"
                    />
                    <Input
                      value={formData.organization_ar}
                      onChange={(e) => setFormData({ ...formData, organization_ar: e.target.value })}
                      placeholder="اسم المنظمة (عربي)"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Department & Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t({ en: 'Department', ar: 'القسم' })}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={formData.department_en}
                        onChange={(e) => setFormData({ ...formData, department_en: e.target.value })}
                        placeholder="English"
                      />
                      <Input
                        value={formData.department_ar}
                        onChange={(e) => setFormData({ ...formData, department_ar: e.target.value })}
                        placeholder="عربي"
                        dir="rtl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ en: 'Years of Experience', ar: 'سنوات الخبرة' })}</Label>
                    <Input
                      type="number"
                      value={formData.years_of_experience}
                      onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                </div>

                {/* Bio - Bilingual */}
                <div className="space-y-2">
                  <Label>{t({ en: 'Short Bio', ar: 'نبذة قصيرة' })}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">English</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => autoTranslate('bio_en', formData.bio_en, 'en')}
                          disabled={!formData.bio_en || isTranslating.bio_ar}
                        >
                          {isTranslating.bio_ar ? <Loader2 className="h-3 w-3 animate-spin" /> : '→ عربي'}
                        </Button>
                      </div>
                      <Textarea
                        value={formData.bio_en}
                        onChange={(e) => setFormData({ ...formData, bio_en: e.target.value })}
                        rows={3}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">العربية</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => autoTranslate('bio_ar', formData.bio_ar, 'ar')}
                          disabled={!formData.bio_ar || isTranslating.bio_en}
                        >
                          {isTranslating.bio_en ? <Loader2 className="h-3 w-3 animate-spin" /> : 'EN ←'}
                        </Button>
                      </div>
                      <Textarea
                        value={formData.bio_ar}
                        onChange={(e) => setFormData({ ...formData, bio_ar: e.target.value })}
                        rows={3}
                        placeholder="أخبرنا عن نفسك..."
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Fields Section */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-4 text-blue-900">
                    {t({ en: 'Additional Information (Optional)', ar: 'معلومات إضافية (اختياري)' })}
                  </h3>

                  {/* Mobile Number with Country Code */}
                  <div className="space-y-2 mb-4">
                    <Label>{t({ en: 'Mobile Number', ar: 'رقم الجوال' })}</Label>
                    <div className="flex gap-2">
                      <select
                        value={formData.mobile_country_code}
                        onChange={(e) => handleFieldChange('mobile_country_code', e.target.value)}
                        className="w-28 h-10 px-2 border border-input rounded-md bg-background text-sm"
                      >
                        <option value="+966">🇸🇦 +966</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+973">🇧🇭 +973</option>
                        <option value="+965">🇰🇼 +965</option>
                        <option value="+968">🇴🇲 +968</option>
                        <option value="+974">🇶🇦 +974</option>
                        <option value="+20">🇪🇬 +20</option>
                        <option value="+962">🇯🇴 +962</option>
                        <option value="+961">🇱🇧 +961</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+92">🇵🇰 +92</option>
                        <option value="+63">🇵🇭 +63</option>
                        <option value="+62">🇮🇩 +62</option>
                        <option value="+60">🇲🇾 +60</option>
                      </select>
                      <Input
                        value={formData.mobile_number}
                        onChange={(e) => handleFieldChange('mobile_number', formatMobileNumber(e.target.value))}
                        placeholder="5XXXXXXXX"
                        className={`flex-1 ${validationErrors.mobile_number ? 'border-red-500' : ''}`}
                        maxLength={15}
                      />
                    </div>
                    {validationErrors.mobile_number && (
                      <p className="text-xs text-red-500">{validationErrors.mobile_number}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>{t({ en: 'National ID / Iqama', ar: 'الهوية الوطنية / الإقامة' })}</Label>
                      <Input
                        value={formData.national_id}
                        onChange={(e) => handleFieldChange('national_id', e.target.value)}
                        placeholder="1234567890"
                        maxLength={10}
                        className={validationErrors.national_id ? 'border-red-500' : ''}
                      />
                      {validationErrors.national_id && (
                        <p className="text-xs text-red-500">{validationErrors.national_id}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Date of Birth', ar: 'تاريخ الميلاد' })}</Label>
                      <Input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => handleFieldChange('date_of_birth', e.target.value)}
                        className={validationErrors.date_of_birth ? 'border-red-500' : ''}
                      />
                      {validationErrors.date_of_birth && (
                        <p className="text-xs text-red-500">{validationErrors.date_of_birth}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Gender', ar: 'الجنس' })}</Label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full h-10 px-3 border border-input rounded-md bg-background"
                      >
                        <option value="">{t({ en: 'Select...', ar: 'اختر...' })}</option>
                        <option value="male">{t({ en: 'Male', ar: 'ذكر' })}</option>
                        <option value="female">{t({ en: 'Female', ar: 'أنثى' })}</option>
                        <option value="other">{t({ en: 'Prefer not to say', ar: 'أفضل عدم الإفصاح' })}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>{t({ en: 'Education Level', ar: 'المستوى التعليمي' })}</Label>
                      <select
                        value={formData.education_level}
                        onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                        className="w-full h-10 px-3 border border-input rounded-md bg-background"
                      >
                        <option value="">{t({ en: 'Select...', ar: 'اختر...' })}</option>
                        <option value="high_school">{t({ en: 'High School', ar: 'ثانوية' })}</option>
                        <option value="diploma">{t({ en: 'Diploma', ar: 'دبلوم' })}</option>
                        <option value="bachelor">{t({ en: 'Bachelor\'s Degree', ar: 'بكالوريوس' })}</option>
                        <option value="master">{t({ en: 'Master\'s Degree', ar: 'ماجستير' })}</option>
                        <option value="doctorate">{t({ en: 'Doctorate/PhD', ar: 'دكتوراه' })}</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Field of Study / Degree', ar: 'التخصص / الشهادة' })}</Label>
                      <Input
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        placeholder={t({ en: 'e.g., Computer Science', ar: 'مثال: علوم الحاسب' })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t({ en: 'Region', ar: 'المنطقة' })}</Label>
                      <select
                        value={formData.region_id || ''}
                        onChange={(e) => {
                          const regionId = e.target.value;
                          const selectedRegion = regions?.find(r => r.id === regionId);
                          setFormData({
                            ...formData,
                            region_id: regionId,
                            location_region: selectedRegion ? (language === 'ar' ? selectedRegion.name_ar : selectedRegion.name_en) : '',
                            city_id: '', // Reset city when region changes
                            location_city: ''
                          });
                        }}
                        className="w-full h-10 px-3 border border-input rounded-md bg-background"
                        aria-label={t({ en: 'Select Region', ar: 'اختر المنطقة' })}
                      >
                        <option value="">{t({ en: 'Select Region...', ar: 'اختر المنطقة...' })}</option>
                        {regions?.map(region => (
                          <option key={region.id} value={region.id}>
                            {language === 'ar' ? region.name_ar : region.name_en}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'City', ar: 'المدينة' })}</Label>
                      <select
                        value={formData.city_id || ''}
                        onChange={(e) => {
                          const cityId = e.target.value;
                          const selectedCity = cities?.find(c => c.id === cityId);
                          setFormData({
                            ...formData,
                            city_id: cityId,
                            location_city: selectedCity ? (language === 'ar' ? selectedCity.name_ar : selectedCity.name_en) : ''
                          });
                        }}
                        className="w-full h-10 px-3 border border-input rounded-md bg-background"
                        disabled={!formData.region_id}
                        aria-label={t({ en: 'Select City', ar: 'اختر المدينة' })}
                      >
                        <option value="">{t({ en: 'Select City...', ar: 'اختر المدينة...' })}</option>
                        {filteredCities?.map(city => (
                          <option key={city.id} value={city.id}>
                            {language === 'ar' ? city.name_ar : city.name_en}
                          </option>
                        ))}
                      </select>
                      {!formData.region_id && (
                        <p className="text-xs text-muted-foreground">{t({ en: 'Select a region first', ar: 'اختر المنطقة أولاً' })}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Language Preference */}
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <Label className="text-sm font-medium text-purple-900 block mb-2">
                    {t({ en: 'Preferred Display Language', ar: 'لغة العرض المفضلة' })}
                  </Label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="preferred_language"
                        value="en"
                        checked={formData.preferred_language === 'en'}
                        onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                        className="accent-purple-600"
                      />
                      <span className="text-sm">English</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="preferred_language"
                        value="ar"
                        checked={formData.preferred_language === 'ar'}
                        onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                        className="accent-purple-600"
                      />
                      <span className="text-sm">العربية</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: AI Suggestions */}
          {currentStep === 4 && (
            <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Wand2 className="h-5 w-5 text-purple-600" />
                  {t({ en: 'AI Profile Assistant', ar: 'مساعد الملف الذكي' })}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Get personalized suggestions to complete and enhance your profile', ar: 'احصل على اقتراحات مخصصة لإكمال وتحسين ملفك الشخصي' })}
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* AI Disclaimer */}
                <AIDisclaimer language={language} />

                {!aiSuggestions && (
                  <div className="text-center py-8">
                    <div className="mb-6">
                      <Sparkles className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {t({ en: 'Let AI analyze your profile, fill missing fields, and suggest improvements', ar: 'دع الذكاء الاصطناعي يحلل ملفك ويملأ الحقول الناقصة ويقترح تحسينات' })}
                      </p>
                    </div>
                    <Button
                      onClick={generateAISuggestions}
                      disabled={isGeneratingAI}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isGeneratingAI ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      {t({ en: 'Generate AI Suggestions', ar: 'إنشاء اقتراحات ذكية' })}
                    </Button>
                  </div>
                )}

                {aiSuggestions && (
                  <div className="space-y-4">
                    {/* Apply All Button */}
                    <div className="flex justify-end">
                      <Button
                        onClick={applyAllAISuggestions}
                        className="bg-gradient-to-r from-purple-600 to-pink-600"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {t({ en: 'Apply All Suggestions', ar: 'تطبيق جميع الاقتراحات' })}
                      </Button>
                    </div>

                    {/* Suggested Profile Fields */}
                    {(aiSuggestions.organization_en || aiSuggestions.department_en || aiSuggestions.years_of_experience || aiSuggestions.education_level || aiSuggestions.location_city) && (
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm font-semibold text-slate-800 mb-3">{t({ en: 'Suggested Profile Fields', ar: 'حقول الملف المقترحة' })}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {aiSuggestions.organization_en && !formData.organization_en && (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-slate-500" />
                              <span className="text-slate-600">{t({ en: 'Organization:', ar: 'المنظمة:' })}</span>
                              <span className="font-medium">{language === 'ar' ? aiSuggestions.organization_ar : aiSuggestions.organization_en}</span>
                            </div>
                          )}
                          {aiSuggestions.department_en && !formData.department_en && (
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-slate-500" />
                              <span className="text-slate-600">{t({ en: 'Department:', ar: 'القسم:' })}</span>
                              <span className="font-medium">{language === 'ar' ? aiSuggestions.department_ar : aiSuggestions.department_en}</span>
                            </div>
                          )}
                          {aiSuggestions.years_of_experience && !formData.years_of_experience && (
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-slate-500" />
                              <span className="text-slate-600">{t({ en: 'Experience:', ar: 'الخبرة:' })}</span>
                              <span className="font-medium">{aiSuggestions.years_of_experience} {t({ en: 'years', ar: 'سنوات' })}</span>
                            </div>
                          )}
                          {aiSuggestions.education_level && !formData.education_level && (
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-slate-500" />
                              <span className="text-slate-600">{t({ en: 'Education:', ar: 'التعليم:' })}</span>
                              <span className="font-medium">{aiSuggestions.education_level} {aiSuggestions.degree ? `- ${aiSuggestions.degree}` : ''}</span>
                            </div>
                          )}
                          {aiSuggestions.location_city && !formData.location_city && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-slate-500" />
                              <span className="text-slate-600">{t({ en: 'Location:', ar: 'الموقع:' })}</span>
                              <span className="font-medium">{aiSuggestions.location_city}, {aiSuggestions.location_region}</span>
                            </div>
                          )}
                          {aiSuggestions.languages?.length > 0 && (!formData.languages || formData.languages.length === 0) && (
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-slate-500" />
                              <span className="text-slate-600">{t({ en: 'Languages:', ar: 'اللغات:' })}</span>
                              <span className="font-medium">{aiSuggestions.languages.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Improved Bio */}
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-purple-800">{t({ en: 'Suggested Bio', ar: 'السيرة المقترحة' })}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => applyAISuggestion('bio', language === 'ar' ? aiSuggestions.improved_bio_ar : aiSuggestions.improved_bio_en)}
                          className="text-xs"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {t({ en: 'Apply', ar: 'تطبيق' })}
                        </Button>
                      </div>
                      <p className="text-sm text-slate-700">
                        {language === 'ar' ? aiSuggestions.improved_bio_ar : aiSuggestions.improved_bio_en}
                      </p>
                    </div>

                    {/* Recommended Persona */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-blue-800">{t({ en: 'Recommended Role', ar: 'الدور الموصى به' })}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => applyAISuggestion('persona', aiSuggestions.recommended_persona)}
                          className="text-xs"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {t({ en: 'Apply', ar: 'تطبيق' })}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-600">{PERSONAS.find(p => p.id === aiSuggestions.recommended_persona)?.title[language] || aiSuggestions.recommended_persona}</Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        {language === 'ar' ? aiSuggestions.persona_reason_ar : aiSuggestions.persona_reason_en}
                      </p>
                    </div>

                    {/* Suggested Expertise */}
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-green-800">{t({ en: 'Suggested Expertise', ar: 'الخبرات المقترحة' })}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => applyAISuggestion('expertise', aiSuggestions.suggested_expertise)}
                          className="text-xs"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {t({ en: 'Apply All', ar: 'تطبيق الكل' })}
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {aiSuggestions.suggested_expertise?.map((exp, i) => (
                          <Badge key={i} variant="outline" className="bg-white">{exp}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Getting Started Tips */}
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm font-semibold text-amber-800 mb-2">{t({ en: 'Getting Started Tips', ar: 'نصائح البدء' })}</p>
                      <ul className="space-y-1">
                        {(language === 'ar' ? aiSuggestions.getting_started_tips_ar : aiSuggestions.getting_started_tips_en)?.map((tip, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={generateAISuggestions}
                        disabled={isGeneratingAI}
                        className="flex-1"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                        {t({ en: 'Regenerate', ar: 'إعادة إنشاء' })}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Persona Selection */}
          {currentStep === 5 && (
            <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  {t({ en: 'Select Your Role', ar: 'اختر دورك' })}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'This personalizes your dashboard and features', ar: 'هذا يخصص لوحة التحكم والميزات الخاصة بك' })}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PERSONAS.map((persona) => {
                    const Icon = persona.icon;
                    const isSelected = formData.selectedPersona === persona.id;

                    return (
                      <div
                        key={persona.id}
                        onClick={() => setFormData({ ...formData, selectedPersona: persona.id })}
                        className={`
                          p-4 rounded-xl border-2 cursor-pointer transition-all
                          ${isSelected
                            ? `${persona.borderColor} ${persona.bgColor} ring-2 ring-offset-2 ring-purple-400`
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${persona.color}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900">{persona.title[language]}</h4>
                            <p className="text-sm text-slate-600 mt-1">{persona.description[language]}</p>
                          </div>
                          {isSelected && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Expertise Selection - Dynamic from Database */}
                <div className="pt-4 border-t">
                  <Label className="text-base font-medium mb-3 block">
                    {t({ en: 'Select Your Expertise Areas', ar: 'اختر مجالات خبرتك' })}
                    <span className="text-sm text-muted-foreground ml-2">({t({ en: 'up to 5', ar: 'حتى 5' })})</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {sectors.length > 0 ? sectors.map((sector) => {
                      const isSelected = formData.expertise_areas?.includes(sector.name_en);
                      return (
                        <Badge
                          key={sector.id}
                          variant={isSelected ? 'default' : 'outline'}
                          className={`cursor-pointer transition-all ${isSelected ? 'bg-purple-600' : 'hover:bg-purple-50'}`}
                          onClick={() => toggleExpertise(sector.name_en)}
                        >
                          {isSelected && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {language === 'ar' && sector.name_ar ? sector.name_ar : sector.name_en}
                        </Badge>
                      );
                    }) : (
                      <p className="text-sm text-muted-foreground">{t({ en: 'Loading expertise areas...', ar: 'جارٍ تحميل مجالات الخبرة...' })}</p>
                    )}
                  </div>
                </div>

                {/* Role Request */}
                {formData.selectedPersona && formData.selectedPersona !== 'viewer' && formData.selectedPersona !== 'citizen' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={formData.requestRole}
                        onCheckedChange={(checked) => setFormData({ ...formData, requestRole: !!checked })}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-900">
                          {t({ en: 'Request official role assignment', ar: 'طلب تعيين دور رسمي' })}
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          {t({ en: 'An admin will review and approve your role request', ar: 'سيراجع المسؤول طلب الدور الخاص بك ويوافق عليه' })}
                        </p>
                      </div>
                    </div>
                    {formData.requestRole && (
                      <Textarea
                        value={formData.roleJustification}
                        onChange={(e) => setFormData({ ...formData, roleJustification: e.target.value })}
                        placeholder={t({ en: 'Why do you need this role? (e.g., organization affiliation, responsibilities)', ar: 'لماذا تحتاج هذا الدور؟ (مثال: الانتماء للمنظمة، المسؤوليات)' })}
                        className="mt-3"
                        rows={2}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 6: Complete */}
          {currentStep === 6 && (
            <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white shadow-2xl">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-6">
                  <div className="text-8xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-green-700">
                    {t({ en: "You're All Set!", ar: 'أنت جاهز!' })}
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {t({
                      en: "Your profile is ready. Let's explore innovation opportunities!",
                      ar: 'ملفك الشخصي جاهز. دعنا نستكشف فرص الابتكار!'
                    })}
                  </p>

                  {/* Profile Summary */}
                  <div className="p-4 bg-white rounded-lg border text-left max-w-md mx-auto">
                    <h3 className="font-semibold mb-3">{t({ en: 'Your Profile Summary', ar: 'ملخص ملفك' })}</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>{t({ en: 'Name:', ar: 'الاسم:' })}</strong>{' '}
                        {language === 'ar' ? (formData.full_name_ar || formData.full_name_en) : (formData.full_name_en || formData.full_name_ar)}
                      </p>
                      {(formData.job_title_en || formData.job_title_ar) && (
                        <p>
                          <strong>{t({ en: 'Title:', ar: 'المسمى:' })}</strong>{' '}
                          {language === 'ar' ? (formData.job_title_ar || formData.job_title_en) : (formData.job_title_en || formData.job_title_ar)}
                        </p>
                      )}
                      {(formData.organization_en || formData.organization_ar) && (
                        <p>
                          <strong>{t({ en: 'Organization:', ar: 'المنظمة:' })}</strong>{' '}
                          {language === 'ar' ? (formData.organization_ar || formData.organization_en) : (formData.organization_en || formData.organization_ar)}
                        </p>
                      )}
                      <p><strong>{t({ en: 'Role:', ar: 'الدور:' })}</strong> {selectedPersona?.title[language]}</p>
                      {formData.education_level && (
                        <p><strong>{t({ en: 'Education:', ar: 'التعليم:' })}</strong> {formData.education_level} {formData.degree && `- ${formData.degree}`}</p>
                      )}
                      {formData.location_city && (
                        <p><strong>{t({ en: 'Location:', ar: 'الموقع:' })}</strong> {formData.location_city}{formData.location_region && `, ${formData.location_region}`}</p>
                      )}
                      {formData.expertise_areas?.length > 0 && (
                        <div>
                          <strong>{t({ en: 'Expertise:', ar: 'الخبرات:' })}</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {formData.expertise_areas.map((exp, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{exp}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {formData.languages?.length > 0 && (
                        <p><strong>{t({ en: 'Languages:', ar: 'اللغات:' })}</strong> {formData.languages.join(', ')}</p>
                      )}
                      {(formData.cv_url || formData.linkedin_url) && (
                        <p className="text-green-600 flex items-center gap-1 mt-2">
                          <CheckCircle2 className="h-4 w-4" />
                          {t({ en: 'Profile imported from', ar: 'تم استيراد الملف من' })}
                          {formData.cv_url && ' CV'}
                          {formData.cv_url && formData.linkedin_url && ' & '}
                          {formData.linkedin_url && ' LinkedIn'}
                        </p>
                      )}
                      <p className="text-purple-600 text-xs mt-2">
                        <strong>{t({ en: 'Display Language:', ar: 'لغة العرض:' })}</strong> {formData.preferred_language === 'ar' ? 'العربية' : 'English'}
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{t({ en: 'Profile Completion:', ar: 'اكتمال الملف:' })}</span>
                        <Progress value={calculateProfileCompletion(formData)} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{calculateProfileCompletion(formData)}%</span>
                      </div>
                    </div>
                  </div>

                  {formData.requestRole && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto">
                      <p className="text-sm text-amber-800">
                        {t({ en: '⏳ Your role request is pending admin approval', ar: '⏳ طلب الدور الخاص بك في انتظار موافقة المسؤول' })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t({ en: 'Back', ar: 'رجوع' })}
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed() || isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {t({ en: 'Next', ar: 'التالي' })}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                {t({ en: 'Complete & Start Exploring', ar: 'إكمال وبدء الاستكشاف' })}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
