import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "DuoArcade — Juegos rápidos de 1 o 2 jugadores",
  description:
    "Juega gratis en un solo dispositivo o en línea con tus amigos. Gato, Conecta 4, Piedra Papel o Tijera, Memoria y Puntos y Cajas sin registros ni descargas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <html lang="es" className="h-full antialiased">
      <head>
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {adsenseClient ? (
          <>
            <meta name="google-adsense-account" content={adsenseClient} />
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
              crossOrigin="anonymous"
            />
          </>
        ) : null}
      </head>
      <body className="min-h-full flex flex-col bg-background font-inter text-on-surface selection:bg-primary selection:text-white border-t-4 border-primary">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-on-surface/15">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="w-6 h-6 bg-primary text-white font-grotesk font-bold text-sm flex items-center justify-center leading-none select-none">
                +
              </span>
              <span className="font-grotesk font-bold text-xl tracking-tighter uppercase text-on-surface group-hover:text-primary transition-colors">
                DUOARCADE
              </span>
            </Link>

            <nav className="hidden sm:flex items-center gap-6 font-mono text-xs uppercase tracking-wider text-on-surface/80">
              <Link
                href="/"
                className="hover:text-primary transition-colors"
              >
                Juegos
              </Link>
              <Link
                href="/salas"
                className="hover:text-primary transition-colors"
              >
                Salas
              </Link>
              <Link
                href="/contacto"
                className="hover:text-primary transition-colors"
              >
                Acerca de
              </Link>
            </nav>

            <Link
              href="/salas"
              className="bg-on-surface text-surface-container-lowest hover:bg-primary hover:text-white px-3.5 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              + Crear sala
            </Link>
          </div>
        </header>

        <main className="flex-1 w-full">{children}</main>

        <footer className="w-full border-t border-on-surface/15 bg-surface-container-lowest mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-on-surface/70">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-primary text-white flex items-center justify-center text-[10px] font-bold leading-none">
                +
              </span>
              <span className="font-grotesk font-bold uppercase text-on-surface">
                DUOARCADE
              </span>
              <span className="text-on-surface/50">© 2026</span>
            </div>

            <div className="flex items-center gap-6 uppercase">
              <Link
                href="/contacto"
                className="hover:text-primary transition-colors"
              >
                Acerca de
              </Link>
              <Link
                href="/privacidad"
                className="hover:text-primary transition-colors"
              >
                Privacidad
              </Link>
              <Link
                href="/terminos"
                className="hover:text-primary transition-colors"
              >
                Términos
              </Link>
            </div>
          </div>
        </footer>
        <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
