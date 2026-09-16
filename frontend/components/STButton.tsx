"use client";

/**
 * STButton – shared button component with design-system variants.
 *
 * Variants:
 * - primary   – dark/transparent (e.g. header "Log in")
 * - secondary – white fill (e.g. "Sign up", "Send Code")
 * - outline   – transparent, white border (e.g. "Sign in to trade", Buy/Sell CTA)
 * - outcomeYes – Yes pill on market cards (optional price suffix)
 * - outcomeNo  – No pill on market cards (optional price suffix)
 * - tab       – underline tab (e.g. "Trade Yes" / "Trade No" in orderbook)
 *
 * Sizes: sm | md | lg. Outcome and tab variants auto-use outcome/tab size when size omitted.
 */

import * as React from "react";
import * as stylex from "@stylexjs/stylex";

/* -------------------------------------------------------------------------
 * Design tokens – single source of truth for button appearance
 * ----------------------------------------------------------------------- */
const tokens = {
  // Outcome (Yes/No) colors – used in market cards and orderbooks
  yes: {
    color: "#22DAFF",
    border: "#22DAFF",
  },
  no: {
    color: "#CD0768",
    border: "#CD0768",
  },
  // Neutrals
  borderNeutral: "#262626",
  borderNeutralHover: "rgba(255,255,255,0.42)",
  borderWhite: "rgba(255,255,255,0.1)",
  white: "#ffffff",
  black: "#000000",
  gray100: "#f3f4f6",
  grayInactive: "#7a7a7a",
  redError: "#ef4444",
  // Radii
  radiusSm: "6px",
  radiusMd: "8px",
  radiusPill: "9999px",
  // Timing
  transition: "150ms",
} as const;

/* -------------------------------------------------------------------------
 * StyleX styles – variant × size × state
 * ----------------------------------------------------------------------- */
const styles = stylex.create({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    whiteSpace: "nowrap",
    cursor: "pointer",
    userSelect: "none",
    borderStyle: "solid",
    outline: "none",
    transitionDuration: tokens.transition,
    transitionTimingFunction: "ease",
    transitionProperty: "background-color, border-color, color, opacity, transform",
    fontFamily: "inherit",
    fontWeight: 500,
    boxSizing: "border-box",
  },
  baseDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  baseFocusVisible: {
    ":focus-visible": {
      outlineWidth: "2px",
      outlineStyle: "solid",
      outlineOffset: "2px",
      outlineColor: "rgba(255,255,255,0.5)",
    },
  },

  /* ----- Sizes ----- */
  sizeSm: {
    paddingTop: "6px",
    paddingBottom: "6px",
    paddingLeft: "12px",
    paddingRight: "12px",
    fontSize: "14px",
    lineHeight: 1.25,
    height: "32px",
  },
  sizeMd: {
    paddingTop: "8px",
    paddingBottom: "8px",
    paddingLeft: "16px",
    paddingRight: "16px",
    fontSize: "15px",
    lineHeight: 1.5,
    minHeight: "40px",
  },
  sizeLg: {
    paddingTop: "12px",
    paddingBottom: "12px",
    paddingLeft: "16px",
    paddingRight: "16px",
    fontSize: "15px",
    lineHeight: 1.5,
    minHeight: "56px",
    minWidth: "72px",
  },
  sizeOutcome: {
    paddingTop: "8px",
    paddingBottom: "8px",
    paddingLeft: "6px",
    paddingRight: "6px",
    fontSize: "15px",
    lineHeight: 1.5,
    minHeight: "40px",
  },
  sizeTab: {
    paddingTop: "8px",
    paddingBottom: "8px",
    paddingLeft: "0",
    paddingRight: "0",
    fontSize: "14px",
    lineHeight: 1.25,
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    backgroundColor: "transparent",
    borderWidth: 0,
  },

  /* ----- Primary (e.g. Log in) – dark header button ----- */
  primary: {
    backgroundColor: "transparent",
    color: tokens.white,
    borderWidth: "1px",
    borderColor: tokens.borderWhite,
    borderRadius: tokens.radiusSm,
    height: "34px",
  },
  primaryHover: {
    ":hover": {
      backgroundColor: "rgba(255,255,255,0.05)",
    },
  },
  primaryActive: {
    ":active": {
      transform: "scale(0.98)",
    },
  },

  /* ----- Secondary (e.g. Sign up, Send Code) – white fill ----- */
  secondary: {
    backgroundColor: tokens.white,
    color: tokens.black,
    borderWidth: 0,
    borderRadius: tokens.radiusSm,
  },
  secondaryHover: {
    ":hover": {
      backgroundColor: tokens.gray100,
    },
  },
  secondaryActive: {
    ":active": {
      transform: "scale(0.98)",
    },
  },

  /* ----- Outline (e.g. Sign in to trade, Buy/Sell CTA) ----- */
  outline: {
    backgroundColor: "transparent",
    color: tokens.white,
    borderWidth: "1px",
    borderColor: tokens.white,
    borderRadius: tokens.radiusMd,
  },
  outlineHover: {
    ":hover": {
      opacity: 0.9,
    },
  },
  outlineActive: {
    ":active": {
      transform: "scale(0.98)",
    },
  },
  outlineDanger: {
    borderWidth: "2px",
    borderColor: tokens.redError,
    color: tokens.redError,
  },

  /* ----- Outcome Yes (market card / orderbook Yes pill) ----- */
  outcomeYes: {
    backgroundColor: "transparent",
    color: tokens.yes.color,
    borderWidth: "1.5px",
    borderColor: tokens.borderNeutral,
    borderRadius: tokens.radiusMd,
  },
  outcomeYesSelected: {
    borderColor: tokens.yes.border,
  },
  outcomeYesHover: {
    ":hover": {
      borderColor: tokens.borderNeutralHover,
      opacity: 0.9,
    },
  },
  outcomeYesActive: {
    ":active": {
      transform: "scale(0.95)",
    },
  },

  /* ----- Outcome No (market card / orderbook No pill) ----- */
  outcomeNo: {
    backgroundColor: "transparent",
    color: tokens.no.color,
    borderWidth: "1.5px",
    borderColor: tokens.borderNeutral,
    borderRadius: tokens.radiusMd,
  },
  outcomeNoSelected: {
    borderColor: tokens.no.border,
  },
  outcomeNoHover: {
    ":hover": {
      borderColor: tokens.borderNeutralHover,
      opacity: 0.9,
    },
  },
  outcomeNoActive: {
    ":active": {
      transform: "scale(0.95)",
    },
  },

  /* ----- Tab (e.g. Trade Yes / Trade No in orderbook) ----- */
  tab: {
    backgroundColor: "transparent",
    color: tokens.grayInactive,
    borderBottomColor: "transparent",
  },
  tabSelected: {
    color: tokens.white,
    borderBottomColor: tokens.white,
  },
  tabHover: {
    ":hover": {
      color: tokens.white,
    },
  },

  /* ----- Layout ----- */
  fullWidth: {
    width: "100%",
  },
  priceSuffix: {
    fontSize: "18px",
    lineHeight: "30px",
    fontWeight: 500,
  },
});

