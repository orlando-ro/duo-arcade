import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Acerca de y Contacto — DuoArcade",
  description:
    "Conoce más sobre DuoArcade, nuestra plataforma gratuita de minijuegos para 1 o 2 jugadores en un mismo dispositivo o en línea.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-8">
      <div className="border-b border-on-surface/15 pb-5">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
          Acerca de
        </p>
        <h1 className="mt-1.5 text-2xl sm:text-4xl font-grotesk font-black uppercase tracking-tight text-on-surface">
          DuoArcade y Contacto
        </h1>
      </div>

      <section className="space-y-3 text-sm leading-relaxed text-on-surface/85">
        <h2 className="text-base font-grotesk font-bold uppercase text-on-surface">
          ¿Qué es DuoArcade?
        </h2>
        <p>
          <strong>DuoArcade</strong> es un portal web de minijuegos clásicos de
          mesa y estrategia pensado para partidas rápidas desde cualquier
          navegador móvil o de escritorio, sin descargar aplicaciones ni crear
          cuentas de usuario.
        </p>
        <p>
          Cada juego del catálogo incluye tres modalidades: entrenamiento
          individual contra inteligencia artificial (
          <strong>1 Jugador vs IA</strong>), partidas compartiendo el mismo
          teléfono o tablet (<strong>2P Local</strong>) y salas multijugador en
          tiempo real mediante enlaces compartibles por WhatsApp, Discord o
          cualquier mensajero (<strong>2P Remoto</strong>).
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-on-surface/85 pt-6 border-t border-on-surface/15">
        <h2 className="text-base font-grotesk font-bold uppercase text-on-surface">
          Contacto y soporte
        </h2>
        <p>
          Si tienes sugerencias de nuevos juegos, encontraste algún error
          técnico o deseas comunicarte con el equipo responsable del proyecto:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
          <li>
            <strong>Repositorio oficial (GitHub Issues):</strong>{" "}
            <a
              href="https://github.com/orlando-ro/duo-arcade/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline"
            >
              github.com/orlando-ro/duo-arcade/issues
            </a>
          </li>
          <li>
            <strong>Documentación legal:</strong> puedes consultar nuestra{" "}
            <Link
              href="/privacidad"
              className="text-primary font-semibold hover:underline"
            >
              Política de Privacidad
            </Link>{" "}
            y nuestros{" "}
            <Link
              href="/terminos"
              className="text-primary font-semibold hover:underline"
            >
              Términos de Uso
            </Link>
            .
          </li>
        </ul>
      </section>
    </div>
  );
}
