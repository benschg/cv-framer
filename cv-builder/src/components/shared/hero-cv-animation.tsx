'use client';

import { useState } from 'react';

export function HeroCVAnimation() {
  // Generate unique key on each component mount to force animation replay
  const [animKey] = useState(() => Date.now());

  return (
    <div className="mb-8 flex justify-center">
      <div
        className="group relative rounded-full bg-primary p-6 duration-700 animate-in fade-in zoom-in sm:p-8"
        style={{ clipPath: 'inset(-50% -0% 0 -0% round 999px)' }}
      >
        {/* Animated CV pages with hover animation */}
        <div className="relative h-40 w-40 sm:h-48 sm:w-48" key={animKey}>
          {/* Back CV page */}
          <div className="-ml-18 sm:-mt-42 cv-page-back absolute left-1/2 top-1/2 -mt-36 h-52 w-36 origin-bottom-left drop-shadow-xl sm:-ml-20 sm:h-60 sm:w-40">
            <img src="/cv-page-back.svg" alt="" className="h-full w-full" />
          </div>

          {/* Front CV page */}
          <div className="-ml-18 sm:-mt-42 cv-page-front absolute left-1/2 top-1/2 -mt-36 h-52 w-36 origin-bottom-right drop-shadow-2xl sm:-ml-20 sm:h-60 sm:w-40">
            <img src="/cv-page-front.svg" alt="" className="h-full w-full" />
          </div>

          {/* AI Sparkle */}
          <div className="ai-sparkle absolute bottom-2 right-2 h-14 w-14 sm:bottom-3 sm:right-3 sm:h-16 sm:w-16">
            <img src="/ai-sparkle.svg" alt="" className="h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
