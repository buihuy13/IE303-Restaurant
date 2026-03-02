# Hướng dẫn tạo service mới — Checklist đầy đủ

Khi thêm một **microservice mới** vào project IE303-Restaurant, cần làm đủ các bước config dưới đây. Ví dụ tên service: **`order-service`**, path API: **`/api/orders/**`**.

---

## 1. Tạo module Gradle trong `backend/`

### 1.1 Thư mục

Tạo thư mục:

```
backend/order-service/
├── src/main/java/com/CNTTK18/order_service/
├── src/main/resources/
└── build.gradle.kts
```

(Đổi `order_service` / `order-service` theo tên service của bạn.)

### 1.2 Đăng ký module trong `backend/settings.gradle.kts`

Thêm tên module vào `include(...)`:

```kotlin
include (
    ":Common",
    ":service-discovery",
    "api-gateway",
    "user-service",
    "auth-service",
    "notification-service",
    "chat-service",
    "order-service",   // <-- thêm dòng này
)
```

### 1.3 Tạo `backend/order-service/build.gradle.kts`

Copy từ một service tương tự (vd `user-service` hoặc `notification-service`) rồi chỉnh dependency:

- **Bắt buộc** cho mọi service (trừ service-discovery):
  - `implementation(project(":Common"))`
  - `implementation("org.springframework.boot:spring-boot-starter-web")`
  - `implementation("org.springframework.cloud:spring-cloud-starter-netflix-eureka-client")`
  - `implementation("io.github.cdimascio:dotenv-java:3.2.0")`
  - `implementation("org.springframework.boot:spring-boot-starter-actuator")`
  - `runtimeOnly("io.micrometer:micrometer-registry-prometheus")`
  - `implementation("org.springframework.boot:spring-boot-starter-security")` (nếu cần JWT/role từ Gateway)
  - `testImplementation("org.springframework.boot:spring-boot-starter-test")`, `testRuntimeOnly("org.junit.platform:junit-platform-launcher")`

- **Tùy chọn** theo nhu cầu:
  - JPA + PostgreSQL: `spring-boot-starter-data-jpa`, `postgresql`
  - RabbitMQ: `spring-boot-starter-amqp`
  - Redis: `spring-boot-starter-data-redis`
  - Validation: `spring-boot-starter-validation`
  - Swagger: `springdoc-openapi-starter-webmvc-ui:2.8.8`
  - MapStruct: `mapstruct` + `mapstruct-processor`
  - Zipkin: `micrometer-tracing-bridge-brave`, `zipkin-reporter-brave`
  - Dev: `spring-boot-devtools`

**Quan trọng**: Thêm `dependencyManagement` với Spring Cloud BOM (copy từ user-service):

```kotlin
extra["springCloudVersion"] = "2025.0.0"
dependencyManagement {
    imports {
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:${property("springCloudVersion")}")
    }
}
```

---

## 2. Application class (main)

Tạo file ví dụ:  
`backend/order-service/src/main/java/com/CNTTK18/order_service/OrderServiceApplication.java`

```java
package com.CNTTK18.order_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = { "com.CNTTK18.order_service", "com.CNTTK18.Common" })
public class OrderServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}
```

- Nếu **có dùng** class trong `Common` (AOP, Event, Exception): bắt buộc `scanBasePackages` gồm `com.CNTTK18.Common`.
- Nếu **không** dùng Common: có thể chỉ `@SpringBootApplication` (không cần scan Common).

---

## 3. Cấu hình ứng dụng: `application.properties`

Tạo `backend/order-service/src/main/resources/application.properties`.

**Tối thiểu** (service đăng ký Eureka, Actuator, Prometheus):

```properties
spring.application.name=order-service

spring.config.import=optional:file:.env[.properties]

server.port=${PORT}
eureka.client.service-url.defaultZone=${EUREKA_SERVER_URL}

# Actuator + Prometheus (để Eureka + Prometheus scrape)
management.tracing.enabled=true
management.endpoints.web.exposure.include=*
management.tracing.sampling.probability=1.0
management.zipkin.tracing.endpoint=${ZIPKIN_ENDPOINT}
management.metrics.export.prometheus.enabled=true
```

