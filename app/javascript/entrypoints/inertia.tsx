import { createInertiaApp } from '@inertiajs/react'

/**
 * Punto de arranque de las páginas React servidas por Rails mediante Inertia.
 * La resolución de `pages` es automática: por ejemplo, `auth/login` carga
 * `app/javascript/pages/auth/login.tsx`.
 */
void createInertiaApp({
  pages: "../pages",

  // Ayuda a detectar efectos secundarios inseguros durante el desarrollo.
  strictMode: true,

  defaults: {
    form: {
      forceIndicesArrayFormatInFormData: false,
      withAllErrors: true,
    },
    visitOptions: () => {
      return { queryStringArrayFormat: "brackets" }
    },
  },
}).catch((error) => {
  if (document.getElementById("app")) {
    throw error
  } else {
    console.error(
      "Missing root element.\n\n" +
      "El entrypoint de Inertia se cargó sin encontrar su nodo raíz.\n" +
      'Revisá que el layout renderice el contenedor de la página Inertia.',
    )
  }
})
