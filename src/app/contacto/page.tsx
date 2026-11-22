import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Manifiesto, Acerca de y Contacto — DuoArcade",
  description:
    "Conoce más sobre DuoArcade, nuestra plataforma gratuita de minijuegos para 1 o 2 jugadores en un mismo dispositivo o en línea.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-8 py-12">
      <div className="border border-on-surface bg-surface-container-lowest divide-y divide-on-surface">
        <div className="p-6 sm:p-8 bg-surface-container-low">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
            {"// SECCIÓN 04 / MANIFIESTO Y CONTACTO"}
          </span>
          <h1 className="mt-2 text-2xl sm:text-4xl font-grotesk font-black uppercase tracking-tight text-on-surface">
            Acerca de DuoArcade &amp; Soporte
          </h1>
        </div>

        <section className="p-6 sm:p-8 space-y-4 text-sm leading-relaxed text-on-surface/85">
          <h2 className="text-lg font-grotesk font-bold uppercase text-on-surface">
            01. ¿Qué es DuoArcade?
          </h2>
          <p>
            <strong>DuoArcade</strong> es un portal web de minijuegos clásicos
            de estrategia diseñado bajo principios tipográficos suizos para
            partidas rápidas desde cualquier navegador móvil o de escritorio,
            sin descargar aplicaciones ni crear cuentas de usuario.
          </p>
          <p>
            Cada juego del catálogo incluye tres modalidades: entrenamiento
            individual contra inteligencia artificial (
            <strong>1 Jugador vs IA</strong>), partidas compartiendo el mismo
            teléfono o tablet (<strong>2P Local</strong>) y salas multijugador
            en tiempo real mediante enlaces compartibles por WhatsApp o Discord
            (<strong>2P Remoto</strong>).
          </p>
        </section>

        <section className="p-6 sm:p-8 space-y-4 text-sm leading-relaxed text-on-surface/85">
          <h2 className="text-lg font-grotesk font-bold uppercase text-on-surface">
            02. Contacto y Repositorio
          </h2>
          <p>
            Si tienes sugerencias de nuevos juegos, encontraste algún error
            técnico o deseas comunicarte con el equipo responsable del proyecto:
          </p>
          <ul className="list-disc pl-5 space-y-2 font-mono text-xs">
            <li>
              <strong>REPOSITORIO OFICIAL (GITHUB ISSUES):</strong>{" "}
              <a
                href="https://github.com/orlando-ro/duo-arcade/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-bold hover:underline"
              >
                github.com/orlando-ro/duo-arcade/issues
              </a>
            </li>
            <li>
              <strong>DOCUMENTACIÓN LEGAL:</strong> Consulta nuestra{" "}
              <Link
                href="/privacidad"
                className="text-primary font-bold hover:underline"
              >
                Política de Privacidad
              </Link>{" "}
              y nuestros{" "}
              <Link
                href="/terminos"
                className="text-primary font-bold hover:underline"
              >
                Términos de Uso
              </Link>
              .
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
