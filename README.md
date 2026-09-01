# Prototipo: Integración con Google

Prototipo de la Segunda Fase del [Plan de Prototipos](https://docs.google.com/document/d/18CiQdJ76j2-vrijp-iGfn1UJRLI2luYMfRx4_g9HfAw) (Grupo 2, GoGrow). Base visual heredada del [prototipo de UI de Pablo Caffaro](https://github.com/PabloCaffaro/gogrow-react-prototype) (Rails + Inertia.js + React + shadcn/ui), donde el botón "Continuar con Google" existía pero estaba deshabilitado. Acá ese login es real.

## Objetivo del prototipo

Comprobar la viabilidad y el esfuerzo de implementar autenticación con Google en Ruby on Rails, con dos roles de usuario (Usuario y Administrador) que acceden a información distinta según su rol. Ver el detalle en el Plan de Prototipos, sección "Integración con Google (Ruby on Rails)".

**Criterio de éxito:** un usuario se autentica correctamente con Google, el sistema identifica su rol y le permite acceder únicamente a la información correspondiente. Además hay que registrar el esfuerzo y el tiempo insumido, para tener mejor criterio de estimación de cara a las próximas iteraciones.

## Cómo funciona el rol

Para este prototipo el rol se resuelve con una regla simple: los emails listados en `GOOGLE_ADMIN_EMAILS` (variable de entorno) entran como **administrador**; cualquier otra cuenta de Google que loguee entra como **usuario**. No es el modelo final de roles/permisos del producto (para eso está la Fase de Construcción) — acá el foco es medir la integración con Google en sí.

Una cuenta administradora, además, puede alternar entre el panel de administrador y el de usuario sin cerrar sesión, con un botón en su propio panel ("Ver como usuario" / "Ver como administrador"). Esto responde a la Historia de Usuario del Administrador #2 y a RF-GEN-04 (documento de Requerimientos), que piden que una misma cuenta pueda operar con ambos perfiles. Cualquier cuenta que no sea administradora sigue restringida a su propio panel.

## Tecnologías

- Ruby 3.3.12 y Rails 8.1
- React 19 + TypeScript, Inertia.js 3, Vite 8
- Tailwind CSS 4 + shadcn/ui (mismos componentes que el prototipo de UI)
- PostgreSQL
- OmniAuth + `omniauth-google-oauth2` para el login real
- Docker Compose

## 1. Crear las credenciales OAuth en Google Cloud Console

1. Entrar a [Google Cloud Console](https://console.cloud.google.com/) y crear (o elegir) un proyecto.
2. Ir a **APIs & Services → OAuth consent screen** y configurarla como tipo "External" (o "Internal" si es un Workspace de GoGrow), con el nombre de la app y un email de soporte.
3. Ir a **APIs & Services → Credentials → Create Credentials → OAuth client ID**, tipo **Web application**.
4. Cargar:
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:** `http://localhost:3000/auth/google_oauth2/callback`
5. Guardar el **Client ID** y el **Client Secret** que genera.

> **Nota:** no hace falta agregar "usuarios de prueba" para este prototipo. Google exige eso solo
> cuando la app pide scopes sensibles; como acá solo pedimos identidad básica
> (`email,profile`), cualquier cuenta de Google puede loguearse sin estar en esa lista, sin ver
> el aviso de "app no verificada" y sin que el login expire a los 7 días. Fuente:
> [Manage App Audience — Google Cloud](https://support.google.com/cloud/answer/15549945?hl=en).
> Esto va a dejar de aplicar el día que se pidan scopes de Calendar/Drive para la sincronización
> real, ahí sí va a hacer falta la lista de test users (o verificar la app).

## 2. Configurar las variables de entorno

```powershell
copy .env.example .env
```

Completar en `.env`:

```
GOOGLE_CLIENT_ID=<el client id del paso anterior>
GOOGLE_CLIENT_SECRET=<el client secret del paso anterior>
GOOGLE_ADMIN_EMAILS=tu-cuenta@gmail.com
```

`.env` está en `.gitignore`: nunca se commitea.

## 3. Levantar el proyecto

Requiere Docker Desktop activo.

```powershell
docker compose up --build
```

La primera vez que corre, crea la base (`db:prepare`) al bootear Rails. Si hace falta correrlo a mano:

```powershell
docker compose exec web bin/rails db:prepare
```

Abrir <http://localhost:3000>.

Para detener el servicio:

```powershell
docker compose down
```

## Probarlo si te pasaron este repo (sin crear tus propias credenciales de Google)

Esto es para cualquier compañero del equipo que va a levantar el prototipo en su propia máquina para probarlo, sin tener que pasar por el paso 1 (crear un OAuth Client en Google Cloud Console).

1. **Requisito único: Docker Desktop instalado y corriendo.** No hace falta instalar Ruby, Node ni Postgres — todo corre en contenedores.
 Sirve el mismo Client ID/Secret para todo el equipo: el redirect URI que tiene registrado (`http://localhost:3000/auth/google_oauth2/callback`) apunta a "tu propia máquina" sin importar de quién sea, así que no hace falta que cada uno cree el suyo en Google Cloud.
2. **Crear tu `.env`** Completar `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` con los valores que envié. Dejá `GOOGLE_ADMIN_EMAILS` con el email que ya está a menos que quieras que tu propia cuenta también sea administradora en tu copia local — en ese caso, agregá tu email a la lista, separado por coma (`GOOGLE_ADMIN_EMAILS=admin@ejemplo.com,tu-email@gmail.com`). Cada uno tiene su `.env` local, así que esto no afecta a nadie más del equipo.
3. **Levantar el proyecto** (paso 3 de arriba): `docker compose up --build`, y la primera vez `docker compose exec web bin/rails db:prepare`.
4. **Entrar a <http://localhost:3000> y tocar "Continuar con Google"**, logueándote con tu propia cuenta de Google (no hace falta que esté en ninguna lista de "usuarios de prueba" — ver la nota del paso 1). Si tu email no está en `GOOGLE_ADMIN_EMAILS` vas a entrar como **usuario**; si sí está, además vas a ver el botón para alternar al panel de administrador y volver.

## Caso de uso implementado

1. La persona abre `/` y ve el login con el botón "Continuar con Google".
2. Al hacer click, el navegador hace un POST (protegido con CSRF) a `/auth/google_oauth2`, que redirige a la pantalla de consentimiento real de Google.
3. Google redirige de vuelta a `/auth/google_oauth2/callback` con el resultado.
4. Rails busca o crea el `User` por email, le asigna rol según `GOOGLE_ADMIN_EMAILS`, crea la sesión y redirige a `/panel/usuario` o `/panel/administrador`.
5. Cada panel sólo es accesible por su rol: si alguien intenta entrar al panel del otro rol, se lo redirige al suyo — excepto la cuenta administradora, que puede ver ambos.
6. Si quien inició sesión es administrador, en su panel aparece un botón para pasar al panel de usuario y viceversa, sin volver a loguearse.
7. "Cerrar sesión" elimina la sesión y vuelve al login.
8. Si el login falla (la persona cancela el consentimiento, etc.), vuelve al login con un mensaje de error.

## Archivos principales

- `app/javascript/pages/auth/login.tsx`: pantalla de login (visual heredada del prototipo de UI).
- `app/javascript/pages/dashboard/show.tsx`: panel adaptado al rol.
- `app/controllers/omniauth_callbacks_controller.rb`: recibe el resultado de Google, crea/actualiza el usuario y la sesión.
- `app/controllers/sessions_controller.rb` / `app/controllers/dashboards_controller.rb`: login y autorización por rol.
- `app/models/user.rb`: persistencia del usuario y asignación de rol.
- `config/initializers/omniauth.rb`: configuración de la estrategia de Google.

## Comandos útiles

```powershell
# Consola Rails
docker compose exec web bin/rails console

# Ver quién quedó cargado y con qué rol
docker compose exec web bin/rails runner "User.all.each { |u| puts [u.email, u.role].join(' - ') }"

# Logs
docker compose logs -f web
```

## Registro de esfuerzo

Horas Estimadas: 10hs 
Horas de Trabajo: 12hs

Dificultades encontradas hasta ahora:

- `omniauth-google-oauth2` no se auto-requiere con el nombre del gem vía Bundler; hace falta un
  `require "omniauth-google-oauth2"` explícito en el initializer (si no, `OmniAuth::Builder`
  tira "Could not find matching strategy").
- El botón de Google no puede ser una visita Inertia (XHR): tiene que ser un `<form>` con POST
  nativo, porque OmniAuth necesita redirigir el navegador entero a `accounts.google.com`, y
  `omniauth-rails_csrf_protection` exige que ese POST lleve el token CSRF.
- Con Docker Compose, un volumen nombrado (`bundle_cache`/`node_modules`) creado en un intento
  anterior puede tapar las gemas/paquetes recién instalados en una imagen reconstruida. Si algo
  que se ve bien en el log del `build` da error de "gem/paquete no encontrado" al arrancar,
  probar `docker compose down -v` antes de `up --build`.
- No hace falta agregar "usuarios de prueba" en Google Cloud para este prototipo (ver nota en la
  sección 1) — con scopes básicos, cualquier cuenta de Google puede loguearse igual.

## Pendiente / fuera de alcance de este prototipo

- Modelo final de permisos por rol (este prototipo sólo separa Usuario/Administrador a nivel de acceso al panel).
- Persistir el modelo de roles múltiples de la app real (ADR04: tablas de perfil separadas por rol). Acá el cambio de panel es sólo de la vista activa en la sesión, no un dato del usuario en la base.
- Restringir el login a un dominio corporativo específico de Google Workspace.
- Despliegue en AWS (no es necesario para este prototipo).
