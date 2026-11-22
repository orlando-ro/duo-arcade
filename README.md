# DuoArcade

**DuoArcade** es una aplicación web de minijuegos rápidos para **1 o 2 jugadores** (en un mismo dispositivo o en remoto), desarrollada como un **proyecto *vibecodeado* para probar Google Antigravity**.

🔗 **Demo en vivo:** https://duo-arcade-pearl.vercel.app

## Juegos y modos

- **Gato (Tres en Raya):** tablero 3×3 con IA táctica (detección de victoria/bloqueo) en 1P.
- **Conecta 4:** matriz 7×6 con evaluación de amenazas en 4 direcciones (horizontal, vertical y diagonales).
- **Piedra, Papel o Tijera:** al mejor de 5 rondas con pantalla de transición oculta en 2P local y sincronización simultánea de jugadas secretas en 2P remoto.

Cada juego soporta **1P vs IA**, **2P Local** (Pass & Play) y **2P Remoto** mediante salas con enlace compartible (`?sala=CODIGO`).

## Arquitectura y detalles técnicos

- **Frontend:** Next.js 16 (App Router + Turbopack), React 19, TypeScript y Tailwind CSS v4.
- **Multijugador en tiempo real sin base de datos:** implementado sobre **Supabase Realtime** usando canales efímeros (`Broadcast` para movimientos/revanchas y `Presence` para detectar conexión y abandono del rival), con fallback automático a `BroadcastChannel` para pruebas locales entre pestañas cuando no hay credenciales configuradas.
- **UI y estándares web:** soporte de tema claro/oscuro automático con `color-scheme: light dark` y tokens `light-dark()`, modales accesibles con el elemento nativo `<dialog>` (`showModal()`) y arquitectura modular de espacios publicitarios (`<AdSlot />`) compatible con Google AdSense.
- **Infraestructura:** hospedado en **Vercel** con despliegue continuo desde GitHub y variables de entorno gestionadas por ambiente.
