import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { toast } from 'sonner';

export default function KeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K - Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('input[placeholder*="Search"]')?.focus();
      }

      // Cmd/Ctrl + H - Home
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        navigate(createPageUrl('Home'));
      }

      // Cmd/Ctrl + Shift + C - Challenges
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'c') {
        e.preventDefault();
        navigate(createPageUrl('Challenges'));
      }

      // Cmd/Ctrl + Shift + P - Pilots
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        navigate(createPageUrl('Pilots'));
      }

      // Cmd/Ctrl + Shift + S - Solutions
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 's') {
        e.preventDefault();
        navigate(createPageUrl('Solutions'));
      }

      // ? - Show shortcuts help
      if (e.key === '?' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        toast.info('Shortcuts: Cmd+K Search | Cmd+H Home | Cmd+Shift+C Challenges | Cmd+Shift+P Pilots');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return null;
}