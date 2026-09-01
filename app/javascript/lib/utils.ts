import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina clases opcionales (`clsx`) y resuelve conflictos entre utilidades de
 * Tailwind (`twMerge`).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Lee el token CSRF que Rails deja en el <head> (csrf_meta_tags). Hace falta
 * para los <form> nativos (no-Inertia) que necesitan navegación de página
 * completa, como el login con Google o el logout.
 */
export function readAuthenticityToken() {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? ''
}

