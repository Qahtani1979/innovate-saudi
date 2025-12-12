import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, FileText, Image, Video, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { STORAGE_BUCKETS } from '@/hooks/useMediaLibrary';

const CATEGORIES = [
  { value: 'primary', label: { en: 'Primary/Hero', ar: 'رئيسي' } },
  { value: 'gallery', label: { en: 'Gallery', ar: 'معرض' } },
  { value: 'document', label: { en: 'Document', ar: 'مستند' } },
  { value: 'attachment', label: { en: 'Attachment', ar: 'مرفق' } },
];

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (file) => {
  const type = file.type;
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Video;
  return FileText;
};

export default function MediaUploadDialog({ 
  open, 
  onOpenChange, 
  onUpload,
  isUploading,
  defaultBucket = 'uploads',
  entityType,
  entityId,
}) {
  const { language, t, isRTL } = useLanguage();
  const [files, setFiles] = useState([]);
  const [bucket, setBucket] = useState(defaultBucket);
  const [category, setCategory] = useState('attachment');
  const [metadata, setMetadata] = useState({
    displayName: '',
    description: '',
    altText: '',
    tags: [],
  });
  const [newTag, setNewTag] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !metadata.tags.includes(newTag.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleUpload = async () => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(prev => ({ ...prev, [i]: { status: 'uploading', progress: 0 } }));
      
      try {
        await onUpload({
          file,
          bucket,
          entityType,
          entityId,
          category,
          metadata: {
            displayName: files.length === 1 ? metadata.displayName : file.name,
            description: metadata.description,
            altText: metadata.altText,
            tags: metadata.tags,
          }
        });
        setUploadProgress(prev => ({ ...prev, [i]: { status: 'success', progress: 100 } }));
      } catch (error) {
        setUploadProgress(prev => ({ ...prev, [i]: { status: 'error', progress: 0, error: error.message } }));
      }
    }

    // Reset after all uploads
    setTimeout(() => {
      setFiles([]);
      setUploadProgress({});
      setMetadata({ displayName: '', description: '', altText: '', tags: [] });
      onOpenChange(false);
    }, 1500);
  };

  const allUploaded = files.length > 0 && 
    Object.values(uploadProgress).length === files.length &&
    Object.values(uploadProgress).every(p => p.status === 'success');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t({ en: 'Upload Files', ar: 'رفع ملفات' })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              {t({ en: 'Drag & drop files here', ar: 'اسحب وأفلت الملفات هنا' })}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {t({ en: 'or', ar: 'أو' })}
            </p>
            <label>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button variant="outline" asChild>
                <span className="cursor-pointer">
                  {t({ en: 'Browse Files', ar: 'تصفح الملفات' })}
                </span>
              </Button>
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>{t({ en: 'Selected Files', ar: 'الملفات المحددة' })} ({files.length})</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => {
                  const Icon = getFileIcon(file);
                  const progress = uploadProgress[index];
                  
                  return (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-2 bg-muted rounded-lg"
                    >
                      <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        {progress?.status === 'uploading' && (
                          <Progress value={progress.progress} className="h-1 mt-1" />
                        )}
                      </div>
                      {!progress && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      {progress?.status === 'uploading' && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                      {progress?.status === 'success' && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      {progress?.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upload Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Storage Bucket', ar: 'حاوية التخزين' })}</Label>
              <Select value={bucket} onValueChange={setBucket}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STORAGE_BUCKETS).map(([id, config]) => (
                    <SelectItem key={id} value={id}>
                      {config.label[language]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Category', ar: 'الفئة' })}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label[language]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Metadata */}
          {files.length === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Display Name', ar: 'اسم العرض' })}</Label>
                <Input
                  value={metadata.displayName}
                  onChange={(e) => setMetadata(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder={files[0]?.name}
                />
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Description', ar: 'الوصف' })}</Label>
                <Textarea
                  value={metadata.description}
                  onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t({ en: 'Optional description...', ar: 'وصف اختياري...' })}
                  rows={2}
                />
              </div>

              {files[0]?.type.startsWith('image/') && (
                <div className="space-y-2">
                  <Label>{t({ en: 'Alt Text', ar: 'النص البديل' })}</Label>
                  <Input
                    value={metadata.altText}
                    onChange={(e) => setMetadata(prev => ({ ...prev, altText: e.target.value }))}
                    placeholder={t({ en: 'Describe the image...', ar: 'صف الصورة...' })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>{t({ en: 'Tags', ar: 'الوسوم' })}</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder={t({ en: 'Add tag...', ar: 'أضف وسم...' })}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    {t({ en: 'Add', ar: 'إضافة' })}
                  </Button>
                </div>
                {metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {metadata.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading || allUploaded}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Uploading...', ar: 'جاري الرفع...' })}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {t({ en: 'Upload', ar: 'رفع' })} ({files.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
