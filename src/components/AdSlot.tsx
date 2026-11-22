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
    dimensions: "728×90 / Responsive",
    defaultLabel: "Banner Superior / Inferior",
  },
  "mobile-banner": {
    sizeClass: "min-h-[60px] w-full max-w-[320px]",
    dimensions: "320×50 / Responsive",
    defaultLabel: "Banner Móvil",
  },
  rectangle: {
    sizeClass: "min-h-[250px] w-full max-w-[300px]",
    dimensions: "300×250",
    defaultLabel: "Anuncio Lateral",
  },
  interstitial: {
    sizeClass: "min-h-[200px] w-full",
    dimensions: "Responsive Post-Partida",
    defaultLabel: "Anuncio Entre Partidas",
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

  // Manual Ad Unit mode (when both NEXT_PUBLIC_ADSENSE_CLIENT and a specific slotId are provided)
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

  // Auto Ads mode: when NEXT_PUBLIC_ADSENSE_CLIENT is configured without manual slotIds,
  // hide the development placeholder boxes so the site looks clean for AdSense review
  // and Google Auto Ads can inject ads automatically.
  if (adsenseClient) {
    return null;
  }

  return (
    <aside
      aria-label="Espacio publicitario"
      className={`mx-auto flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-100/70 dark:bg-zinc-900/60 px-4 py-3 text-center ${meta.sizeClass} ${className}`}
    >
      <span className="rounded bg-slate-200 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
        Espacio Publicitario
      </span>
      <p className="mt-1 text-xs font-medium text-slate-600 dark:text-zinc-300">
        {label ?? meta.defaultLabel}
      </p>
      <p className="text-[11px] text-slate-400 dark:text-zinc-500">
        {meta.dimensions} · Modo vista previa (sin NEXT_PUBLIC_ADSENSE_CLIENT)
      </p>
    </aside>
  );
}
