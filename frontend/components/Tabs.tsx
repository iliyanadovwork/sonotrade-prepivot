"use client"

import * as React from "react"
import * as stylex from "@stylexjs/stylex"
import * as TabsPrimitive from "@radix-ui/react-tabs"

const styles = stylex.create({
  list: {
    display: "inline-flex",
    height: "2.5rem",
    alignItems: "center",
    justifyContent: "center",
    color: "hsl(var(--muted-foreground))",
  },
  trigger: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    paddingLeft: "0.75rem",
    paddingRight: "0.75rem",
    paddingTop: "0.5rem",
    paddingBottom: "0.5rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
    transitionProperty: "all",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
  },
  triggerInactive: {
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: "transparent",
    color: "#7a7a7a",
  },
  triggerActive: {
    color: "white",
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: "white",
  },
  triggerDisabled: {
    pointerEvents: "none",
    opacity: 0.5,
  },
  triggerFocus: {
    outline: "none",
  },
  content: {
    marginTop: 0,
  },
  contentFocus: {
    outline: "none",
  },
});

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    {...stylex.props(styles.list)}
    {...props} />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    {...stylex.props(styles.trigger)}
    {...props} />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    {...stylex.props(styles.content)}
    {...props} />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
