import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const LOCAL_STORAGE_KEY = 'strategic_plan_draft';
const AUTO_SAVE_DELAY = 30000; // 30 seconds

/**
 * useAutoSaveDraft Hook
 * 
 * Manages auto-saving of strategic plan wizard data with:
 * - Local storage for immediate recovery
 * - Database sync for persistence
 * - Version control on edit mode
 */
export function useAutoSaveDraft({
  planId = null,
  mode = 'create', // 'create' | 'edit' | 'review'
  enabled = true
}) {
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const saveTimeoutRef = useRef(null);
  const dataRef = useRef(null);

  // Check for existing local draft on mount
  useEffect(() => {
    if (mode === 'create') {
      const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed && parsed.name_en) {
            setHasDraft(true);
          }
        } catch (e) {
          console.warn('Failed to parse draft:', e);
        }
      }
    }
  }, [mode]);

  // Save to local storage
  const saveToLocal = useCallback((data) => {
    if (mode === 'create') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
          ...data,
          _savedAt: new Date().toISOString()
        }));
        setLastSaved(new Date());
      } catch (e) {
        console.warn('Failed to save to local storage:', e);
      }
    }
  }, [mode]);

  // Save to database
  const saveToDatabase = useCallback(async (data, currentStep) => {
    if (!enabled) return { success: false, error: 'Auto-save disabled' };

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const saveData = {
        name_en: data.name_en || 'Untitled Plan',
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
        status: 'draft',
        owner_email: user?.email,
        updated_at: new Date().toISOString()
      };

      let result;
      if (mode === 'edit' && planId) {
        // Update existing plan
        const { data: updated, error } = await supabase
          .from('strategic_plans')
          .update(saveData)
          .eq('id', planId)
          .select()
          .single();
        
        if (error) throw error;
        result = updated;
      } else if (mode === 'create' && planId) {
        // Update draft plan
        const { data: updated, error } = await supabase
          .from('strategic_plans')
          .update(saveData)
          .eq('id', planId)
          .select()
          .single();
        
        if (error) throw error;
        result = updated;
      } else if (mode === 'create' && data.name_en) {
        // Create new draft
        const { data: created, error } = await supabase
          .from('strategic_plans')
          .insert(saveData)
          .select()
          .single();
        
        if (error) throw error;
        result = created;
      }

      setLastSaved(new Date());
      setIsSaving(false);
      return { success: true, planId: result?.id };
    } catch (error) {
      console.error('Auto-save error:', error);
      setIsSaving(false);
      return { success: false, error: error.message };
    }
  }, [planId, mode, enabled]);

  // Schedule auto-save
  const scheduleAutoSave = useCallback((data, currentStep) => {
    dataRef.current = data;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Save to local immediately
    saveToLocal(data);

    // Schedule database save
    saveTimeoutRef.current = setTimeout(() => {
      if (dataRef.current) {
        saveToDatabase(dataRef.current, currentStep);
      }
    }, AUTO_SAVE_DELAY);
  }, [saveToLocal, saveToDatabase]);

  // Manual save
  const saveNow = useCallback(async (data, currentStep) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveToLocal(data);
    return await saveToDatabase(data, currentStep);
  }, [saveToLocal, saveToDatabase]);

  // Load draft from local storage
  const loadLocalDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load draft:', e);
    }
    return null;
  }, []);

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
    isSaving
  };
}

export default useAutoSaveDraft;