Nếu có **Swagger** (SpringDoc):

```properties
springdoc.api-docs.path=/v3/api-docs/order-service
springdoc.swagger-ui.enabled=false
springdoc.info.title=Order Service API
springdoc.info.version=1.0.0
```

Nếu có **DB** (JPA):

```properties
spring.datasource.url=${ORDER_SERVICE_DB_URL}
spring.datasource.username=${ORDER_SERVICE_DB_USER}
spring.datasource.password=${ORDER_SERVICE_DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver
```

Nếu có **RabbitMQ**:

```properties
spring.rabbitmq.host=${RABBITMQ_HOST}
spring.rabbitmq.port=${RABBITMQ_PORT}
spring.rabbitmq.username=${RABBITMQ_USERNAME}
spring.rabbitmq.password=${RABBITMQ_PASSWORD}
```

**Lưu ý**: `spring.application.name` **phải trùng** với tên dùng ở Gateway (`lb://order-service`) và thường là tên thư mục (dạng `order-service`).

---

## 4. API Gateway — Route tới service mới

### 4.1 Thêm route trong `backend/api-gateway/src/main/resources/application-routes.yml`

Trong `spring.cloud.gateway.routes`, thêm (ví dụ):

```yaml
# Order-service
- id: order-service-api
  uri: lb://order-service
  predicates:
    - Path=/api/orders/**
  filters:
    - name: JwtAuthentication
```

- **Có JWT**: thêm `filters: - name: JwtAuthentication`.
- **Không JWT** (public): bỏ đoạn `filters` đó.
- Nếu cần **method** cụ thể: thêm `- Method=GET` (hoặc POST, PUT, DELETE) vào `predicates`.

**Nếu có Swagger**, thêm route cho OpenAPI docs:

```yaml
- id: order-service-docs
  uri: lb://order-service
  predicates:
    - Path=/v3/api-docs/order-service
```

### 4.2 (Tùy chọn) Thêm vào Swagger UI tổng hợp

Trong `backend/api-gateway/src/main/resources/application-swagger.yml`:

```yaml
springdoc:
  swagger-ui:
    path: /api-docs/swagger-ui.html
    urls:
      - name: User Service
        url: /v3/api-docs/user-service
      - name: Chat Service
        url: /v3/api-docs/chat-service
      - name: Order Service
        url: /v3/api-docs/order-service
```

---

## 5. Security trong service mới (khi Gateway truyền JWT)

Nếu route qua Gateway có `JwtAuthentication`, Gateway đã validate JWT và gắn header `user-id`, `role` xuống request. Service chỉ cần:

- **Cho phép mọi request** (authorization thực tế ở Gateway), **hoặc**
- Đọc header `user-id` / `role` trong controller/service.

Ví dụ **SecurityConfig** đơn giản (giống notification-service):

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.csrf(c -> c.disable())
                .authorizeHttpRequests(req -> req
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().permitAll())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .build();
    }
}
```

Nếu cần **kiểm tra role trong service** (vd chỉ ADMIN mới gọi được vài API): dùng `@PreAuthorize("hasRole('ADMIN')")` và cấu hình method security; khi đó có thể cần thêm filter đọc JWT từ header (hoặc dùng header `user-id`/`role` do Gateway gửi xuống).

---

## 6. Biến môi trường — `.env` và `.env.example`

Tạo `backend/order-service/.env.example` với **ít nhất**:

```env
PORT=8085
EUREKA_SERVER_URL=http://localhost:8761/eureka/
ZIPKIN_ENDPOINT=http://localhost:9411/api/v2/spans
```

Nếu có DB:

```env
ORDER_SERVICE_DB_URL=jdbc:postgresql://localhost:5432/order-service
ORDER_SERVICE_DB_USER=postgres
ORDER_SERVICE_DB_PASSWORD=yourpassword
```

Nếu có RabbitMQ:

```env
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
```

Copy thành `.env` (không commit) và điền giá trị thật. Root project và các service khác có thể dùng `.env` chung tùy cách bạn chạy (local vs Docker).

---

## 7. (Tùy chọn) Docker / docker-compose

- **docker-compose.dev.yml** hiện chỉ có hạ tầng (Zipkin, RabbitMQ, Redis, Keycloak, Prometheus, Grafana), **không** build từng service Java. Service mới chạy local (IDE hoặc `./gradlew :order-service:bootRun`) và đăng ký Eureka với `EUREKA_SERVER_URL` trỏ tới host (vd `http://host.docker.internal:8761/eureka/` nếu Eureka chạy trên máy).
- Nếu sau này bạn **build image** và chạy service trong Docker: cần thêm service trong compose (build Dockerfile hoặc dùng image) và đảm bảo `PORT`, `EUREKA_SERVER_URL`, DB, RabbitMQ… trỏ đúng mạng Docker.

