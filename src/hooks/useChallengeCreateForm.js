import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing multi-step challenge creation form
 * Handles form state, validation, and step navigation
 * 
 * @param {Object} initialData - Initial form data
 * @returns {Object} - Form state and handlers
 */
export function useChallengeCreateForm(initialData = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    code: `CH-${Date.now().toString().slice(-6)}`,
    municipality_id: '',
    title_en: '',
    title_ar: '',
    tagline_en: '',
    tagline_ar: '',
    description_en: '',
    description_ar: '',
    problem_statement_en: '',
    problem_statement_ar: '',
    current_situation_en: '',
    current_situation_ar: '',
    desired_outcome_en: '',
    desired_outcome_ar: '',
    root_cause_en: '',
    root_cause_ar: '',
    root_causes: [],
    theme: '',
    keywords: [],
    challenge_type: 'other',
    category: '',
    sector: '',
    sector_id: '',
    sub_sector: '',
    subsector_id: '',
    service_id: '',
    affected_services: [],
    ministry_service: '',
    responsible_agency: '',
    department: '',
    challenge_owner: '',
    challenge_owner_email: '',
    city_id: '',
    region_id: '',
    coordinates: { latitude: null, longitude: null },
    priority: 'tier_3',
    status: 'draft',
    tracks: [],
    source: '',
    strategic_goal: '',
    strategic_plan_ids: [],
    severity_score: 50,
    impact_score: 50,
    overall_score: 50,
    affected_population: { size: null, demographics: '', location: '' },
    affected_population_size: null,
    budget_estimate: null,
    timeline_estimate: '',
    kpis: [],
    stakeholders: [],
    data_evidence: [],
    constraints: [],
    innovation_framing: null,
    image_url: '',
    gallery_urls: [],
    citizen_origin_idea_id: null,
    ...initialData
  });

  const [hasUserEdited, setHasUserEdited] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  // Update a single field
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUserEdited(prev => ({ ...prev, [field]: true }));
    // Clear validation error for this field
    setValidationErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // Update multiple fields at once
  const updateFields = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
    Object.keys(updates).forEach(field => {
      setHasUserEdited(prev => ({ ...prev, [field]: true }));
    });
  }, []);

  // Validate current step
  const validateStep = useCallback((step) => {
    const errors = {};

    switch (step) {
      case 1: // Basic Info
        if (!formData.title_en?.trim()) errors.title_en = 'Title (English) is required';
        if (!formData.municipality_id) errors.municipality_id = 'Municipality is required';
        break;
      case 2: // Classification
        if (!formData.sector_id) errors.sector_id = 'Sector is required';
        break;
      case 3: // Problem Statement
        if (!formData.description_en?.trim()) errors.description_en = 'Description is required';
        break;
      default:
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Navigate to next step
  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6)); // Max 6 steps
      return true;
    }
    return false;
  }, [currentStep, validateStep]);

  // Navigate to previous step
  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  // Go to specific step
  const goToStep = useCallback((step) => {
    if (step >= 1 && step <= 6) {
      setCurrentStep(step);
    }
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      ...initialData,
      code: `CH-${Date.now().toString().slice(-6)}`
    });
    setCurrentStep(1);
    setHasUserEdited({});
    setValidationErrors({});
  }, [initialData]);

  // Auto-save to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('challenge_draft', JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('challenge_draft');
    if (draft && !initialData.title_en) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse draft:', e);
      }
    }
  }, []);

  return {
    formData,
    currentStep,
    hasUserEdited,
    validationErrors,
    updateField,
    updateFields,
    validateStep,
    nextStep,
    prevStep,
    goToStep,
    resetForm,
    setHasUserEdited,
    isValid: Object.keys(validationErrors).length === 0
  };
}

export default useChallengeCreateForm;
