import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de Uso — DuoArcade",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-8">
      <div className="border-b border-on-surface/15 pb-5">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
          Legal
        </p>
        <h1 className="mt-1.5 text-2xl sm:text-4xl font-grotesk font-black uppercase tracking-tight text-on-surface">
          Términos de Uso
        </h1>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-on-surface/85">
        <p>
          Al acceder y utilizar <strong>DuoArcade</strong>, aceptas usar los
          juegos de manera responsable y únicamente con fines de
          entretenimiento.
        </p>

        <section className="space-y-2">
          <h2 className="text-base font-grotesk font-bold uppercase text-on-surface">
            1. Disponibilidad del servicio
          </h2>
          <p>
            Los juegos se ofrecen &ldquo;tal cual&rdquo;, de forma gratuita, sin
            garantías de disponibilidad ininterrumpida.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-grotesk font-bold uppercase text-on-surface">
            2. Publicidad
          </h2>
          <p>
            Para mantener el servicio gratuito, el sitio incluye espacios
            publicitarios. Está prohibido manipular clics o bloquear
            artificialmente la medición de los mismos de manera fraudulenta.
          </p>
        </section>
      </div>
    </div>
  );
}
