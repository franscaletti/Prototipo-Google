# frozen_string_literal: true

class SessionsController < InertiaController
  # Evita que una sesión ya iniciada vuelva a mostrar el login.
  def new
    return redirect_to dashboard_path(current_user.role) if current_user

    render inertia: "auth/login"
  end

  def destroy
    reset_session
    redirect_to login_path, notice: "La sesión se cerró correctamente."
  end
end
