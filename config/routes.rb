Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  root "sessions#new"
  get "login", to: "sessions#new", as: :login
  delete "logout", to: "sessions#destroy", as: :logout

  # El GET a /auth/google_oauth2 (inicio del flujo) lo intercepta el middleware
  # de OmniAuth antes de llegar al router; sólo necesitamos rutear el callback
  # y el camino de falla.
  get "auth/google_oauth2/callback", to: "omniauth_callbacks#google_oauth2"
  get "auth/failure", to: "omniauth_callbacks#failure"

  get "panel/:role", to: "dashboards#show", as: :dashboard,
      constraints: { role: /usuario|administrador/ }
end
