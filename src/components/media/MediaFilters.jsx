import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Folder, Image, FileText, Video, Music, Archive, File, 
  HardDrive, Calendar, Clock
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { STORAGE_BUCKETS } from '@/hooks/useMediaLibrary';

const FILE_TYPE_OPTIONS = [
  { value: 'all', label: { en: 'All Files', ar: 'جميع الملفات' }, icon: File },
  { value: 'image', label: { en: 'Images', ar: 'الصور' }, icon: Image },
  { value: 'video', label: { en: 'Videos', ar: 'الفيديو' }, icon: Video },
  { value: 'document', label: { en: 'Documents', ar: 'المستندات' }, icon: FileText },
  { value: 'other', label: { en: 'Other', ar: 'أخرى' }, icon: Archive },
];

export default function MediaFilters({
  selectedBuckets,
  onBucketsChange,
  selectedType,
  onTypeChange,
  stats,
}) {
  const { language, t, isRTL } = useLanguage();

  const toggleBucket = (bucketId) => {
    if (selectedBuckets.includes(bucketId)) {
      if (selectedBuckets.length > 1) {
        onBucketsChange(selectedBuckets.filter(b => b !== bucketId));
      }
    } else {
      onBucketsChange([...selectedBuckets, bucketId]);
    }
  };

  const selectAllBuckets = () => {
    onBucketsChange(Object.keys(STORAGE_BUCKETS));
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Folder className="h-4 w-4" />
          {t({ en: 'Filters', ar: 'الفلاتر' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Types */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {t({ en: 'File Type', ar: 'نوع الملف' })}
          </h4>
          <div className="space-y-1">
            {FILE_TYPE_OPTIONS.map(type => {
              const Icon = type.icon;
              const count = stats?.byType?.[type.value] || 0;
              const isSelected = selectedType === type.value;
              
              return (
                <button
                  key={type.value}
                  onClick={() => onTypeChange(type.value)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {type.label[language]}
                  </span>
                  <Badge variant={isSelected ? 'secondary' : 'outline'} className="text-xs">
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Storage Buckets */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t({ en: 'Storage Buckets', ar: 'حاويات التخزين' })}
            </h4>
            <button 
              onClick={selectAllBuckets}
              className="text-xs text-primary hover:underline"
            >
              {t({ en: 'Select All', ar: 'تحديد الكل' })}
            </button>
          </div>
          <ScrollArea className="h-48">
            <div className="space-y-2 pr-2">
              {Object.entries(STORAGE_BUCKETS).map(([bucketId, config]) => {
                const count = stats?.byBucket?.[bucketId] || 0;
                const isSelected = selectedBuckets.includes(bucketId);
                
                return (
                  <div 
                    key={bucketId} 
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Checkbox
                        id={`bucket-${bucketId}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleBucket(bucketId)}
                      />
                      <Label 
                        htmlFor={`bucket-${bucketId}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {config.label[language]}
                      </Label>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Storage Stats */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {t({ en: 'Storage', ar: 'التخزين' })}
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <File className="h-4 w-4" />
                {t({ en: 'Total Files', ar: 'إجمالي الملفات' })}
              </span>
              <span className="font-medium">{stats?.totalFiles || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <HardDrive className="h-4 w-4" />
                {t({ en: 'Total Size', ar: 'الحجم الإجمالي' })}
              </span>
              <span className="font-medium">{stats?.totalSizeFormatted || '0 B'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
