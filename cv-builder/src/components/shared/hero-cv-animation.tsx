'use client';

import Image from 'next/image';
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
        <div className="relative h-48 w-48" key={animKey}>
          {/* Back CV page */}
          <div className="cv-page-back absolute left-1/2 top-1/2 -ml-[72px] -mt-36 h-52 w-36 origin-bottom-left drop-shadow-xl sm:-ml-20 sm:-mt-[168px] sm:h-60 sm:w-40">
            <Image
              src="/cv-page-back.svg"
              alt=""
              className="h-full w-full"
              width={160}
              height={240}
              priority
            />
          </div>

          {/* Front CV page */}
          <div className="cv-page-front absolute left-1/2 top-1/2 -ml-[72px] -mt-36 h-52 w-36 origin-bottom-right drop-shadow-2xl sm:-ml-20 sm:-mt-[168px] sm:h-60 sm:w-40">
            <Image
              src="/cv-page-front.svg"
              alt=""
              className="h-full w-full"
              width={160}
              height={240}
              priority
            />
          </div>

          {/* AI Sparkle */}
          <div className="ai-sparkle absolute bottom-2 right-2 h-14 w-14 sm:bottom-3 sm:right-3 sm:h-16 sm:w-16">
            <Image
              src="/ai-sparkle.svg"
              alt=""
              className="h-full w-full"
              width={64}
              height={64}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
