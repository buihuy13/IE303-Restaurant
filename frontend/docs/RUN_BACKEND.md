# Hướng dẫn chạy Backend

Backend là project **Gradle** đa module (Spring Boot), gồm: **service-discovery**, **api-gateway**, **user-service**, **notification-service**, **chat-service**, **restaurant-service**, **recommendation-service**, **blog-service**, **payment-service**.

Có **2 cách** chạy: bằng **Docker** (khuyến nghị) hoặc **chạy local bằng Gradle**.

---

## Cách 1: Chạy toàn bộ Backend bằng Docker (khuyến nghị)

Chạy luôn **PostgreSQL + tất cả microservice** qua Docker Compose.

### Yêu cầu

- Docker & Docker Compose
- File `.env` ở **thư mục gốc project** (đã có sẵn)

### Bước 1: Chạy hạ tầng + backend

Từ **thư mục gốc project** (IE303):

```bash
docker compose up -d
```

Lệnh này sẽ:

- Chạy **PostgreSQL** (có sẵn DB: `user_service`, `blog_service`, `chat_service`, `payment_service` từ `backend/main.prod.sql`)
- Chạy **Redis**, **RabbitMQ**, **Zipkin**, **Keycloak**, **Prometheus**, **Grafana**
- Chạy **service-discovery** (Eureka, port 8761)
- Chạy **api-gateway** (port 8080)
- Chạy **user-service**, **notification-service**, **chat-service**, **recommendation-service**
- Chạy **Caddy** (reverse proxy, port 8443)

**Lưu ý:** `docker-compose.yml` hiện **không** build/chạy **restaurant-service**, **blog-service**, **payment-service**. Nếu cần các service đó, bạn phải thêm vào `docker-compose.yml` hoặc chạy local (Cách 2).

### Bước 2: Kiểm tra

- **Eureka:** http://localhost:8761  
- **API Gateway:** http://localhost:8080 (hoặc qua Caddy https://localhost:8443)
- **Keycloak:** http://localhost:9090/auth  

---

## Cách 2: Chạy Backend local bằng Gradle

Chạy từng service trên máy, dùng **PostgreSQL + Redis + RabbitMQ + Keycloak** (có thể chạy bằng Docker).

### Yêu cầu

- **Java 21**
- **Gradle** (hoặc dùng `./gradlew` trong `backend`)
- **PostgreSQL** (chạy local hoặc Docker)
- File **`.env`** (copy từ `.env` gốc và chỉnh cho local)

### Bước 1: Chạy hạ tầng (Docker)

Từ thư mục gốc project:

```bash
./docker.sh up
```

Script này chạy `docker-compose.dev.yml`, gồm: **Zipkin**, **RabbitMQ**, **Redis**, **Keycloak**, **Prometheus**, **Grafana**.  
**Không** có PostgreSQL trong file dev → bạn cần **tự chạy PostgreSQL** (xem bước 2).

Chờ Keycloak sẵn sàng (script sẽ chạy `role-management.sh` khi realm ready).

### Bước 2: Chạy PostgreSQL (nếu chưa có)

Tạo DB và schema bằng script trong repo:

```bash
# Ví dụ: PostgreSQL chạy local port 5432, user postgres, password 1
psql -U postgres -h localhost -f backend/main.sql
# hoặc dùng main.prod.sql nếu dùng \connect thay \c
```

Hoặc chạy PostgreSQL bằng Docker:

```bash
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=1 \
  -e POSTGRES_USER=postgres \
  -p 5432:5432 \
  -v $(pwd)/backend/main.prod.sql:/docker-entrypoint-initdb.d/01-init.sql \
  postgis/postgis:16-3.4
```

Đảm bảo có các database: `user_service`, `blog_service`, `chat_service`, `payment_service` (theo nội dung `main.sql` / `main.prod.sql`).

### Bước 3: Cấu hình .env cho chạy local

File `.env` gốc dùng hostname Docker (`postgres`, `keycloak`, `service-discovery`, `redis`, …). Khi chạy service **trên máy** (không trong Docker), cần trỏ về **localhost**:

