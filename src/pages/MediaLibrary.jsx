import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from '@/components/LanguageContext';
import { 
  Upload, Search, Grid, List, Loader2, RefreshCw, Trash2, Download,
  Image, Video, FileText, File, SlidersHorizontal
} from 'lucide-react';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import MediaFilters from '@/components/media/MediaFilters';
import MediaGrid from '@/components/media/MediaGrid';
import MediaDetails from '@/components/media/MediaDetails';
import MediaUploadDialog from '@/components/media/MediaUploadDialog';
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MediaLibrary() {
  const { language, isRTL, t } = useLanguage();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const {
    media,
    stats,
    isLoading,
    selectedBuckets,
    setSelectedBuckets,
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    upload,
    isUploading,
    delete: deleteFile,
    updateMetadata,
    isUpdating,
    trackDownload,
    refetch,
    formatFileSize,
  } = useMediaLibrary();

  const handleView = (file) => {
    setSelectedFile(file);
  };

  const handleDownload = (file) => {
    if (file.public_url) {
      trackDownload(file.id);
      window.open(file.public_url, '_blank');
    }
  };

  const handleDelete = (file) => {
    setDeleteConfirm(file);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteFile({
        id: deleteConfirm.id,
        bucketId: deleteConfirm.bucket_id,
        storagePath: deleteConfirm.storage_path,
        source: deleteConfirm.source,
      });
      setDeleteConfirm(null);
      setSelectedFile(null);
    }
  };

  const fileTypes = [
    { value: 'all', label: { en: 'All', ar: 'الكل' }, icon: File },
    { value: 'image', label: { en: 'Images', ar: 'صور' }, icon: Image },
    { value: 'video', label: { en: 'Videos', ar: 'فيديو' }, icon: Video },
    { value: 'document', label: { en: 'Docs', ar: 'مستندات' }, icon: FileText },
  ];

  return (
    <div className="h-full flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t({ en: 'Content Management Hub', ar: 'مركز إدارة المحتوى' })}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t({ en: 'Centralized media and file management', ar: 'إدارة مركزية للوسائط والملفات' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            {t({ en: 'Upload', ar: 'رفع' })}
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <Card className="mb-4">
        <CardContent className="py-3">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              {t({ en: 'Filters', ar: 'فلاتر' })}
            </Button>
            
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
              <Input
                placeholder={t({ en: 'Search files...', ar: 'ابحث عن ملفات...' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>

            <div className="flex gap-1">
              {fileTypes.map(type => (
                <Button
                  key={type.value}
                  variant={selectedType === type.value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedType(type.value)}
                >
                  <type.icon className="h-4 w-4 mr-1" />
                  {type.label[language]}
                </Button>
              ))}
            </div>

            <div className="flex gap-1 ml-auto">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-64 flex-shrink-0">
            <MediaFilters
              selectedBuckets={selectedBuckets}
              onBucketsChange={setSelectedBuckets}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              stats={stats}
            />
          </div>
        )}

        {/* File Grid */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : media.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {t({ en: 'No files found. Upload your first file!', ar: 'لم يتم العثور على ملفات.' })}
                </p>
              </CardContent>
            </Card>
          ) : (
            <MediaGrid
              files={media}
              onView={handleView}
              onDelete={handleDelete}
              onDownload={handleDownload}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          )}
        </div>

        {/* Details Panel */}
        <Sheet open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
          <SheetContent side={isRTL ? 'left' : 'right'} className="w-[400px] p-0">
            <MediaDetails
              file={selectedFile}
              onClose={() => setSelectedFile(null)}
              onDelete={handleDelete}
              onDownload={handleDownload}
              onUpdate={updateMetadata}
              isUpdating={isUpdating}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Upload Dialog */}
      <MediaUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUpload={upload}
        isUploading={isUploading}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t({ en: 'Delete File?', ar: 'حذف الملف؟' })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t({ 
                en: `Are you sure you want to delete "${deleteConfirm?.original_filename}"? This action cannot be undone.`,
                ar: `هل أنت متأكد من حذف "${deleteConfirm?.original_filename}"؟`
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t({ en: 'Cancel', ar: 'إلغاء' })}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              <Trash2 className="h-4 w-4 mr-2" />
              {t({ en: 'Delete', ar: 'حذف' })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
