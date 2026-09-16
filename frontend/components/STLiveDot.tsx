"use client";

import * as stylex from "@stylexjs/stylex";

const pulseKeyframes = stylex.keyframes({
  "0%, 100%": { backgroundColor: "#e53935" },
  "50%": { backgroundColor: "#7b1a18" },
});

const styles = stylex.create({
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#e53935",
    flexShrink: 0,
    animationName: pulseKeyframes,
    animationDuration: "2s",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
  },
  dotLarge: {
    width: "10px",
    height: "10px",
  },
  wrapper: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  label: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#e53935",
    letterSpacing: "0.08em",
    lineHeight: 1,
  },
});

type STLiveDotProps = {
  size?: "default" | "large";
  /** When true, shows "LIVE" text next to the dot (e.g. for section headers) */
  showLabel?: boolean;
};

export function STLiveDot({ size = "default", showLabel = false }: STLiveDotProps) {
  const dot = (
    <span
      {...stylex.props(styles.dot, size === "large" && styles.dotLarge)}
      role="img"
      aria-label="Live"
    />
  );

  if (showLabel) {
    return (
      <span {...stylex.props(styles.wrapper)}>
        {dot}
        <span {...stylex.props(styles.label)}>LIVE</span>
      </span>
    );
  }

  return dot;
}
