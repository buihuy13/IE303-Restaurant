#Stage 1: Builder
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /app

#Cache
COPY build.gradle.kts settings.gradle.kts gradlew ./
COPY gradle ./gradle
RUN chmod +x ./gradlew
RUN ./gradlew dependencies --no-daemon

COPY . .
RUN chmod +x ./gradlew
# Giống build nhưng bootJar hiệu quả hơn
RUN ./gradlew bootJar --no-daemon -x test

#Stage 2: Publish
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
ARG MODULE_PATH
COPY --from=builder /app/${MODULE_PATH}/build/libs/*.jar application.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/application.jar"]