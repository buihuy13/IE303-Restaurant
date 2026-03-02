# Giải thích chi tiết cấu trúc dự án IE303-Restaurant

Tài liệu này mô tả **ý nghĩa từng thư mục, file cấu hình và luồng hoạt động** của toàn bộ dự án.

---

## 1. Tổng quan kiến trúc

- **Dự án**: Website nhà hàng (Restaurant), môn IE303.
- **Kiến trúc**: Microservices (Spring Boot, Java 21).
- **Công nghệ chính**: Spring Cloud (Eureka, Gateway), Keycloak (OAuth2), RabbitMQ, Redis, PostgreSQL, Prometheus, Grafana, Docker.

**Luồng request tổng quát**:
1. Client → **API Gateway** (một cửa vào duy nhất).
2. Gateway kiểm tra JWT (nếu route yêu cầu), rate limit (Redis), circuit breaker, rồi **route** theo path đến đúng service (Eureka).
3. Các service (user, auth, chat, notification) đăng ký với **Eureka**; Gateway dùng `lb://service-name` để gọi qua Eureka.
4. **Keycloak** xử lý đăng nhập (OAuth2/Google/Facebook); khi user đăng ký, Keycloak gửi event HTTP đến **user-service** để đồng bộ user vào DB.
5. **RabbitMQ**: đồng bộ sự kiện giữa các service (ví dụ: user cập nhật/xóa → publish event).
6. **Monitoring**: Prometheus scrape metrics từ Eureka/Actuator, Grafana hiển thị dashboard.

---

## 2. Thư mục gốc

### 2.1 `README.md`
- Mô tả ngắn: **IE303-Restaurant**.

### 2.2 `docker-compose.dev.yml`
Dùng cho **môi trường development** khi chạy hạ tầng trên máy local.

| Service   | Ý nghĩa |
|----------|--------|
| **zipkin** | Distributed tracing: theo dõi request qua nhiều service (Gateway → User → …). Các service dùng Brave + Zipkin reporter. |
| **rabbitmq** | Message broker: port 5672 cho AMQP, 15672 cho UI quản lý. Dùng cho event user (Create/Update/Delete), có thể cho notification. |
| **redis** | Cache + rate limit: Gateway dùng Redis cho `RequestRateLimiter` (100 req/s, burst 200). Có thể dùng cho session/chat. |
| **keycloak** | IdP (Identity Provider): đăng nhập OAuth2, JWT. Mount `keycloak-config` (realm, init script, theme, jar event). Port 9090. |
| **prometheus** | Thu thập metrics (scrape từ Eureka + `/actuator/prometheus` của từng instance). Port 9000 (map 9090 trong container). Config từ `./monitoring`. |
| **grafana** | Dashboard: đọc datasource Prometheus, hiển thị JVM/Micrometer. Port 3030 (map 3000). Provisioning từ `./monitoring/grafana/provisioning`. |

**Lưu ý**: File này **không** chạy PostgreSQL (backend thường dùng DB local hoặc compose riêng). Chỉ chạy hạ tầng + monitoring.

---

## 3. `.github/workflows/` — CI/CD

### 3.1 `ci.yml`

**Kích hoạt**: Push hoặc Pull Request lên nhánh `main` hoặc `develop`.

**Jobs**:

1. **lint-backend**
   - Working directory: `./backend`.
   - Setup JDK 21 (Temurin), cache Gradle.
   - Chạy: `./gradlew spotlessCheck`.
   - **Ý nghĩa**: Đảm bảo code Java đúng format (Palantir), không commit code lệch chuẩn.

2. **java-build**
   - `needs: lint-backend` → chỉ chạy khi lint pass.
   - Chạy: `./gradlew assemble` (build JAR, **không** chạy test).
   - **Ý nghĩa**: Đảm bảo project compile được, tránh break build.

**Phần bị comment**: Frontend (Node 20, `npm ci`, `npm run build`). Hiện tại repo chỉ CI backend.

---

## 4. `backend/` — Ứng dụng Spring Boot đa module

### 4.1 File cấu hình Gradle (gốc)

