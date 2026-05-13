#Stage 1: Builder
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /app
ARG MODULE_PATH

COPY build.gradle.kts settings.gradle.kts gradlew ./
COPY gradle ./gradle
COPY ${MODULE_PATH}/build.gradle.kts ./${MODULE_PATH}/
COPY Common ./Common
RUN chmod +x ./gradlew
RUN ./gradlew :${MODULE_PATH}:dependencies --no-daemon
COPY . .
RUN ./gradlew :${MODULE_PATH}:bootJar --no-daemon -x test

#Stage 2: Publish
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
ARG MODULE_PATH
COPY --from=builder /app/${MODULE_PATH}/build/libs/*.jar application.jar
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "/app/application.jar"]
