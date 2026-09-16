"use client";
import { STButton } from "../STButton";

interface STLoginButtonProps {
  onClick: () => void;
}

export function STLoginButton({ onClick }: STLoginButtonProps) {
  return (
    <STButton variant="primary" size="sm" onClick={onClick}>
      Log in
    </STButton>
  );
}
