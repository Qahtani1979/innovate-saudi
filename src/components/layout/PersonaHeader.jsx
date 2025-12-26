import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';
import { usePersonaRouting } from '@/hooks/usePersonaRouting';
import {
  Shield,
  Building2,
  Briefcase,
  GraduationCap,
  Users,
  User,
  Globe,
  Target
} from 'lucide-react';

const PERSONA_CONFIG = {
  admin: {
    icon: Shield,
    color: 'bg-red-100 text-red-700 border-red-200',
    label: { en: 'Platform Admin', ar: 'مدير المنصة' }
  },
  executive: {
    icon: Target,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    label: { en: 'Executive', ar: 'تنفيذي' }
  },
  deputyship: {
    icon: Globe,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    label: { en: 'Deputyship', ar: 'الوكالة' }
  },
  municipality: {
    icon: Building2,
    color: 'bg-green-100 text-green-700 border-green-200',
    label: { en: 'Municipality', ar: 'البلدية' }
  },
  provider: {
    icon: Briefcase,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    label: { en: 'Provider', ar: 'المزود' }
  },
  expert: {
    icon: GraduationCap,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    label: { en: 'Expert', ar: 'خبير' }
  },
  researcher: {
    icon: GraduationCap,
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    label: { en: 'Researcher', ar: 'باحث' }
  },
  citizen: {
    icon: Users,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    label: { en: 'Citizen', ar: 'مواطن' }
  },
  user: {
    icon: User,
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    label: { en: 'User', ar: 'مستخدم' }
  }
};

export default function PersonaHeader({ showLabel = true, size = 'default' }) {
  const { t, language } = useLanguage();
  const { userMunicipality } = usePermissions();
  const { persona, isNationalEntity } = usePersonaRouting();

  const config = PERSONA_CONFIG[persona] || PERSONA_CONFIG.user;
  const Icon = config.icon;

  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    default: 'text-sm px-2.5 py-1',
    large: 'text-base px-3 py-1.5'
  };

  // Get organization/municipality name
  const orgName = userMunicipality 
    ? (language === 'ar' ? userMunicipality.name_ar : userMunicipality.name_en)
    : null;

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="outline" 
        className={`${config.color} ${sizeClasses[size]} flex items-center gap-1.5`}
      >
        <Icon className={size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} />
        {showLabel && <span>{t(config.label)}</span>}
      </Badge>
      
      {orgName && (
        <Badge variant="secondary" className={sizeClasses[size]}>
          {isNationalEntity && <Globe className="w-3 h-3 mr-1" />}
          {orgName}
        </Badge>
      )}
    </div>
  );
}
