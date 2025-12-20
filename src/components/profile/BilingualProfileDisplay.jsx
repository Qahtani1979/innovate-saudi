import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { 
  Linkedin, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Calendar,
  Languages,
  Award,
  Building2,
  ExternalLink
} from 'lucide-react';

// Bilingual text display component
export function BilingualText({ textEn, textAr, className = "", showBoth = false }) {
  const { language, isRTL } = useLanguage();
  
  if (showBoth && textEn && textAr) {
    return (
      <div className={className}>
        <p dir="ltr" className="text-start">{textEn}</p>
        <p dir="rtl" className="text-start text-muted-foreground mt-1">{textAr}</p>
      </div>
    );
  }
  
  const text = language === 'ar' ? (textAr || textEn) : (textEn || textAr);
  return <span className={className} dir={language === 'ar' ? 'rtl' : 'ltr'}>{text || '—'}</span>;
}

// Profile field with icon
export function ProfileField({ icon: Icon, label, value, valueAr, href, isLink = false, showBilingual = false }) {
  const { language, t, isRTL } = useLanguage();
  
  if (!value && !valueAr) return null;
  
  const displayValue = language === 'ar' ? (valueAr || value) : (value || valueAr);
  
  return (
    <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
      {Icon && <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />}
      <div className="flex-1 min-w-0">
        {label && <p className="text-xs text-muted-foreground mb-0.5">{t(label)}</p>}
        {isLink && href ? (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            {displayValue}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : showBilingual && value && valueAr ? (
          <div>
            <p className="text-sm" dir="ltr">{value}</p>
            <p className="text-sm text-muted-foreground" dir="rtl">{valueAr}</p>
          </div>
        ) : (
          <p className="text-sm" dir={language === 'ar' && valueAr ? 'rtl' : 'ltr'}>{displayValue}</p>
        )}
      </div>
    </div>
  );
}

// Contact information section
export function ContactSection({ 
  email, 
  phone, 
  mobileNumber,
  mobileCountryCode,
  workPhone,
  linkedinUrl, 
  website,
  location,
  locationCity,
  locationRegion,
  socialLinks 
}) {
  const { t, isRTL } = useLanguage();
  
  const formattedMobile = mobileNumber 
    ? `${mobileCountryCode || '+966'} ${mobileNumber}` 
    : null;
  
  return (
    <div className={`space-y-3 ${isRTL ? 'text-right' : ''}`}>
      <ProfileField
        icon={Mail}
        label={{ en: 'Email', ar: 'البريد الإلكتروني' }}
        value={email}
        href={`mailto:${email}`}
        isLink={true}
      />
      
      {formattedMobile && (
        <ProfileField
          icon={Phone}
          label={{ en: 'Mobile', ar: 'الجوال' }}
          value={formattedMobile}
          href={`tel:${mobileCountryCode || '+966'}${mobileNumber}`}
          isLink={true}
        />
      )}
      
      {workPhone && (
        <ProfileField
          icon={Phone}
          label={{ en: 'Work Phone', ar: 'هاتف العمل' }}
          value={workPhone}
          href={`tel:${workPhone}`}
          isLink={true}
        />
      )}
      
      {phone && !formattedMobile && (
        <ProfileField
          icon={Phone}
          label={{ en: 'Phone', ar: 'الهاتف' }}
          value={phone}
          href={`tel:${phone}`}
          isLink={true}
        />
      )}
      
      {linkedinUrl && (
        <ProfileField
          icon={Linkedin}
          label={{ en: 'LinkedIn', ar: 'لينكد إن' }}
          value={t({ en: 'View Profile', ar: 'عرض الملف' })}
          href={linkedinUrl}
          isLink={true}
        />
      )}
      
      {website && (
        <ProfileField
          icon={Globe}
          label={{ en: 'Website', ar: 'الموقع الإلكتروني' }}
          value={website}
          href={website.startsWith('http') ? website : `https://${website}`}
          isLink={true}
        />
      )}
      
      {(location || locationCity || locationRegion) && (
        <ProfileField
          icon={MapPin}
          label={{ en: 'Location', ar: 'الموقع' }}
          value={[locationCity, locationRegion, location].filter(Boolean).join(', ')}
        />
      )}
      
      {socialLinks && Object.keys(socialLinks).length > 0 && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">{t({ en: 'Social Links', ar: 'روابط التواصل' })}</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(socialLinks).map(([platform, url]) => (
              url && (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline capitalize"
                >
                  {platform}
                </a>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Professional information section
export function ProfessionalSection({ 
  jobTitleEn,
  jobTitleAr,
  departmentEn,
  departmentAr,
  organizationEn,
  organizationAr,
  yearsExperience,
  educationLevel,
  degree
}) {
  const { t, isRTL } = useLanguage();
  
  return (
    <div className={`space-y-3 ${isRTL ? 'text-right' : ''}`}>
      {(jobTitleEn || jobTitleAr) && (
        <ProfileField
          icon={Briefcase}
          label={{ en: 'Job Title', ar: 'المسمى الوظيفي' }}
          value={jobTitleEn}
          valueAr={jobTitleAr}
          showBilingual={!!(jobTitleEn && jobTitleAr)}
        />
      )}
      
      {(departmentEn || departmentAr) && (
        <ProfileField
          icon={Building2}
          label={{ en: 'Department', ar: 'القسم' }}
          value={departmentEn}
          valueAr={departmentAr}
          showBilingual={!!(departmentEn && departmentAr)}
        />
      )}
      
      {(organizationEn || organizationAr) && (
        <ProfileField
          icon={Building2}
          label={{ en: 'Organization', ar: 'المؤسسة' }}
          value={organizationEn}
          valueAr={organizationAr}
          showBilingual={!!(organizationEn && organizationAr)}
        />
      )}
      
      {yearsExperience > 0 && (
        <ProfileField
          icon={Calendar}
          label={{ en: 'Experience', ar: 'الخبرة' }}
          value={`${yearsExperience} ${yearsExperience === 1 ? 'year' : 'years'}`}
          valueAr={`${yearsExperience} ${yearsExperience === 1 ? 'سنة' : 'سنوات'}`}
        />
      )}
      
      {educationLevel && (
        <ProfileField
          icon={GraduationCap}
          label={{ en: 'Education', ar: 'التعليم' }}
          value={educationLevel}
        />
      )}
      
      {degree && (
        <ProfileField
          icon={Award}
          label={{ en: 'Degree', ar: 'الدرجة العلمية' }}
          value={degree}
        />
      )}
    </div>
  );
}

// Languages section
export function LanguagesSection({ languages }) {
  const { t, isRTL } = useLanguage();
  
  if (!languages || (Array.isArray(languages) && languages.length === 0)) return null;
  
  const languagesList = Array.isArray(languages) 
    ? languages 
    : typeof languages === 'object' 
      ? Object.entries(languages).map(([lang, level]) => ({ language: lang, level }))
      : [];
  
  return (
    <div className={`${isRTL ? 'text-right' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <Languages className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">{t({ en: 'Languages', ar: 'اللغات' })}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {languagesList.map((lang, i) => (
          <Badge key={i} variant="outline" className="text-xs">
            {typeof lang === 'object' ? `${lang.language} (${lang.level || lang.proficiency || ''})` : lang}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// Certifications section
export function CertificationsSection({ certifications }) {
  const { t, isRTL } = useLanguage();
  
  if (!certifications || (Array.isArray(certifications) && certifications.length === 0)) return null;
  
  const certList = Array.isArray(certifications) ? certifications : [];
  
  return (
    <div className={`${isRTL ? 'text-right' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <Award className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">{t({ en: 'Certifications', ar: 'الشهادات' })}</p>
      </div>
      <div className="space-y-2">
        {certList.map((cert, i) => (
          <div key={i} className="p-2 bg-muted/50 rounded text-sm">
            <p className="font-medium">{typeof cert === 'object' ? cert.name : cert}</p>
            {typeof cert === 'object' && cert.issuer && (
              <p className="text-xs text-muted-foreground">{cert.issuer}</p>
            )}
            {typeof cert === 'object' && cert.date && (
              <p className="text-xs text-muted-foreground">{cert.date}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Bio section with bilingual support
export function BioSection({ bioEn, bioAr, showBoth = true }) {
  const { language, t, isRTL } = useLanguage();
  
  if (!bioEn && !bioAr) return null;
  
  return (
    <div className={`${isRTL ? 'text-right' : ''}`}>
      <p className="text-xs text-muted-foreground mb-2">{t({ en: 'About', ar: 'نبذة' })}</p>
      {showBoth && bioEn && bioAr ? (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed" dir="ltr">{bioEn}</p>
          <p className="text-sm leading-relaxed text-muted-foreground border-t pt-3" dir="rtl">{bioAr}</p>
        </div>
      ) : (
        <p 
          className="text-sm leading-relaxed whitespace-pre-wrap" 
          dir={language === 'ar' && bioAr ? 'rtl' : 'ltr'}
        >
          {language === 'ar' ? (bioAr || bioEn) : (bioEn || bioAr)}
        </p>
      )}
    </div>
  );
}

// Skills/Expertise badges
export function SkillsBadges({ skills, label, colorClass = "bg-primary/10 text-primary" }) {
  const { t, isRTL } = useLanguage();
  
  if (!skills || skills.length === 0) return null;
  
  return (
    <div className={`${isRTL ? 'text-right' : ''}`}>
      {label && <p className="text-xs text-muted-foreground mb-2">{t(label)}</p>}
      <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : ''}`}>
        {skills.map((skill, i) => (
          <Badge key={i} className={colorClass}>
            {skill}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// Work experience section
export function WorkExperienceSection({ workExperience }) {
  const { t, isRTL } = useLanguage();
  
  if (!workExperience || workExperience.length === 0) return null;
  
  return (
    <div className={`${isRTL ? 'text-right' : ''}`}>
      <div className="flex items-center gap-2 mb-3">
        <Briefcase className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">{t({ en: 'Work Experience', ar: 'الخبرة العملية' })}</p>
      </div>
      <div className="space-y-3">
        {workExperience.map((exp, i) => (
          <div key={i} className="p-3 border rounded-lg">
            <p className="font-medium text-sm">{exp.position || exp.title}</p>
            <p className="text-sm text-muted-foreground">{exp.company || exp.organization}</p>
            {(exp.start_date || exp.end_date) && (
              <p className="text-xs text-muted-foreground mt-1">
                {exp.start_date} - {exp.end_date || t({ en: 'Present', ar: 'الحالي' })}
              </p>
            )}
            {exp.description && (
              <p className="text-xs text-muted-foreground mt-2">{exp.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default {
  BilingualText,
  ProfileField,
  ContactSection,
  ProfessionalSection,
  LanguagesSection,
  CertificationsSection,
  BioSection,
  SkillsBadges,
  WorkExperienceSection
};
