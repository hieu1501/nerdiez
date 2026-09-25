#!/bin/sh
set -e

if [ -f /run/secrets/keycloak_admin_password ]; then
  export KC_BOOTSTRAP_ADMIN_PASSWORD="$(cat /run/secrets/keycloak_admin_password)"
fi

if [ -f /run/secrets/keycloak_db_password ]; then
  export KC_DB_PASSWORD="$(cat /run/secrets/keycloak_db_password)"
fi

if [ -f /run/secrets/google_idp_client_secret ]; then
  GOOGLE_IDP_CLIENT_SECRET="$(cat /run/secrets/google_idp_client_secret)"
fi

if [ -f /run/secrets/github_idp_client_secret ]; then
  GITHUB_IDP_CLIENT_SECRET="$(cat /run/secrets/github_idp_client_secret)"
fi

if [ -f /run/secrets/keycloak_client_secret ]; then
  KEYCLOAK_CLIENT_SECRET="$(cat /run/secrets/keycloak_client_secret)"
fi

# Native --import-realm doesn't support env-var substitution, so resolve it ourselves.
escape_sed() {
  printf '%s' "$1" | sed -e 's/[\/&]/\\&/g'
}

# "a,b,c" -> "a","b","c" (each item quoted, comma-joined) -- for splicing straight into a
# JSON array in the template, e.g. "redirectUris": [__PLACEHOLDER__]
# (POSIX sh only -- the base image has no awk.)
csv_to_json_array_items() {
  out=""
  old_ifs="$IFS"
  IFS=','
  for item in $1; do
    [ -z "$item" ] && continue
    if [ -n "$out" ]; then
      out="$out,\"$item\""
    else
      out="\"$item\""
    fi
  done
  IFS="$old_ifs"
  printf '%s' "$out"
}

KC_CLIENT_REDIRECT_URIS_JSON="$(csv_to_json_array_items "${KC_CLIENT_REDIRECT_URIS:-http://localhost/login/oauth2/code/keycloak}")"
KC_CLIENT_WEB_ORIGINS_JSON="$(csv_to_json_array_items "${KC_CLIENT_WEB_ORIGINS:-http://localhost,http://localhost:3000}")"

mkdir -p /opt/keycloak/data/import
sed \
  -e "s/__GOOGLE_IDP_CLIENT_ID__/$(escape_sed "${GOOGLE_IDP_CLIENT_ID:-}")/g" \
  -e "s/__GOOGLE_IDP_CLIENT_SECRET__/$(escape_sed "${GOOGLE_IDP_CLIENT_SECRET:-}")/g" \
  -e "s/__GITHUB_IDP_CLIENT_ID__/$(escape_sed "${GITHUB_IDP_CLIENT_ID:-}")/g" \
  -e "s/__GITHUB_IDP_CLIENT_SECRET__/$(escape_sed "${GITHUB_IDP_CLIENT_SECRET:-}")/g" \
  -e "s/__KEYCLOAK_CLIENT_SECRET__/$(escape_sed "${KEYCLOAK_CLIENT_SECRET:-}")/g" \
  -e "s/__KC_CLIENT_REDIRECT_URIS_JSON__/$(escape_sed "$KC_CLIENT_REDIRECT_URIS_JSON")/g" \
  -e "s/__KC_CLIENT_WEB_ORIGINS_JSON__/$(escape_sed "$KC_CLIENT_WEB_ORIGINS_JSON")/g" \
  /opt/keycloak/realm-template.json > /opt/keycloak/data/import/nerdiez-realm.json

exec /opt/keycloak/bin/kc.sh "$@"
