import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Image, Video, FileText, Upload, Search, Trash2, Download, Grid, List } from 'lucide-react';
import { toast } from 'sonner';

export default function MediaLibrary() {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedType, setSelectedType] = useState('all');
  const queryClient = useQueryClient();

  // Mock media data - in real implementation, you'd have a MediaFile entity
  const mockMedia = [
    { id: '1', name: 'pilot-riyadh-traffic.jpg', type: 'image', size: '2.4 MB', url: 'https://images.unsplash.com/photo-1590642916589-592bca10dfbf', uploaded_date: '2025-01-15', used_in: ['Pilot PLT-001'] },
    { id: '2', name: 'challenge-presentation.pdf', type: 'document', size: '1.2 MB', url: '#', uploaded_date: '2025-01-14', used_in: ['Challenge CH-035'] },
    { id: '3', name: 'demo-video.mp4', type: 'video', size: '15.8 MB', url: '#', uploaded_date: '2025-01-13', used_in: ['Solution SOL-120'] },
    { id: '4', name: 'municipality-banner.jpg', type: 'image', size: '3.1 MB', url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000', uploaded_date: '2025-01-12', used_in: [] }
  ];

  const [media] = useState(mockMedia);

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
    const size = parseFloat(file.size);
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
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Upload className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Upload Files', ar: 'رفع ملفات' })}
        </Button>
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

      {/* Media Grid */}
      {viewMode === 'grid' ? (
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
                  {file.used_in.length > 0 && (
                    <Badge variant="outline" className="text-xs mt-2">
                      {t({ en: 'Used in', ar: 'مستخدم في' })} {file.used_in.length}
                    </Badge>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
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
                      {file.used_in.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {file.used_in.length} refs
                        </Badge>
                      )}
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
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