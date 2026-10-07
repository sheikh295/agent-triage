import { cn } from '@/lib/utils/cn';

interface AvatarProps {
  emoji: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  colorHex?: string;
  className?: string;
}

const sizeClasses = {
  xs: 'w-5 h-5 text-xs',
  sm: 'w-7 h-7 text-sm',
  md: 'w-9 h-9 text-base',
  lg: 'w-12 h-12 text-xl',
};

export function AgentAvatar({ emoji, name, size = 'md', colorHex, className }: AvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center flex-shrink-0 select-none',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: colorHex ? `${colorHex}20` : '#71717a20', border: `1.5px solid ${colorHex ?? '#71717a'}40` }}
      title={name}
      aria-label={name}
    >
      <span role="img" aria-hidden="true">{emoji}</span>
    </div>
  );
}
