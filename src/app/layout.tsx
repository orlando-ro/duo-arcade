import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DuoArcade — Juegos rápidos de 1 o 2 jugadores",
  description:
    "Juega gratis en un solo dispositivo o en línea con tus amigos. Gato, Conecta 4, Piedra Papel o Tijera sin registros ni descargas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="color-scheme" content="light dark" />
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
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-zinc-800 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold tracking-tight text-lg text-slate-900 dark:text-zinc-100"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Gamepad2 className="h-5 w-5" />
              </span>
              <span>DuoArcade</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-zinc-400">
              <Link
                href="/"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Juegos
              </Link>
              <Link
                href="/contacto"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Acerca de
              </Link>
              <Link
                href="/privacidad"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hidden sm:inline"
              >
                Privacidad
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 py-6 text-center text-xs text-slate-500 dark:text-zinc-400">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
            <p>© 2026 DuoArcade. Juega al instante.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contacto" className="hover:underline">
                Acerca de y Contacto
              </Link>
              <Link href="/privacidad" className="hover:underline">
                Política de Privacidad
              </Link>
              <Link href="/terminos" className="hover:underline">
                Términos de Uso
              </Link>
            </div>
          </div>
        </footer>
        <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