---

## 8. (Tùy chọn) Prometheus / Grafana

- Prometheus đang dùng **Eureka service discovery**: mọi instance đăng ký Eureka với `management.endpoints.web.exposure.include=*` và `management.metrics.export.prometheus.enabled=true` sẽ **tự được** scrape qua `/actuator/prometheus`. **Không cần** sửa file `monitoring/prometheus.yml` khi thêm service mới.
- Grafana dùng chung datasource Prometheus; dashboard JVM/Micrometer áp dụng cho mọi app Spring Boot. Không bắt buộc thêm config gì trừ khi bạn muốn dashboard riêng cho order-service.

---

## 9. Checklist tổng hợp

| # | Việc cần làm | File / vị trí |
|---|----------------|----------------|
| 1 | Tạo thư mục module | `backend/order-service/` + cấu trúc `src/main/...` |
| 2 | Đăng ký module | `backend/settings.gradle.kts` → `include(..., "order-service")` |
| 3 | Cấu hình Gradle | `backend/order-service/build.gradle.kts` (deps + dependencyManagement) |
| 4 | Application main | `.../order_service/OrderServiceApplication.java` (+ scanBasePackages nếu dùng Common) |
| 5 | Cấu hình app | `backend/order-service/src/main/resources/application.properties` (name, port, Eureka, Actuator, Prometheus, DB/RabbitMQ nếu có) |
| 6 | Route Gateway | `backend/api-gateway/.../application-routes.yml` (route `/api/orders/**` → `lb://order-service`, JWT nếu cần) |
| 7 | Swagger Gateway (nếu có) | `application-routes.yml` (route `/v3/api-docs/order-service`) + `application-swagger.yml` (url Order Service) |
| 8 | Security (nếu cần) | `SecurityConfig` trong order-service (permitAll hoặc đọc header từ Gateway) |
| 9 | Biến môi trường | `backend/order-service/.env.example` (và `.env` local) |

### Tại sao phải làm từng bước?

