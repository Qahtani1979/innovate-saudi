import { useState, useEffect, useCallback } from 'react';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@tanstack/react-query';
import { STRATEGY_TEMPLATE_TYPES } from '@/constants/strategyTemplateTypes';

export function useStrategyTemplates() {
  const { user } = useAuth();
  const queryClient = useAppQueryClient();

  // Fetch all public templates
  const {
    data: templates = [],
    isLoading: isLoadingTemplates,
    error: templatesError,
    refetch: refetchTemplates
  } = useQuery({
    queryKey: ['strategy-templates', 'public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('is_template', true)
        .eq('is_public', true)
        .order('usage_count', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch user's own templates
  const {
    data: myTemplates = [],
    isLoading: isLoadingMyTemplates,
    refetch: refetchMyTemplates
  } = useQuery({
    queryKey: ['strategy-templates', 'my', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];

      const { data, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('is_template', true)
        .eq('owner_email', user.email)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.email
  });

  // Fetch featured templates
  const {
    data: featuredTemplates = [],
    isLoading: isLoadingFeatured
  } = useQuery({
    queryKey: ['strategy-templates', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('is_template', true)
        .eq('is_featured', true)
        .order('usage_count', { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Create template from plan data
  const createTemplateMutation = useMutation({
    mutationFn: async ({ planData, templateMeta }) => {
      if (!user?.email) throw new Error('User not authenticated');

      const templateData = {
        ...planData,
        id: undefined, // Let DB generate new ID
        name_en: templateMeta.name_en,
        name_ar: templateMeta.name_ar || templateMeta.name_en,
        description_en: templateMeta.description_en,
        description_ar: templateMeta.description_ar,
        is_template: true,
        template_type: templateMeta.template_type,
        template_category: 'personal',
        is_public: templateMeta.is_public || false,
        is_featured: false,
        usage_count: 0,
        template_rating: null,
        template_reviews: 0,
        template_tags: templateMeta.tags || [],
        source_plan_id: planData.id || null,
        owner_email: user.email,
        status: 'template',
        approval_status: null,
        submitted_at: null,
        submitted_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Remove fields that shouldn't be copied
      delete templateData.id;

      const { data, error } = await supabase
        .from('strategic_plans')
        .insert(templateData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-templates'] });
      toast.success('Template created successfully');
    },
    onError: (error) => {
      console.error('Create template error:', error);
      toast.error('Failed to create template');
    }
  });

  // Update template
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('is_template', true)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-templates'] });
      toast.success('Template updated');
    },
    onError: (error) => {
      console.error('Update template error:', error);
      toast.error('Failed to update template');
    }
  });

  // Delete template (hard delete since is_deleted column doesn't exist)
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('strategic_plans')
        .delete()
        .eq('id', id)
        .eq('is_template', true);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-templates'] });
      toast.success('Template deleted');
    },
    onError: (error) => {
      console.error('Delete template error:', error);
      toast.error('Failed to delete template');
    }
  });

  // Toggle public visibility
  const togglePublicMutation = useMutation({
    mutationFn: async ({ id, isPublic }) => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .update({
          is_public: isPublic,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('is_template', true)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['strategy-templates'] });
      toast.success(data.is_public ? 'Template is now public' : 'Template is now private');
    }
  });

  // Increment usage count via RPC
  const incrementUsage = useCallback(async (templateId) => {
    try {
      await supabase.rpc('increment_template_usage', {
        template_id: templateId
      });
    } catch (err) {
      console.warn('Failed to increment usage:', err);
    }
  }, []);

  // Rate a template
  const rateTemplate = useCallback(async (templateId, rating) => {
    if (!user?.email) {
      toast.error('Please sign in to rate templates');
      return null;
    }

    try {
      const { data, error } = await supabase.rpc('rate_template', {
        p_template_id: templateId,
        p_rating: rating,
        p_user_email: user.email
      });

      if (error) throw error;

      if (data?.success) {
        queryClient.invalidateQueries({ queryKey: ['strategy-templates'] });
        toast.success(`Rated ${rating} stars`);
        return data;
      }
      return null;
    } catch (err) {
      console.error('Rate template error:', err);
      toast.error('Failed to rate template');
      return null;
    }
  }, [user?.email, queryClient]);

  // Apply template - returns wizard-compatible data
  const applyTemplate = useCallback(async (templateId) => {
    try {
      const { data: template, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('id', templateId)
        .eq('is_template', true)
        .single();

      if (error) throw error;
      if (!template) throw new Error('Template not found');

      // Increment usage
      await incrementUsage(templateId);

      // Transform template to wizard data format
      const wizardData = {
        // Basic info - clear for customization
        name_en: '',
        name_ar: '',
        description_en: template.description_en || '',
        description_ar: template.description_ar || '',

        // Copy template content
        vision_en: template.vision_en || '',
        vision_ar: template.vision_ar || '',
        mission_en: template.mission_en || '',
        mission_ar: template.mission_ar || '',
        core_values: template.core_values || [],
        strategic_pillars: template.strategic_pillars || template.pillars || [],

        // Analysis
        stakeholders: template.stakeholders || [],
        pestel: template.pestel || {},
        swot: template.swot || {},
        scenarios: template.scenarios || {},
        risks: template.risks || [],
        dependencies: template.dependencies || [],
        constraints: template.constraints || [],

        // Strategy
        objectives: template.objectives || [],
        national_alignments: template.national_alignments || [],
        kpis: template.kpis || [],
        action_plans: template.action_plans || [],
        resource_plan: template.resource_plan || {},

        // Implementation
        milestones: template.milestones || [],
        phases: template.phases || [],
        governance: template.governance || {},
        communication_plan: template.communication_plan || {},
        change_management: template.change_management || {},

        // Context - reset for new plan
        start_year: new Date().getFullYear(),
        end_year: new Date().getFullYear() + 5,
        target_sectors: template.target_sectors || [],
        target_regions: template.target_regions || [],
        strategic_themes: template.strategic_themes || [],
        focus_technologies: template.focus_technologies || [],
        vision_2030_programs: template.vision_2030_programs || [],
        budget_range: template.budget_range || '',

        // Meta
        _sourceTemplateId: template.id,
        _sourceTemplateName: template.name_en
      };

      return wizardData;
    } catch (err) {
      console.error('Apply template error:', err);
      toast.error('Failed to apply template');
      throw err;
    }
  }, [incrementUsage]);

  // Fetch single template
  const fetchTemplate = useCallback(async (templateId) => {
    const { data, error } = await supabase
      .from('strategic_plans')
      .select('*')
      .eq('id', templateId)
      .eq('is_template', true)
      .single();

    if (error) throw error;
    return data;
  }, []);

  // Get templates by type
  const getTemplatesByType = useCallback((type) => {
    return templates.filter(t => t.template_type === type);
  }, [templates]);

  // Search templates by tags
  const searchByTags = useCallback((tags) => {
    if (!tags || tags.length === 0) return templates;
    return templates.filter(t =>
      t.template_tags?.some(tag =>
        tags.some(searchTag => tag.toLowerCase().includes(searchTag.toLowerCase()))
      )
    );
  }, [templates]);

  // Clone a template
  const cloneTemplate = useCallback(async (templateId) => {
    if (!user?.email) {
      toast.error('Please sign in to clone templates');
      return null;
    }

    try {
      const template = await fetchTemplate(templateId);
      if (!template) throw new Error('Template not found');

      const clonedData = {
        ...template,
        id: undefined,
        name_en: `${template.name_en} (Copy)`,
        name_ar: template.name_ar ? `${template.name_ar} (نسخة)` : null,
        is_public: false,
        is_featured: false,
        usage_count: 0,
        template_rating: null,
        template_reviews: 0,
        template_category: 'personal',
        source_plan_id: template.id,
        owner_email: user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      delete clonedData.id;

      const { data, error } = await supabase
        .from('strategic_plans')
        .insert(clonedData)
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['strategy-templates'] });
      toast.success('Template cloned successfully');
      return data;
    } catch (err) {
      console.error('Clone template error:', err);
      toast.error('Failed to clone template');
      return null;
    }
  }, [user?.email, fetchTemplate, queryClient]);

  // Get templates by category
  const getTemplatesByCategory = useCallback((category) => {
    return templates.filter(t => t.template_category === category);
  }, [templates]);

  return {
    // Data
    templates,
    myTemplates,
    featuredTemplates,
    templateTypes: STRATEGY_TEMPLATE_TYPES,

    // Loading states
    isLoading: isLoadingTemplates || isLoadingMyTemplates,
    isLoadingFeatured,
    error: templatesError,

    // Refetch
    refetchTemplates,
    refetchMyTemplates,

    // Mutations
    createTemplate: createTemplateMutation.mutateAsync,
    updateTemplate: updateTemplateMutation.mutateAsync,
    deleteTemplate: deleteTemplateMutation.mutateAsync,
    togglePublic: togglePublicMutation.mutateAsync,
    isCreating: createTemplateMutation.isPending,
    isUpdating: updateTemplateMutation.isPending,
    isDeleting: deleteTemplateMutation.isPending,

    // Actions
    applyTemplate,
    fetchTemplate,
    incrementUsage,
    getTemplatesByType,
    getTemplatesByCategory,
    rateTemplate,
    searchByTags,
    cloneTemplate,

    // Legacy compatibility
    saveTemplate: (template) => createTemplateMutation.mutateAsync({
      planData: template,
      templateMeta: template
    })
  };
}

