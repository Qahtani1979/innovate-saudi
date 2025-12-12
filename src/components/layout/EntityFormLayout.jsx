import React from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { PageLayout, PageHeader, PersonaButton, usePersonaColors } from './PersonaPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Form section component for grouping related fields
 */
export function FormSection({ 
  title, 
  description, 
  children, 
  className = '',
  collapsible = false
}) {
  const { language } = useLanguage();
  
  const resolveText = (text) => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return language === 'ar' && text.ar ? text.ar : (text.en || '');
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{resolveText(title)}</CardTitle>
        {description && (
          <CardDescription>{resolveText(description)}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}

/**
 * Form actions bar component
 */
export function FormActions({
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel,
  cancelLabel,
  showCancel = true,
  disabled = false,
  className = ''
}) {
  const { t, isRTL } = useLanguage();
  
  return (
    <div 
      className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''} ${className}`}
    >
      <PersonaButton 
        onClick={onSubmit}
        disabled={isSubmitting || disabled}
        type="submit"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        {submitLabel || t({ en: 'Save', ar: 'حفظ' })}
      </PersonaButton>
      
      {showCancel && (
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          <X className="h-4 w-4 mr-2" />
          {cancelLabel || t({ en: 'Cancel', ar: 'إلغاء' })}
        </Button>
      )}
    </div>
  );
}

/**
 * Two-column form layout for side-by-side fields
 */
export function FormGrid({ children, columns = 2, className = '' }) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };
  
  return (
    <div className={`grid gap-4 ${gridCols[columns] || gridCols[2]} ${className}`}>
      {children}
    </div>
  );
}

/**
 * EntityFormLayout - Consistent layout for create/edit forms
 * 
 * @param {Object} props
 * @param {'create'|'edit'} props.mode - Form mode
 * @param {React.ComponentType} props.icon - Header icon
 * @param {Object} props.title - Bilingual title {en, ar}
 * @param {Object} props.description - Bilingual description {en, ar}
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Function} props.onCancel - Cancel handler (defaults to navigate back)
 * @param {boolean} props.isLoading - Loading data state
 * @param {boolean} props.isSubmitting - Submitting form state
 * @param {string} props.backPath - Custom back navigation path
 * @param {Object} props.submitLabel - Custom submit button label {en, ar}
 * @param {ReactNode} props.headerAction - Additional header action
 * @param {ReactNode} props.children - Form content
 * @param {ReactNode} props.sidebar - Sidebar content (for 2-column layouts)
 * @param {boolean} props.stickyActions - Sticky action bar at bottom
 */
export function EntityFormLayout({
  mode = 'create',
  icon,
  title,
  description,
  onSubmit,
  onCancel,
  isLoading = false,
  isSubmitting = false,
  backPath,
  submitLabel,
  headerAction,
  children,
  sidebar,
  stickyActions = false
}) {
  const { t, isRTL, language } = useLanguage();
  const navigate = useNavigate();
  const { iconColor } = usePersonaColors();
  
  const resolveText = (text) => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return language === 'ar' && text.ar ? text.ar : (text.en || '');
  };
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };
  
  const handleSubmit = (e) => {
    e?.preventDefault();
    onSubmit?.(e);
  };
  
  // Default titles based on mode
  const defaultTitle = mode === 'create' 
    ? { en: 'Create New', ar: 'إنشاء جديد' }
    : { en: 'Edit', ar: 'تعديل' };
  
  const defaultSubmitLabel = mode === 'create'
    ? { en: 'Create', ar: 'إنشاء' }
    : { en: 'Save Changes', ar: 'حفظ التغييرات' };
  
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <PageHeader
        icon={icon}
        title={title || defaultTitle}
        description={description}
        action={
          <div className="flex items-center gap-2">
            {headerAction}
            <Button variant="outline" onClick={handleCancel}>
              <ArrowLeft className={`h-4 w-4 mr-2 ${isRTL ? 'rotate-180' : ''}`} />
              {t({ en: 'Back', ar: 'رجوع' })}
            </Button>
          </div>
        }
      />
      
      <form onSubmit={handleSubmit}>
        {sidebar ? (
          // Two-column layout with sidebar
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {children}
            </div>
            <div className="space-y-6">
              {sidebar}
              
              {/* Actions in sidebar */}
              <Card>
                <CardContent className="pt-6">
                  <FormActions
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isSubmitting={isSubmitting}
                    submitLabel={resolveText(submitLabel || defaultSubmitLabel)}
                    className="flex-col"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Single column layout
          <div className="space-y-6">
            {children}
            
            {/* Bottom actions */}
            <div className={`flex justify-end ${stickyActions ? 'sticky bottom-0 bg-background/80 backdrop-blur-sm py-4 -mx-4 px-4 border-t' : ''}`}>
              <FormActions
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
                submitLabel={resolveText(submitLabel || defaultSubmitLabel)}
              />
            </div>
          </div>
        )}
      </form>
    </PageLayout>
  );
}

export default EntityFormLayout;
