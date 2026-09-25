# Build
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -B

COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Runtime
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

RUN addgroup --system spring && adduser --system --ingroup spring spring
COPY --chown=spring:spring docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh
USER spring:spring

COPY --from=build /app/target/*.jar application.jar

EXPOSE 8080
ENTRYPOINT ["/app/docker-entrypoint.sh"]