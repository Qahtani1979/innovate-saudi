import { Button } from "@/components/ui/button";
import { Share2, Mail, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ShareButton({ entityType, entityId, entityName, url }) {
  const shareUrl = url || window.location.href;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard');
  };

  const shareEmail = () => {
    const subject = encodeURIComponent(`Check out: ${entityName}`);
    const body = encodeURIComponent(`I thought you might be interested in this ${entityType}:\n\n${entityName}\n\n${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: entityName,
          text: `Check out this ${entityType}`,
          url: shareUrl
        });
        toast.success('Shared successfully');
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error('Share failed');
        }
      }
    } else {
      copyLink();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={shareNative}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyLink}>
          <LinkIcon className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareEmail}>
          <Mail className="h-4 w-4 mr-2" />
          Share via Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}