import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2, Check, X, Image } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function SupabaseFileUploader({ 
  onUpload,
  bucket = 'avatars',
  accept = 'image/*',
  maxSize = 5, // MB
  trigger,
  showPreview = false,
  currentUrl = null,
  className = ''
}) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate type for images
    if (accept === 'image/*' && !file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      // Create unique file path with user ID
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      setProgress(30);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      setProgress(80);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      
      setProgress(100);
      setPreviewUrl(publicUrl);
      
      // Call callback with URL
      if (onUpload) {
        onUpload(publicUrl);
      }

      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      
      {trigger ? (
        <div onClick={handleClick}>
          {uploading ? (
            <Button size="sm" disabled className="rounded-full h-8 w-8 p-0">
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : (
            trigger
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {showPreview && previewUrl && (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => {
                  setPreviewUrl(null);
                  onUpload?.(null);
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          <Button 
            onClick={handleClick} 
            disabled={uploading}
            variant="outline"
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </>
            )}
          </Button>
          
          {uploading && (
            <Progress value={progress} className="h-1" />
          )}
        </div>
      )}
    </div>
  );
}
