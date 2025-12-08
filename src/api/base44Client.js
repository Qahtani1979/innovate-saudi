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

// Create a client object that mimics base44 SDK structure
export const base44 = {
  entities,
  auth,
  integrations,
};

export default base44;
