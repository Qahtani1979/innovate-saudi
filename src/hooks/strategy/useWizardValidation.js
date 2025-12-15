/**
 * Wizard step validation utilities
 * Validates required fields for each step before allowing navigation
 * 
 * NOTE: Converted to plain functions to avoid React hook dispatcher issues
 */

// Define required fields per step (aligned with WIZARD_STEPS.required flags)
const stepRequirements = {
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
    fields: [],
    arrayFields: [{ field: 'stakeholders', min: 0, label: { en: 'Stakeholders', ar: 'أصحاب المصلحة' } }],
    labels: {}
  },
  4: { fields: [], labels: {} },
  5: { fields: [], labels: {} },
  6: { fields: [], labels: {} },
  7: {
    fields: [],
    arrayFields: [{ field: 'risks', min: 0, label: { en: 'Risks', ar: 'المخاطر' } }],
    labels: {}
  },
  8: { fields: [], labels: {} },
  9: {
    fields: [],
    arrayFields: [{ field: 'objectives', min: 1, label: { en: 'Strategic Objectives', ar: 'الأهداف الاستراتيجية' } }],
    labels: {}
  },
  10: { fields: [], labels: {} },
  11: {
    fields: [],
    arrayFields: [{ field: 'kpis', min: 0, label: { en: 'KPIs', ar: 'مؤشرات الأداء' } }],
    labels: {}
  },
  12: {
    fields: [],
    arrayFields: [{ field: 'action_plans', min: 0, label: { en: 'Action Plans', ar: 'خطط العمل' } }],
    labels: {}
  },
  13: { fields: [], labels: {} },
  14: { fields: [], labels: {} },
  15: { fields: [], labels: {} },
  16: { fields: [], labels: {} },
  17: { fields: [], labels: {} },
  18: { fields: [], labels: {} }
};

/**
 * Validate a specific step
 */
function validateStep(wizardData, stepNumber, t = (obj) => obj?.en || obj) {
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
}

/**
 * Get overall completion status
 */
function getCompletionStatus(wizardData, t) {
  const status = {};
  for (let step = 1; step <= 18; step++) {
    const validation = validateStep(wizardData, step, t);
    status[step] = {
      isComplete: validation.isValid,
      errors: validation.errors
    };
  }
  return status;
}

/**
 * Check if step has any data filled
 */
function hasStepData(wizardData, stepNumber) {
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
      return !!(wizardData.scenarios && Object.keys(wizardData.scenarios).some(k => 
        wizardData.scenarios[k]?.description_en || wizardData.scenarios[k]?.description_ar || wizardData.scenarios[k]?.description
      ));
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
      return !!(wizardData.resource_plan && (
        wizardData.resource_plan.hr_requirements?.length > 0 ||
        wizardData.resource_plan.technology_requirements?.length > 0 ||
        wizardData.resource_plan.infrastructure_requirements?.length > 0 ||
        wizardData.resource_plan.budget_allocation?.length > 0
      ));
    case 14:
      return wizardData.milestones?.length > 0 || wizardData.phases?.length > 0;
    case 15:
      return !!(wizardData.governance && (
        wizardData.governance.structure?.length > 0 ||
        wizardData.governance.committees?.length > 0 ||
        wizardData.governance.escalation_path?.length > 0
      ));
    case 16:
      return !!(wizardData.communication_plan && (
        wizardData.communication_plan.internal_channels?.length > 0 ||
        wizardData.communication_plan.external_channels?.length > 0 ||
        wizardData.communication_plan.key_messages?.length > 0
      ));
    case 17:
      return !!(wizardData.change_management && (
        wizardData.change_management.readiness_assessment_en?.trim() ||
        wizardData.change_management.readiness_assessment_ar?.trim() ||
        wizardData.change_management.change_approach_en?.trim() ||
        wizardData.change_management.change_approach_ar?.trim() ||
        wizardData.change_management.training_plan?.length > 0 ||
        wizardData.change_management.resistance_management_en?.trim() ||
        wizardData.change_management.resistance_management_ar?.trim()
      ));
    case 18:
      return true;
    default:
      return false;
  }
}

/**
 * Calculate overall progress
 */
function calculateProgress(wizardData) {
  let filledSteps = 0;
  for (let step = 1; step <= 17; step++) {
    if (hasStepData(wizardData, step)) filledSteps++;
  }
  return Math.round((filledSteps / 17) * 100);
}

/**
 * Hook-like interface that returns bound functions for a given wizardData
 * This avoids using React hooks while maintaining similar API
 */
export function useWizardValidation(wizardData, t = (obj) => obj?.en || obj) {
  return {
    validateStep: (stepNumber) => validateStep(wizardData, stepNumber, t),
    getCompletionStatus: () => getCompletionStatus(wizardData, t),
    hasStepData: (stepNumber) => hasStepData(wizardData, stepNumber),
    calculateProgress: () => calculateProgress(wizardData),
    stepRequirements
  };
}

// Also export individual functions for direct use
export { validateStep, getCompletionStatus, hasStepData, calculateProgress, stepRequirements };
