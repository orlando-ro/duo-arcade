import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad — DuoArcade",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-5 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
        Política de Privacidad
      </h1>
      <p>
        En <strong>DuoArcade</strong> respetamos tu privacidad. No requerimos
        registro, cuentas de usuario ni contraseñas para jugar.
      </p>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
        1. Datos técnicos y salas de juego
      </h2>
      <p>
        Cuando usas el modo multijugador remoto, se genera un identificador de
        sesión temporal en tu navegador (<code>sessionStorage</code>) para
        sincronizar tus movimientos en tiempo real dentro de la sala. No se
        almacena información personal identificable.
      </p>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
        2. Publicidad y Cookies de terceros
      </h2>
      <p>
        Este sitio puede mostrar anuncios proporcionados por redes
        publicitarias de terceros (como Google AdSense). Dichos proveedores
        pueden utilizar cookies o tecnologías similares para mostrar anuncios
        relevantes basados en visitas anteriores a este u otros sitios web.
      </p>
      <p>
        Puedes gestionar o desactivar la publicidad personalizada desde la
        configuración de anuncios de Google o mediante las opciones de cookies
        de tu navegador.
      </p>
    </div>
  );
}
