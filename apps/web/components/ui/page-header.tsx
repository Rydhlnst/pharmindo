import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import PortalBrand from "@/components/ui/portal-brand";

type PageHeaderVariant = "default" | "brand";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  bottomSlot?: ReactNode;
  variant?: PageHeaderVariant;
  brandImageSrc?: string;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  disableSafeArea?: boolean;
}

export default function PageHeader({
  title,
  description,
  eyebrow = "Portal RW 25 Pharmindo",
  leftSlot,
  rightSlot,
  bottomSlot,
  variant = "default",
  brandImageSrc,
  className,
  contentClassName,
  titleClassName,
  descriptionClassName,
  disableSafeArea = false,
}: PageHeaderProps) {
  const isBrand = variant === "brand";

  return (
    <header
      className={cn(
        "relative overflow-hidden border-b border-input transition-colors duration-300",
        "min-h-[160px]",
        isBrand ? "bg-primary text-primary-foreground" : "bg-background text-foreground",
        disableSafeArea ? "px-5 py-4" : "safe-top px-5 pb-4",
        className,
      )}
    >
      {isBrand ? (
        <>
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/[0.08]" />
          <div className="pointer-events-none absolute right-16 top-10 h-32 w-32 rounded-full bg-white/[0.12]" />
          <div className="pointer-events-none absolute -bottom-10 right-40 h-48 w-48 rounded-full bg-white/[0.08]" />
        </>
      ) : null}

      <div className={cn("relative z-10 flex items-start justify-between gap-3", contentClassName)}>
        <div className="min-w-0 flex-1">
          {eyebrow === "Portal RW 25 Pharmindo" ? (
            <PortalBrand
              className="gap-1.5"
              imageSize={20}
              imageClassName="h-5 w-5"
              imageSrc={brandImageSrc}
              textClassName={cn(
                "text-[10px] font-semibold",
                isBrand ? "text-primary-foreground/70" : "text-muted-foreground",
              )}
            />
          ) : (
            <p
              className={cn(
                "text-[10px] font-semibold",
                isBrand ? "text-primary-foreground/70" : "text-muted-foreground",
              )}
            >
              {eyebrow}
            </p>
          )}
          <h1 className={cn("mt-1 text-lg font-bold tracking-tight", titleClassName)}>{title}</h1>
          {description ? (
            <p
              className={cn(
                "mt-1 text-[12px]",
                isBrand ? "text-primary-foreground/75" : "text-muted-foreground",
                descriptionClassName,
              )}
            >
              {description}
            </p>
          ) : null}
        </div>

        {(leftSlot || rightSlot) && (
          <div className="flex shrink-0 items-center gap-2">
            {leftSlot}
            {rightSlot}
          </div>
        )}
      </div>

      {bottomSlot ? <div className="relative z-10 mt-4">{bottomSlot}</div> : null}
    </header>
  );
}
