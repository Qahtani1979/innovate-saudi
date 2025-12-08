/**
 * Supabase-based client that mimics the Base44 SDK interface
 * This allows gradual migration from Base44 to Supabase
 */

import { entities } from './supabaseEntities';
import { auth } from './supabaseAuth';
import { supabase } from '@/integrations/supabase/client';

// Integration functions that call Supabase edge functions
const integrations = {
  Core: {
    InvokeLLM: async ({ prompt, response_json_schema, system_prompt }) => {
      const { data, error } = await supabase.functions.invoke('invoke-llm', {
        body: { prompt, response_json_schema, system_prompt }
      });
      
      if (error) {
        console.error('InvokeLLM error:', error);
        throw error;
      }
      
      return data;
    },
    
    SendEmail: async ({ to, subject, body, html }) => {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, body, html }
      });
      
      if (error) {
        console.error('SendEmail error:', error);
        // Don't throw - return success:false so app continues working
        return { success: false, error: error.message };
      }
      
      return data;
    },
    
    SendSMS: async ({ to, message }) => {
      console.warn('SendSMS is not yet implemented - would send to:', to);
      return { success: true, message: 'SMS sending not implemented' };
    },
    
    UploadFile: async ({ file }) => {
      try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `public/${fileName}`;
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error('UploadFile error:', error);
          throw error;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('uploads')
          .getPublicUrl(filePath);
        
        return { 
          file_url: urlData.publicUrl,
          url: urlData.publicUrl,
          path: filePath
        };
      } catch (err) {
        console.error('UploadFile error:', err);
        throw err;
      }
    },
    
    GenerateImage: async ({ prompt }) => {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt }
      });
      
      if (error) {
        console.error('GenerateImage error:', error);
        return { url: null, error: error.message };
      }
      
      return data;
    },
    
    ExtractDataFromUploadedFile: async ({ file_url, json_schema }) => {
      const { data, error } = await supabase.functions.invoke('extract-file-data', {
        body: { file_url, json_schema }
      });
      
      if (error) {
        console.error('ExtractDataFromUploadedFile error:', error);
        throw error;
      }
      
      return data;
    }
  }
};

// Agents API for conversational AI
const agents = {
  createConversation: async ({ agent_name, metadata = {} }) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to create a conversation');
    }
    
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        user_email: user.email,
        agent_name,
        metadata
      })
      .select()
      .single();
    
    if (error) {
      console.error('createConversation error:', error);
      throw error;
    }
    
    return { id: data.id, messages: [] };
  },
  
  listConversations: async ({ agent_name }) => {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('agent_name', agent_name)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('listConversations error:', error);
      throw error;
    }
    
    return data || [];
  },
  
  subscribeToConversation: (conversationId, callback) => {
    // Initial fetch
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('ai_messages')
        .select('role, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      callback({ messages: data || [] });
    };
    
    fetchMessages();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();
    
    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  },
  
  addMessage: async (conversation, { role, content }) => {
    const { data, error } = await supabase.functions.invoke('chat-agent', {
      body: {
        conversationId: conversation.id,
        message: content,
        agentName: 'strategicAdvisor'
      }
    });
    
    if (error) {
      console.error('addMessage error:', error);
      throw error;
    }
    
    return data;
  }
};

// Function name mapping from camelCase to kebab-case
const functionNameMap = {
  'generateEmbeddings': 'generate-embeddings',
  'semanticSearch': 'semantic-search',
  'translatePolicy': 'translate-policy',
  'checkConsensus': 'check-consensus',
  'citizenNotifications': 'citizen-notifications',
  'approveDelegation': 'approve-delegation',
  'validatePermission': 'validate-permission',
  'checkFieldSecurity': 'check-field-security',
  'budgetApproval': 'budget-approval',
  'initiativeLaunch': 'initiative-launch',
  'autoNotificationTriggers': 'auto-notification-triggers',
  'searchImages': 'search-images',
  'autoMatchmakerEnrollment': 'auto-matchmaker-enrollment',
  'enrollMunicipalityTraining': 'enroll-municipality-training',
  'invokeLlm': 'invoke-llm',
  'sendEmail': 'send-email',
  'generateImage': 'generate-image',
  'extractFileData': 'extract-file-data',
  'chatAgent': 'chat-agent',
  'evaluationNotifications': 'evaluation-notifications',
  'pointsAutomation': 'points-automation',
  'slaAutomation': 'sla-automation',
  'calculateOrganizationReputation': 'calculate-organization-reputation',
  'calculateStartupReputation': 'calculate-startup-reputation',
  'autoExpertAssignment': 'auto-expert-assignment',
  'challengeRDBacklink': 'challenge-rd-backlink',
  'autoGenerateSuccessStory': 'auto-generate-success-story',
  'autoProgramStartupLink': 'auto-program-startup-link',
  'autoRoleAssignment': 'auto-role-assignment',
  'miiCitizenIntegration': 'mii-citizen-integration',
  'portfolioReview': 'portfolio-review',
  'programSLAAutomation': 'program-sla-automation',
  'providerMatchNotifications': 'provider-match-notifications',
  'publicationsAutoTracker': 'publications-auto-tracker',
  'runRBACSecurityAudit': 'run-rbac-security-audit',
  'strategicPlanApproval': 'strategic-plan-approval',
  'strategicPriorityScoring': 'strategic-priority-scoring',
  'strategyLabResearchGenerator': 'strategy-lab-research-generator',
  'strategyProgramThemeGenerator': 'strategy-program-theme-generator',
  'strategyRDCallGenerator': 'strategy-rd-call-generator',
  'strategySandboxPlanner': 'strategy-sandbox-planner',
  'strategySectorGapAnalysis': 'strategy-sector-gap-analysis',
  'weeklyIdeasReport': 'weekly-ideas-report',
  'alumniAutomation': 'alumni-automation',
};

// Functions API - calls Supabase edge functions
const functions = {
  invoke: async (functionName, params = {}) => {
    // Convert camelCase to kebab-case if mapping exists, otherwise use as-is
    const edgeFunctionName = functionNameMap[functionName] || functionName;
    
    console.log(`Invoking edge function: ${edgeFunctionName} (from ${functionName})`);
    
    const { data, error } = await supabase.functions.invoke(edgeFunctionName, {
      body: params
    });
    
    if (error) {
      console.error(`Function ${edgeFunctionName} error:`, error);
      throw error;
    }
    
    return { data };
  }
};

// Create a client object that mimics base44 SDK structure
export const base44 = {
  entities,
  auth,
  integrations,
  agents,
  functions,
};

export default base44;
