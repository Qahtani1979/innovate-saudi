import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Facebook, Twitter, Linkedin, Link2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SocialShare({ idea }) {
  const { t } = useLanguage();
  const shareUrl = window.location.href;
  const shareText = `${idea.title} - ${idea.description?.substring(0, 100)}...`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success(t({ en: 'Link copied!', ar: 'تم نسخ الرابط!' }));
  };

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button variant="outline" size="sm" onClick={copyLink}>
        <Link2 className="h-4 w-4 mr-2" />
        {t({ en: 'Copy Link', ar: 'نسخ الرابط' })}
      </Button>
      <Button variant="outline" size="sm" onClick={shareWhatsApp} className="text-green-600">
        <MessageCircle className="h-4 w-4 mr-2" />
        WhatsApp
      </Button>
      <Button variant="outline" size="sm" onClick={shareTwitter} className="text-blue-500">
        <Twitter className="h-4 w-4 mr-2" />
        Twitter
      </Button>
      <Button variant="outline" size="sm" onClick={shareFacebook} className="text-blue-600">
        <Facebook className="h-4 w-4 mr-2" />
        Facebook
      </Button>
      <Button variant="outline" size="sm" onClick={shareLinkedIn} className="text-blue-700">
        <Linkedin className="h-4 w-4 mr-2" />
        LinkedIn
      </Button>
    </div>
  );
}