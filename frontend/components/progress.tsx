"use client"

import * as React from "react"
import * as stylex from "@stylexjs/stylex"
import * as ProgressPrimitive from "@radix-ui/react-progress"

const styles = stylex.create({
  root: {
    position: "relative",
    height: "0.25rem",
    width: "100%",
    overflow: "hidden",
    borderRadius: "9999px",
    backgroundColor: "#3c3a3a",
  },
  indicator: {
    height: "100%",
    width: "100%",
    flex: 1,
    transitionProperty: "all",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
  },
  indicatorFilled: {
    backgroundColor: "#6bff21",
  },
  indicatorEmpty: {
    backgroundColor: "#3c3a3a",
  },
  fadeTip: {
    position: "absolute",
    insetBlock: 0,
    right: 0,
    zIndex: 5,
    width: "15%",
    pointerEvents: "none",
  },
  shimmer: {
    position: "absolute",
    inset: 0,
    zIndex: 10,
    width: "30%",
    pointerEvents: "none",
  },
});

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ value, ...props }, ref) => {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes burn-fuse-shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      ` }} />
      <ProgressPrimitive.Root
        ref={ref}
        {...stylex.props(styles.root)}
        {...props}>
        <ProgressPrimitive.Indicator
          {...stylex.props(
            styles.indicator,
            value !== 0 ? styles.indicatorFilled : styles.indicatorEmpty
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}>
          {/* Static white fade at the tip */}
          {value && value > 0 && (
            <div
              {...stylex.props(styles.fadeTip)}
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 100%)',
              }}
            />
          )}
          {/* Burning fuse effect - moving shimmer */}
          {value && value > 0 && (
            <div
              {...stylex.props(styles.shimmer)}
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
                animation: 'burn-fuse-shimmer 1.5s ease-in-out infinite',
              }}
            />
          )}
        </ProgressPrimitive.Indicator>
      </ProgressPrimitive.Root>
    </>
  );
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
