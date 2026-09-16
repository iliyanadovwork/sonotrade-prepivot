import * as React from "react";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  base: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "9999px",
    borderWidth: "1px",
    borderStyle: "solid",
    paddingLeft: "0.625rem",
    paddingRight: "0.625rem",
    paddingTop: "0.125rem",
    paddingBottom: "0.125rem",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    fontWeight: 600,
    transitionProperty: "color, background-color, border-color",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    ":focus": {
      outline: "none",
    },
  },
  default: {
    borderColor: "transparent",
    backgroundColor: "hsl(var(--primary))",
    color: "hsl(var(--primary-foreground))",
  },
  secondary: {
    borderColor: "transparent",
    backgroundColor: "hsl(var(--secondary))",
    color: "hsl(var(--secondary-foreground))",
  },
  destructive: {
    borderColor: "transparent",
    backgroundColor: "hsl(var(--destructive))",
    color: "hsl(var(--destructive-foreground))",
  },
  outline: {
    color: "hsl(var(--foreground))",
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      {...stylex.props(styles.base, styles[variant])}
      {...props}
    />
  );
}

export { Badge };