**`build.gradle.kts`** (root):
- **Plugins**: `java`, Spring Boot 3.5.5 (apply false), dependency-management, **Spotless** (format code).
- **allprojects**: Java 21, group `com.CNTTK18`, version SNAPSHOT, repo Maven Central.
- **subprojects**: Spotless cho Java (Palantir format, remove unused imports, import order); JUnit 5 cho Test; `compileOnly` kế thừa `annotationProcessor` (để Lombok dùng chung).

**`settings.gradle.kts`**:
- `rootProject.name = "Restaurant"`.
- **include** các module: `:Common`, `:service-discovery`, `api-gateway`, `user-service`, `auth-service`, `notification-service`, `chat-service`.

---

### 4.2 Module `Common`

- **Vai trò**: Thư viện dùng chung, **không** chạy Spring Boot (chỉ build JAR).
- **build.gradle.kts**: `bootJar { enabled = false }`, `jar { enabled = true }`. Dependency: AOP, Lombok.

**Các class chính** (trong `com.CNTTK18.Common`):

| Class | Ý nghĩa |
|-------|--------|
| **SlugGenerator** | Tạo slug từ chuỗi (dùng cho URL profile, v.v.). |
| **ErrorResponse** | DTO chuẩn trả lỗi API (timestamp, message, path, …). |
| **ResourceNotFoundException** | Exception khi không tìm thấy resource. |
| **UpdateUsernameDTO** | Event: user đổi username → gửi qua RabbitMQ. |
| **DeleteUserDTO** | Event: user bị xóa → gửi qua RabbitMQ. |
| **CreateUserDTO** | Event: tạo user mới (dùng cho queue CreateUser). |
| **ConfirmationEvent** | Event xác nhận (có thể dùng cho email/notification). |
| **TimeLogging** (AOP) | `@Around` tất cả method trong `com.CNTTK18.*.service..*` → log thời gian thực thi (ms). |

Các service (user, auth, chat, notification) đều `implementation(project(":Common"))` để dùng chung exception, event, AOP.

---

### 4.3 Module `service-discovery`

- **Công nghệ**: Netflix Eureka Server.
- **Ý nghĩa**: Registry — tất cả service (api-gateway, user-service, auth-service, chat-service, notification-service) đăng ký instance của mình (host, port, health). Gateway và client gọi service qua tên (vd: `lb://user-service`) thay vì hardcode IP/port.
- **Port**: Thường 8761 (cấu hình trong application của từng service).

---

### 4.4 Module `api-gateway`

- **Công nghệ**: Spring Cloud Gateway (reactive), Eureka Client, Redis, Resilience4j, JWT (jjwt), SpringDoc OpenAPI (WebFlux), Zipkin.

**Chức năng**:
1. **Routing**: Theo path + method → forward tới đúng service (xem `application-routes.yml`).
2. **JWT**: Filter `JwtAuthentication` — đọc `Authorization: Bearer <token>`, validate bằng `JwtUtil`, trích `user-id` và `role` gắn vào header xuống downstream; nếu route yêu cầu role thì kiểm tra, 401/403 nếu lỗi.
3. **Rate limit**: `RequestRateLimiter` với Redis — 100 token/s, burst 200, key theo IP (`ipKeyResolver`).
4. **Circuit breaker**: Resilience4j — sliding window 10 request, 50% failure → open; 4s sau thử half-open; timeout 3s; retry 3 lần với exponential backoff. Fallback: `forward:/fallback`.
5. **CORS**: Cho phép origin `http://localhost:3000`, methods GET/POST/PUT/DELETE/OPTIONS/PATCH, headers Content-Type, Authorization, Refresh-Token, credentials, maxAge 3600.
6. **Swagger tổng hợp**: Trỏ đến `/v3/api-docs/user-service` và `/v3/api-docs/chat-service` (xem `application-swagger.yml`).

**File cấu hình**:
- **application-routes.yml**: Định nghĩa route (eureka, user-service GET/PUT, OAuth2 callback, chat API + WebSocket `/ws/**`, SSE `/api/sse/subcribe/**`). Route cần JWT có `filters: - name: JwtAuthentication`.
- **application-cb.yml**: Cấu hình Resilience4j (circuit breaker, time limiter, retry), exception nào tính là failure/ignore.

