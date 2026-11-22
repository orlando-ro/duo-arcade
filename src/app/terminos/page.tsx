import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de Uso — DuoArcade",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-8 py-12">
      <div className="border border-on-surface bg-surface-container-lowest divide-y divide-on-surface">
        <div className="p-6 sm:p-8 bg-surface-container-low">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
            {"// DOCUMENTO LEGAL 02"}
          </span>
          <h1 className="mt-2 text-2xl sm:text-4xl font-grotesk font-black uppercase tracking-tight text-on-surface">
            Términos de Uso
          </h1>
        </div>

        <div className="p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-on-surface/85">
          <p>
            Al acceder y utilizar <strong>DuoArcade</strong>, aceptas usar los
            juegos de manera responsable y únicamente con fines de
            entretenimiento.
          </p>

          <div className="space-y-2">
            <h2 className="text-base font-grotesk font-bold uppercase text-on-surface">
              1. Disponibilidad del servicio
            </h2>
            <p>
              Los juegos se ofrecen &ldquo;tal cual&rdquo;, de forma gratuita,
              sin garantías de disponibilidad ininterrumpida.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-grotesk font-bold uppercase text-on-surface">
              2. Publicidad
            </h2>
            <p>
              Para mantener el servicio gratuito, el sitio incluye espacios
              publicitarios. Está prohibido manipular clics o bloquear
              artificialmente la medición de los mismos de manera fraudulenta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
