"use client";

import { useState } from "react";

export function HeroCVAnimation() {
  // Generate unique key on each component mount to force animation replay
  const [animKey] = useState(() => Date.now());

  return (
    <div className="mb-8 flex justify-center">
      <div
        className="rounded-full bg-primary p-6 sm:p-8 animate-in fade-in zoom-in duration-700 relative group"
        style={{ clipPath: "inset(-50% -0% 0 -0% round 999px)" }}
      >
        {/* Animated CV pages with hover animation */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48" key={animKey}>
          {/* Back CV page */}
          <div className="absolute top-1/2 left-1/2 w-36 h-52 sm:w-40 sm:h-60 -ml-18 -mt-36 sm:-ml-20 sm:-mt-42 cv-page-back origin-bottom-left drop-shadow-xl">
            <img src="/cv-page-back.svg" alt="" className="w-full h-full" />
          </div>

          {/* Front CV page */}
          <div className="absolute top-1/2 left-1/2 w-36 h-52 sm:w-40 sm:h-60 -ml-18 -mt-36 sm:-ml-20 sm:-mt-42 cv-page-front origin-bottom-right drop-shadow-2xl">
            <img src="/cv-page-front.svg" alt="" className="w-full h-full" />
          </div>

          {/* AI Sparkle */}
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-14 h-14 sm:w-16 sm:h-16 ai-sparkle">
            <img src="/ai-sparkle.svg" alt="" className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
