import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

// Note: This hook can work with local state until strategy_templates table is created
// For now, we use the sector_strategies table structure or local state

export function useStrategyTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Default templates (in-memory for now)
  const defaultTemplates = [
    {
      id: 'template-1',
      name_en: 'Innovation Strategy Template',
      name_ar: 'قالب استراتيجية الابتكار',
      description_en: 'Comprehensive template for municipal innovation strategies',
      description_ar: 'قالب شامل لاستراتيجيات الابتكار البلدية',
      template_type: 'innovation',
      is_public: true,
      usage_count: 15,
      template_data: {
        objectives: [
          { title: 'Digital Transformation', weight: 30 },
          { title: 'Citizen Engagement', weight: 25 },
          { title: 'Partnership Development', weight: 25 },
          { title: 'Capacity Building', weight: 20 }
        ]
      }
    },
    {
      id: 'template-2',
      name_en: 'Digital Transformation Template',
      name_ar: 'قالب التحول الرقمي',
      description_en: 'Template focused on digital service transformation',
      description_ar: 'قالب يركز على تحول الخدمات الرقمية',
      template_type: 'digital_transformation',
      is_public: true,
      usage_count: 12,
      template_data: {
        objectives: [
          { title: 'Service Digitization', weight: 35 },
          { title: 'Data Analytics', weight: 25 },
          { title: 'Process Automation', weight: 25 },
          { title: 'User Experience', weight: 15 }
        ]
      }
    },
    {
      id: 'template-3',
      name_en: 'Sustainability Strategy Template',
      name_ar: 'قالب استراتيجية الاستدامة',
      description_en: 'Template for environmental and sustainability initiatives',
      description_ar: 'قالب للمبادرات البيئية والاستدامة',
      template_type: 'sustainability',
      is_public: true,
      usage_count: 8,
      template_data: {
        objectives: [
          { title: 'Carbon Reduction', weight: 30 },
          { title: 'Resource Efficiency', weight: 30 },
          { title: 'Green Infrastructure', weight: 25 },
          { title: 'Community Awareness', weight: 15 }
        ]
      }
    }
  ];

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For now, use default templates
      // When strategy_templates table is created, fetch from DB
      setTemplates(defaultTemplates);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = useCallback(async (template) => {
    if (!user?.email) {
      toast.error('You must be logged in');
      return null;
    }

    setIsLoading(true);
    try {
      const newTemplate = {
        ...template,
        id: `template-${Date.now()}`,
        created_by_email: user.email,
        created_at: new Date().toISOString(),
        usage_count: 0
      };

      setTemplates(prev => [...prev, newTemplate]);
      toast.success('Template created successfully');
      return newTemplate;
    } catch (err) {
      console.error('Error creating template:', err);
      toast.error('Failed to create template');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const useTemplate = useCallback(async (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      toast.error('Template not found');
      return null;
    }

    // Increment usage count
    setTemplates(prev => prev.map(t => 
      t.id === templateId 
        ? { ...t, usage_count: (t.usage_count || 0) + 1 }
        : t
    ));

    toast.success('Template applied successfully');
    return template.template_data;
  }, [templates]);

  const deleteTemplate = useCallback(async (templateId) => {
    setIsLoading(true);
    try {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast.success('Template deleted');
      return true;
    } catch (err) {
      console.error('Error deleting template:', err);
      toast.error('Failed to delete template');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTemplatesByType = useCallback((type) => {
    return templates.filter(t => t.template_type === type);
  }, [templates]);

  const getPublicTemplates = useCallback(() => {
    return templates.filter(t => t.is_public);
  }, [templates]);

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    createTemplate,
    useTemplate,
    deleteTemplate,
    getTemplatesByType,
    getPublicTemplates,
    setTemplates
  };
}
