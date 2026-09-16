"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import Image from "next/image";

const pulsate = stylex.keyframes({
  "0%, 100%": {
    opacity: 0.3,
    transform: "scale(0.95)",
  },
  "50%": {
    opacity: 1,
    transform: "scale(1.05)",
  },
});

const styles = stylex.create({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  animatedWrapper: {
    animationName: pulsate,
    animationDuration: "2s",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
  },
});

interface STSkeletonGlyphProps {
  size?: number;
}

export default function STSkeletonGlyph({ 
  size = 48
}: STSkeletonGlyphProps) {
  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.animatedWrapper)}>
        <Image
          src="/st-glyph.png"
          alt="Loading"
          width={size}
          height={size}
          priority
        />
      </div>
    </div>
  );
}
