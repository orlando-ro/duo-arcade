# DuoArcade

**DuoArcade** es una aplicación web de minijuegos rápidos para **1 o 2 jugadores**, diseñada para jugar al instante desde el navegador sin registros ni descargas.

🔗 **Demo en vivo:** https://duo-arcade-pearl.vercel.app

## Juegos incluidos

- **Gato (Tres en Raya):** tablero clásico 3×3 con marcador de victorias y empates.
- **Conecta 4:** tablero 7×6 con detección de línea ganadora en horizontal, vertical y diagonal.
- **Piedra, Papel o Tijera:** duelo al mejor de 5 rondas con pantalla oculta en modo local y elección secreta simultánea en modo remoto.

## Modos de juego

- **1 Jugador:** partida rápida contra la IA.
- **2 Jugadores Local:** juego por turnos en un mismo dispositivo.
- **2 Jugadores Remoto:** salas en tiempo real mediante enlace compartible (`?sala=CODIGO`).

## Stack tecnológico

- **Framework:** Next.js (App Router) + TypeScript
- **Estilos:** Tailwind CSS
- **Tiempo real:** Supabase Realtime (Broadcast & Presence)
- **Despliegue:** Vercel
