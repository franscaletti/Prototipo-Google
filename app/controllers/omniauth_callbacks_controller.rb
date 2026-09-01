# frozen_string_literal: true

class OmniauthCallbacksController < InertiaController
  # Rails sólo exige el token CSRF en pedidos "unsafe" (POST/PUT/DELETE).
  # Este callback llega por GET desde Google, así que no aplica.

  def google_oauth2
    auth = request.env["omniauth.auth"]
    user = User.find_or_create_from_google(auth)

    reset_session
    session[:user_id] = user.id
    redirect_to dashboard_path(user.role)
  end

  # OmniAuth.config.on_failure redirige acá ante cualquier error del flujo
  # (usuario cancela el consentimiento, credenciales inválidas, etc.).
  def failure
    redirect_to login_path, inertia: {
      errors: { auth: "No pudimos verificar tu cuenta de Google. Probá de nuevo." }
    }
  end
end
