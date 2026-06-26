"use client";

import { useEffect, useState, type ReactNode } from "react";
import BottomNavBar from "@/components/warga/BottomNavBar";
import { ThemeContext } from "./theme-context";
import { IdentityContext, type VerificationStatus } from "./identity-context";
import InfoKehilanganFab from "./info-kehilangan-fab";
import { platformFetch } from "@/lib/api/platform";
import { useSyncVersions } from "@/lib/use-sync-versions";

export default function WargaShellClient({
  children,
  identity,
}: {
  children: ReactNode;
  identity: {
    userId: string;
    userName: string;
    userEmail: string;
    maskedNik: string;
    verificationStatus: VerificationStatus;
    rejectionReason?: string | null;
  };
}) {
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem("abdimas-dark") === "true";
    } catch {
      return false;
    }
  });
  const [identityState, setIdentityState] = useState(identity);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    setIdentityState(identity);
  }, [identity]);

  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("abdimas-dark", String(next));
      return next;
    });
  };

  const refreshIdentity = async () => {
    const response = await platformFetch<{
      userId: string;
      userName: string;
      userEmail: string;
      maskedNik: string;
      verificationStatus: VerificationStatus;
      rejectionReason?: string | null;
    }>("/me/identity");
    setIdentityState((current) => ({
      ...current,
      ...response.data,
    }));
  };

  useSyncVersions([`user:${identityState.userId}:identity`], {
    enabled: Boolean(identityState.userId),
    onVersionsChanged: async (changedKeys) => {
      if (changedKeys.includes(`user:${identityState.userId}:identity`)) {
        await refreshIdentity();
      }
    },
  });

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark }}>
      <IdentityContext.Provider value={{ ...identityState, refreshIdentity }}>
        <div className="flex min-h-[100svh] justify-center bg-background px-0 transition-colors duration-300 md:bg-slate-100 md:px-6 md:py-6">
          <div className="relative flex h-[100dvh] min-h-[100svh] w-full max-w-md flex-col overflow-hidden bg-background text-foreground transition-colors duration-300 md:min-h-[780px] md:rounded-[28px] md:border md:border-slate-200 md:shadow-xl">
            <main className="flex-1 overflow-y-auto pb-[calc(6rem+env(safe-area-inset-bottom,0px))]">
              {children}
            </main>
            <InfoKehilanganFab />
            <BottomNavBar />
          </div>
        </div>
      </IdentityContext.Provider>
    </ThemeContext.Provider>
  );
}
