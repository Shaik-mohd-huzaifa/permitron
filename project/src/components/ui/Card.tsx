import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  hover?: boolean;
}

export const Card = ({ className, children, onClick, hover = true }: CardProps) => {
  return (
    <div 
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm p-4',
        hover && 'transition-shadow hover:shadow-md',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return <div className={cn('pb-2 mb-3 border-b border-gray-100', className)}>{children}</div>;
};

export const CardTitle = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return <h3 className={cn('font-semibold text-lg text-gray-800', className)}>{children}</h3>;
};

export const CardContent = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return <div className={cn('text-gray-600', className)}>{children}</div>;
};

export const CardFooter = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return <div className={cn('pt-3 mt-2 border-t border-gray-100', className)}>{children}</div>;
};