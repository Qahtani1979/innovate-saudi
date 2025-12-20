import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Image, Video, FileText, Music, Archive, File, 
  Download, Trash2, Eye, MoreVertical, ArrowUp, ArrowDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const SortableHeader = ({ field, label, sortBy, sortOrder, onSortChange, className = '' }) => {
  const isActive = sortBy === field;
  
  return (
    <TableHead 
      className={`cursor-pointer hover:bg-muted/50 transition-colors ${className}`}
      onClick={() => onSortChange(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive && (
          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        )}
      </div>
    </TableHead>
  );
};

export default function MediaListView({ 
  files, 
  onView, 
  onDelete, 
  onDownload,
  selectedIds = [],
  onSelectionChange,
  sortBy,
  sortOrder,
  onSortChange,
}) {
  const { language, t, isRTL } = useLanguage();

  const handleSelect = (fileId) => {
    if (selectedIds.includes(fileId)) {
      onSelectionChange(selectedIds.filter(id => id !== fileId));
    } else {
      onSelectionChange([...selectedIds, fileId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === files.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(files.map(f => f.id));
    }
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox 
                checked={files.length > 0 && selectedIds.length === files.length}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="w-10"></TableHead>
            <SortableHeader 
              field="original_filename" 
              label={t({ en: 'Name', ar: 'الاسم' })}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
            />
            <TableHead>{t({ en: 'Bucket', ar: 'الحاوية' })}</TableHead>
            <SortableHeader 
              field="file_size" 
              label={t({ en: 'Size', ar: 'الحجم' })}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
              className="text-right"
            />
            <SortableHeader 
              field="created_at" 
              label={t({ en: 'Uploaded', ar: 'تاريخ الرفع' })}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
            />
            <TableHead>{t({ en: 'Uploaded By', ar: 'رفع بواسطة' })}</TableHead>
            <SortableHeader 
              field="view_count" 
              label={t({ en: 'Views', ar: 'مشاهدات' })}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
              className="text-center"
            />
            <SortableHeader 
              field="download_count" 
              label={t({ en: 'Downloads', ar: 'تحميلات' })}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
              className="text-center"
            />
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map(file => {
            const Icon = FILE_TYPE_ICONS[file.file_type] || File;
            const isSelected = selectedIds.includes(file.id);
            const fileAge = file.created_at 
              ? formatDistanceToNow(new Date(file.created_at), { 
                  addSuffix: true, 
                  locale: language === 'ar' ? ar : enUS 
                })
              : '-';

            return (
              <TableRow 
                key={file.id} 
                className={`cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-muted/30' : ''}`}
                onClick={() => onView(file)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => handleSelect(file.id)}
                  />
                </TableCell>
                <TableCell>
                  {file.file_type === 'image' && file.public_url ? (
                    <div className="w-8 h-8 rounded overflow-hidden bg-muted">
                      <img 
                        src={file.public_url} 
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    <p className="font-medium truncate" title={file.display_name || file.original_filename}>
                      {file.display_name || file.original_filename}
                    </p>
                    {file.description && (
                      <p className="text-xs text-muted-foreground truncate">{file.description}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {file.bucket_id}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatFileSize(file.file_size)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {fileAge}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {file.uploaded_by_email ? (
                    <span className="truncate max-w-[120px] block" title={file.uploaded_by_email}>
                      {file.uploaded_by_email.split('@')[0]}
                    </span>
                  ) : '-'}
                </TableCell>
                <TableCell className="text-center text-sm text-muted-foreground">
                  {file.view_count || 0}
                </TableCell>
                <TableCell className="text-center text-sm text-muted-foreground">
                  {file.download_count || 0}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
