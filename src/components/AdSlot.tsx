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
    dimensions: "728×90 / RESPONSIVE",
    defaultLabel: "BANNER SUPERIOR / INFERIOR",
  },
  "mobile-banner": {
    sizeClass: "min-h-[60px] w-full max-w-[320px]",
    dimensions: "320×50 / RESPONSIVE",
    defaultLabel: "BANNER MÓVIL",
  },
  rectangle: {
    sizeClass: "min-h-[250px] w-full max-w-[300px]",
    dimensions: "300×250",
    defaultLabel: "MÓDULO LATERAL",
  },
  interstitial: {
    sizeClass: "min-h-[200px] w-full",
    dimensions: "RESPONSIVE POST-PARTIDA",
    defaultLabel: "ANUNCIO ENTRE PARTIDAS",
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
      className={`mx-auto flex flex-col items-center justify-center border border-dashed border-on-surface/30 bg-surface-container-low px-4 py-3 text-center font-mono ${meta.sizeClass} ${className}`}
    >
      <span className="border border-on-surface/20 bg-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-outline">
        ESPACIO PUBLICITARIO
      </span>
      <p className="mt-1.5 text-xs font-bold uppercase text-on-surface">
        {label ?? meta.defaultLabel}
      </p>
      <p className="text-[10px] text-outline uppercase">
        {meta.dimensions} · PREVIEW MODE
      </p>
    </aside>
  );
}
