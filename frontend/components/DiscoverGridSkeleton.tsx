'use client';

import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gap: "1rem",
    marginBottom: "2rem",
    "@media (max-width: 1024px)": {
      display: "none",
    },
  },
  leftColumn: {
    gridColumn: "span 4",
    display: "flex",
    flexDirection: "column",
  },
  trendingRow: {
    display: "flex",
    gap: "1.5rem",
    padding: "1.5rem 0",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "#262626",
  },
  trendingRowLast: {
    borderBottomWidth: 0,
  },
  trendingText: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  trendingImage: {
    width: "96px",
    height: "96px",
    backgroundColor: "#1a1a1a",
    borderRadius: "0.25rem",
    flexShrink: 0,
  },
  skeleton: {
    backgroundColor: "#262626",
    borderRadius: "0.25rem",
  },
  skeletonLine: {
    height: "0.75rem",
    width: "100%",
    marginBottom: "0.5rem",
  },
  skeletonLineShort: {
    height: "0.75rem",
    width: "70%",
  },
});

export default function DiscoverGridSkeleton() {
  return (
    <>
      <div {...stylex.props(styles.container)}>
        {/* Left Column - Trending List Skeleton */}
        <div {...stylex.props(styles.leftColumn)}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              {...stylex.props(styles.trendingRow, i === 5 && styles.trendingRowLast)}
            >
              <div {...stylex.props(styles.trendingText)}>
                <div {...stylex.props(styles.skeleton, styles.skeletonLine)} className="skeleton-pulse" />
                <div {...stylex.props(styles.skeleton, styles.skeletonLineShort)} className="skeleton-pulse" />
              </div>
              <div {...stylex.props(styles.trendingImage, styles.skeleton)} className="skeleton-pulse" />
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes skeleton-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .skeleton-pulse {
          animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
}
