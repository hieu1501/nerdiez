#!/bin/sh
set -e

if [ -f /run/secrets/db_password ]; then
  export SPRING_DATASOURCE_PASSWORD="$(cat /run/secrets/db_password)"
fi

if [ -f /run/secrets/keycloak_client_secret ]; then
  export SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_KEYCLOAK_CLIENT_SECRET="$(cat /run/secrets/keycloak_client_secret)"
fi

if [ -f /run/secrets/r2_access_key_id ]; then
  export R2_ACCESS_KEY_ID="$(cat /run/secrets/r2_access_key_id)"
fi

if [ -f /run/secrets/r2_secret_access_key ]; then
  export R2_SECRET_ACCESS_KEY="$(cat /run/secrets/r2_secret_access_key)"
fi

exec java -jar application.jar "$@"
