import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de Uso — DuoArcade",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-5 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
        Términos de Uso
      </h1>
      <p>
        Al acceder y utilizar <strong>DuoArcade</strong>, aceptas usar los
        juegos de manera responsable y únicamente con fines de entretenimiento.
      </p>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
        1. Disponibilidad del servicio
      </h2>
      <p>
        Los juegos se ofrecen &ldquo;tal cual&rdquo;, de forma gratuita, sin
        garantías de disponibilidad ininterrumpida.
      </p>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
        2. Publicidad
      </h2>
      <p>
        Para mantener el servicio gratuito, el sitio incluye espacios
        publicitarios. Está prohibido manipular clics o bloquear artificialmente
        la medición de los mismos de manera fraudulenta.
      </p>
    </div>
  );
}
