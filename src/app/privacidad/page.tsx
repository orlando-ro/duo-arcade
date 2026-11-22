import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad — DuoArcade",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-8 py-12">
      <div className="border border-on-surface bg-surface-container-lowest divide-y divide-on-surface">
        <div className="p-6 sm:p-8 bg-surface-container-low">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
            {"// DOCUMENTO LEGAL 01"}
          </span>
          <h1 className="mt-2 text-2xl sm:text-4xl font-grotesk font-black uppercase tracking-tight text-on-surface">
            Política de Privacidad
          </h1>
        </div>

        <div className="p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-on-surface/85">
          <p>
            En <strong>DuoArcade</strong> respetamos tu privacidad. No
            requerimos registro, cuentas de usuario ni contraseñas para jugar.
          </p>

          <div className="space-y-2">
            <h2 className="text-base font-grotesk font-bold uppercase text-on-surface">
              1. Datos técnicos y salas de juego
            </h2>
            <p>
              Cuando usas el modo multijugador remoto, se genera un
              identificador de sesión temporal en tu navegador (
              <code className="font-mono text-xs bg-surface-container px-1.5 py-0.5 border border-on-surface/20">
                sessionStorage
              </code>
              ) para sincronizar tus movimientos en tiempo real dentro de la
              sala. No se almacena información personal identificable.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-grotesk font-bold uppercase text-on-surface">
              2. Publicidad y Cookies de terceros
            </h2>
            <p>
              Este sitio puede mostrar anuncios proporcionados por redes
              publicitarias de terceros (como Google AdSense). Dichos
              proveedores pueden utilizar cookies o tecnologías similares para
              mostrar anuncios relevantes basados en visitas anteriores a este u
              otros sitios web.
            </p>
            <p>
              Puedes gestionar o desactivar la publicidad personalizada desde la
              configuración de anuncios de Google o mediante las opciones de
              cookies de tu navegador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
