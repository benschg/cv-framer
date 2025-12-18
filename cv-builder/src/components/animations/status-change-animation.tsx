'use client';

import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, CheckCircle, Gift, Search, Send, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { PaperAirplane } from '@/components/icons/paper-airplane';
import type { ApplicationStatus } from '@/types/cv.types';

interface StatusChangeAnimationProps {
  status: ApplicationStatus | null;
  onComplete: () => void;
}

// Animation configurations for each status
const statusAnimations: Partial<
  Record<
    ApplicationStatus,
    {
      icon: React.ElementType;
      color: string;
      animation: 'fly' | 'burst' | 'fade' | 'sparkle' | 'confetti';
      duration: number;
    }
  >
> = {
  applied: {
    icon: Send,
    color: '#3b82f6', // blue
    animation: 'fly',
    duration: 1200,
  },
  screening: {
    icon: Search,
    color: '#9333ea', // purple
    animation: 'burst',
    duration: 800,
  },
  interview: {
    icon: Calendar,
    color: '#f59e0b', // amber
    animation: 'sparkle',
    duration: 1000,
  },
  offer: {
    icon: Gift,
    color: '#22c55e', // green
    animation: 'sparkle',
    duration: 1200,
  },
  accepted: {
    icon: CheckCircle,
    color: '#10b981', // emerald
    animation: 'confetti',
    duration: 1500,
  },
  rejected: {
    icon: XCircle,
    color: '#ef4444', // red
    animation: 'fade',
    duration: 600,
  },
};

// Send animation - paper airplane flies up and to the right, out of screen
function FlyAnimation({
  color,
  onComplete,
}: {
  icon: React.ElementType;
  color: string;
  onComplete: () => void;
}) {
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Paper airplane - pops in then flies diagonally up-right out of screen */}
      <motion.div
        initial={{ scale: 0, opacity: 0, rotate: -45 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.25,
          ease: 'backOut',
        }}
      >
        <motion.div
          initial={{ x: 0, y: 0 }}
          animate={{ x: 900, y: -700 }}
          transition={{
            duration: 1.5,
            ease: [0.2, 0, 0.8, 1], // smooth ease-in for gradual acceleration
          }}
          onAnimationComplete={onComplete}
        >
          <motion.div
            initial={{ opacity: 1, rotate: -45 }}
            animate={{ opacity: 0 }}
            transition={{
              duration: 0.4,
              delay: 1.1,
            }}
          >
            <PaperAirplane color={color} className="h-16 w-16" />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Burst animation (for screening)
function BurstAnimation({
  icon: Icon,
  color,
  onComplete,
}: {
  icon: React.ElementType;
  color: string;
  onComplete: () => void;
}) {
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Burst rings */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full border-4"
          style={{ borderColor: color }}
          initial={{ width: 0, height: 0, opacity: 1 }}
          animate={{
            width: [0, 150 + ring * 80],
            height: [0, 150 + ring * 80],
            opacity: [1, 0],
          }}
          transition={{
            duration: 1.2,
            delay: ring * 0.15,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Center icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{
          scale: [0, 1.5, 1, 1, 0.8],
          rotate: [-180, 0, 0, 0, 0],
          opacity: [0, 1, 1, 1, 0],
        }}
        transition={{
          duration: 1.5,
          times: [0, 0.3, 0.5, 0.8, 1],
          ease: 'easeOut',
        }}
        onAnimationComplete={onComplete}
      >
        <Icon className="h-16 w-16" style={{ color }} />
      </motion.div>
    </motion.div>
  );
}

