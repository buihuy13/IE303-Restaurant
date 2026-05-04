# Docker Flow Hien Tai (`docker.sh` + seed DB)

Tai lieu nay mo ta dung flow dang chay trong project, bat dau tu `./docker.sh up` cho den khi seed data theo Keycloak ID.

## 1) Diem vao chinh

- Lenh: `./docker.sh up`
- File dieu phoi: `docker.sh`

Flow trong `docker.sh`:

1. Chay compose dev:
	- `docker compose -f docker-compose.dev.yml up -d`
2. Cho Keycloak san sang qua health endpoint:
	- `http://localhost:9090/auth/health/ready`
3. Cho realm `restaurant-realm` san sang:
	- `http://localhost:9090/auth/realms/restaurant-realm`
4. Chay script phan quyen service account:
	- `bash ./keycloak-config/role-management.sh`
5. Chay script seed du lieu theo Keycloak:
	- `bash ./backend/seed-db/seed-from-keycloak.sh`

## 2) Init schema DB (Postgres entrypoint)

Phan nay xay ra khi container `postgres` khoi tao data directory moi (lan dau hoac sau `down -v`).

Trong `docker-compose.yml`, service `postgres` mount cac file vao `/docker-entrypoint-initdb.d`:

- `backend/seed-db/seed-db.sh` -> `00_seed_db.sh`
- `backend/seed-db/user_service.sql`
- `backend/seed-db/blog_service.sql`
- `backend/seed-db/chat_service.sql`
- `backend/seed-db/payment_service.sql`
- `backend/seed-db/restaurant_service.sql`

`seed-db.sh` se:

1. Tao cac database:
	- `user_service`, `blog_service`, `chat_service`, `payment_service`, `restaurant_service`, `auth_service`
2. Import schema SQL vao tung DB tuong ung.

Luu y:

- Day la buoc tao schema/cau truc bang.
- Khong phu thuoc Keycloak.

## 3) Phan quyen service-account cho backend

Script: `keycloak-config/role-management.sh`

Script nay:

1. Doc `.env` lay thong tin admin Keycloak va `BACKEND_CLIENT_ID`.
2. Lay admin token (`admin-cli`).
3. Tim `client UUID` cua backend client (`my-backend-service`).
4. Tim service-account user ID cua client.
5. Tim `realm-management` client va lay role can gan:
	- `manage-users`, `view-users`, `view-realm`
6. Gan cac role tren cho service-account.

Muc dich:

- Dam bao backend co quyen thao tac user tren Keycloak qua Admin API.

## 4) Seed du lieu theo Keycloak ID

Script: `backend/seed-db/seed-from-keycloak.sh`

### 4.1 Che do ket noi DB

Script ho tro 3 mode qua bien `SEED_DB_MODE`:

- `auto` (mac dinh):
  - Neu co service `postgres` trong compose -> dung mode `docker`
  - Nguoc lai -> dung mode `local`
- `docker`: ep chay SQL bang `docker compose exec ... postgres psql`
- `local`: ep chay SQL bang `psql` local

Bien local DB (chi dung khi mode `local`):

- `LOCAL_DB_HOST` (default: `localhost`)
- `LOCAL_DB_PORT` (default: `5432`)
- `LOCAL_DB_USER` (default: `postgres`)
- `LOCAL_DB_PASSWORD` (default: tu `DB_PASSWORD`)

### 4.2 Luong seed

1. Cho Postgres san sang (`pg_isready`).
2. Lay admin token tu Keycloak.
3. Lay thong tin 3 user da co trong realm:
	- `test_user`
	- `admin_manager`
	- `merchant`
4. Lay role realm cua tung user (`USER`/`ADMIN`/`MERCHANT`).
5. Upsert vao `user_service.users` theo chinh `id` tu Keycloak.
6. Seed `restaurant_service`:
	- categories
	- size
	- restaurants
	- restaurant_categories
	- products
	- product_sizes
	- reviews

### 4.3 Nguyen tac idempotent

- Dung `ON CONFLICT` cho bang co unique key ro rang (`slug`, `cate_name`, `name`, ...).
- Sau khi upsert `products`, script truy van lai `product_id` theo `slug` de tranh lech FK.
- `product_sizes` dung `UPDATE` + `INSERT ... WHERE NOT EXISTS` de tranh phu thuoc vao unique constraint local.
- `reviews` xoa ban ghi cung khoa logic truoc khi insert lai de tranh trung.

## 5) Thu tu tong the tu luc chay `./docker.sh up`

1. Compose start cac service.
2. Postgres (neu volume moi) chay init SQL qua entrypoint.
3. Keycloak start, import realm qua `init.sh`.
4. `docker.sh` doi Keycloak ready + realm ready.
5. `role-management.sh` gan quyen cho backend service-account.
6. `seed-from-keycloak.sh` dong bo user IDs va seed du lieu lien quan.

## 6) Lenh hay dung

Chay full flow dev:

```bash
./docker.sh up
```

Chi seed lai theo Keycloak (khong restart full stack):

```bash
bash ./backend/seed-db/seed-from-keycloak.sh
```

Ep seed theo postgres local:

```bash
SEED_DB_MODE=local bash ./backend/seed-db/seed-from-keycloak.sh
```

Ha stack va xoa volume (lan sau se init schema lai tu dau):

```bash
./docker.sh down
```

## 7) Luu y van hanh

- Neu `docker-compose.dev.yml` map cong bi trung (vi du `5672`), compose co the fail mot phan service.
- Postgres entrypoint chi chay khi data directory moi. Neu da co volume cu, schema se khong auto import lai.
- Seed script can Keycloak realm va 3 user mau ton tai truoc khi chay.
