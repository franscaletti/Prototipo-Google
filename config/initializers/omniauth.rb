# frozen_string_literal: true

# Bundler no auto-requiere este gem con el nombre correcto (por el guion
# entre "google" y "oauth2" en "omniauth-google-oauth2" vs. cómo Bundler
# arma la ruta a partir del nombre del gem), así que hay que pedirlo a mano.
# Sin esto, OmniAuth::Builder no encuentra la estrategia :google_oauth2.
require "omniauth-google-oauth2"

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2,
    ENV.fetch("GOOGLE_CLIENT_ID", nil),
    ENV.fetch("GOOGLE_CLIENT_SECRET", nil),
    scope: "email,profile",
    prompt: "select_account",
    image_aspect_ratio: "square",
    image_size: 200
end

# omniauth-rails_csrf_protection ya exige POST en /auth/:provider; esto evita
# además el warning de OmniAuth por permitir GET en desarrollo.
OmniAuth.config.allowed_request_methods = [:post]
OmniAuth.config.silence_get_warning = true

# Ante cualquier error (usuario cancela el consentimiento, credenciales
# inválidas, etc.) OmniAuth redirige acá en lugar de levantar una excepción.
OmniAuth.config.on_failure = proc do |env|
  OmniauthCallbacksController.action(:failure).call(env)
end
