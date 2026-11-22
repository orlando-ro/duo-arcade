# DuoArcade — Web App de Juegos 1 o 2 Jugadores (Vercel + Supabase + AdSense)

Aplicación web construida con **Next.js (App Router)**, **TypeScript**, **Tailwind CSS** y **Supabase Realtime**.

## Características
- **3 juegos incluidos:**
  - **Gato (Tres en Raya)** (`1P vs IA`, `2P Local`, `2P Remoto`)
  - **Conecta 4** (`1P vs IA`, `2P Local`, `2P Remoto`)
  - **Piedra, Papel o Tijera** (`1P vs IA`, `2P Local` con pantalla oculta, `2P Remoto` con elección secreta simultánea)
- **Multijugador remoto sin base de datos:** usa **Supabase Realtime (Broadcast + Presence)** mediante enlaces compartibles (`?sala=XXXXXX`).
  - *Modo Demo automático:* si aún no configuras Supabase, el modo remoto funciona entre 2 pestañas del mismo navegador usando `BroadcastChannel` para que puedas probarlo al instante.
- **Espacios listos para monetización (`<AdSlot />`):**
  - Banner superior/inferior (`leaderboard` en desktop / `mobile-banner` en móvil)
  - Bloque lateral `300x250` (`rectangle`) en cada juego
  - Anuncio post-partida (`interstitial`) al terminar una ronda
  - Páginas legales (`/privacidad` y `/terminos`) requeridas para aprobación de Google AdSense.

## Desarrollo local
```bash
npm install --ignore-scripts
npm run dev
```

## Configurar Multijugador Remoto (Supabase)
1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. Ve a **Project Settings → API** y copia `Project URL` y `anon public key`.
3. Crea un archivo `.env.local` basado en `.env.example`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```
   *(No necesitas crear ninguna tabla SQL; Realtime Broadcast y Presence funcionan directo.)*

## Configurar Anuncios (Google AdSense)
1. Agrega tu ID de editor en `.env.local` (y en Vercel Environment Variables):
   ```env
   NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
   ```
2. Pasa el `slotId` correspondiente en los componentes `<AdSlot format="..." slotId="1234567890" />`.

## Despliegue en Vercel
1. Sube este repositorio a GitHub.
2. Impórtalo en [vercel.com](https://vercel.com).
3. Añade las variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_ADSENSE_CLIENT`) en **Settings → Environment Variables**.
4. Haz clic en **Deploy**.
