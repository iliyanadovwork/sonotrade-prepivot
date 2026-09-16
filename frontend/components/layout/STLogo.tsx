"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import Image from "next/image";
import Link from "next/link";

const styles = stylex.create({
  leftSection: {
    display: "flex",
    alignItems: "center",
    userSelect: "none",
    transform: "scale(1)",
    transformOrigin: "left center",
    "@media (max-width: 768px)": {
      transform: "scale(0.9)",
    },
  },
  logo: {
    height: "32px",
    width: "auto",
    display: "block",
  },
  logoText: {
    fontSize: "1.5rem",
    letterSpacing: "-0.05em",
    fontWeight: 400,
    fontFamily: "var(--font-geist-sans)",
    color: 'white',
    userSelect: "none",
    margin: 0,
  },
  heading: {
    fontSize: "1.5rem",
    fontWeight: 400,
    color: "#fafafa",
    margin: 0,
    fontFamily: "var(--font-geist-sans)",
    "@media (max-width: 768px)": {
      fontSize: "1.25rem",
    },
  },
  textRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  betaBadge: {
    fontSize: "0.625rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "rgba(255, 255, 255, 0.6)",
    padding: "0.15em 0.4em",
    borderRadius: "4px",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    marginTop: "1px",
  },
});

export default function STLogo({ footer = false }: { footer?: boolean }) {
  const logoSize = footer ? 40 : 32;
  const textSize = footer ? "1.75rem" : "1.5rem";

  return (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <div {...stylex.props(styles.leftSection)}>
        <Image
          src="/st-glyph.png"
          alt="Sonotrade"
          width={logoSize}
          height={logoSize}
          priority
          {...stylex.props(styles.logo)}
          style={{ height: `${logoSize}px` }}
        />
        <div {...stylex.props(styles.textRow)}>
          <h2 {...stylex.props(styles.logoText)} style={{ fontSize: textSize }}>Sonotrade</h2>
        </div>
      </div>
    </Link>
  );
}