#!/bin/sh
# Runs a command with the secrets the spring container gets from compose's secrets/ files.
# Usage: backend/scripts/dev-env.sh ./mvnw spring-boot:run
set -e

if [ $# -eq 0 ]; then
  echo "usage: $0 <command> [args...]" >&2
  exit 64
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

load_secret() {
  file="$ROOT/secrets/$2"
  if [ -f "$file" ]; then
    export "$1=$(cat "$file")"
  else
    echo "dev-env: $file not found, $1 left unset" >&2
  fi
}

load_secret SPRING_DATASOURCE_PASSWORD db_password.txt
load_secret KEYCLOAK_CLIENT_SECRET keycloak_client_secret.txt
load_secret R2_ACCESS_KEY_ID r2_access_key_id.txt
load_secret R2_SECRET_ACCESS_KEY r2_secret_access_key.txt

exec "$@"
