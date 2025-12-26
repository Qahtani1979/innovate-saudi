import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from '../LanguageContext';

/**
 * RTL-aware modal/dialog wrapper
 */
export default function RTLModal({ open, onOpenChange, title, description, children, ...props }) {
  const { isRTL } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent className={isRTL ? 'rtl' : 'ltr'} dir={isRTL ? 'rtl' : 'ltr'}>
        {title && (
          <DialogHeader className={isRTL ? 'text-right' : 'text-left'}>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        <div className={isRTL ? 'text-right' : 'text-left'}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
