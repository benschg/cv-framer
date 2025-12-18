import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { APPLICATION_STATUS_CONFIG,ApplicationStatus } from '@/types/cv.types';

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: '',
        outline: 'border',
        minimal: 'bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof statusBadgeVariants> {
  status: ApplicationStatus;
}

export function StatusBadge({ status, variant, className, ...props }: StatusBadgeProps) {
  const config = APPLICATION_STATUS_CONFIG[status];

  return (
    <div
      className={cn(
        statusBadgeVariants({ variant }),
        variant === 'default' && config.bgColor,
        config.color,
        variant === 'outline' && `border-current`,
        className
      )}
      {...props}
    >
      {config.label}
    </div>
  );
}
