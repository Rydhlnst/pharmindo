"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

type PortalBrandProps = {
  className?: string;
  textClassName?: string;
  subtitle?: string;
  subtitleClassName?: string;
  imageClassName?: string;
  imageSize?: number;
  imageSrc?: string;
};

export default function PortalBrand({
  className,
  textClassName,
  subtitle,
  subtitleClassName,
  imageClassName,
  imageSize = 32,
  imageSrc = "/pharmindo25.png",
}: PortalBrandProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="relative shrink-0 overflow-hidden"
        style={{ width: imageSize, height: imageSize, minWidth: imageSize, minHeight: imageSize }}
      >
        <Image
          src={imageSrc}
          alt="Portal RW 25 Pharmindo"
          fill
          sizes={`${imageSize}px`}
          className={cn("object-contain", imageClassName)}
          priority
        />
      </div>
      <div className="min-w-0">
        <p className={cn("truncate font-bold leading-tight", textClassName)}>Portal RW 25 Pharmindo</p>
        {subtitle ? (
          <p className={cn("truncate leading-tight", subtitleClassName)}>{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
