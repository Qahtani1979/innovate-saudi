import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Image, Video, FileText, Upload, Search, Trash2, Download, Grid, List, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MediaLibrary() {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedType, setSelectedType] = useState('all');
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch files from Supabase storage
  const { data: media = [], isLoading } = useQuery({
    queryKey: ['media-library'],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from('uploads')
        .list('public', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });
      
      if (error) {
        console.error('Error fetching media:', error);
        return [];
      }
      
      // Get public URLs and metadata for each file
      const filesWithUrls = await Promise.all(
        (data || []).map(async (file) => {
          const { data: urlData } = supabase.storage
            .from('uploads')
            .getPublicUrl(`public/${file.name}`);
          
          const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
          let type = 'document';
          if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt)) type = 'image';
          if (['mp4', 'webm', 'mov', 'avi'].includes(fileExt)) type = 'video';
          
          return {
            id: file.id,
            name: file.name,
            type,
            size: formatFileSize(file.metadata?.size || 0),
            url: urlData.publicUrl,
            uploaded_date: file.created_at ? new Date(file.created_at).toLocaleDateString() : 'Unknown',
            used_in: [] // Would need separate tracking table
          };
        })
      );
      
      return filesWithUrls;
    }
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `public/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['media-library']);
      toast.success(t({ en: 'File uploaded successfully', ar: 'تم رفع الملف بنجاح' }));
    },
    onError: (error) => {
      toast.error(t({ en: 'Upload failed', ar: 'فشل الرفع' }));
      console.error('Upload error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileName) => {
      const { error } = await supabase.storage
        .from('uploads')
        .remove([`public/${fileName}`]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['media-library']);
      toast.success(t({ en: 'File deleted', ar: 'تم حذف الملف' }));
    },
    onError: (error) => {
      toast.error(t({ en: 'Delete failed', ar: 'فشل الحذف' }));
      console.error('Delete error:', error);
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    await uploadMutation.mutateAsync(file);
    setUploading(false);
    e.target.value = '';
  };

  const fileTypes = [
    { value: 'all', label: { en: 'All Files', ar: 'جميع الملفات' }, icon: FileText },
    { value: 'image', label: { en: 'Images', ar: 'الصور' }, icon: Image },
    { value: 'video', label: { en: 'Videos', ar: 'الفيديو' }, icon: Video },
    { value: 'document', label: { en: 'Documents', ar: 'المستندات' }, icon: FileText }
  ];

  const filteredMedia = media.filter(file =>
    (selectedType === 'all' || file.type === selectedType) &&
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSize = media.reduce((sum, file) => {
    const size = parseFloat(file.size) || 0;
    return sum + size;
  }, 0);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent">
            {t({ en: 'Media Library', ar: 'مكتبة الوسائط' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Centralized file and media management', ar: 'إدارة مركزية للملفات والوسائط' })}
          </p>
        </div>
        <label>
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 cursor-pointer"
            disabled={uploading}
            asChild
          >
            <span>
              {uploading ? (
                <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
              ) : (
                <Upload className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              )}
              {t({ en: 'Upload Files', ar: 'رفع ملفات' })}
            </span>
          </Button>
        </label>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {fileTypes.map(type => {
          const Icon = type.icon;
          const count = type.value === 'all' ? media.length : media.filter(f => f.type === type.value).length;
          return (
            <Card key={type.value}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{type.label[language]}</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{count}</p>
                  </div>
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                placeholder={t({ en: 'Search files...', ar: 'ابحث عن ملفات...' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
            <div className="flex gap-2">
              {fileTypes.map(type => (
                <Button
                  key={type.value}
                  variant={selectedType === type.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type.value)}
                >
                  {type.label[language]}
                </Button>
              ))}
            </div>
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredMedia.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {t({ en: 'No files found. Upload your first file!', ar: 'لم يتم العثور على ملفات. ارفع أول ملف!' })}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Media Grid */}
      {!isLoading && filteredMedia.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {filteredMedia.map(file => {
            const Icon = file.type === 'image' ? Image : file.type === 'video' ? Video : FileText;
            return (
              <Card key={file.id} className="hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  {file.type === 'image' && (
                    <img src={file.url} alt={file.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                  )}
                  {file.type !== 'image' && (
                    <div className="w-full h-32 bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                      <Icon className="h-12 w-12 text-slate-400" />
                    </div>
                  )}
                  <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{file.size}</p>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => deleteMutation.mutate(file.name)}
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Media List */}
      {!isLoading && filteredMedia.length > 0 && viewMode === 'list' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {filteredMedia.map(file => {
                const Icon = file.type === 'image' ? Image : file.type === 'video' ? Video : FileText;
                return (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-3 flex-1">
                      <Icon className="h-5 w-5 text-slate-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{file.name}</p>
                        <p className="text-xs text-slate-500">{file.uploaded_date} • {file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteMutation.mutate(file.name)}
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Storage Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Storage Usage', ar: 'استخدام التخزين' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">{t({ en: 'Total Files', ar: 'إجمالي الملفات' })}</p>
              <p className="text-2xl font-bold text-blue-600">{media.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">{t({ en: 'Total Size', ar: 'الحجم الإجمالي' })}</p>
              <p className="text-2xl font-bold text-green-600">{totalSize.toFixed(1)} MB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
