"use client";

import * as stylex from "@stylexjs/stylex";

const RECORD_PLAYER_GIF =
  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bDA5Z29xbWg3Z3M5dXh6MG52NTMzb3JhYzh6cDN1bm9lOWxhM245MyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/cPa0VPT5ZR8d6s9UGU/giphy.gif";

const styles = stylex.create({
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1.5rem",
    gap: "0.5rem",
  },
  textBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.25rem",
  },
  title: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#e5e5e5",
    margin: 0,
    textAlign: "center",
  },
  message: {
    fontSize: "0.875rem",
    fontWeight: 400,
    color: "#7a7a7a",
    margin: 0,
    textAlign: "center",
  },
  gif: {
    width: "160px",
    height: "auto",
    borderRadius: "8px",
    objectFit: "contain",
    marginTop: "0.75rem",
  },
});

export default function STMainPageError() {
  return (
    <div {...stylex.props(styles.wrapper)}>
      <div {...stylex.props(styles.textBlock)}>
        <p {...stylex.props(styles.title)}>Oops, something went wrong</p>
        <p {...stylex.props(styles.message)}>Back in a sec.</p>
      </div>
      <img
        src={RECORD_PLAYER_GIF}
        alt=""
        {...stylex.props(styles.gif)}
        loading="lazy"
      />
    </div>
  );
}