- `USER_SERVICE_DB_URL=jdbc:postgresql://localhost:5432/user_service`
- `KEYCLOAK_SERVER_URL=http://localhost:9090`
- `EUREKA_SERVER_URL=http://localhost:8761/eureka/`
- `EUREKA_SERVER_URI=http://localhost:8761`
- `REDIS_HOST=localhost`
- `RABBITMQ_HOST=localhost`
- `ZIPKIN_ENDPOINT=http://localhost:9411/api/v2/spans`
- `GATEWAY_URL=http://localhost:8080`

Các biến `PORT` cho từng service (khi chạy bằng Gradle) lấy từ `.env` hoặc set tay (xem bước 4). Trong `.env` gốc có: `API_GATEWAY_PORT=8080`, `USER_PORT=8081`, `NOTIFICATION_PORT=8084`, `CHAT_PORT=8086`, `RECOMMENDATION_PORT=8090`. Ứng với từng module cần biến **`PORT`** (Spring Boot dùng `server.port=${PORT}`).

### Bước 4: Chạy từng module bằng Gradle

Mở **nhiều terminal**, từ thư mục **`backend`**:

**Terminal 1 – Service Discovery (Eureka):**

```bash
cd backend
export PORT=8761
./gradlew :service-discovery:bootRun
```

**Terminal 2 – API Gateway (sau khi Eureka đã lên):**

```bash
cd backend
export PORT=8080
./gradlew :api-gateway:bootRun
```

**Terminal 3 – User Service:**

```bash
cd backend
export PORT=8081
./gradlew :user-service:bootRun
```

**Terminal 4, 5, … – Các service khác (tùy nhu cầu):**

```bash
export PORT=8084 && ./gradlew :notification-service:bootRun
export PORT=8086 && ./gradlew :chat-service:bootRun
export PORT=8090 && ./gradlew :recommendation-service:bootRun
export PORT=8082 && ./gradlew :restaurant-service:bootRun
export PORT=8083 && ./gradlew :blog-service:bootRun
export PORT=8085 && ./gradlew :payment-service:bootRun
```

Hoặc dùng script có sẵn (truyền đúng tên module):

```bash
cd backend
./start.sh service-discovery    # port 8761
./start.sh api-gateway          # port 8080
./start.sh user-service         # port 8081
# ...
```

**Lưu ý:** `start.sh` gọi `./gradlew :$module:bootrun` và **không** set `PORT`. Bạn cần **export PORT** trước khi chạy hoặc đảm bảo trong `.env` (ở thư mục backend hoặc project gốc) có biến `PORT` đúng cho từng service khi chạy.

### Thứ tự chạy gợi ý

1. **service-discovery** (8761)  
2. **api-gateway** (8080)  
3. Các service còn lại (user, notification, chat, recommendation, restaurant, blog, payment) – thứ tự không bắt buộc nhưng phải có Eureka trước.

---

## Tóm tắt port các service

| Service            | Port (mặc định trong .env) |
|--------------------|----------------------------|
| service-discovery  | 8761                       |
| api-gateway        | 8080                       |
| user-service       | 8081                       |
| restaurant-service | (thường 8082)             |
| blog-service       | (thường 8083)             |
| notification-service | 8084                    |
| payment-service    | (thường 8085)             |
| chat-service       | 8086                       |
| recommendation-service | 8090                  |

---

## Lỗi thường gặp

- **Kết nối PostgreSQL:** Kiểm tra `USER_SERVICE_DB_URL`, `CHAT_SERVICE_DB_URL`, … trỏ đúng host/port/user/password và DB đã tạo.
- **Eureka:** Các service phải chạy **sau** service-discovery và `EUREKA_SERVER_URL` trỏ đúng (localhost khi chạy local).
- **Keycloak:** Cần chạy Keycloak (ví dụ `./docker.sh up`) và đợi realm + role script xong; `KEYCLOAK_SERVER_URL` trỏ đúng (http://localhost:9090 khi chạy local).
- **PORT:** Nếu không set `PORT`, Spring Boot có thể dùng port mặc định (8080) → dễ trùng. Luôn set `PORT` khác nhau cho từng service khi chạy nhiều module trên một máy.

Nếu bạn chỉ cần “chạy backend nhanh” thì dùng **Cách 1 (Docker)**. Nếu cần debug hoặc sửa code từng service thì dùng **Cách 2 (Gradle)** với `.env` đã chỉnh cho local.
