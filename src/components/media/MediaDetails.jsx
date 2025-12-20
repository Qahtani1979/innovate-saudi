import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  X, Download, Trash2, Copy, ExternalLink, Save, Clock, User, 
  Eye, HardDrive, Calendar, Tag, Link2, FileText, Image, Video
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { formatDistanceToNow, format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { toast } from 'sonner';

const FILE_TYPE_ICONS = {
  image: Image,
  video: Video,
  document: FileText,
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function MediaDetails({ 
  file, 
  onClose, 
  onDelete, 
  onDownload,
  onUpdate,
  isUpdating
}) {
  const { language, t, isRTL } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    display_name: file?.display_name || file?.original_filename || '',
    description: file?.description || '',
    alt_text: file?.alt_text || '',
    tags: file?.tags || [],
  });
  const [newTag, setNewTag] = useState('');

  if (!file) return null;

  const Icon = FILE_TYPE_ICONS[file.file_type] || FileText;
  const locale = language === 'ar' ? ar : enUS;

  const fileAge = file.created_at 
    ? formatDistanceToNow(new Date(file.created_at), { addSuffix: true, locale })
    : null;

  const lastAccessed = file.last_accessed_at
    ? formatDistanceToNow(new Date(file.last_accessed_at), { addSuffix: true, locale })
    : null;

  const createdDate = file.created_at
    ? format(new Date(file.created_at), 'PPP p', { locale })
    : null;

  const handleCopyUrl = () => {
    if (file.public_url) {
      navigator.clipboard.writeText(file.public_url);
      toast.success(t({ en: 'URL copied to clipboard', ar: 'تم نسخ الرابط' }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editedData.tags.includes(newTag.trim())) {
      setEditedData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setEditedData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = () => {
    onUpdate?.({
      id: file.id,
      updates: editedData
    });
    setIsEditing(false);
  };

  return (
    <div className="h-full flex flex-col bg-background border-l">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold truncate max-w-[200px]" title={file.display_name || file.original_filename}>
          {file.display_name || file.original_filename}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Preview */}
          <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            {file.file_type === 'image' && file.public_url ? (
              <img 
                src={file.public_url} 
                alt={file.display_name || file.original_filename}
                className="max-w-full max-h-full object-contain"
              />
            ) : file.file_type === 'video' && file.public_url ? (
              <video 
                src={file.public_url} 
                controls 
                className="max-w-full max-h-full"
              />
            ) : (
              <Icon className="h-16 w-16 text-muted-foreground" />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onDownload(file)}
            >
              <Download className="h-4 w-4 mr-1" />
              {t({ en: 'Download', ar: 'تحميل' })}
            </Button>
            {file.public_url && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCopyUrl}
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
            {file.public_url && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(file.public_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(file)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          <Tabs defaultValue="details">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">
                {t({ en: 'Details', ar: 'التفاصيل' })}
              </TabsTrigger>
              <TabsTrigger value="metadata" className="flex-1">
                {t({ en: 'Metadata', ar: 'البيانات الوصفية' })}
              </TabsTrigger>
              {file.source === 'database' && (
                <TabsTrigger value="usage" className="flex-1">
                  {t({ en: 'Usage', ar: 'الاستخدام' })}
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              {/* File Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t({ en: 'Original Name', ar: 'الاسم الأصلي' })}</span>
                  <span className="font-medium truncate max-w-[150px]" title={file.original_filename}>
                    {file.original_filename}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t({ en: 'Type', ar: 'النوع' })}</span>
                  <span className="font-medium">{file.mime_type || file.file_type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    {t({ en: 'Size', ar: 'الحجم' })}
                  </span>
                  <span className="font-medium">{formatFileSize(file.file_size)}</span>
                </div>
                {file.width && file.height && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t({ en: 'Dimensions', ar: 'الأبعاد' })}</span>
                    <span className="font-medium">{file.width} × {file.height}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t({ en: 'Bucket', ar: 'الحاوية' })}</span>
                  <Badge variant="outline">{file.bucket_id}</Badge>
                </div>
              </div>

              <Separator />

              {/* Upload Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t({ en: 'Upload Info', ar: 'معلومات الرفع' })}
                </h4>
                {file.uploaded_by_email && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t({ en: 'Uploaded by', ar: 'رفع بواسطة' })}</span>
                    <span className="font-medium truncate max-w-[150px]" title={file.uploaded_by_email}>
                      {file.uploaded_by_email}
                    </span>
                  </div>
                )}
                {createdDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {t({ en: 'Upload date', ar: 'تاريخ الرفع' })}
                    </span>
                    <span className="font-medium text-xs">{createdDate}</span>
                  </div>
                )}
                {fileAge && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {t({ en: 'Age', ar: 'العمر' })}
                    </span>
                    <span className="font-medium">{fileAge}</span>
                  </div>
                )}
                {file.upload_source && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t({ en: 'Source', ar: 'المصدر' })}</span>
                    <Badge variant="secondary">{file.upload_source}</Badge>
                  </div>
                )}
              </div>

              <Separator />

              {/* Analytics */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {t({ en: 'Analytics', ar: 'الإحصائيات' })}
                </h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t({ en: 'Views', ar: 'المشاهدات' })}</span>
                  <span className="font-medium">{file.view_count || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t({ en: 'Downloads', ar: 'التحميلات' })}</span>
                  <span className="font-medium">{file.download_count || 0}</span>
                </div>
                {lastAccessed && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t({ en: 'Last accessed', ar: 'آخر وصول' })}</span>
                    <span className="font-medium">{lastAccessed}</span>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="metadata" className="space-y-4 mt-4">
              {file.source !== 'database' ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {t({ 
                      en: 'This file is not tracked in the media registry. Upload via the hub to enable metadata.',
                      ar: 'هذا الملف غير مسجل. ارفع عبر المركز لتفعيل البيانات الوصفية.'
                    })}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-end">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                          {t({ en: 'Cancel', ar: 'إلغاء' })}
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                          <Save className="h-4 w-4 mr-1" />
                          {t({ en: 'Save', ar: 'حفظ' })}
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        {t({ en: 'Edit', ar: 'تعديل' })}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t({ en: 'Display Name', ar: 'اسم العرض' })}</Label>
                      {isEditing ? (
                        <Input 
                          value={editedData.display_name}
                          onChange={(e) => setEditedData(prev => ({ ...prev, display_name: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm">{file.display_name || '-'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>{t({ en: 'Description', ar: 'الوصف' })}</Label>
                      {isEditing ? (
                        <Textarea 
                          value={editedData.description}
                          onChange={(e) => setEditedData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{file.description || t({ en: 'No description', ar: 'لا يوجد وصف' })}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>{t({ en: 'Alt Text', ar: 'النص البديل' })}</Label>
                      {isEditing ? (
                        <Input 
                          value={editedData.alt_text}
                          onChange={(e) => setEditedData(prev => ({ ...prev, alt_text: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{file.alt_text || t({ en: 'No alt text', ar: 'لا يوجد نص بديل' })}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {t({ en: 'Tags', ar: 'الوسوم' })}
                      </Label>
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input 
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              placeholder={t({ en: 'Add tag...', ar: 'أضف وسم...' })}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                            />
                            <Button type="button" variant="outline" onClick={handleAddTag}>
                              {t({ en: 'Add', ar: 'إضافة' })}
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {editedData.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="gap-1">
                                {tag}
                                <X 
                                  className="h-3 w-3 cursor-pointer" 
                                  onClick={() => handleRemoveTag(tag)}
                                />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {file.tags?.length > 0 ? (
                            file.tags.map(tag => (
                              <Badge key={tag} variant="secondary">{tag}</Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">{t({ en: 'No tags', ar: 'لا توجد وسوم' })}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="usage" className="space-y-4 mt-4">
              {file.entity_type && file.entity_id ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    {t({ en: 'Entity Association', ar: 'ارتباط الكيان' })}
                  </h4>
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t({ en: 'Entity Type', ar: 'نوع الكيان' })}</span>
                      <Badge>{file.entity_type}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t({ en: 'Field', ar: 'الحقل' })}</span>
                      <span className="font-medium">{file.entity_field || file.category || '-'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {t({ 
                      en: 'This file is not linked to any entity.',
                      ar: 'هذا الملف غير مرتبط بأي كيان.'
                    })}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
