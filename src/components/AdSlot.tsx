"use client";

import { useEffect, useRef } from "react";

type AdFormat = "leaderboard" | "rectangle" | "mobile-banner" | "interstitial";

interface AdSlotProps {
  format: AdFormat;
  slotId?: string;
  className?: string;
  label?: string;
}

const FORMAT_STYLES: Record<
  AdFormat,
  { sizeClass: string; dimensions: string; defaultLabel: string }
> = {
  leaderboard: {
    sizeClass: "min-h-[90px] w-full max-w-[728px]",
    dimensions: "728×90",
    defaultLabel: "Banner",
  },
  "mobile-banner": {
    sizeClass: "min-h-[60px] w-full max-w-[320px]",
    dimensions: "320×50",
    defaultLabel: "Banner móvil",
  },
  rectangle: {
    sizeClass: "min-h-[250px] w-full max-w-[300px]",
    dimensions: "300×250",
    defaultLabel: "Anuncio",
  },
  interstitial: {
    sizeClass: "min-h-[160px] w-full",
    dimensions: "Post-partida",
    defaultLabel: "Anuncio",
  },
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({
  format,
  slotId,
  className = "",
  label,
}: AdSlotProps) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const pushed = useRef(false);
  const meta = FORMAT_STYLES[format];

  useEffect(() => {
    if (!adsenseClient || !slotId || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // Ignore AdSense push errors in dev or blocked environments
    }
  }, [adsenseClient, slotId]);

  if (adsenseClient && slotId) {
    return (
      <div
        className={`mx-auto flex items-center justify-center overflow-hidden ${meta.sizeClass} ${className}`}
        aria-label="Publicidad"
      >
        <ins
          className="adsbygoogle block w-full"
          data-ad-client={adsenseClient}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  if (adsenseClient) {
    return null;
  }

  return (
    <aside
      aria-label="Espacio publicitario"
      className={`mx-auto flex flex-col items-center justify-center border border-dashed border-on-surface/15 bg-surface-container-low/60 px-4 py-3 text-center font-mono ${meta.sizeClass} ${className}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-outline">
        {label ?? meta.defaultLabel} · {meta.dimensions}
      </p>
      <p className="text-[10px] text-outline/70">Espacio publicitario</p>
    </aside>
  );
}