const sizeStyles = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
  outcome: styles.sizeOutcome,
  tab: styles.sizeTab,
} as const;

export type STButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "outcomeYes"
  | "outcomeNo"
  | "tab";

export type STButtonSize = "sm" | "md" | "lg" | "outcome" | "tab";

export interface STButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: STButtonVariant;
  size?: STButtonSize;
  /** For outcomeYes/outcomeNo and tab: whether the option is selected */
  selected?: boolean;
  /** For outline: show error/danger state (red border and text) */
  danger?: boolean;
  /** Stretch to full width of container */
  fullWidth?: boolean;
  /** For outcomeYes/outcomeNo: optional price suffix (e.g. 72 for "72¢") */
  price?: string | number;
  children?: React.ReactNode;
}

/**
 * Resolves size from variant when size is omitted so outcome/tab get correct size.
 */
function resolveSize(
  variant: STButtonVariant,
  size: STButtonSize | undefined
): keyof typeof sizeStyles {
  if (size != null && size !== "md") return size;
  if (variant === "outcomeYes" || variant === "outcomeNo") return "outcome";
  if (variant === "tab") return "tab";
  return "md";
}

/**
 * Returns the style objects for the given variant. Typed as array of styles
 * that stylex.props() accepts (StyleX’s typings are strict for pseudo-selectors).
 */
function getVariantStyles(
  variant: STButtonVariant,
  selected: boolean,
  danger: boolean
) {
  // StyleX runtime accepts pseudo-selector objects; typings are narrow for :hover/:active
  type StyleArg = Parameters<typeof stylex.props>[number];
  switch (variant) {
    case "primary":
      return [styles.primary, styles.primaryHover, styles.primaryActive] as StyleArg[];
    case "secondary":
      return [styles.secondary, styles.secondaryHover, styles.secondaryActive] as StyleArg[];
    case "outline":
      return [
        styles.outline,
        ...(danger ? [styles.outlineDanger] : []),
        styles.outlineHover,
        styles.outlineActive,
      ] as StyleArg[];
    case "outcomeYes":
      return [
        styles.outcomeYes,
        ...(selected ? [styles.outcomeYesSelected] : []),
        styles.outcomeYesHover,
        styles.outcomeYesActive,
      ] as StyleArg[];
    case "outcomeNo":
      return [
        styles.outcomeNo,
        ...(selected ? [styles.outcomeNoSelected] : []),
        styles.outcomeNoHover,
        styles.outcomeNoActive,
      ] as StyleArg[];
    case "tab":
      return [
        styles.tab,
        ...(selected ? [styles.tabSelected] : []),
        styles.tabHover,
      ] as StyleArg[];
    default:
      return [styles.primary, styles.primaryHover, styles.primaryActive] as StyleArg[];
  }
}

const STButton = React.forwardRef<HTMLButtonElement, STButtonProps>(
  (
    {
      variant = "primary",
      size: sizeProp,
      selected = false,
      danger = false,
      fullWidth = false,
      price,
      disabled,
      children,
      type = "button",
      ...rest
    },
    ref
  ) => {
    const size = resolveSize(variant, sizeProp);
    const variantStyle = getVariantStyles(variant, selected, danger);
    const sizeStyle = sizeStyles[size];

    const isOutcome = variant === "outcomeYes" || variant === "outcomeNo";

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        aria-pressed={variant === "tab" || isOutcome ? selected : undefined}
        {...stylex.props(
          styles.base,
          styles.baseFocusVisible,
          disabled && styles.baseDisabled,
          ...variantStyle,
          sizeStyle,
          fullWidth && styles.fullWidth
        )}
        {...rest}
      >
        {children}
        {isOutcome && price != null && (
          <>
            {" "}
            <span {...stylex.props(styles.priceSuffix)}>{price}¢</span>
          </>
        )}
      </button>
    );
  }
);

STButton.displayName = "STButton";

export { STButton, tokens as STButtonTokens };
