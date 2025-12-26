import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';

/**
 * Hook to fetch published news articles
 */
export function usePublishedNews(limit = 20) {
  return useQuery({
    queryKey: ['news-articles', 'published', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('is_published', true)
        .order('publish_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    }
  });
}

/**
 * Hook to fetch all news articles (for admin)
 */
export function useAllNewsArticles() {
  return useQuery({
    queryKey: ['news-articles', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });
}

/**
 * Hook to fetch a single news article
 */
export function useNewsArticle(id) {
  return useQuery({
    queryKey: ['news-article', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

/**
 * Hook for news article CRUD operations
 */
export function useNewsArticleMutations() {
  const queryClient = useQueryClient();

  /**
   * @param {Object} article
   */
  const createArticle = useMutation({
    mutationFn: async (article) => {
      const { data, error } = await supabase
        .from('news_articles')
        .insert(article)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      toast.success('Article created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create article: ${error.message}`);
    }
  });

  /**
   * @param {{ id: string, updates: Object }} payload
   */
  const updateArticle = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('news_articles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      toast.success('Article updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update article: ${error.message}`);
    }
  });

  const deleteArticle = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      toast.success('Article deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete article: ${error.message}`);
    }
  });

  const publishArticle = useMutation({
    mutationFn: async (id) => {
      const { data, error } = await supabase
        .from('news_articles')
        .update({
          is_published: true,
          publish_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      toast.success('Article published successfully');
    },
    onError: (error) => {
      toast.error(`Failed to publish article: ${error.message}`);
    }
  });

  const unpublishArticle = useMutation({
    mutationFn: async (id) => {
      const { data, error } = await supabase
        .from('news_articles')
        .update({
          is_published: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      toast.success('Article unpublished');
    },
    onError: (error) => {
      toast.error(`Failed to unpublish article: ${error.message}`);
    }
  });

  const incrementViewCount = useMutation({
    mutationFn: async (id) => {
      const { data, error } = await supabase.rpc('increment_news_view_count', { article_id: id });
      if (error) {
        // Fallback if RPC doesn't exist
        const { data: article } = await supabase
          .from('news_articles')
          .select('view_count')
          .eq('id', id)
          .single();

        if (article) {
          await supabase
            .from('news_articles')
            .update({ view_count: (article.view_count || 0) + 1 })
            .eq('id', id);
        }
      }
      return data;
    }
  });

  return {
    createArticle,
    updateArticle,
    deleteArticle,
    publishArticle,
    unpublishArticle,
    incrementViewCount
  };
}

/**
 * Hook for AI content generation
 */
export function useNewsAI() {
  const generateContent = useMutation({
    mutationFn: async ({ task, content, targetLanguage }) => {
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: {
          task,
          content,
          targetLanguage
        }
      });

      if (error) throw error;
      return data;
    },
    onError: (error) => {
      toast.error(`AI generation failed: ${error.message}`);
    }
  });

  return { generateContent };
}

/**
 * Hook to fetch featured news
 */
export function useFeaturedNews(limit = 5) {
  return useQuery({
    queryKey: ['news-articles', 'featured', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('publish_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    }
  });
}

/**
 * Hook to fetch news by category
 */
export function useNewsByCategory(category, limit = 10) {
  return useQuery({
    queryKey: ['news-articles', 'category', category, limit],
    queryFn: async () => {
      if (!category) return [];
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('is_published', true)
        .eq('category', category)
        .order('publish_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: !!category
  });
}
