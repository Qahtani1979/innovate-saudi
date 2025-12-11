/**
 * Citizen Page Layout - Re-exports from PersonaPageLayout for backward compatibility
 * All new pages should import from '@/components/layout/PersonaPageLayout' directly
 */

// Re-export everything from the shared PersonaPageLayout
export { 
  usePersonaColors,
  PageHeader as CitizenPageHeader,
  SearchFilter as CitizenSearchFilter,
  CardGrid as CitizenCardGrid,
  EmptyState as CitizenEmptyState,
  PageLayout as CitizenPageLayout,
  PersonaButton,
} from '@/components/layout/PersonaPageLayout';

// Default export for backward compatibility
export { PageLayout as default } from '@/components/layout/PersonaPageLayout';
