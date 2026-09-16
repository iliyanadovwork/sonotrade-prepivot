"use client"

import * as React from "react"
import * as stylex from "@stylexjs/stylex"
import * as ProgressPrimitive from "@radix-ui/react-progress"

const styles = stylex.create({
  root: {
    position: "relative",
    height: "35px",
    width: "100%",
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  indicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: "100%",
    width: "100%",
    flex: 1,
    backgroundColor: "#001c03",
    transitionProperty: "all",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 0,
  },
  content: {
    position: 'relative',
    zIndex: 1,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  }
});

export interface FillBidProps extends Omit<React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, 'value'> {
  value?: number | string
}

const FillBid = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.PropsWithChildren<FillBidProps>
>(({ value, children, ...props }, ref) => {
  const numeric = Math.max(0, Math.min(100, value ? Number(value) : 0));
  const transform = `translateX(-${100 - numeric}%)`;

  return (
    <ProgressPrimitive.Root
      ref={ref}
      {...stylex.props(styles.root)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        {...stylex.props(styles.indicator)}
        style={{ transform }}
      />

      <div {...stylex.props(styles.content)}>
        {children}
      </div>
    </ProgressPrimitive.Root>
  );
})
FillBid.displayName = ProgressPrimitive.Root.displayName

export { FillBid }