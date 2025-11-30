'use client';

interface BearLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function BearLoader({ message = 'Loading...', size = 'md' }: BearLoaderProps) {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="bear-pulse">
        <img
          src="/workout-bear-icon-180.svg"
          alt="Loading"
          className={sizeClasses[size]}
        />
      </div>
      {message && (
        <div className="text-sm text-muted-foreground animate-pulse">
          {message}
        </div>
      )}
    </div>
  );
}
