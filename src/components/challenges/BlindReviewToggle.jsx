import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from 'lucide-react';

export default function BlindReviewToggle({ blindMode, onToggle }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-300">
      <div className="flex-1">
        <p className="text-sm font-medium text-purple-900">Blind Review Mode</p>
        <p className="text-xs text-purple-700">
          {blindMode 
            ? 'Submitter info hidden to reduce bias' 
            : 'Full challenge details visible'}
        </p>
      </div>
      <Button
        onClick={onToggle}
        variant={blindMode ? 'default' : 'outline'}
        size="sm"
        className={blindMode ? 'bg-purple-600' : ''}
      >
        {blindMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
        {blindMode ? 'Disable' : 'Enable'}
      </Button>
    </div>
  );
}