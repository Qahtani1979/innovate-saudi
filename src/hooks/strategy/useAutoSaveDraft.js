import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useStrategyMutations } from '@/hooks/useStrategyMutations';
import { useAuth } from '@/lib/AuthContext';

const LOCAL_STORAGE_KEY = 'strategic_plan_draft';
const AUTO_SAVE_DELAY = 15000; // 15 seconds

/**
 * useAutoSaveDraft Hook
 * ✅ GOLD STANDARD COMPLIANT
 * 
 * Manages auto-saving of strategic plan wizard data using centralized mutations.
 */
export function useAutoSaveDraft({
  planId = null,
  mode = 'create',
  enabled = true,
  onPlanIdChange = null
}) {
  const [lastSaved, setLastSaved] = useState(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [internalPlanId, setInternalPlanId] = useState(planId);
  const saveTimeoutRef = useRef(null);
  const dataRef = useRef(null);
  const currentStepRef = useRef(0);

  const { user } = useAuth();
  const { wizardSave, refreshStrategies } = useStrategyMutations();

  // Sync internal planId with prop
  useEffect(() => {
    if (planId && planId !== internalPlanId) {
      setInternalPlanId(planId);
    }
  }, [planId]);

  // Check for existing local draft on mount
  useEffect(() => {
    if (mode === 'create' && !planId) {
      const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          const hasMeaningfulData = parsed && (
            parsed.name_en ||
            parsed.name_ar ||
            parsed._planId ||
            parsed._savedStep
          );
          if (hasMeaningfulData) {
            setHasDraft(true);
          }
        } catch (e) {
          console.warn('Failed to parse draft:', e);
        }
      }
    }
  }, [mode, planId]);

  // Save to local storage
  const saveToLocal = useCallback((data, step) => {
    if (mode === 'create' || mode === 'edit') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
          ...data,
          _savedAt: new Date().toISOString(),
          _savedStep: step,
          _planId: internalPlanId
        }));
      } catch (e) {
        console.warn('Failed to save to local storage:', e);
      }
    }
  }, [mode, internalPlanId]);

  // Save to database
  const saveToDatabase = useCallback(async (data, currentStep) => {
    if (!enabled || !user) return { success: false };

    // Don't save if no meaningful data
    if (!data.name_en && !data.name_ar) return { success: false };

    try {
      const result = await wizardSave.mutateAsync({
        id: internalPlanId,
        data: {
          ...data,
          last_saved_step: currentStep,
          owner_email: user.email
        },
        mode
      });

      if (result?.id && !internalPlanId) {
        setInternalPlanId(result.id);
        if (onPlanIdChange) onPlanIdChange(result.id);
      }

      setLastSaved(new Date());
      return { success: true, planId: result?.id };
    } catch (error) {
      console.error('[AutoSave] Error:', error);
      return { success: false, error: error.message };
    }
  }, [internalPlanId, mode, enabled, user, wizardSave, onPlanIdChange]);

  // Schedule auto-save
  const scheduleAutoSave = useCallback((data, currentStep) => {
    dataRef.current = data;
    currentStepRef.current = currentStep;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveToLocal(data, currentStep);

    saveTimeoutRef.current = setTimeout(async () => {
      if (dataRef.current) {
        await saveToDatabase(dataRef.current, currentStepRef.current);
      }
    }, AUTO_SAVE_DELAY);
  }, [saveToLocal, saveToDatabase]);

  // Manual save
  const saveNow = useCallback(async (data, currentStep) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveToLocal(data, currentStep);
    return await saveToDatabase(data, currentStep);
  }, [saveToLocal, saveToDatabase]);

  // Handle unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  return {
    scheduleAutoSave,
    saveNow,
    loadLocalDraft: () => {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    },
    clearLocalDraft: () => {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setHasDraft(false);
    },
    hasDraft,
    lastSaved,
    isSaving: wizardSave.isPending,
    currentPlanId: internalPlanId
  };
}

export default useAutoSaveDraft;
