'use client';

import { cn } from '@/lib/utils';

interface CircularProgressProps {
  /** Progress percentage (0-100) or boolean for complete/incomplete */
  progress: number | boolean;
  /** Optional count to display inside the circle */
  count?: number;
  /** Size of the circle in pixels */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Color for the progress arc and count text */
  progressColor?: string;
  /** Color for the background track */
  trackColor?: string;
  /** Additional className */
  className?: string;
}

/**
 * Small circular progress indicator with radial fill.
 * Shows progress as a filling arc around the circle.
 * Optionally displays a count number inside when provided.
 */
export function CircularProgress({
  progress,
  count,
  size = 12,
  strokeWidth = 2,
  progressColor = 'hsl(var(--primary))',
  trackColor = 'hsl(var(--muted-foreground) / 0.3)',
  className,
}: CircularProgressProps) {
  // Convert boolean to percentage
  const percentage = typeof progress === 'boolean' ? (progress ? 100 : 0) : progress;
  const hasCount = count !== undefined && count > 0;

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // For count display, use a larger size
  const displaySize = hasCount ? 16 : size;
  const displayRadius = hasCount ? (displaySize - strokeWidth) / 2 : radius;
  const displayCenter = displaySize / 2;
  const displayCircumference = 2 * Math.PI * displayRadius;
  const displayStrokeDashoffset = displayCircumference - (percentage / 100) * displayCircumference;

  if (hasCount) {
    return (
      <div
        className={cn('relative flex flex-shrink-0 items-center justify-center', className)}
        style={{ width: displaySize, height: displaySize }}
      >
        <svg
          width={displaySize}
          height={displaySize}
          viewBox={`0 0 ${displaySize} ${displaySize}`}
          className="absolute"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background track circle */}
          <circle
            cx={displayCenter}
            cy={displayCenter}
            r={displayRadius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          {percentage > 0 && (
            <circle
              cx={displayCenter}
              cy={displayCenter}
              r={displayRadius}
              fill="none"
              stroke={progressColor}
              strokeWidth={strokeWidth}
              strokeDasharray={displayCircumference}
              strokeDashoffset={displayStrokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
          )}
        </svg>
        {/* Count number */}
        <span
          className="relative text-[9px] font-semibold leading-none"
          style={{ color: progressColor }}
        >
          {count > 9 ? '9+' : count}
        </span>
      </div>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn('flex-shrink-0', className)}
      style={{ transform: 'rotate(-90deg)' }}
    >
      {/* Background track circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      {percentage > 0 && (
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      )}
    </svg>
  );
}
