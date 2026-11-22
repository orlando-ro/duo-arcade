import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "DUOARCADE — International Typographic Arcade (1P / 2P)",
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
        {/* HEADER: International Typographic Minimalist Navigation */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-on-surface/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16 sm:h-20">
            {/* Brand Wordmark */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2.5 group"
              >
                <span className="w-6 h-6 bg-primary flex items-center justify-center font-grotesk font-bold text-white text-sm leading-none select-none">
                  +
                </span>
                <span className="font-grotesk font-bold text-xl sm:text-2xl tracking-tighter uppercase text-on-surface group-hover:text-primary transition-colors">
                  DUOARCADE<span className="text-primary font-normal">®</span>
                </span>
              </Link>
              <span className="hidden md:inline-block font-mono text-[10px] tracking-widest text-on-surface/50 border-l border-on-surface/20 pl-3 uppercase">
                SYS.EDITION // CH-8001
              </span>
            </div>

            {/* Stark Nav Links */}
            <nav className="hidden md:flex items-center space-x-1 font-mono text-xs uppercase tracking-wider text-on-surface">
              <Link
                href="/"
                className="px-4 py-2 font-semibold text-on-surface hover:text-primary border-b-2 border-transparent hover:border-primary transition-all"
              >
                01 / Juegos
              </Link>
              <Link
                href="/salas"
                className="px-4 py-2 font-semibold text-on-surface hover:text-primary border-b-2 border-transparent hover:border-primary transition-all"
              >
                02 / Sala Remota
              </Link>
              <Link
                href="/#como-funciona"
                className="px-4 py-2 text-on-surface/70 hover:text-on-surface border-b-2 border-transparent hover:border-on-surface/30 transition-all"
              >
                03 / Mecánicas
              </Link>
              <Link
                href="/contacto"
                className="px-4 py-2 text-on-surface/70 hover:text-on-surface border-b-2 border-transparent hover:border-on-surface/30 transition-all"
              >
                04 / Manifiesto
              </Link>
            </nav>

            {/* Minimal Control Actions */}
            <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs">
              <Link
                href="/salas"
                className="inline-flex items-center gap-2 bg-on-surface text-surface-container-lowest px-3.5 py-2 sm:px-4 sm:py-2.5 font-mono text-xs font-semibold tracking-wider hover:bg-primary hover:text-white transition-colors uppercase border border-on-surface"
              >
                <span className="w-1.5 h-1.5 bg-primary" />
                <span>+ Crear Sala</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full">{children}</main>

        {/* FOOTER: Pure Swiss Typography Grid */}
        <footer className="w-full border-t-2 border-on-surface bg-surface-container-lowest mt-16 font-mono">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 pb-8 border-b border-on-surface/15">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-primary flex items-center justify-center text-white text-[10px] font-bold">
                    +
                  </span>
                  <span className="font-grotesk font-bold text-lg tracking-tight uppercase text-on-surface">
                    DUOARCADE
                  </span>
                </div>
                <p className="text-xs text-on-surface/60 max-w-sm font-inter leading-relaxed">
                  Catálogo minimalista de juegos clásicos de estrategia para 1 o 2
                  jugadores. Estética suiza racionalista y tipografía estricta.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
                <div className="space-y-2">
                  <span className="font-bold text-on-surface uppercase tracking-wider text-[11px] block">
                    ÍNDICE
                  </span>
                  <div className="flex flex-col space-y-1.5 text-on-surface/70">
                    <Link className="hover:text-primary transition-colors" href="/">
                      Juegos (05)
                    </Link>
                    <Link className="hover:text-primary transition-colors" href="/salas">
                      Salas P2P
                    </Link>
                    <Link
                      className="hover:text-primary transition-colors"
                      href="/#como-funciona"
                    >
                      Protocolo
                    </Link>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-on-surface uppercase tracking-wider text-[11px] block">
                    LEGAL
                  </span>
                  <div className="flex flex-col space-y-1.5 text-on-surface/70">
                    <Link
                      className="hover:text-primary transition-colors"
                      href="/contacto"
                    >
                      Acerca de y Contacto
                    </Link>
                    <Link
                      className="hover:text-primary transition-colors"
                      href="/privacidad"
                    >
                      Privacidad
                    </Link>
                    <Link
                      className="hover:text-primary transition-colors"
                      href="/terminos"
                    >
                      Términos
                    </Link>
                  </div>
                </div>

                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <span className="font-bold text-on-surface uppercase tracking-wider text-[11px] block">
                    ESTÁNDAR
                  </span>
                  <span className="text-[11px] text-on-surface/60 block leading-tight font-inter">
                    DIN EN ISO 9241 / SWISS TYPOGRAPHIC GRID
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-on-surface/50">
              <div>
                © 2026 DUOARCADE ARCHIVE. JUEGA AL INSTANTE SIN REGISTROS.
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary" />
                <span>SWISS INTERNATIONAL EDITION // REALTIME ENGINE</span>
              </div>
            </div>
          </div>
        </footer>
        <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