| # | Lý do / ý nghĩa |
|---|------------------|
| **1. Tạo thư mục module** | Gradle đa module cần mỗi service nằm trong một thư mục riêng, có cấu trúc `src/main/java` và `src/main/resources` chuẩn. Nếu không có, Gradle không nhận diện được đây là một project con và không build/chạy được. |
| **2. Đăng ký module trong settings.gradle.kts** | File `settings.gradle.kts` quy định **danh sách module** của toàn bộ project. Nếu không thêm tên module vào `include(...)`, Gradle sẽ **bỏ qua** thư mục đó — lệnh `./gradlew :order-service:bootRun` hay `build` sẽ báo "project not found". |
| **3. Cấu hình Gradle (build.gradle.kts)** | Mỗi module cần khai báo **dependencies** (Spring Boot, Eureka, Common, DB, …) và **dependencyManagement** (Spring Cloud BOM) để version đồng bộ. Thiếu dependency → compile lỗi; thiếu BOM → có thể xung đột version giữa các thư viện Spring Cloud. |
| **4. Application main class** | Spring Boot cần một class có `@SpringBootApplication` và method `main` để **khởi động** ứng dụng. **scanBasePackages** cần thêm `com.CNTTK18.Common` khi service dùng class trong module Common (AOP, Event, Exception) — nếu không scan, Spring không tìm thấy bean từ Common và có thể lỗi khi chạy (vd AOP không áp dụng, event không gửi). |
| **5. application.properties** | **spring.application.name** là **tên service** đăng ký lên Eureka; Gateway route dùng đúng tên này trong `lb://order-service`. Sai hoặc thiếu → Eureka không có tên để resolve → Gateway gọi `lb://order-service` sẽ fail. Port, Eureka URL, Actuator, Prometheus cần đúng để service đăng ký Eureka và bị Prometheus scrape; DB/RabbitMQ phải khai báo nếu service dùng. |
| **6. Route Gateway** | Client chỉ gọi **một cửa** là API Gateway (vd `http://localhost:8080/api/orders/...`). Nếu **không** thêm route trong Gateway, request `/api/orders/**` sẽ không biết forward đi đâu (404 hoặc fallback). Route `lb://order-service` nghĩa là "lấy danh sách instance của service tên `order-service` từ Eureka rồi load-balance tới một instance". **JwtAuthentication** filter đảm bảo chỉ request có token hợp lệ mới tới được service. |
| **7. Swagger Gateway** | Swagger UI đang chạy **trên Gateway** và tổng hợp OpenAPI của nhiều service. Cần **route** `/v3/api-docs/order-service` → `lb://order-service` để Gateway biết forward request lấy spec sang order-service; và cần thêm **url** trong `application-swagger.yml` để Swagger UI hiển thị tab "Order Service" và load spec đó. Thiếu một trong hai → không xem được API docs của service mới trên cùng một Swagger UI. |
| **8. SecurityConfig trong service** | Gateway đã validate JWT và có thể gắn header xuống. Service vẫn cần **Spring Security** (vd `SecurityFilterChain`) để ứng dụng khởi động đúng (Spring Boot auto-config security). Nếu không cấu hình (permitAll hoặc đọc header), có thể bị 401/403 mặc định hoặc lỗi cấu hình. Một số API cần kiểm tra role trong chính service → cần filter hoặc `@PreAuthorize` đọc `user-id`/`role` từ header do Gateway gửi xuống. |
| **9. .env.example (và .env)** | **application.properties** dùng `${PORT}`, `${EUREKA_SERVER_URL}`, … Các biến này phải **có giá trị** khi chạy (từ env hoặc file `.env` nhờ `spring.config.import=optional:file:.env[.properties]`). `.env.example` dùng để **ghi lại** cho người khác (hoặc môi trường khác) biết cần khai báo những biến gì; `.env` là file thật (không commit) chứa giá trị local. Thiếu biến → service không start được (vd thiếu PORT, EUREKA_SERVER_URL). |

Sau khi xong: chạy Eureka + Gateway + service mới (và DB/RabbitMQ nếu cần), gọi API qua Gateway: `http://localhost:<gateway-port>/api/orders/...`.

---

## 10. Ví dụ nhanh: service chỉ REST, có JWT, có Swagger

- **settings.gradle.kts**: thêm `"order-service"`.
- **order-service/build.gradle.kts**: giống user-service nhưng bỏ JPA, RabbitMQ nếu không dùng; giữ Common, Web, Eureka, Actuator, Prometheus, Security, SpringDoc.
- **OrderServiceApplication**: `scanBasePackages = "com.CNTTK18.order_service", "com.CNTTK18.Common"`.
- **application.properties**: `spring.application.name=order-service`, `server.port=${PORT}`, `eureka.client.service-url.defaultZone=...`, Actuator + Prometheus, `springdoc.api-docs.path=/v3/api-docs/order-service`, `springdoc.swagger-ui.enabled=false`.
- **application-routes.yml**: route `Path=/api/orders/**` → `lb://order-service`, filter `JwtAuthentication`; route `Path=/v3/api-docs/order-service` → `lb://order-service`.
- **application-swagger.yml**: thêm url Order Service.
- **.env.example**: PORT, EUREKA_SERVER_URL, ZIPKIN_ENDPOINT.

Làm đủ các bước trên là có thể tích hợp service mới vào kiến trúc hiện tại (Eureka, Gateway, JWT, Swagger, monitoring) mà không bỏ sót config.
