import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/components/LanguageContext';
import { Image, Video, FileText, Upload, Library, X, ExternalLink } from 'lucide-react';
import MediaLibraryPicker from './MediaLibraryPicker';
import FileUploader from '@/components/FileUploader';

const TYPE_ICONS = {
  image: Image,
  video: Video,
  document: FileText,
};

/**
 * Media field component with library picker and upload support.
 * Provides a unified interface for selecting or uploading media.
 */
export default function MediaFieldWithPicker({
  label,
  value,
  onChange,
  onMediaSelect,
  fieldName,
  entityType,
  entityId,
  mediaType = 'image',
  allowedTypes,
  bucket,
  placeholder,
  showUrlInput = true,
  disabled = false,
}) {
  const { t, isRTL } = useLanguage();
  const [showPicker, setShowPicker] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  const Icon = TYPE_ICONS[mediaType] || Image;

  const handlePickerSelect = async (result) => {
    let url = null;
    
    if (result.type === 'library' && result.file) {
      url = result.file.public_url;
      if (onMediaSelect) {
        await onMediaSelect(result, fieldName);
      }
    } else if (result.type === 'upload' && result.url) {
      url = result.url;
      if (onMediaSelect) {
        await onMediaSelect(result, fieldName);
      }
    }

    if (url) {
      onChange(url);
    }
    setShowPicker(false);
  };

  const handleUploadComplete = async (url) => {
    if (onMediaSelect) {
      await onMediaSelect({ type: 'upload', url }, fieldName);
    }
    onChange(url);
    setShowUploader(false);
  };

  const handleClear = () => {
    onChange('');
  };

  const isImageUrl = value && value.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i);

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      {/* Preview */}
      {value && (
        <div className="relative group">
          {isImageUrl ? (
            <div className="relative rounded-lg overflow-hidden border bg-muted">
              <img
                src={value}
                alt={label || 'Media preview'}
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.open(value, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleClear}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
              <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm truncate flex-1">{value}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={handleClear}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {!value && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPicker(true)}
              disabled={disabled}
              className="flex-1"
            >
              <Library className="h-4 w-4 mr-2" />
              {t({ en: 'From Library', ar: 'من المكتبة' })}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowUploader(!showUploader)}
              disabled={disabled}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {t({ en: 'Upload', ar: 'رفع' })}
            </Button>
          </div>

          {showUploader && (
            <div className="border rounded-lg p-3 bg-muted/30">
              <FileUploader
                type={mediaType}
                label={t({ en: `Upload ${mediaType}`, ar: `رفع ${mediaType === 'image' ? 'صورة' : 'ملف'}` })}
                maxSize={50}
                bucket={bucket || entityType || 'uploads'}
                onUploadComplete={handleUploadComplete}
              />
            </div>
          )}

          {showUrlInput && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{t({ en: 'or', ar: 'أو' })}</span>
              <Input
                placeholder={placeholder || t({ en: 'Paste URL...', ar: 'الصق الرابط...' })}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="flex-1"
              />
            </div>
          )}
        </div>
      )}

      {/* Change button when value exists */}
      {value && !disabled && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPicker(true)}
          >
            <Library className="h-4 w-4 mr-2" />
            {t({ en: 'Change', ar: 'تغيير' })}
          </Button>
        </div>
      )}

      {/* Media Library Picker Dialog */}
      <MediaLibraryPicker
        open={showPicker}
        onOpenChange={setShowPicker}
        onSelect={handlePickerSelect}
        allowedTypes={allowedTypes || [mediaType]}
        bucketId={bucket || entityType}
        entityType={entityType}
        title={label}
      />
    </div>
  );
}
