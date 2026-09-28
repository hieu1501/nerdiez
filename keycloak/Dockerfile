FROM quay.io/keycloak/keycloak:26.0 AS builder

WORKDIR /opt/keycloak
# Build-time options; `start --optimized` in compose reuses them, so they can't be changed via env at runtime.
RUN /opt/keycloak/bin/kc.sh build --db=postgres --health-enabled=true --http-relative-path=/auth

FROM quay.io/keycloak/keycloak:26.0
LABEL org.opencontainers.image.source=https://github.com/hieu1501/Nerdy

COPY --from=builder /opt/keycloak/ /opt/keycloak/
COPY --chown=keycloak:keycloak docker-entrypoint.sh /opt/keycloak/docker-entrypoint.sh
# Baked in rather than bind-mounted, so the secret-resolved copy never touches the host.
COPY --chown=keycloak:keycloak import/nerdiez-realm.json /opt/keycloak/realm-template.json

ENTRYPOINT ["/opt/keycloak/docker-entrypoint.sh"]