import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from '@/components/LanguageContext';
import { 
  PageLayout, PageHeader, SearchFilter, usePersonaColors, PersonaButton
} from '@/components/layout/PersonaPageLayout';
import { 
  Upload, Search, Grid, List, Loader2, RefreshCw, Trash2, Download,
  Image, Video, FileText, File, SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown,
  Calendar, HardDrive, Eye, FolderOpen, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import MediaFilters from '@/components/media/MediaFilters';
import MediaGrid from '@/components/media/MediaGrid';
import MediaListView from '@/components/media/MediaListView';
import MediaDetails from '@/components/media/MediaDetails';
import MediaUploadDialog from '@/components/media/MediaUploadDialog';
import MediaAIHelper from '@/components/media/MediaAIHelper';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const fileTypes = [
  { value: 'all', label: { en: 'All', ar: 'الكل' }, icon: File },
  { value: 'image', label: { en: 'Images', ar: 'صور' }, icon: Image },
  { value: 'video', label: { en: 'Videos', ar: 'فيديو' }, icon: Video },
  { value: 'document', label: { en: 'Docs', ar: 'مستندات' }, icon: FileText },
];

const sortOptions = [
  { value: 'created_at', label: { en: 'Date Uploaded', ar: 'تاريخ الرفع' }, icon: Calendar },
  { value: 'original_filename', label: { en: 'Name', ar: 'الاسم' }, icon: FileText },
  { value: 'file_size', label: { en: 'Size', ar: 'الحجم' }, icon: HardDrive },
  { value: 'view_count', label: { en: 'Views', ar: 'المشاهدات' }, icon: Eye },
  { value: 'download_count', label: { en: 'Downloads', ar: 'التحميلات' }, icon: Download },
];

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
    totalMedia,
    stats,
    isLoading,
    selectedBuckets,
    setSelectedBuckets,
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    page,
    setPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    upload,
    isUploading,
    delete: deleteFile,
    updateMetadata,
    isUpdating,
    trackDownload,
    refetch,
    formatFileSize,
  } = useMediaLibrary();

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || sortOptions[0].label;

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

  const totalSize = media.reduce((acc, f) => acc + (f.file_size || 0), 0);
  const formatTotalSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const headerStats = [
    { icon: File, value: media.length, label: t({ en: 'Files', ar: 'ملفات' }) },
    { icon: HardDrive, value: formatTotalSize(totalSize), label: t({ en: 'Total Size', ar: 'الحجم الكلي' }) },
    { icon: Eye, value: media.reduce((acc, f) => acc + (f.view_count || 0), 0), label: t({ en: 'Views', ar: 'مشاهدات' }) },
  ];

  return (
    <PageLayout>
      <PageHeader
        icon={FolderOpen}
        title={t({ en: 'Content Management Hub', ar: 'مركز إدارة المحتوى' })}
        description={t({ en: 'Centralized media and file management', ar: 'إدارة مركزية للوسائط والملفات' })}
        stats={headerStats}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={refetch}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <PersonaButton onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              {t({ en: 'Upload', ar: 'رفع' })}
            </PersonaButton>
          </div>
        }
      />

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

            {/* Sort Controls */}
            <div className="flex items-center gap-2 ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ArrowUpDown className="h-3 w-3" />
                    {currentSortLabel[language]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                  {sortOptions.map(option => (
                    <DropdownMenuItem 
                      key={option.value} 
                      onClick={() => setSortBy(option.value)}
                      className={sortBy === option.value ? 'bg-accent' : ''}
                    >
                      <option.icon className="h-4 w-4 mr-2" />
                      {option.label[language]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSortOrder}
                title={sortOrder === 'asc' ? t({ en: 'Ascending', ar: 'تصاعدي' }) : t({ en: 'Descending', ar: 'تنازلي' })}
              >
                {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </Button>

              <div className="h-4 w-px bg-border mx-1" />

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

      {/* AI Media Helper */}
      <MediaAIHelper 
        files={media} 
        stats={stats}
        onAction={(action, recommendation) => {
          console.log('AI Action:', action, recommendation);
          // Future: implement specific actions based on AI recommendations
        }}
      />

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

        {/* File Grid/List */}
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
          ) : viewMode === 'grid' ? (
            <MediaGrid
              files={media}
              onView={handleView}
              onDelete={handleDelete}
              onDownload={handleDownload}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          ) : (
            <MediaListView
              files={media}
              onView={handleView}
              onDelete={handleDelete}
              onDownload={handleDownload}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={(field) => {
                if (sortBy === field) {
                  toggleSortOrder();
                } else {
                  setSortBy(field);
                  setSortOrder('desc');
                }
              }}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {t({ 
                  en: `Showing ${(page - 1) * 50 + 1}-${Math.min(page * 50, totalMedia)} of ${totalMedia} files`,
                  ar: `عرض ${(page - 1) * 50 + 1}-${Math.min(page * 50, totalMedia)} من ${totalMedia} ملف`
                })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t({ en: 'Previous', ar: 'السابق' })}
                </Button>
                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'ghost'}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!hasNextPage}
                >
                  {t({ en: 'Next', ar: 'التالي' })}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Details Panel */}
        <Sheet open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
          <SheetContent side={isRTL ? 'left' : 'right'} className="w-[400px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>{selectedFile?.display_name || selectedFile?.original_filename || t({ en: 'File Details', ar: 'تفاصيل الملف' })}</SheetTitle>
            </SheetHeader>
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
    </PageLayout>
  );
}
