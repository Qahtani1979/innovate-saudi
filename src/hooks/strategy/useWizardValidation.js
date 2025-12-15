import { useMemo, useCallback } from 'react';
import { useLanguage } from '@/components/LanguageContext';

/**
 * Hook for wizard step validation
 * Validates required fields for each step before allowing navigation
 */
export function useWizardValidation(wizardData) {
  const { t } = useLanguage();

  // Define required fields per step (aligned with WIZARD_STEPS.required flags)
  const stepRequirements = useMemo(() => ({
    1: {
      fields: ['name_en'],
      labels: { name_en: { en: 'Plan Name', ar: 'اسم الخطة' } }
    },
    2: {
      fields: ['vision_en', 'mission_en'],
      labels: {
        vision_en: { en: 'Vision Statement', ar: 'بيان الرؤية' },
        mission_en: { en: 'Mission Statement', ar: 'بيان الرسالة' }
      }
    },
    3: {
      fields: [], // Stakeholders recommended but not blocking
      arrayFields: [{ field: 'stakeholders', min: 0, label: { en: 'Stakeholders', ar: 'أصحاب المصلحة' } }],
      labels: {}
    },
    4: {
      fields: [], // PESTEL optional
      labels: {}
    },
    5: {
      fields: [], // SWOT recommended
      labels: {}
    },
    6: {
      fields: [], // Scenarios optional
      labels: {}
    },
    7: {
      fields: [], // Risks recommended but not blocking
      arrayFields: [{ field: 'risks', min: 0, label: { en: 'Risks', ar: 'المخاطر' } }],
      labels: {}
    },
    8: {
      fields: [], // Dependencies optional
      labels: {}
    },
    9: {
      fields: [],
      arrayFields: [{ field: 'objectives', min: 1, label: { en: 'Strategic Objectives', ar: 'الأهداف الاستراتيجية' } }],
      labels: {}
    },
    10: {
      fields: [], // National alignment optional
      labels: {}
    },
    11: {
      fields: [], // KPIs recommended
      arrayFields: [{ field: 'kpis', min: 0, label: { en: 'KPIs', ar: 'مؤشرات الأداء' } }],
      labels: {}
    },
    12: {
      fields: [], // Action plans recommended
      arrayFields: [{ field: 'action_plans', min: 0, label: { en: 'Action Plans', ar: 'خطط العمل' } }],
      labels: {}
    },
    13: {
      fields: [], // Resources optional
      labels: {}
    },
    14: {
      fields: [], // Timeline optional
      labels: {}
    },
    15: {
      fields: [], // Governance optional
      labels: {}
    },
    16: {
      fields: [], // Communication optional
      labels: {}
    },
    17: {
      fields: [], // Change management optional
      labels: {}
    },
    18: {
      fields: [], // Review - all prior steps
      labels: {}
    }
  }), []);

  // Validate a specific step
  const validateStep = useCallback((stepNumber) => {
    const requirements = stepRequirements[stepNumber];
    if (!requirements) return { isValid: true, errors: [] };

    const errors = [];

    // Check required text fields
    requirements.fields?.forEach(field => {
      const value = wizardData[field];
      if (!value || (typeof value === 'string' && !value.trim())) {
        errors.push({
          field,
          message: t({ 
            en: `${t(requirements.labels[field])} is required`, 
            ar: `${t(requirements.labels[field])} مطلوب` 
          })
        });
      }
    });

    // Check array fields with minimum counts
    requirements.arrayFields?.forEach(({ field, min, label }) => {
      const arr = wizardData[field];
      const fieldLabel = label || requirements.labels[field] || { en: field, ar: field };
      if (min > 0 && (!arr || arr.length < min)) {
        errors.push({
          field,
          message: t({ 
            en: `At least ${min} ${t(fieldLabel)} required`, 
            ar: `مطلوب ${min} ${t(fieldLabel)} على الأقل` 
          })
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [wizardData, stepRequirements, t]);

  // Get overall completion status
  const getCompletionStatus = useCallback(() => {
    const status = {};
    for (let step = 1; step <= 18; step++) {
      const validation = validateStep(step);
      status[step] = {
        isComplete: validation.isValid,
        errors: validation.errors
      };
    }
    return status;
  }, [validateStep]);

  // Check if step has any data filled
  const hasStepData = useCallback((stepNumber) => {
    switch (stepNumber) {
      case 1:
        return !!(wizardData.name_en || wizardData.description_en);
      case 2:
        return !!(wizardData.vision_en || wizardData.mission_en);
      case 3:
        return wizardData.stakeholders?.length > 0;
      case 4:
        return !!(wizardData.pestel && Object.values(wizardData.pestel).some(arr => arr?.length > 0));
      case 5:
        return !!(wizardData.swot && Object.values(wizardData.swot).some(arr => arr?.length > 0));
      case 6:
        return !!(wizardData.scenarios && Object.keys(wizardData.scenarios).some(k => wizardData.scenarios[k]?.description));
      case 7:
        return wizardData.risks?.length > 0;
      case 8:
        return wizardData.dependencies?.length > 0 || wizardData.constraints?.length > 0;
      case 9:
        return wizardData.objectives?.length > 0;
      case 10:
        return wizardData.national_alignments?.length > 0;
      case 11:
        return wizardData.kpis?.length > 0;
      case 12:
        return wizardData.action_plans?.length > 0;
      case 13:
        // Resource plan has nested arrays - check if any have content
        return !!(wizardData.resource_plan && (
          wizardData.resource_plan.hr_requirements?.length > 0 ||
          wizardData.resource_plan.technology_requirements?.length > 0 ||
          wizardData.resource_plan.infrastructure_requirements?.length > 0 ||
          wizardData.resource_plan.budget_allocation?.length > 0
        ));
      case 14:
        return wizardData.milestones?.length > 0 || wizardData.phases?.length > 0;
      case 15:
        // Governance has nested arrays - check if any have content
        return !!(wizardData.governance && (
          wizardData.governance.structure?.length > 0 ||
          wizardData.governance.committees?.length > 0 ||
          wizardData.governance.escalation_path?.length > 0
        ));
      case 16:
        // Communication plan has nested arrays
        return !!(wizardData.communication_plan && (
          wizardData.communication_plan.internal_channels?.length > 0 ||
          wizardData.communication_plan.external_channels?.length > 0 ||
          wizardData.communication_plan.key_messages?.length > 0
        ));
      case 17:
        // Change management - check text fields and arrays
        return !!(wizardData.change_management && (
          wizardData.change_management.readiness_assessment?.trim() ||
          wizardData.change_management.change_approach?.trim() ||
          wizardData.change_management.training_plan?.length > 0 ||
          wizardData.change_management.resistance_management?.trim()
        ));
      case 18:
        return true; // Review step always considered "has data"
      default:
        return false;
    }
  }, [wizardData]);

  // Calculate overall progress
  const calculateProgress = useCallback(() => {
    let filledSteps = 0;
    for (let step = 1; step <= 17; step++) {
      if (hasStepData(step)) filledSteps++;
    }
    return Math.round((filledSteps / 17) * 100);
  }, [hasStepData]);

  return {
    validateStep,
    getCompletionStatus,
    hasStepData,
    calculateProgress,
    stepRequirements
  };
}