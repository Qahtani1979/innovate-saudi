import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/components/LanguageContext';
import { 
  Newspaper, Plus, Search, Trash2, Edit, Eye, EyeOff, 
  Star, Loader2 
} from 'lucide-react';
import { useAllNewsArticles, useNewsArticleMutations } from '@/hooks/useNewsArticles';
import NewsArticleEditor from '@/components/news/NewsArticleEditor';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { format } from 'date-fns';
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

function NewsManagement() {
  const { language, t } = useLanguage();
  const { data: articles = [], isLoading } = useAllNewsArticles();
  const { deleteArticle, publishArticle, unpublishArticle } = useNewsArticleMutations();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchQuery || 
      article.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.title_ar?.includes(searchQuery) ||
      article.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'published' && article.is_published) ||
      (activeTab === 'draft' && !article.is_published) ||
      (activeTab === 'featured' && article.is_featured);
    
    return matchesSearch && matchesTab;
  });

  const stats = {
    total: articles.length,
    published: articles.filter(a => a.is_published).length,
    draft: articles.filter(a => !a.is_published).length,
    featured: articles.filter(a => a.is_featured).length
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteArticle.mutateAsync(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleEdit = (article) => {
    setSelectedArticle(article);
    setShowEditor(true);
  };

  const handleCreate = () => {
    setSelectedArticle(null);
    setShowEditor(true);
  };

  const togglePublish = async (article) => {
    if (article.is_published) {
      await unpublishArticle.mutateAsync(article.id);
    } else {
      await publishArticle.mutateAsync(article.id);
    }
  };

  if (showEditor) {
    return (
      <PageLayout>
        <NewsArticleEditor
          article={selectedArticle}
          onClose={() => setShowEditor(false)}
          onSave={() => setShowEditor(false)}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        icon={Newspaper}
        title={t({ en: 'News Management', ar: 'إدارة الأخبار' })}
        description={t({ en: 'Create, edit, and publish news articles', ar: 'إنشاء وتعديل ونشر المقالات الإخبارية' })}
        stats={[
          { icon: Newspaper, value: stats.total, label: t({ en: 'Total', ar: 'الإجمالي' }) },
          { icon: Eye, value: stats.published, label: t({ en: 'Published', ar: 'منشور' }) },
          { icon: EyeOff, value: stats.draft, label: t({ en: 'Drafts', ar: 'مسودات' }) },
          { icon: Star, value: stats.featured, label: t({ en: 'Featured', ar: 'مميز' }) }
        ]}
        action={
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t({ en: 'New Article', ar: 'مقال جديد' })}
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t({ en: 'Search articles...', ar: 'بحث في المقالات...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">{t({ en: 'All', ar: 'الكل' })} ({stats.total})</TabsTrigger>
                <TabsTrigger value="published">{t({ en: 'Published', ar: 'منشور' })} ({stats.published})</TabsTrigger>
                <TabsTrigger value="draft">{t({ en: 'Drafts', ar: 'مسودات' })} ({stats.draft})</TabsTrigger>
                <TabsTrigger value="featured">{t({ en: 'Featured', ar: 'مميز' })} ({stats.featured})</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredArticles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              {t({ en: 'No articles found', ar: 'لم يتم العثور على مقالات' })}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t({ en: 'Create your first article to get started', ar: 'أنشئ مقالك الأول للبدء' })}
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: 'Create Article', ar: 'إنشاء مقال' })}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map(article => (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {article.image_url && (
                    <img 
                      src={article.image_url} 
                      alt={article.title_en}
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {article.is_published ? (
                        <Badge className="bg-green-600">{t({ en: 'Published', ar: 'منشور' })}</Badge>
                      ) : (
                        <Badge variant="secondary">{t({ en: 'Draft', ar: 'مسودة' })}</Badge>
                      )}
                      {article.is_featured && (
                        <Badge className="bg-amber-500">
                          <Star className="h-3 w-3 mr-1 fill-white" />
                          {t({ en: 'Featured', ar: 'مميز' })}
                        </Badge>
                      )}
                      <Badge variant="outline">{article.category}</Badge>
                    </div>
                    <h3 className="font-semibold text-foreground text-lg mb-1">
                      {language === 'ar' ? (article.title_ar || article.title_en) : article.title_en}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {language === 'ar' ? (article.summary_ar || article.summary_en) : (article.summary_en || article.summary_ar)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {article.author && <span>{article.author}</span>}
                      {article.publish_date && (
                        <span>{format(new Date(article.publish_date), 'PPP')}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.view_count || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => togglePublish(article)}
                      title={article.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {article.is_published ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(article)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setDeleteConfirm(article.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t({ en: 'Delete Article', ar: 'حذف المقال' })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t({ en: 'Are you sure you want to delete this article? This action cannot be undone.', ar: 'هل أنت متأكد من حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء.' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t({ en: 'Cancel', ar: 'إلغاء' })}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              {t({ en: 'Delete', ar: 'حذف' })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}

export default ProtectedPage(NewsManagement, { requiredPermissions: ['manage_content'] });
