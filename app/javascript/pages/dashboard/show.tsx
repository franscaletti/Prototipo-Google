/**
 * Panel post-login. Su único propósito es demostrar que la integración con
 * Google resuelve identidad y rol correctamente (criterio de éxito del
 * prototipo, no una UI final del producto).
 */
import { Head, Link } from '@inertiajs/react'
import { ArrowLeftRight, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react'
import type { ComponentType } from 'react'

import { Button, buttonVariants } from '@/components/ui/actions/button'
import { readAuthenticityToken } from '@/lib/utils'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card'
import styles from './show.module.css'

type Role = 'usuario' | 'administrador'

type Props = {
  // Rol real de la cuenta (decide si puede ver el botón de cambio de panel).
  role: Role
  // Panel que se está mostrando ahora mismo: para una cuenta administradora
  // puede diferir de `role` cuando eligió "ver como usuario".
  active_role: Role
  email: string
  name?: string | null
  avatar_url?: string | null
}

const ROLE_COPY: Record<Role, { title: string; description: string; icon: ComponentType<{ 'aria-hidden'?: string }> }> = {
  usuario: {
    title: 'Panel de Usuario',
    description: 'Vista de empleado: pedidos, subsidios y consumos (fuera del alcance de este prototipo).',
    icon: UserIcon,
  },
  administrador: {
    title: 'Panel de Administrador',
    description: 'Vista de RRHH: gestión de usuarios, permisos y operación (fuera del alcance de este prototipo).',
    icon: ShieldCheck,
  },
}

export default function Dashboard({ role, active_role, email, name, avatar_url }: Props) {
  const copy = ROLE_COPY[active_role]
  const Icon = copy.icon
  // El botón sólo tiene sentido para la cuenta administradora, y siempre
  // ofrece pasar al panel contrario del que se está viendo ahora.
  const otherRole: Role = active_role === 'administrador' ? 'usuario' : 'administrador'

  return (
    <>
      <Head title={copy.title} />
      <main className={styles.page}>
        <Card className={styles.card}>
          <CardHeader className={styles.header}>
            <div className={styles.identity}>
              {avatar_url ? (
                <img src={avatar_url} alt="" className={styles.avatar} referrerPolicy="no-referrer" />
              ) : (
                <span className={styles.avatarFallback}><Icon aria-hidden="true" /></span>
              )}
              <div>
                <CardTitle>{copy.title}</CardTitle>
                <CardDescription>{name ?? email}</CardDescription>
              </div>
            </div>
            <CardAction className={styles.actions}>
              {role === 'administrador' && (
                /*
                  Esto sí es una visita Inertia normal (GET, vía Link), no un
                  <form>: a diferencia del logout, acá no hay reset_session
                  de por medio ni token CSRF que perder, sólo estamos
                  cambiando qué panel se renderiza para la misma sesión.
                */
                <Link
                  href={`/panel/${otherRole}`}
                  as="button"
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  <ArrowLeftRight aria-hidden="true" />
                  Ver como {otherRole}
                </Link>
              )}
              {/*
                Navegación de página completa (no una visita Inertia): así el
                próximo /login que carga el navegador trae un token CSRF
                fresco, ligado a la sesión nueva que deja reset_session.
                Con router.delete() (XHR de Inertia) el <head> nunca se
                recarga, y el login siguiente queda con un token viejo -> 500
                ActionController::InvalidAuthenticityToken.
              */}
              <form action="/logout" method="post">
                <input type="hidden" name="_method" value="delete" />
                <input type="hidden" name="authenticity_token" value={readAuthenticityToken()} />
                <Button type="submit" variant="outline" size="sm">
                  <LogOut aria-hidden="true" />
                  Cerrar sesión
                </Button>
              </form>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className={styles.description}>{copy.description}</p>
            <dl className={styles.meta}>
              <div>
                <dt>Cuenta de Google</dt>
                <dd>{email}</dd>
              </div>
              <div>
                {/*
                  "Panel actual" y no "Rol asignado": para una cuenta
                  administradora puede no coincidir (ver como usuario sin
                  dejar de ser administrador).
                */}
                <dt>Panel actual</dt>
                <dd><span className={styles.roleBadge} data-role={active_role}>{active_role}</span></dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
