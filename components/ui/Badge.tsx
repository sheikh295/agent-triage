import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'agent' | 'outline';
  colorHex?: string;
  className?: string;
}

export function Badge({ children, variant = 'default', colorHex, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        variant === 'default' && 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
        variant === 'outline' && 'border border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400',
        className
      )}
      style={
        variant === 'agent' && colorHex
          ? { backgroundColor: `${colorHex}15`, color: colorHex, border: `1px solid ${colorHex}30` }
          : undefined
      }
    >
      {children}
    </span>
  );
}