**Route quan trọng**:
- `/api/users/**` (GET/PUT) → user-service, có JWT.
- `/oauth2/authorization/**`, `/login/oauth2/code/**` → user-service (OAuth2 login thực chất do auth/user xử lý).
- `/api/chat/roomId/**`, `/api/chat/rooms/**` → chat-service, JWT.
- `/ws/**` → `lb:ws://chat-service`, WebSocket, JWT.
- `/api/sse/subcribe/**` → notification-service (SSE subscribe).

---

### 4.5 Module `auth-service`

- **Vai trò**: Xác thực và ủy quyền: OAuth2 login (Keycloak, Google, Facebook), JWT, session stateless.
- **Công nghệ**: Spring Security, OAuth2 Client, JPA + PostgreSQL, JWT (jjwt), RabbitMQ, MapStruct, SpringDoc.

**SecurityConfig**:
- CSRF tắt, session `STATELESS`.
- **oauth2Login**: `CustomOauth2UserService` (lấy thông tin user từ IdP), `Oauth2LoginSuccessHandler` (tạo JWT/redirect sau khi login thành công).
- **InternalFilter**: Filter tùy chỉnh (có thể kiểm tra JWT từ header cho request nội bộ hoặc từ gateway).
- Mọi request hiện tại `permitAll()` (bảo mật thực tế nằm ở Gateway + filter).

Auth-service thường cung cấp endpoint đăng nhập/refresh token; frontend gọi qua Gateway.

---

### 4.6 Module `user-service`

- **Vai trò**: Quản lý user (CRUD), đồng bộ với Keycloak qua event HTTP.
- **Công nghệ**: JPA + PostgreSQL, Security, JWT, RabbitMQ, MapStruct, SpringDoc, Eureka, Actuator, Micrometer, Zipkin.

**API chính** (`UserController`, base `/api/users`):
- `GET /api/users` — danh sách user (phân trang), **ADMIN**.
- `GET /api/users/admin/{id}` — user theo ID.
- `GET /api/users/{slug}` — user theo slug (public/profile).
- `PUT /api/users/{id}` — cập nhật user (body + auth user).
- `DELETE /api/users/{id}` — xóa user.
- **`POST /api/users/keycloak`** — **nhận event từ Keycloak** (Keycloak gọi HTTP sau khi có event REGISTER/UPDATE v.v.). Body là `KeycloakEventDTO` (type, realmId, userId, details: email, username, …). `handleKeycloakEvent` nếu type `REGISTER` thì `syncUserFromKeycloak` — tạo bản ghi user trong DB tương ứng với user Keycloak (đồng bộ email, username, role…). Nhờ đó user đăng ký qua Keycloak sẽ có bản ghi trong DB nhà hàng.

**RabbitMQ** (`RabbitMQConfig`):
- Exchange: `User_exchange` (Topic).
- Queue: `CreateUser_queue` (routing key `CreateUser`) — dùng khi có event tạo user (vd từ Keycloak hoặc từ service khác).
- Dead Letter: `dead_letter_exchange` / `dead_letter_queue` — message lỗi không xử lý được sẽ vào đây, tránh mất event.

**UserEventListener** (trong user-service):
- Lắng nghe event **trong process** (Spring `@TransactionalEventListener`): khi user update username → publish `UpdateUsernameDTO` vào `User_exchange` với key `UpdateUser`; khi user delete → publish `DeleteUserDTO` với key `DeleteUser`. Các service khác (vd notification, chat) có thể subscribe để cập nhật cache hoặc xóa dữ liệu liên quan.

**InternalFilter**: Giống auth-service — xử lý request nội bộ (vd kiểm tra JWT từ gateway truyền xuống header `user-id`, `role`).

---

### 4.7 Module `chat-service`

- **Vai trò**: Chat realtime (WebSocket) + API quản lý phòng chat, tin nhắn.
- **Công nghệ**: WebSocket, JPA + PostgreSQL, Redis, Eureka, MapStruct, SpringDoc, Security.

