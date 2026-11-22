import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Acerca de y Contacto — DuoArcade",
  description:
    "Conoce más sobre DuoArcade, nuestra plataforma gratuita de minijuegos para 1 o 2 jugadores en un mismo dispositivo o en línea.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
        Acerca de DuoArcade y Contacto
      </h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
          ¿Qué es DuoArcade?
        </h2>
        <p>
          <strong>DuoArcade</strong> es un portal web de minijuegos clásicos de
          mesa y estrategia pensado para partidas rápidas desde cualquier
          navegador móvil o de escritorio, sin necesidad de descargar
          aplicaciones ni crear cuentas de usuario.
        </p>
        <p>
          Cada juego del catálogo incluye tres modalidades: entrenamiento
          individual contra inteligencia artificial (<strong>1 Jugador</strong>
          ), partidas compartiendo el mismo teléfono o tablet (
          <strong>2P Local</strong>) y salas multijugador en tiempo real
          mediante enlaces compartibles por WhatsApp, Discord o cualquier
          mensajero (<strong>2P Remoto</strong>).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
          Contacto y soporte
        </h2>
        <p>
          Si tienes sugerencias de nuevos juegos, encontraste algún error
          técnico o deseas comunicarte con el equipo responsable del proyecto,
          puedes contactarnos a través de:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong>Repositorio oficial y reporte de issues (GitHub):</strong>{" "}
            <a
              href="https://github.com/orlando-ro/duo-arcade/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              github.com/orlando-ro/duo-arcade/issues
            </a>
          </li>
          <li>
            <strong>Políticas del sitio:</strong> puedes consultar nuestra{" "}
            <Link
              href="/privacidad"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Política de Privacidad
            </Link>{" "}
            y nuestros{" "}
            <Link
              href="/terminos"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
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
