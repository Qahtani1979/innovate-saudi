import { supabase } from '@/integrations/supabase/client';

/**
 * AI Service - Unified interface for AI operations
 */

/**
 * Extracts data from a file using AI
 * @param {Object} params
 * @param {string} params.file_content - Base64 encoded file content
 * @param {string} params.file_name - Name of the file
 * @param {string} params.file_type - MIME type
 * @param {Object} params.json_schema - Schema for extraction
 */
export async function extractFileData({ file_content, file_name, file_type, json_schema }) {
    const { data, error } = await supabase.functions.invoke('extract-file-data', {
        body: {
            file_content,
            file_name,
            file_type,
            json_schema
        }
    });

    if (error) {
        throw new Error('AI extraction failed: ' + error.message);
    }

    if (data?.error) {
        throw new Error(data.error);
    }

    return data;
}

const aiService = {
    extractFileData
};

export default aiService;
