import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';

/**
 * Hook for tracking onboarding analytics events
 * Usage:
 *   const { trackEvent, trackStepStart, trackStepComplete, trackOnboardingComplete } = useOnboardingAnalytics();
 *   trackEvent('wizard_opened', { source: 'auth_redirect' });
 */
export function useOnboardingAnalytics() {
  const { user } = useAuth();

  const trackEvent = useCallback(async (eventType, eventData = {}, stepInfo = {}) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.from('onboarding_events').insert({
        user_id: user.id,
        user_email: user.email,
        event_type: eventType,
        event_data: eventData,
        step_number: stepInfo.stepNumber || null,
        step_name: stepInfo.stepName || null,
        persona: stepInfo.persona || null,
        duration_seconds: stepInfo.durationSeconds || null
      });

      if (error) {
        console.warn('Failed to track onboarding event:', error);
      }
    } catch (err) {
      console.warn('Error tracking onboarding event:', err);
    }
  }, [user]);

  const trackStepStart = useCallback((stepNumber, stepName, additionalData = {}) => {
    // Store start time in sessionStorage for duration calculation
    sessionStorage.setItem(`onboarding_step_${stepNumber}_start`, Date.now().toString());
    
    return trackEvent('step_started', additionalData, { stepNumber, stepName });
  }, [trackEvent]);

  const trackStepComplete = useCallback((stepNumber, stepName, additionalData = {}) => {
    const startTime = sessionStorage.getItem(`onboarding_step_${stepNumber}_start`);
    let durationSeconds = null;
    
    if (startTime) {
      durationSeconds = Math.round((Date.now() - parseInt(startTime)) / 1000);
      sessionStorage.removeItem(`onboarding_step_${stepNumber}_start`);
    }

    return trackEvent('step_completed', additionalData, { stepNumber, stepName, durationSeconds });
  }, [trackEvent]);

  const trackOnboardingComplete = useCallback((persona, additionalData = {}) => {
    return trackEvent('onboarding_completed', additionalData, { persona });
  }, [trackEvent]);

  const trackWizardOpened = useCallback((source = 'unknown') => {
    return trackEvent('wizard_opened', { source });
  }, [trackEvent]);

  const trackWizardAbandoned = useCallback((stepNumber, stepName, reason = 'unknown') => {
    return trackEvent('wizard_abandoned', { reason }, { stepNumber, stepName });
  }, [trackEvent]);

  const trackCVUploaded = useCallback((fileType, extractedFields = []) => {
    return trackEvent('cv_uploaded', { fileType, extractedFieldsCount: extractedFields.length });
  }, [trackEvent]);

  const trackLinkedInImported = useCallback((fieldsExtracted = []) => {
    return trackEvent('linkedin_imported', { fieldsExtractedCount: fieldsExtracted.length });
  }, [trackEvent]);

  const trackAISuggestionApplied = useCallback((suggestionType) => {
    return trackEvent('ai_suggestion_applied', { suggestionType });
  }, [trackEvent]);

  const trackPersonaSelected = useCallback((persona) => {
    return trackEvent('persona_selected', { persona }, { persona });
  }, [trackEvent]);

  return {
    trackEvent,
    trackStepStart,
    trackStepComplete,
    trackOnboardingComplete,
    trackWizardOpened,
    trackWizardAbandoned,
    trackCVUploaded,
    trackLinkedInImported,
    trackAISuggestionApplied,
    trackPersonaSelected
  };
}

export default useOnboardingAnalytics;