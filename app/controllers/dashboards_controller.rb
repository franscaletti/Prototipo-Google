# frozen_string_literal: true

class DashboardsController < InertiaController
  before_action :require_authentication

  # Una cuenta administradora puede alternar entre su panel y el de
  # empleado sin cerrar sesión (HU Administrador #2 / RF-GEN-04 del
  # documento de requerimientos). Cualquier otra cuenta sigue restringida
  # a su propio rol: no puede abrir el panel de otro perfil.
  def show
    return unless current_user

    unless current_user.role == "administrador" || params[:role] == current_user.role
      return redirect_to dashboard_path(current_user.role)
    end

    render inertia: "dashboard/show", props: {
      role: current_user.role,
      active_role: params[:role],
      email: current_user.email,
      name: current_user.name,
      avatar_url: current_user.avatar_url
    }
  end
end
