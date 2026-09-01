# frozen_string_literal: true

# Cuenta persistida a partir del login con Google. El rol se decide con una
# regla deliberadamente simple (lista de emails administradores por env var):
# este prototipo valida la integración con Google en Rails, no el modelo
# final de roles y permisos de la aplicación.
class User < ApplicationRecord
  ROLES = %w[usuario administrador].freeze

  validates :email, presence: true, uniqueness: true
  validates :role, inclusion: { in: ROLES }

  def self.admin_emails
    ENV.fetch("GOOGLE_ADMIN_EMAILS", "").split(",").map { |email| email.strip.downcase }
  end

  # Crea o actualiza la cuenta a partir de los datos que devuelve OmniAuth
  # tras un login exitoso con Google (request.env["omniauth.auth"]).
  def self.find_or_create_from_google(auth)
    email = auth.info.email.to_s.downcase
    role = admin_emails.include?(email) ? "administrador" : "usuario"

    user = find_or_initialize_by(email: email)
    user.google_uid = auth.uid
    user.name = auth.info.name
    user.avatar_url = auth.info.image
    user.role = role
    user.save!
    user
  end
end
