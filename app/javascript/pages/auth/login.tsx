/**
 * Login real del prototipo: la única forma de entrar es con la cuenta
 * corporativa de Google. Visual heredado del prototipo de UI (Pablo
 * Caffaro), donde este mismo botón existía pero estaba deshabilitado.
 */
import { Head } from '@inertiajs/react'
import { UtensilsCrossed } from 'lucide-react'

import { GoogleMark } from '@/components/branding/google-mark'
import { readAuthenticityToken } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/feedback/alert'
import styles from './login.module.css'

type Props = {
  errors?: { auth?: string }
}

const productBenefits = [
  'Menús semanales en un solo lugar',
  'Beneficio y pedidos siempre visibles',
  'Pagos organizados por proveedor',
]

export default function Login({ errors }: Props) {
  return (
    <>
      <Head title="Iniciar sesión" />
      <main className={styles.page}>
        <div className={styles.layout}>
          {/* Panel editorial: sólo aparece en pantallas amplias. */}
          <section className={styles.introduction} aria-labelledby="product-title">
            <div className={styles.brand}>
              <span className={styles.brandMark}><UtensilsCrossed aria-hidden="true" /></span>
              <span>GoGrow Meals</span>
            </div>

            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Prototipo · Integración con Google</p>
              <h1 id="product-title">Organizá tus viandas en un solo lugar.</h1>
              <p>
                Ingresá con tu cuenta corporativa de Google para acceder al panel
                correspondiente a tu rol.
              </p>
            </div>

            <ul className={styles.benefitList}>
              {productBenefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>

            <p className={styles.introductionFooter}>Alimentación que acompaña tu jornada.</p>
          </section>

          {/* Panel funcional: marca móvil y acceso con Google. */}
          <section className={styles.accessSection}>
            <div className={styles.mobileBrand}>
              <span className={styles.brandMark}><UtensilsCrossed aria-hidden="true" /></span>
              <span>GoGrow Meals</span>
            </div>

            <Card className={styles.loginCard}>
              <CardHeader className={styles.cardHeader}>
                <p className={styles.cardEyebrow}>Acceso a tu cuenta</p>
                <CardTitle className={styles.cardTitle}>Bienvenido a GoGrow</CardTitle>
                <CardDescription className={styles.cardDescription}>
                  Iniciá sesión con tu cuenta de Google para continuar.
                </CardDescription>
              </CardHeader>

              <CardContent className={styles.cardContent}>
                {errors?.auth && (
                  <Alert variant="destructive" role="alert" className={styles.authAlert}>
                    <AlertTitle>No pudimos iniciar sesión</AlertTitle>
                    <AlertDescription>{errors.auth}</AlertDescription>
                  </Alert>
                )}

                {/*
                  Navegación de página completa (no una visita Inertia): OmniAuth
                  necesita redirigir el navegador a accounts.google.com, y
                  omniauth-rails_csrf_protection exige que el pedido sea POST.
                */}
                <form action="/auth/google_oauth2" method="post">
                  <input type="hidden" name="authenticity_token" value={readAuthenticityToken()} />
                  <button type="submit" className={styles.googleButton}>
                    <GoogleMark />
                    Continuar con Google
                  </button>
                </form>
              </CardContent>
            </Card>

            <p className={styles.privacyCopy}>Acceso exclusivo para colaboradores de GoGrow.</p>
          </section>
        </div>
      </main>
    </>
  )
}
