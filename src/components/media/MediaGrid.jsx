import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Image, Video, FileText, Music, Archive, File, 
  Download, Trash2, Eye, MoreVertical, Clock, User, HardDrive
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '@/components/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const FILE_TYPE_ICONS = {
  image: Image,
  video: Video,
  audio: Music,
  pdf: FileText,
  document: FileText,
  spreadsheet: FileText,
  presentation: FileText,
  archive: Archive,
  other: File,
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

function MediaCard({ file, onView, onDelete, onDownload, isSelected, onSelect }) {
  const { language, t, isRTL } = useLanguage();
  const Icon = FILE_TYPE_ICONS[file.file_type] || File;
  
  const fileAge = file.created_at 
    ? formatDistanceToNow(new Date(file.created_at), { 
        addSuffix: true, 
        locale: language === 'ar' ? ar : enUS 
      })
    : null;

  const lastAccessed = file.last_accessed_at
    ? formatDistanceToNow(new Date(file.last_accessed_at), { 
        addSuffix: true, 
        locale: language === 'ar' ? ar : enUS 
      })
    : null;

  return (
    <Card className={`group hover:shadow-lg transition-all cursor-pointer ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-3">
        {/* Selection checkbox */}
        <div className="flex items-center justify-between mb-2">
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={onSelect}
            onClick={(e) => e.stopPropagation()}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
              <DropdownMenuItem onClick={() => onView(file)}>
                <Eye className="h-4 w-4 mr-2" />
                {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload(file)}>
                <Download className="h-4 w-4 mr-2" />
                {t({ en: 'Download', ar: 'تحميل' })}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(file)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                {t({ en: 'Delete', ar: 'حذف' })}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Preview */}
        <div 
          className="w-full aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden"
          onClick={() => onView(file)}
        >
          {file.file_type === 'image' && file.public_url ? (
            <img 
              src={file.public_url} 
              alt={file.display_name || file.original_filename}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <Icon className="h-12 w-12 text-muted-foreground" />
          )}
        </div>

        {/* File info */}
        <div className="space-y-1">
          <p className="text-sm font-medium truncate" title={file.display_name || file.original_filename}>
            {file.display_name || file.original_filename}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs px-1.5">
              {file.bucket_id}
            </Badge>
            <span className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              {formatFileSize(file.file_size)}
            </span>
          </div>

          {/* Metadata */}
          <div className="flex flex-col gap-0.5 text-xs text-muted-foreground pt-1 border-t">
            {file.uploaded_by_email && (
              <span className="flex items-center gap-1 truncate" title={file.uploaded_by_email}>
                <User className="h-3 w-3 flex-shrink-0" />
                {file.uploaded_by_email.split('@')[0]}
              </span>
            )}
            {fileAge && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 flex-shrink-0" />
                {fileAge}
              </span>
            )}
          </div>

          {/* Analytics */}
          {(file.view_count > 0 || file.download_count > 0) && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {file.view_count > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {file.view_count}
                </span>
              )}
              {file.download_count > 0 && (
                <span className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {file.download_count}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MediaGrid({ 
  files, 
  onView, 
  onDelete, 
  onDownload,
  selectedIds = [],
  onSelectionChange,
}) {
  const handleSelect = (fileId) => {
    if (selectedIds.includes(fileId)) {
      onSelectionChange(selectedIds.filter(id => id !== fileId));
    } else {
      onSelectionChange([...selectedIds, fileId]);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {files.map(file => (
        <MediaCard
          key={file.id}
          file={file}
          onView={onView}
          onDelete={onDelete}
          onDownload={onDownload}
          isSelected={selectedIds.includes(file.id)}
          onSelect={() => handleSelect(file.id)}
        />
      ))}
    </div>
  );
}
