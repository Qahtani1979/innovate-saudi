import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const LOCAL_STORAGE_KEY = 'strategic_plan_draft';
const AUTO_SAVE_DELAY = 15000; // 15 seconds - reduced for better reliability

/**
 * useAutoSaveDraft Hook
 * 
 * Manages auto-saving of strategic plan wizard data with:
 * - Local storage for immediate recovery
 * - Database sync for persistence
 * - Version control on edit mode
 * - Callback to update parent planId after first save
 */
export function useAutoSaveDraft({
  planId = null,
  mode = 'create', // 'create' | 'edit' | 'review'
  enabled = true,
  onPlanIdChange = null // Callback to update parent's planId
}) {
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [internalPlanId, setInternalPlanId] = useState(planId);
  const saveTimeoutRef = useRef(null);
  const dataRef = useRef(null);
  const currentStepRef = useRef(0);

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
          // Check for any meaningful data, not just name
          const hasMeaningfulData = parsed && (
            parsed.name_en || 
            parsed.name_ar || 
            parsed._planId ||
            parsed._savedStep ||
            parsed.vision_en ||
            parsed.mission_en ||
            (parsed.objectives && parsed.objectives.length > 0) ||
            (parsed.stakeholders && parsed.stakeholders.length > 0)
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
        console.log('[AutoSave] Saved to local storage, step:', step);
      } catch (e) {
        console.warn('Failed to save to local storage:', e);
      }
    }
  }, [mode, internalPlanId]);

  // Save to database
  const saveToDatabase = useCallback(async (data, currentStep) => {
    if (!enabled) {
      console.log('[AutoSave] Disabled, skipping');
      return { success: false, error: 'Auto-save disabled' };
    }

    // Don't save if no meaningful data
    if (!data.name_en && !data.name_ar) {
      console.log('[AutoSave] No plan name (name_en/name_ar), skipping save');
      return { success: false, error: 'No plan name' };
    }

    setIsSaving(true);
    console.log('[AutoSave] Saving to database, step:', currentStep, 'planId:', internalPlanId);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const saveData = {
        name_en: data.name_en || data.name_ar || 'Untitled Plan',
        name_ar: data.name_ar,
        description_en: data.description_en,
        description_ar: data.description_ar,
        vision_en: data.vision_en,
        vision_ar: data.vision_ar,
        mission_en: data.mission_en,
        mission_ar: data.mission_ar,
        start_year: data.start_year,
        end_year: data.end_year,
        objectives: data.objectives || [],
        kpis: data.kpis || [],
        pillars: data.strategic_pillars || [],
        stakeholders: data.stakeholders || [],
        pestel: data.pestel || {},
        swot: data.swot || {},
        scenarios: data.scenarios || {},
        risks: data.risks || [],
        dependencies: data.dependencies || [],
        constraints: data.constraints || [],
        assumptions: data.assumptions || [],
        national_alignments: data.national_alignments || [],
        action_plans: data.action_plans || [],
        resource_plan: data.resource_plan || {},
        milestones: data.milestones || [],
        phases: data.phases || [],
        governance: data.governance || {},
        communication_plan: data.communication_plan || {},
        change_management: data.change_management || {},
        target_sectors: data.target_sectors || [],
        target_regions: data.target_regions || [],
        strategic_themes: data.strategic_themes || [],
        focus_technologies: data.focus_technologies || [],
        vision_2030_programs: data.vision_2030_programs || [],
        budget_range: data.budget_range,
        core_values: data.core_values || [],
        strategic_pillars: data.strategic_pillars || [],
        quick_stakeholders: data.quick_stakeholders || [],
        key_challenges: data.key_challenges || '',
        available_resources: data.available_resources || '',
        initial_constraints: data.initial_constraints || '',
        last_saved_step: currentStep,
        draft_data: data,
        status: data.status || 'draft',
        owner_email: user?.email,
        updated_at: new Date().toISOString()
      };

      let result;
      
      if (internalPlanId) {
        // Update existing plan (whether edit or create mode with existing draft)
        console.log('[AutoSave] Updating existing plan:', internalPlanId);
        const { data: updated, error } = await supabase
          .from('strategic_plans')
          .update(saveData)
          .eq('id', internalPlanId)
          .select()
          .single();
        
        if (error) throw error;
        result = updated;
      } else if (mode === 'create') {
        // Create new draft - only if we don't have a planId yet
        console.log('[AutoSave] Creating new plan');
        const { data: created, error } = await supabase
          .from('strategic_plans')
          .insert(saveData)
          .select()
          .single();
        
        if (error) throw error;
        result = created;
        
        // CRITICAL: Update internal planId and notify parent
        if (result?.id) {
          console.log('[AutoSave] New plan created with ID:', result.id);
          setInternalPlanId(result.id);
          if (onPlanIdChange) {
            onPlanIdChange(result.id);
          }
          // Also update local storage with the new planId
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
            ...data,
            _savedAt: new Date().toISOString(),
            _savedStep: currentStep,
            _planId: result.id
          }));
        }
      }

      setLastSaved(new Date());
      setIsSaving(false);
      console.log('[AutoSave] Save successful, planId:', result?.id);
      return { success: true, planId: result?.id };
    } catch (error) {
      console.error('[AutoSave] Error:', error);
      setIsSaving(false);
      return { success: false, error: error.message };
    }
  }, [internalPlanId, mode, enabled, onPlanIdChange]);

  // Schedule auto-save
  const scheduleAutoSave = useCallback((data, currentStep) => {
    dataRef.current = data;
    currentStepRef.current = currentStep;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Save to local immediately
    saveToLocal(data, currentStep);

    // Schedule database save
    saveTimeoutRef.current = setTimeout(async () => {
      if (dataRef.current) {
        const result = await saveToDatabase(dataRef.current, currentStepRef.current);
        if (result.success) {
          console.log('[AutoSave] Scheduled save completed');
        }
      }
    }, AUTO_SAVE_DELAY);
  }, [saveToLocal, saveToDatabase]);

  // Manual save - returns promise
  const saveNow = useCallback(async (data, currentStep) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveToLocal(data, currentStep);
    return await saveToDatabase(data, currentStep);
  }, [saveToLocal, saveToDatabase]);

  // Load draft from local storage
  const loadLocalDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If there's a planId in the draft, use it
        if (parsed._planId && !internalPlanId) {
          setInternalPlanId(parsed._planId);
          if (onPlanIdChange) {
            onPlanIdChange(parsed._planId);
          }
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load draft:', e);
    }
    return null;
  }, [internalPlanId, onPlanIdChange]);

  // Clear local draft
  const clearLocalDraft = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setHasDraft(false);
  }, []);

  // Load existing plan from database
  const loadPlan = useCallback(async (id) => {
    try {
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setInternalPlanId(id);
      return data;
    } catch (error) {
      console.error('Failed to load plan:', error);
      return null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    scheduleAutoSave,
    saveNow,
    loadLocalDraft,
    clearLocalDraft,
    loadPlan,
    hasDraft,
    lastSaved,
    isSaving,
    currentPlanId: internalPlanId
  };
}

export default useAutoSaveDraft;
