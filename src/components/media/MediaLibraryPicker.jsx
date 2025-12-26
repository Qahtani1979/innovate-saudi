import { useState } from 'react';
import { useMediaLibrary } from '@/hooks/useMedia';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/components/LanguageContext';
import { Image, Video, FileText, Search, Upload, Check, Loader2, X } from 'lucide-react';
import FileUploader from '@/components/FileUploader';

const FILE_TYPE_FILTERS = [
  { value: 'all', label: { en: 'All', ar: 'الكل' }, icon: null },
  { value: 'image', label: { en: 'Images', ar: 'صور' }, icon: Image },
  { value: 'video', label: { en: 'Videos', ar: 'فيديو' }, icon: Video },
  { value: 'document', label: { en: 'Documents', ar: 'مستندات' }, icon: FileText },
];

export default function MediaLibraryPicker({
  open,
  onOpenChange,
  onSelect,
  allowedTypes = ['image', 'video', 'document', 'pdf', 'audio'],
  bucketId,
  entityType,
  title,
  multiple = false,
}) {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  // Fetch media files from library
  const { data: mediaFiles = [], isLoading } = useMediaLibrary({
    typeFilter,
    searchQuery,
    bucketId,
    allowedTypes
  });

  const handleFileSelect = (file) => {
    if (multiple) {
      const isSelected = selectedFiles.some(f => f.id === file.id);
      if (isSelected) {
        setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
      } else {
        setSelectedFiles([...selectedFiles, file]);
      }
    } else {
      setSelectedFiles([file]);
    }
  };

  const handleConfirm = () => {
    if (uploadedUrl) {
      // Return the uploaded URL directly (new upload)
      onSelect({ type: 'upload', url: uploadedUrl });
    } else if (selectedFiles.length > 0) {
      // Return selected files from library
      if (multiple) {
        onSelect({ type: 'library', files: selectedFiles });
      } else {
        onSelect({ type: 'library', file: selectedFiles[0] });
      }
    }
    handleClose();
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setUploadedUrl(null);
    setSearchQuery('');
    setTypeFilter('all');
    setActiveTab('library');
    onOpenChange(false);
  };

  const handleUploadComplete = (url) => {
    setUploadedUrl(url);
    setActiveTab('upload');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            {title || t({ en: 'Select Media', ar: 'اختر الوسائط' })}
          </DialogTitle>
          <DialogDescription>
            {t({ en: 'Choose from your media library or upload a new file', ar: 'اختر من مكتبة الوسائط أو ارفع ملفًا جديدًا' })}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid grid-cols-2 w-full max-w-xs">
            <TabsTrigger value="library">
              {t({ en: 'Library', ar: 'المكتبة' })}
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              {t({ en: 'Upload', ar: 'رفع' })}
            </TabsTrigger>
          </TabsList>

          {/* Library Tab */}
          <TabsContent value="library" className="mt-4">
            {/* Search and Filters */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t({ en: 'Search files...', ar: 'بحث...' })}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-1">
                {FILE_TYPE_FILTERS.map(filter => (
                  <Button
                    key={filter.value}
                    variant={typeFilter === filter.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTypeFilter(filter.value)}
                  >
                    {filter.icon && <filter.icon className="h-4 w-4 mr-1" />}
                    {t(filter.label)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Media Grid */}
            <ScrollArea className="h-[350px] border rounded-lg p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : mediaFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Image className="h-12 w-12 mb-2" />
                  <p>{t({ en: 'No files found', ar: 'لا توجد ملفات' })}</p>
                  <Button
                    variant="link"
                    onClick={() => setActiveTab('upload')}
                    className="mt-2"
                  >
                    {t({ en: 'Upload a new file', ar: 'ارفع ملفًا جديدًا' })}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {mediaFiles.map(file => {
                    const isSelected = selectedFiles.some(f => f.id === file.id);
                    return (
                      <div
                        key={file.id}
                        onClick={() => handleFileSelect(file)}
                        className={`
                          relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all
                          ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}
                        `}
                      >
                        {/* Thumbnail */}
                        <div className="aspect-square bg-muted flex items-center justify-center">
                          {file.file_type === 'image' && file.public_url ? (
                            <img
                              src={file.public_url}
                              alt={file.display_name || file.original_filename}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : file.file_type === 'video' ? (
                            <Video className="h-8 w-8 text-muted-foreground" />
                          ) : (
                            <FileText className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>

                        {/* Selection indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="h-3 w-3" />
                          </div>
                        )}

                        {/* File info */}
                        <div className="p-2 bg-background">
                          <p className="text-xs font-medium truncate">
                            {file.display_name || file.original_filename}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.file_size)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="mt-4">
            <div className="border rounded-lg p-6">
              {uploadedUrl ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        {t({ en: 'File uploaded successfully!', ar: 'تم رفع الملف بنجاح!' })}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedUrl(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {uploadedUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                    <div className="flex justify-center">
                      <img
                        src={uploadedUrl}
                        alt="Uploaded preview"
                        className="max-h-48 rounded-lg shadow"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <FileUploader
                  type={allowedTypes.includes('image') ? 'image' : 'document'}
                  label={t({ en: 'Upload new file', ar: 'رفع ملف جديد' })}
                  maxSize={50}
                  bucket={bucketId || (entityType === 'programs' ? 'programs' : entityType === 'events' ? 'events' : 'uploads')}
                  onUploadComplete={handleUploadComplete}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {selectedFiles.length > 0 && (
                <Badge variant="secondary">
                  {selectedFiles.length} {t({ en: 'selected', ar: 'محدد' })}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={selectedFiles.length === 0 && !uploadedUrl}
              >
                {t({ en: 'Select', ar: 'اختيار' })}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
