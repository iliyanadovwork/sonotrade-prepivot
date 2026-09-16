"use client";

import { useRef, useState, useEffect } from "react";
import * as stylex from "@stylexjs/stylex";
import { Volume2, VolumeX } from "lucide-react";
import { STLiveDot } from "@/components/STLiveDot";

const STREAM_URL = "https://radio.sonotrade.io/stream.mp3";
const DEFAULT_VOLUME = 0.8;

const spin = stylex.keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
});

const styles = stylex.create({
  root: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "9999px",
    backgroundColor: "#000000",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,0.1)",
    userSelect: "none",
  },
  disc: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "20px",
    height: "22px",
    flexShrink: 0,
    fontSize: "12px",
    lineHeight: 1,
    animationName: spin,
    animationDuration: "2s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
  live: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flexShrink: 0,
  },
  liveText: {
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    color: "#e53935",
    textTransform: "uppercase",
    lineHeight: 1,
  },
  glyph: {
    width: "14px",
    height: "14px",
    flexShrink: 0,
    display: "block",
  },
  muteButton: {
    width: "20px",
    height: "22px",
    margin: 0,
    padding: 0,
    borderWidth: 0,
    borderStyle: "none",
    borderRadius: "4px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    cursor: "pointer",
    backgroundColor: "transparent",
    transitionProperty: "background-color",
    transitionDuration: "120ms",
    transitionTimingFunction: "ease",
  },
  muteButtonHover: {
    ":hover": {
      backgroundColor: "rgba(255,255,255,0.1)",
    },
  },
  iconVolume: {
    width: "14px",
    height: "14px",
  },
});

export function STRadioChip() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const play = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.src !== STREAM_URL) audio.src = STREAM_URL;
    audio.volume = DEFAULT_VOLUME;
    audio.play().catch(() => {});
    setIsMuted(false);
  };

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = "";
    setIsMuted(true);
  };

  const toggleMute = () => {
    if (isMuted) play();
    else stop();
  };

  return (
    <div
      {...stylex.props(styles.root)}
      role="group"
      aria-label="SonoTrade Radio"
    >
      <span {...stylex.props(styles.disc)} aria-hidden>
        💿
      </span>
      <span {...stylex.props(styles.live)}>
        <STLiveDot size="default" />
        <span {...stylex.props(styles.liveText)}>Live</span>
      </span>
      <button
        type="button"
        onClick={toggleMute}
        {...stylex.props(styles.muteButton, styles.muteButtonHover)}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <VolumeX {...stylex.props(styles.iconVolume)} />
        ) : (
          <Volume2 {...stylex.props(styles.iconVolume)} />
        )}
      </button>
    </div>
  );
}
