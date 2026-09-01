# syntax = docker/dockerfile:1
# Dockerfile de DESARROLLO (no para produccion). Coincide con docker-compose.yml,
# que monta el codigo en /app como volumen para que los cambios se vean sin rebuild.

ARG RUBY_VERSION=3.3.12
FROM docker.io/library/ruby:$RUBY_VERSION-slim

WORKDIR /app

# Paquetes de sistema para compilar gems nativas y correr la app
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential \
      libpq-dev \
      libyaml-dev \
      curl \
      git \
      pkg-config \
      libvips \
      postgresql-client \
      nodejs \
      npm && \
    npm install -g yarn && \
    rm -rf /var/lib/apt/lists/*

# Instala TODAS las gems, incluyendo los grupos :development y :test
# (el Dockerfile de produccion de Rails los excluye a proposito, por eso faltaban)
COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

EXPOSE 3000

CMD ["bin/rails", "server", "-b", "0.0.0.0"]