// Sparkle animation (for interview, offer)
function SparkleAnimation({
  icon: Icon,
  color,
  onComplete,
}: {
  icon: React.ElementType;
  color: string;
  onComplete: () => void;
}) {
  const sparkles = [...Array(12)].map((_, i) => ({
    id: i,
    angle: i * 30 * (Math.PI / 180),
  }));

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Sparkle particles */}
      {sparkles.map(({ id, angle }) => (
        <motion.div
          key={id}
          className="absolute"
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            opacity: 1,
          }}
          animate={{
            x: Math.cos(angle) * 120,
            y: Math.sin(angle) * 120,
            scale: [0, 1, 0],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 1.2,
            delay: id * 0.05,
            ease: 'easeOut',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20">
            <polygon points="10,0 12,8 20,10 12,12 10,20 8,12 0,10 8,8" fill={color} />
          </svg>
        </motion.div>
      ))}

      {/* Center icon with pulse */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.3, 1, 1, 1, 0.8],
          opacity: [0, 1, 1, 1, 1, 0],
        }}
        transition={{
          duration: 2,
          times: [0, 0.15, 0.25, 0.5, 0.85, 1],
          ease: 'backOut',
        }}
        onAnimationComplete={onComplete}
      >
        <motion.div
          animate={{
            boxShadow: [`0 0 0 0 ${color}40`, `0 0 0 30px ${color}00`],
          }}
          transition={{ duration: 1.5 }}
          className="rounded-full p-4"
        >
          <Icon className="h-16 w-16" style={{ color }} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Confetti animation (for accepted) - uses canvas-confetti library
function ConfettiAnimation({
  icon: Icon,
  color,
  onComplete,
}: {
  icon: React.ElementType;
  color: string;
  onComplete: () => void;
}) {
  useEffect(() => {
    // Fire confetti from both sides
    const duration = 1500;
    const animationEnd = Date.now() + duration;
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Also fire a burst from center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.5 },
      colors,
    });
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Center celebration icon */}
      <motion.div
        initial={{ scale: 0, y: 50, opacity: 0 }}
        animate={{
          scale: [0, 1.5, 1, 1, 0.8],
          y: [50, 0, 0, 0, 0],
          opacity: [0, 1, 1, 1, 0],
        }}
        transition={{
          duration: 2.5,
          times: [0, 0.15, 0.25, 0.85, 1],
          ease: 'easeOut',
        }}
        onAnimationComplete={() => {
          // Wait for confetti to settle before completing
          setTimeout(onComplete, 1000);
        }}
      >
        <Icon className="h-20 w-20" style={{ color }} />
      </motion.div>
    </motion.div>
  );
}

// Fade animation (for rejected)
function FadeAnimation({
  icon: Icon,
  color,
  onComplete,
}: {
  icon: React.ElementType;
  color: string;
  onComplete: () => void;
}) {
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.2, 1, 0.9, 0.7],
          opacity: [0, 1, 1, 0.6, 0],
        }}
        transition={{
          duration: 1.5,
          times: [0, 0.2, 0.5, 0.8, 1],
          ease: 'easeOut',
        }}
        onAnimationComplete={onComplete}
      >
        <Icon className="h-16 w-16" style={{ color }} />
      </motion.div>
    </motion.div>
  );
}

export function StatusChangeAnimation({ status, onComplete }: StatusChangeAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ApplicationStatus | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (status && statusAnimations[status]) {
      // Immediately start new animation, interrupting any current one
      setCurrentStatus(status);
      setIsVisible(true);
      setAnimationKey((prev) => prev + 1); // Force remount to restart animation
    }
  }, [status]);

  const handleComplete = () => {
    setIsVisible(false);
    setCurrentStatus(null);
    onComplete();
  };

  const config = currentStatus ? statusAnimations[currentStatus] : null;

  if (!config) return null;

  const AnimationComponent = {
    fly: FlyAnimation,
    burst: BurstAnimation,
    sparkle: SparkleAnimation,
    confetti: ConfettiAnimation,
    fade: FadeAnimation,
  }[config.animation];

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <AnimationComponent
          key={animationKey}
          icon={config.icon}
          color={config.color}
          onComplete={handleComplete}
        />
      )}
    </AnimatePresence>
  );
}
