import React from 'react';
import { cn } from '../../lib/utils';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar = ({ src, alt = 'Avatar', size = 'md', className }: AvatarProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn(
      'relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center',
      sizeClasses[size],
      className
    )}>
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.querySelector('div')!.style.display = 'flex';
          }}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600">
          <User size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
        </div>
      )}
    </div>
  );
};