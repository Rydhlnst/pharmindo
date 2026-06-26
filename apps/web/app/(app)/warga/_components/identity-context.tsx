"use client";

import { createContext, useContext } from "react";

export type VerificationStatus = "NONE" | "PENDING" | "VERIFIED" | "REJECTED";

export type IdentityContextValue = {
  userId: string;
  userName: string;
  userEmail: string;
  maskedNik: string;
  /** "NONE" means the user has an account but hasn't submitted their identity profile yet. */
  verificationStatus: VerificationStatus;
  rejectionReason?: string | null;
  refreshIdentity: () => Promise<void>;
};

export const IdentityContext = createContext<IdentityContextValue | null>(null);

export function useIdentity() {
  const ctx = useContext(IdentityContext);
  if (!ctx) {
    throw new Error("useIdentity must be used within IdentityContext.Provider");
  }
  return ctx;
}
