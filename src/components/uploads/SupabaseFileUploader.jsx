import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2, X } from 'lucide-react';
import { useSupabaseFileUpload } from '@/hooks/useSupabaseFileUpload';

/**
 * SupabaseFileUploader
 * ✅ GOLD STANDARD COMPLIANT
 */
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
  const { upload, isUploading, progress, resetProgress } = useSupabaseFileUpload();
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const publicUrl = await upload({ file, bucket, maxSize });

      setPreviewUrl(publicUrl);

      // Call callback with URL
      if (onUpload) {
        onUpload(publicUrl);
      }
    } catch (error) {
      // Error handled by hook
    } finally {
      resetProgress();
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
          {isUploading ? (
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
                type="button"
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
            type="button"
            onClick={handleClick}
            disabled={isUploading}
            variant="outline"
            className="w-full"
          >
            {isUploading ? (
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

          {isUploading && (
            <Progress value={progress} className="h-1" />
          )}
        </div>
      )}
    </div>
  );
}
