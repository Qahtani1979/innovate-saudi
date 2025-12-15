import { useMemo, useCallback } from 'react';
import { useLanguage } from '@/components/LanguageContext';

/**
 * Hook for wizard step validation
 * Validates required fields for each step before allowing navigation
 */
export function useWizardValidation(wizardData) {
  const { t } = useLanguage();

  // Define required fields per step
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
      fields: [], // Stakeholders optional
      labels: {}
    },
    4: {
      fields: [], // PESTEL optional
      labels: {}
    },
    5: {
      fields: [], // SWOT recommended but not required
      labels: {}
    },
    6: {
      fields: [], // Scenarios optional
      labels: {}
    },
    7: {
      fields: [], // Risks optional
      labels: {}
    },
    8: {
      fields: [], // Dependencies optional
      labels: {}
    },
    9: {
      fields: [], // Objectives - at least one recommended
      arrayFields: [{ field: 'objectives', min: 1 }],
      labels: { objectives: { en: 'Strategic Objectives', ar: 'الأهداف الاستراتيجية' } }
    },
    10: {
      fields: [], // National alignment optional
      labels: {}
    },
    11: {
      fields: [], // KPIs - at least one recommended
      arrayFields: [{ field: 'kpis', min: 0 }],
      labels: {}
    },
    12: {
      fields: [], // Action plans optional
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
    requirements.arrayFields?.forEach(({ field, min }) => {
      const arr = wizardData[field];
      if (min > 0 && (!arr || arr.length < min)) {
        errors.push({
          field,
          message: t({ 
            en: `At least ${min} ${t(requirements.labels[field] || { en: field, ar: field })} required`, 
            ar: `مطلوب ${min} ${t(requirements.labels[field] || { en: field, ar: field })} على الأقل` 
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
        return !!(wizardData.resource_plan && Object.keys(wizardData.resource_plan).length > 0);
      case 14:
        return wizardData.milestones?.length > 0 || wizardData.phases?.length > 0;
      case 15:
        return !!(wizardData.governance && Object.keys(wizardData.governance).length > 0);
      case 16:
        return !!(wizardData.communication_plan && Object.keys(wizardData.communication_plan).length > 0);
      case 17:
        return !!(wizardData.change_management && Object.keys(wizardData.change_management).length > 0);
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