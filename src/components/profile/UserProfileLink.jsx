import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User, CheckCircle, ExternalLink } from 'lucide-react';
import { cn } from "@/lib/utils";

export function UserProfileLink({ 
  userId, 
  userEmail,
  userName,
  avatarUrl,
  showAvatar = true,
  showBadge = true,
  size = 'sm',
  className
}) {
  // Fetch profile if we only have email
  const { data: profile } = useQuery({
    queryKey: ['user-profile-link', userId || userEmail],
    queryFn: async () => {
      if (userId) {
        const { data } = await supabase
          .from('user_profiles')
          .select('user_id, full_name, full_name_en, avatar_url, is_public, verified')
          .eq('user_id', userId)
          .maybeSingle();
        return data;
      }
      if (userEmail) {
        const { data } = await supabase
          .from('user_profiles')
          .select('user_id, full_name, full_name_en, avatar_url, is_public, verified')
          .eq('user_email', userEmail)
          .maybeSingle();
        return data;
      }
      return null;
    },
    enabled: !!(userId || userEmail)
  });

  const displayName = userName || profile?.full_name_en || profile?.full_name || userEmail || 'Unknown User';
  const displayAvatar = avatarUrl || profile?.avatar_url;
  const profileUserId = userId || profile?.user_id;
  const isPublic = profile?.is_public;
  const isVerified = profile?.verified;

  const sizeClasses = {
    xs: 'h-5 w-5',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const content = (
    <div className={cn('inline-flex items-center gap-2', className)}>
      {showAvatar && (
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={displayAvatar} alt={displayName} />
          <AvatarFallback className="bg-primary/10 text-primary">
            <User className={size === 'xs' ? 'h-3 w-3' : 'h-4 w-4'} />
          </AvatarFallback>
        </Avatar>
      )}
      <span className={cn('font-medium', textSizes[size])}>{displayName}</span>
      {showBadge && isVerified && (
        <CheckCircle className="h-3 w-3 text-primary" />
      )}
    </div>
  );

  if (!isPublic || !profileUserId) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-default">{content}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Private profile</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link 
            to={`/profile/${profileUserId}`}
            className="hover:opacity-80 transition-opacity"
          >
            {content}
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs flex items-center gap-1">
            View profile <ExternalLink className="h-3 w-3" />
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function UserProfileAvatar({ 
  userId, 
  userEmail,
  avatarUrl,
  size = 'md',
  linkToProfile = true
}) {
  const { data: profile } = useQuery({
    queryKey: ['user-avatar', userId || userEmail],
    queryFn: async () => {
      if (userId) {
        const { data } = await supabase
          .from('user_profiles')
          .select('user_id, avatar_url, is_public')
          .eq('user_id', userId)
          .maybeSingle();
        return data;
      }
      if (userEmail) {
        const { data } = await supabase
          .from('user_profiles')
          .select('user_id, avatar_url, is_public')
          .eq('user_email', userEmail)
          .maybeSingle();
        return data;
      }
      return null;
    },
    enabled: !!(userId || userEmail)
  });

  const displayAvatar = avatarUrl || profile?.avatar_url;
  const profileUserId = userId || profile?.user_id;
  const isPublic = profile?.is_public;

  const sizeClasses = {
    xs: 'h-5 w-5',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
  };

  const avatar = (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={displayAvatar} />
      <AvatarFallback className="bg-primary/10 text-primary">
        <User className={size === 'xs' || size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      </AvatarFallback>
    </Avatar>
  );

  if (!linkToProfile || !isPublic || !profileUserId) {
    return avatar;
  }

  return (
    <Link to={`/profile/${profileUserId}`} className="hover:opacity-80 transition-opacity">
      {avatar}
    </Link>
  );
}

export default UserProfileLink;
