"use client";

import * as React from "react";
import { STButton } from "../STButton";

interface STSignupButtonProps {
  onClick: () => void;
}

export function STSignupButton({ onClick }: STSignupButtonProps) {
  return (
    <STButton variant="secondary" size="sm" onClick={onClick}>
      Sign up
    </STButton>
  );
}