**API** (qua Gateway):
- `GET /api/chat/roomId/{userId1}/{userId2}` — lấy hoặc tạo room giữa hai user, trả roomId.
- `GET /api/chat/rooms/{userId}` — danh sách phòng của user (phân trang).
- `GET /api/chat/rooms/unreadCount/{userId}` — tổng số tin chưa đọc.
- `GET /api/chat/rooms/{roomId}/unreadCount/{userId}` — số tin chưa đọc trong phòng.
- `PUT /api/chat/rooms/{roomId}/read/{userId}` — đánh dấu đã đọc.

**WebSocket**: Path `/ws/**` được Gateway route `lb:ws://chat-service` — client kết nối WebSocket qua Gateway, Gateway forward đến chat-service. Redis thường dùng để đồng bộ message giữa nhiều instance (pub/sub) hoặc lưu session.

---

### 4.8 Module `notification-service`

- **Vai trò**: Gửi thông báo: email (Thymeleaf template) và SSE (Server-Sent Events) realtime.
- **Công nghệ**: Spring Mail, Thymeleaf, RabbitMQ, Eureka, Actuator, Zipkin.

**SSE** (`SSEController`):
- `GET /api/sse/subcribe/{userId}` — trả về `SseEmitter`, client subscribe nhận event theo `userId` (vd thông báo đơn hàng, tin nhắn mới). Gateway route `/api/sse/subcribe/**` tới notification-service.

**Email**: Gửi mail qua SMTP (cấu hình trong application); template Thymeleaf (cấu trong `ThymeleafTemplateConfig`, `ThymeleafProperties`). Có thể kích hoạt khi nhận event từ RabbitMQ (vd order placed → gửi mail xác nhận).

---

## 5. `keycloak-config/` — Cấu hình Keycloak (dev)

Dùng cho **docker-compose.dev.yml** (volume mount vào container Keycloak).

