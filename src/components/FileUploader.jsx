import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Upload, X, Check, Loader2, File, Image, Video, Music, Search, Globe, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useFileStorage, useImageSearch } from '@/hooks/usePlatformCore';

export default function FileUploader({
  onUploadComplete,
  accept = "*/*",
  maxSize = 50, // MB
  label = "Upload File",
  description,
  preview = true,
  type = "any", // any, image, video, audio, document
  enableImageSearch = false,
  searchContext = "" // context for AI image search (e.g., challenge title)
}) {
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [fileName, setFileName] = useState('');
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoSearched, setAutoSearched] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchResults, setSearchResults] = useState([]);

  const { uploadMutation, uploading } = useFileStorage();
  const { searchMutation, searching } = useImageSearch();

  const getAcceptString = () => {
    switch (type) {
      case 'image': return 'image/*';
      case 'video': return 'video/*';
      case 'audio': return 'audio/*';
      case 'document': return '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx';
      default: return accept;
    }
  };

  const getIcon = () => {
    if (uploadedUrl) return <Check className="h-5 w-5 text-green-600" />;
    if (uploading) return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;

    switch (type) {
      case 'image': return <Image className="h-5 w-5 text-slate-400" />;
      case 'video': return <Video className="h-5 w-5 text-slate-400" />;
      case 'audio': return <Music className="h-5 w-5 text-slate-400" />;
      case 'document': return <File className="h-5 w-5 text-slate-400" />;
      default: return <Upload className="h-5 w-5 text-slate-400" />;
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setProgress(10);

    uploadMutation.mutate({ file, maxSize }, {
      onSuccess: (result) => {
        setProgress(100);
        setUploadedUrl(result.file_url);
        onUploadComplete(result.file_url);
      },
      onError: (error) => {
        toast.error('Upload failed: ' + error.message);
        setProgress(0);
      }
    });
  };

  const handleRemove = () => {
    setUploadedUrl(null);
    setFileName('');
    setProgress(0);
    setSearchResults([]);
    onUploadComplete(null);
  };

  // Auto-search when component mounts if context is available
  React.useEffect(() => {
    if (enableImageSearch && searchContext && !autoSearched && !uploadedUrl) {
      setAutoSearched(true);
      setShowImageSearch(true);
      handleImageSearch(searchContext);
    }
  }, [searchContext, enableImageSearch, autoSearched, uploadedUrl]);

  const handleImageSearch = async (queryOverride = null, shuffle = false) => {
    const query = queryOverride || searchQuery || searchContext;

    if (!query) {
      toast.error('Please enter a search term');
      return;
    }

    const nextPage = shuffle ? (searchPage % 5) + 1 : searchPage;

    searchMutation.mutate({ query, page: nextPage }, {
      onSuccess: (images) => {
        if (images.length > 0) {
          setSearchResults(images);
          setSearchPage(nextPage);
          toast.success(`Found ${images.length} fresh images (page ${nextPage})`);
        } else {
          toast.error('No more images found. Try a different search term.');
        }
      },
      onError: (error) => {
        toast.error('Image search failed: ' + error.message);
      }
    });
  };

  const handleSelectImage = (imageUrl, imageName) => {
    setUploadedUrl(imageUrl);
    setFileName(imageName || 'Selected image');
    setShowImageSearch(false);
    setSearchResults([]);
    onUploadComplete(imageUrl);
    toast.success('Image selected');
  };

  return (
    <div className="space-y-3">
      {!uploadedUrl ? (
        <>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept={getAcceptString()}
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
              id={`file-upload-${type}`}
            />
            <label
              htmlFor={`file-upload-${type}`}
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="mb-3">
                {getIcon()}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">{label}</p>
                {description && (
                  <p className="text-xs text-slate-500 mt-1">{description}</p>
                )}
                <p className="text-xs text-slate-400 mt-2">Max size: {maxSize}MB</p>
              </div>
            </label>

            {uploading && (
              <div className="mt-4 space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-slate-500">
                  Uploading {fileName}... {progress}%
                </p>
              </div>
            )}
          </div>

          {enableImageSearch && type === 'image' && (
            <div className="space-y-3">
              <div className="relative">
                <span className="block text-center text-xs text-slate-500">OR</span>
              </div>

              {!showImageSearch ? (
                <Button
                  variant="outline"
                  onClick={() => setShowImageSearch(true)}
                  className="w-full"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Search Free Images Online
                </Button>
              ) : (
                <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search for images (e.g., pedestrian safety, traffic)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleImageSearch()}
                    />
                    <Button
                      onClick={() => handleImageSearch()}
                      disabled={searching}
                      className="bg-blue-600"
                    >
                      {searching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                    {searchResults.length > 0 && (
                      <Button
                        onClick={() => handleImageSearch(null, true)}
                        disabled={searching}
                        variant="outline"
                        title="Shuffle - Get fresh images"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowImageSearch(false);
                        setSearchResults([]);
                        setSearchQuery('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {searching && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                      <span className="text-sm text-slate-600">Searching for images...</span>
                    </div>
                  )}

                  {!searching && searchResults.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                      {searchResults.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative group cursor-pointer border border-slate-200 rounded-lg overflow-hidden hover:border-blue-500 transition-colors"
                          onClick={() => handleSelectImage(img.url, img.description)}
                        >
                          <img
                            src={img.url}
                            alt={img.description || 'Image'}
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                            <Check className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                            <p className="text-xs text-white truncate">{img.credit || img.source || 'Free image'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!searching && searchResults.length === 0 && searchQuery && (
                    <p className="text-sm text-slate-500 text-center py-4">
                      No images found. Try a different search term.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-shrink-0">
                {preview && type === 'image' ? (
                  <img src={uploadedUrl} alt="Preview" className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-slate-200 rounded flex items-center justify-center">
                    {getIcon()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{fileName}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <Check className="h-3 w-3" />
                  Uploaded successfully
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
