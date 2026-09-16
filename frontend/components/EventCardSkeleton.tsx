'use client';

import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
    "@media (max-width: 1536px)": {
      gridTemplateColumns: "repeat(3, 1fr)",
    },
    "@media (max-width: 1024px)": {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
    "@media (max-width: 640px)": {
      gridTemplateColumns: "repeat(1, 1fr)",
    },
  },
  skeletonCard: {
    backgroundColor: "#262626",
    borderRadius: "0.5rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    minHeight: "203px", // Match EventCardsGrid card minHeight
    height: "fit-content",
    minWidth: 0,
    // Prevent layout shift by containing layout
    contain: "layout style paint",
  },
});

interface EventCardSkeletonProps {
  count?: number;
}

export default function EventCardSkeleton({ count = 8 }: EventCardSkeletonProps) {
  return (
    <>
      <style jsx global>{`
        @keyframes skeletonPulse {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.5;
          }
        }
        .skeleton-animate {
          animation: skeletonPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      <div {...stylex.props(styles.cardsGrid)}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} {...stylex.props(styles.skeletonCard)} className="skeleton-animate" />
        ))}
      </div>
    </>
  );
}