| Thành phần | Ý nghĩa |
|------------|--------|
| **realm.json** | Export realm Keycloak: clients (frontend, backend), roles (ADMIN, USER), identity providers (Google, Facebook), credentials. Trong file có placeholder như `SMTP_PASSWORD_PLACEHOLDER`, `GOOGLE_CLIENT_ID_PLACEHOLDER`, … để inject từ biến môi trường (.env). |
| **init.sh** | Script chạy khi container start: dùng `sed` thay thế tất cả placeholder trong realm.json bằng biến môi trường (SMTP_*, GOOGLE_*, FACEBOOK_*, BACKEND_CLIENT_SECRET, ADMIN_PASSWORD, USER_PASSWORD), ghi ra `/opt/keycloak/data/import/realm.json`, rồi chạy `kc.sh start-dev`. Keycloak sẽ import realm khi khởi động. |
| **keycloak-events-0.51.jar** | SPI (provider) Keycloak: khi có event (REGISTER, UPDATE_PASSWORD, …) Keycloak gửi HTTP request đến endpoint cấu hình (trong docker-compose: `KC_SPI_EVENTS_LISTENER_EXT_EVENT_HTTP_ENDPOINT=http://host.docker.internal:8080/api/users/keycloak` — tức user-service). Nhờ đó user-service nhận event và gọi `POST /api/users/keycloak` để đồng bộ user. |
| **themes/restaurant-theme/** | Theme đăng nhập Keycloak: giao diện trang login (logo, CSS: style.css, overrides.css, theme.properties). |

---

## 6. `monitoring/` — Prometheus + Grafana (dev)

- **prometheus.yml**:
  - Scrape Prometheus itself (`localhost:9090`).
  - **Eureka discovery**: scrape tất cả instance đăng ký trong Eureka, path `/actuator/prometheus`. Relabel: chỉ giữ instance `UP`, lấy `application` (tên service) và `instance` (id). Refresh 30s. Nhờ đó mỗi service Spring Boot (gateway, user, auth, chat, notification) tự xuất hiện trong Prometheus.

- **grafana/provisioning/**:
  - **datasources/prometheus_ds.yml**: Khai báo datasource Prometheus, URL `http://prometheus:9090`, access proxy, default.
  - **dashboards/dashboard.yml**: Provider type file, path `/etc/grafana/provisioning/dashboards` — Grafana scan folder này (300s) để load dashboard JSON.
  - **dashboards/jvm-micrometer.json**: Dashboard mẫu hiển thị metrics JVM và Micrometer (CPU, memory, HTTP, …) từ các service.

---

## 7. `deploy/` — Cấu hình triển khai (production / staging)

- **docker-compose.prod.yml**:
  - Các service: rabbitmq, redis, **postgres** (PostGIS 16), zipkin, keycloak, prometheus, grafana. **Không** build hoặc chạy backend Java — chỉ hạ tầng. PostgreSQL có init script `main_postgres.sql`, volume lưu data. Keycloak dùng script `init-keycloak.sh` và realm từ `./realm.json`.
  - Prometheus/Grafana dùng config từ `./prometheus.yml` và `../monitoring/grafana/provisioning`.
  - Keycloak redirect/URL có thể cần chỉnh theo domain khi deploy thật.

- **init-keycloak.sh**:
  - Giống `keycloak-config/init.sh`: thay placeholder trong realm.json, ghi vào `/opt/keycloak/data/import/realm.json`.
  - Khác: chạy `kc.sh build` rồi `kc.sh start --optimized --import-realm --proxy=edge --http-enabled=true --hostname-strict=false` — phù hợp môi trường production (optimized, proxy edge).

- **realm.json**: Bản copy realm cho deploy (có thể khác dev về client URL, redirect URI).
- **prometheus.yml**: Cấu hình scrape cho môi trường deploy (targets có thể khác dev).

---

## 8. Luồng dữ liệu tóm tắt

1. **Đăng ký user**: User đăng ký trên Keycloak → Keycloak gửi event HTTP tới user-service `/api/users/keycloak` → user-service tạo bản ghi user trong DB (syncUserFromKeycloak).
2. **Đăng nhập**: Client → Gateway → auth/user-service OAuth2 → Keycloak → redirect + JWT. Các request sau gửi JWT qua Gateway; Gateway validate và gắn `user-id`, `role` vào header xuống service.
3. **User cập nhật/xóa**: user-service sau khi commit DB → UserEventListener publish event RabbitMQ (UpdateUser, DeleteUser). Service khác có thể consume để đồng bộ.
4. **Chat**: Client mở WebSocket tới Gateway `/ws/**` → Gateway forward tới chat-service; chat-service dùng Redis (và DB) cho room/message.
5. **Thông báo realtime**: Client GET `/api/sse/subcribe/{userId}` → notification-service trả SseEmitter; khi có sự kiện (từ RabbitMQ hoặc nội bộ) service push event tới emitter tương ứng.
6. **Monitoring**: Tất cả service expose `/actuator/prometheus`; Prometheus scrape qua Eureka; Grafana vẽ dashboard từ Prometheus.

---

## 9. Bảng tham chiếu nhanh

| Thư mục / file | Mục đích chính |
|----------------|----------------|
| `.github/workflows/ci.yml` | CI: Spotless check + Gradle assemble cho backend. |
| `backend/build.gradle.kts` | Cấu hình Gradle gốc (Java 21, Spotless, Spring Boot). |
| `backend/settings.gradle.kts` | Khai báo 7 module. |
| `backend/Common` | JAR dùng chung: AOP TimeLogging, Exception, Event DTO, SlugGenerator. |
| `backend/service-discovery` | Eureka Server — registry service. |
| `backend/api-gateway` | Gateway: routing, JWT, rate limit, circuit breaker, CORS, Swagger. |
| `backend/auth-service` | OAuth2 login, JWT, Security. |
| `backend/user-service` | CRUD user, nhận Keycloak event, publish RabbitMQ (Update/Delete user). |
| `backend/chat-service` | WebSocket chat, API room/message, Redis + PostgreSQL. |
| `backend/notification-service` | Email (Thymeleaf), SSE subscribe. |
| `keycloak-config/` | Realm, init script, event SPI jar, theme — cho Keycloak dev. |
| `monitoring/` | Prometheus config (Eureka SD), Grafana datasource + dashboards. |
| `deploy/` | Docker Compose + script + config cho môi trường deploy. |
| `docker-compose.dev.yml` | Compose dev: Zipkin, RabbitMQ, Redis, Keycloak, Prometheus, Grafana. |

Nếu cần đi sâu thêm vào một module cụ thể (vd chỉ Gateway hoặc chỉ user-service), có thể mở file tương ứng và đối chiếu với tài liệu này.
