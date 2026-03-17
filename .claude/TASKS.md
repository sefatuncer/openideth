# OpenIDEth - Gorev Listesi

> Bu dosya projenin tum gelistirme gorevlerini icerir.
> Her gorev review edildikten sonra uygulamaya gecirilecektir.
> Durum: [ ] Bekliyor, [~] Devam Ediyor, [x] Tamamlandi

---

## FAZ 1: Proje Altyapisi ve Konfigurasyonlar

### 1.1 Monorepo Kurulumu
- [x] **T-001:** Root `package.json` (scripts: dev, build, lint, test, clean, db:migrate, db:seed, db:generate, format)
- [x] **T-002:** `pnpm-workspace.yaml` (apps/*, packages/*)
- [x] **T-003:** `turbo.json` (task pipeline: dev, build, lint, test, clean)
- [x] **T-004:** `tsconfig.base.json` (target ES2022, strict, moduleResolution bundler)
- [x] **T-005:** `.gitignore` (node_modules, dist, .next, .turbo, .env, coverage, artifacts, cache, typechain-types)
- [x] **T-006:** `.prettierrc` (semi, singleQuote, trailingComma all, printWidth 100)
- [x] **T-007:** `.eslintrc.js` (root eslint config - TypeScript rules, import order, no unused vars)
- [x] **T-008:** `.env.example` - Tum ortam degiskenleri:
  - DATABASE_URL (postgres connection string)
  - REDIS_URL
  - JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRATION, JWT_REFRESH_EXPIRATION
  - STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_CONNECT_CLIENT_ID
  - AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, AWS_REGION
  - ETHEREUM_RPC_URL, DEPLOYER_PRIVATE_KEY
  - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
  - FRONTEND_URL, API_URL
  - NODE_ENV
- [x] **T-009:** `git init` + ilk commit

### 1.2 Shared Package (packages/shared)
- [x] **T-010:** `packages/shared/package.json` (name: @openideth/shared, deps: zod)
- [x] **T-011:** `packages/shared/tsconfig.json` (extends root, outDir dist, rootDir src)
- [x] **T-012:** `packages/shared/src/types/index.ts` - Enum ve tip tanimlari:
  - `UserRole`: TENANT, LANDLORD, ADMIN
  - `PropertyStatus`: DRAFT, ACTIVE, INACTIVE, RENTED
  - `AgreementStatus`: DRAFT, PENDING_SIGNATURE, ACTIVE, TERMINATED, EXPIRED
  - `PaymentStatus`: PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED
  - `PaymentMethod`: STRIPE, ETH, USDT
  - `EscrowStatus`: HELD, RELEASED, REFUNDED, DISPUTED
  - `KycStatus`: NOT_STARTED, PENDING, APPROVED, REJECTED
  - `NotificationType`: PAYMENT_DUE, PAYMENT_RECEIVED, AGREEMENT_SIGNED, AGREEMENT_TERMINATED, KYC_UPDATE, ESCROW_UPDATE, SYSTEM
  - DTO interfaceleri: PaginatedResponse<T>, ApiResponse<T>, PaginationQuery
- [x] **T-013:** `packages/shared/src/schemas/index.ts` - Zod validasyon semalari:
  - `registerSchema` (email, password min 8, name min 2, role)
  - `loginSchema` (email, password)
  - `createPropertySchema` (title, description, address, city, state, zipCode, country, bedrooms, bathrooms, area sqm, monthlyRent, depositAmount, propertyType enum, amenities optional array)
  - `updatePropertySchema` (partial of create)
  - `createAgreementSchema` (propertyId uuid, tenantId uuid, startDate, endDate, monthlyRent, depositAmount, terms optional)
  - `createPaymentSchema` (agreementId uuid, amount, method enum)
  - `createReviewSchema` (propertyId uuid, rating 1-5, comment optional)
  - `paginationSchema` (page min 1, limit min 1 max 100)
  - `propertySearchSchema` (query optional, city, minPrice, maxPrice, bedrooms, propertyType, sortBy, sortOrder)
- [x] **T-014:** `packages/shared/src/constants/index.ts`:
  - PLATFORM_FEE_BPS = 250 (2.5%)
  - REWARD_AMOUNTS = { ON_TIME_PAYMENT: 10, KYC_COMPLETE: 50, REFERRAL: 25, FIRST_LISTING: 20 }
  - MAX_FILE_SIZE = 10 * 1024 * 1024 (10MB)
  - SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
  - PAGINATION_DEFAULT_LIMIT = 20
  - PAGINATION_MAX_LIMIT = 100
  - PASSWORD_MIN_LENGTH = 8
  - JWT_DEFAULT_EXPIRATION = '15m'
  - JWT_REFRESH_DEFAULT_EXPIRATION = '7d'
- [x] **T-015:** `packages/shared/src/index.ts` (barrel export: types, schemas, constants)

### 1.3 Database Package (packages/database)
- [ ] **T-016:** `packages/database/package.json` (name: @openideth/database, deps: prisma, @prisma/client)
- [ ] **T-017:** `packages/database/tsconfig.json`
- [ ] **T-018:** `packages/database/prisma/schema.prisma` - Tum tablolar:

  **users tablosu:**
  - id (UUID, default uuid), email (unique), passwordHash, name, role (UserRole enum), phone (optional)
  - walletAddress (optional, unique), avatarUrl (optional), emailVerified (boolean default false)
  - createdAt, updatedAt
  - Relations: properties, tenantAgreements, landlordAgreements, payments, reviews, notifications, rewardPoints, kycVerification, refreshTokens

  **properties tablosu:**
  - id (UUID), landlordId (FK users), title, description, propertyType (APARTMENT/HOUSE/STUDIO/COMMERCIAL)
  - address, city, state, zipCode, country, latitude (optional Float), longitude (optional Float)
  - bedrooms (Int), bathrooms (Int), area (Float sqm), monthlyRent (Decimal), depositAmount (Decimal)
  - amenities (String[]), rules (String[]), status (PropertyStatus enum)
  - availableFrom (DateTime), isVerified (boolean default false)
  - blockchainRegistryId (optional - Faz 3 icin)
  - searchVector - full text search icin (raw SQL migration ile)
  - createdAt, updatedAt
  - Relations: images, agreements, reviews, landlord

  **property_images tablosu:**
  - id (UUID), propertyId (FK), url, caption (optional), isPrimary (boolean default false), order (Int)
  - createdAt

  **rental_agreements tablosu:**
  - id (UUID), propertyId (FK), landlordId (FK users), tenantId (FK users)
  - startDate, endDate, monthlyRent (Decimal), depositAmount (Decimal)
  - terms (Text optional), status (AgreementStatus enum)
  - landlordSignedAt (optional DateTime), tenantSignedAt (optional DateTime)
  - landlordSignatureIp (optional), tenantSignatureIp (optional)
  - documentUrl (optional - S3 PDF), documentHash (optional - keccak256 for blockchain)
  - blockchainTxHash (optional - Faz 3), blockchainAgreementId (optional)
  - terminatedAt (optional), terminationReason (optional)
  - createdAt, updatedAt
  - Relations: property, landlord, tenant, payments, escrowDeposits

  **payments tablosu:**
  - id (UUID), agreementId (FK), payerId (FK users), payeeId (FK users)
  - amount (Decimal), currency (String default "USD"), method (PaymentMethod enum)
  - status (PaymentStatus enum), dueDate (DateTime), paidAt (optional DateTime)
  - stripePaymentIntentId (optional), stripeTransferId (optional)
  - blockchainTxHash (optional), blockchainConfirmations (optional Int)
  - platformFee (Decimal optional), netAmount (Decimal optional)
  - failureReason (optional String)
  - createdAt, updatedAt
  - Relations: agreement, payer, payee

  **escrow_deposits tablosu:**
  - id (UUID), agreementId (FK), amount (Decimal), currency (String default "USD")
  - status (EscrowStatus enum), depositedAt (DateTime), releasedAt (optional), refundedAt (optional)
  - stripePaymentIntentId (optional), blockchainTxHash (optional)
  - disputeReason (optional), disputeResolvedAt (optional), disputeResolution (optional)
  - resolvedBy (optional FK users - admin)
  - createdAt, updatedAt
  - Relations: agreement, resolver

  **kyc_verifications tablosu:**
  - id (UUID), userId (FK unique), status (KycStatus enum)
  - documentType (optional - PASSPORT/ID_CARD/DRIVERS_LICENSE)
  - documentFrontUrl (optional), documentBackUrl (optional), selfieUrl (optional)
  - rejectionReason (optional), reviewedBy (optional FK users - admin)
  - submittedAt (optional), reviewedAt (optional)
  - createdAt, updatedAt
  - Relations: user, reviewer

  **notifications tablosu:**
  - id (UUID), userId (FK), type (NotificationType enum)
  - title, message, data (Json optional), isRead (boolean default false)
  - createdAt
  - Relations: user

  **reviews tablosu:**
  - id (UUID), propertyId (FK), reviewerId (FK users)
  - rating (Int 1-5), comment (optional Text)
  - createdAt, updatedAt
  - Relations: property, reviewer
  - @@unique([propertyId, reviewerId]) - bir kullanici bir mulke tek review

  **reward_points tablosu:**
  - id (UUID), userId (FK), points (Int), reason (String)
  - referenceType (optional - PAYMENT/KYC/REFERRAL/LISTING)
  - referenceId (optional UUID)
  - createdAt
  - Relations: user

  **refresh_tokens tablosu:**
  - id (UUID), userId (FK), token (String unique), expiresAt (DateTime)
  - isRevoked (boolean default false)
  - createdAt
  - Relations: user

  **Indexler:**
  - users: email, walletAddress
  - properties: landlordId, status, city, (city + status), monthlyRent
  - rental_agreements: propertyId, landlordId, tenantId, status
  - payments: agreementId, payerId, status, dueDate
  - escrow_deposits: agreementId, status
  - notifications: userId + isRead
  - reviews: propertyId, reviewerId
  - reward_points: userId
  - refresh_tokens: token, userId

- [ ] **T-019:** `packages/database/prisma/seed.ts` - Ornek veriler:
  - 3 kullanici (1 admin, 1 landlord, 1 tenant) - sifre: "password123" bcrypt hash
  - 5 ornek mulk (farkli tipler, sehirler, fiyatlar)
  - 2 ornek kira sozlesmesi (1 active, 1 draft)
  - 3 ornek odeme (completed, pending, failed)
  - Ornek bildirimler ve review'lar
- [ ] **T-020:** `packages/database/src/index.ts` (PrismaClient export + singleton pattern)
- [ ] **T-021:** `packages/database/src/client.ts` (PrismaClient instantiation with logging)

### 1.4 Docker Altyapisi
- [ ] **T-022:** `docker/Dockerfile.api` - Multi-stage:
  - Stage 1 (deps): node:20-alpine, pnpm install --frozen-lockfile
  - Stage 2 (build): TypeScript compile, prisma generate
  - Stage 3 (production): Minimal, non-root user, HEALTHCHECK
- [ ] **T-023:** `docker/Dockerfile.web` - Multi-stage:
  - Stage 1 (deps): node:20-alpine, pnpm install
  - Stage 2 (build): next build (standalone output)
  - Stage 3 (production): Minimal, non-root user, HEALTHCHECK
- [ ] **T-024:** `docker/Dockerfile.worker` - Multi-stage (api ile benzer, farkli entrypoint)
- [ ] **T-025:** `docker/nginx/nginx.conf` - Ana nginx ayarlari:
  - Worker processes auto, gzip on, proxy headers
- [ ] **T-026:** `docker/nginx/default.conf` - Site config:
  - `/` -> web:3000 (Next.js)
  - `/api` -> api:4000 (NestJS)
  - WebSocket upgrade destegi
  - Static file caching headers
- [ ] **T-027:** `docker/postgres/init.sql`:
  - CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
  - CREATE EXTENSION IF NOT EXISTS "pg_trgm" (fuzzy search icin)
- [ ] **T-028:** `docker-compose.yml` - Gelistirme ortami:
  ```
  services:
    postgres:  (16-alpine, port 5432, volume, healthcheck)
    redis:     (7-alpine, port 6379, healthcheck)
    api:       (Dockerfile.api, port 4000+9229, depends postgres+redis, volume mount, env_file)
    worker:    (Dockerfile.worker, depends postgres+redis, env_file)
    web:       (Dockerfile.web, port 3000, depends api, volume mount, env_file)
    hardhat:   (node:20-alpine, command: npx hardhat node, port 8545)
    nginx:     (nginx:alpine, port 80, depends web+api, config volumes)
  volumes: postgres_data, redis_data
  networks: openideth-network
  ```
- [ ] **T-029:** `docker-compose.prod.yml` - Uretim override'lari (restart: always, resource limits, no debug port)

---

## FAZ 2: Backend API (NestJS)

### 2.1 NestJS Iskelet
- [ ] **T-030:** `apps/api/package.json` - Dependencies:
  - @nestjs/core, @nestjs/common, @nestjs/platform-express, @nestjs/config
  - @nestjs/passport, @nestjs/jwt, passport, passport-jwt
  - @nestjs/swagger (Swagger/OpenAPI)
  - @nestjs/bull (BullMQ entegrasyonu)
  - @openideth/shared, @openideth/database
  - bcrypt, class-validator, class-transformer
  - stripe, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner
  - ioredis, bullmq
  - helmet, compression, express-rate-limit
  - DevDeps: @nestjs/testing, jest, ts-jest, supertest, @types/*
- [ ] **T-031:** `apps/api/tsconfig.json` + `tsconfig.build.json`
- [ ] **T-032:** `apps/api/nest-cli.json`
- [ ] **T-033:** `apps/api/src/main.ts`:
  - ValidationPipe (global, whitelist, transform)
  - Swagger setup (title, description, version, bearer auth)
  - CORS config (FRONTEND_URL)
  - Helmet, Compression
  - Global prefix: 'api/v1'
  - Port: 4000
- [ ] **T-034:** `apps/api/src/app.module.ts`:
  - ConfigModule.forRoot (global, envFilePath)
  - Tum feature module importlari
  - PrismaModule (global)
  - BullModule.forRoot (Redis connection)
  - HealthCheck endpoint

### 2.2 Common (Ortak Altyapi)
- [ ] **T-035:** `apps/api/src/common/prisma/prisma.module.ts` + `prisma.service.ts`:
  - PrismaService extends PrismaClient, onModuleInit, onModuleDestroy
  - Global module olarak export
- [ ] **T-036:** `apps/api/src/common/guards/jwt-auth.guard.ts`:
  - AuthGuard('jwt') extend, canActivate override
  - Token'dan user'i request'e ekle
- [ ] **T-037:** `apps/api/src/common/guards/roles.guard.ts`:
  - @Roles() decorator ile birlikte calisir
  - User role kontrolu, yetkisiz erisimde ForbiddenException
- [ ] **T-038:** `apps/api/src/common/decorators/roles.decorator.ts` (@Roles(...roles) metadata decorator)
- [ ] **T-039:** `apps/api/src/common/decorators/current-user.decorator.ts` (@CurrentUser() request.user cekme)
- [ ] **T-040:** `apps/api/src/common/filters/http-exception.filter.ts`:
  - Tum hatalari yakalayip standart format don { statusCode, message, error, timestamp, path }
- [ ] **T-041:** `apps/api/src/common/interceptors/transform.interceptor.ts`:
  - Basarili response'lari wrap et: { data, meta: { timestamp } }
- [ ] **T-042:** `apps/api/src/common/dto/pagination.dto.ts`:
  - PaginationQueryDto (page, limit - class-validator decoratorleri ile)
  - PaginatedResponseDto<T> (data, meta: { total, page, limit, totalPages })

### 2.3 Auth Modulu
- [ ] **T-043:** `apps/api/src/modules/auth/auth.module.ts`:
  - JwtModule.registerAsync (ConfigService'den secret ve expiration)
  - PassportModule.register({ defaultStrategy: 'jwt' })
  - Import: UsersModule
- [ ] **T-044:** `apps/api/src/modules/auth/auth.service.ts`:
  - register(dto): email unique kontrol, bcrypt hash, user olustur, token cift don
  - login(dto): email+password dogrula, token cifti don
  - refreshToken(token): refresh token dogrula, yeni token cifti don, eski token'i revoke et
  - logout(userId, token): refresh token'i revoke et
  - getProfile(userId): kullanici bilgisi don (passwordHash haric)
  - generateTokens(userId, role): { accessToken, refreshToken } olustur
  - hashPassword(password): bcrypt.hash (salt 12)
  - comparePasswords(plain, hash): bcrypt.compare
- [ ] **T-045:** `apps/api/src/modules/auth/auth.controller.ts`:
  - POST /auth/register -> register dto, 201 don
  - POST /auth/login -> login dto, { accessToken, refreshToken, user } don
  - POST /auth/refresh -> { refreshToken } body, yeni token cifti don
  - POST /auth/logout -> JWT auth gerekli, refresh token revoke
  - GET /auth/me -> JWT auth gerekli, kullanici profili don
- [ ] **T-046:** `apps/api/src/modules/auth/strategies/jwt.strategy.ts`:
  - PassportStrategy(Strategy) extend
  - validate(payload): payload'dan userId ve role extract et
  - jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
- [ ] **T-047:** `apps/api/src/modules/auth/dto/`:
  - register.dto.ts (email, password, name, role - class-validator)
  - login.dto.ts (email, password)
  - refresh-token.dto.ts (refreshToken)
  - auth-response.dto.ts (accessToken, refreshToken, user)

### 2.4 Users Modulu
- [ ] **T-048:** `apps/api/src/modules/users/users.module.ts`
- [ ] **T-049:** `apps/api/src/modules/users/users.service.ts`:
  - findById(id): kullanici bul (passwordHash haric)
  - findByEmail(email): email ile bul
  - update(id, dto): profil guncelle (name, phone, avatarUrl)
  - updateWalletAddress(id, address): wallet adresi ekle/guncelle
  - findAll(pagination, filters): admin icin kullanici listesi (role, search)
  - getStats(userId): kullanici istatistikleri (mulk sayisi, sozlesme sayisi, odeme toplami)
- [ ] **T-050:** `apps/api/src/modules/users/users.controller.ts`:
  - GET /users/me -> profil (JWT)
  - PATCH /users/me -> profil guncelle (JWT)
  - PATCH /users/me/wallet -> wallet adresi guncelle (JWT)
  - GET /users (admin only) -> kullanici listesi
  - GET /users/:id (admin only) -> belirli kullanici detay

### 2.5 Properties Modulu
- [ ] **T-051:** `apps/api/src/modules/properties/properties.module.ts`
- [ ] **T-052:** `apps/api/src/modules/properties/properties.service.ts`:
  - create(landlordId, dto): mulk olustur (status: DRAFT)
  - findAll(query): arama + filtre + pagination (city, minPrice, maxPrice, bedrooms, propertyType, sortBy)
  - findById(id): detay (images, landlord bilgisi, ortalama rating dahil)
  - update(id, landlordId, dto): guncelle (sadece sahip guncelleyebilir)
  - delete(id, landlordId): soft delete (status: INACTIVE)
  - updateStatus(id, status): admin icin durum degistirme
  - getMyListings(landlordId, pagination): landlord'un ilanları
  - addImage(propertyId, imageData): resim ekle (max 10 per property)
  - removeImage(imageId, landlordId): resim sil
  - toggleFavorite(userId, propertyId): favori ekle/cikar
  - getFavorites(userId, pagination): favoriler listesi
  - verify(id, adminId): mulku dogrula (isVerified = true)
- [ ] **T-053:** `apps/api/src/modules/properties/properties.controller.ts`:
  - POST /properties -> olustur (landlord only)
  - GET /properties -> arama + filtre (public)
  - GET /properties/my-listings -> landlord ilanları (JWT, landlord)
  - GET /properties/favorites -> favorilerim (JWT)
  - GET /properties/:id -> detay (public)
  - PATCH /properties/:id -> guncelle (JWT, owner only)
  - DELETE /properties/:id -> sil (JWT, owner only)
  - POST /properties/:id/images -> resim ekle (JWT, owner)
  - DELETE /properties/:id/images/:imageId -> resim sil (JWT, owner)
  - POST /properties/:id/favorite -> favori toggle (JWT)
  - PATCH /properties/:id/verify -> dogrula (JWT, admin only)
- [ ] **T-054:** `apps/api/src/modules/properties/dto/`:
  - create-property.dto.ts, update-property.dto.ts, property-search-query.dto.ts

### 2.6 Agreements Modulu
- [ ] **T-055:** `apps/api/src/modules/agreements/agreements.module.ts`
- [ ] **T-056:** `apps/api/src/modules/agreements/agreements.service.ts`:
  - create(landlordId, dto): sozlesme olustur (status: DRAFT, mulk musaitlik kontrolu)
  - findById(id, userId): detay (taraflardan biri veya admin olmali)
  - findByUser(userId, role, pagination): kullanicinin sozlesmeleri
  - update(id, landlordId, dto): draft iken guncelle
  - sign(id, userId, ip): imzala (landlord veya tenant, her ikisi imzalayinca ACTIVE)
  - terminate(id, userId, reason): sonlandir (taraflardan biri, status: TERMINATED)
  - uploadDocument(id, userId, url, hash): PDF belge URL ve hash kaydet
  - findExpiring(days): yakında sona erecek sozlesmeler (cron job icin)
- [ ] **T-057:** `apps/api/src/modules/agreements/agreements.controller.ts`:
  - POST /agreements -> olustur (JWT, landlord)
  - GET /agreements -> kullanicinin sozlesmeleri (JWT)
  - GET /agreements/:id -> detay (JWT, taraf veya admin)
  - PATCH /agreements/:id -> guncelle (JWT, landlord, draft iken)
  - POST /agreements/:id/sign -> imzala (JWT, taraf)
  - POST /agreements/:id/terminate -> sonlandir (JWT, taraf)
  - POST /agreements/:id/upload-document -> belge yukle (JWT, taraf)
- [ ] **T-058:** `apps/api/src/modules/agreements/dto/`:
  - create-agreement.dto.ts, update-agreement.dto.ts, sign-agreement.dto.ts

### 2.7 Payments Modulu (Strategy Pattern)
- [ ] **T-059:** `apps/api/src/modules/payments/payments.module.ts`
- [ ] **T-060:** `apps/api/src/modules/payments/interfaces/payment-strategy.interface.ts`:
  - IPaymentStrategy: createPayment(dto), confirmPayment(id), refundPayment(id)
- [ ] **T-061:** `apps/api/src/modules/payments/strategies/stripe-payment.strategy.ts`:
  - Stripe SDK ile PaymentIntent olustur, confirm, refund
  - Platform fee hesaplama (basis points)
  - Connected account transfer (landlord'a)
- [ ] **T-062:** `apps/api/src/modules/payments/strategies/crypto-payment.strategy.ts`:
  - Placeholder - Faz 3'te implement edilecek
  - Simdilik NotImplementedException firlat
- [ ] **T-063:** `apps/api/src/modules/payments/payments.service.ts`:
  - createPayment(userId, dto): odeme olustur (strategy secimi method'a gore)
  - confirmPayment(id): odemeyi onayla
  - getPaymentsByAgreement(agreementId, pagination): sozlesme odemeleri
  - getPaymentsByUser(userId, pagination): kullanici odemeleri
  - getUpcomingPayments(userId): yaklasan odemeler
  - handleStripeWebhook(event): Stripe webhook isleme
  - calculatePlatformFee(amount): komisyon hesapla
  - getPaymentStats(userId): istatistikler (toplam gelir/gider, bekleyen, tamamlanan)
- [ ] **T-064:** `apps/api/src/modules/payments/payments.controller.ts`:
  - POST /payments/stripe/create-intent -> Stripe PaymentIntent olustur (JWT)
  - POST /payments/stripe/confirm -> onayla (JWT)
  - POST /payments/crypto/initiate -> kripto odeme baslat (JWT, placeholder)
  - GET /payments -> kullanici odemeleri (JWT)
  - GET /payments/upcoming -> yaklasan odemeler (JWT)
  - GET /payments/:id -> odeme detay (JWT, taraf)
  - GET /payments/stats -> istatistikler (JWT)
  - POST /payments/stripe/webhook -> Stripe webhook (no auth, raw body, signature verify)
- [ ] **T-065:** `apps/api/src/modules/payments/dto/`:
  - create-payment.dto.ts, payment-query.dto.ts

### 2.8 Escrow Modulu
- [ ] **T-066:** `apps/api/src/modules/escrow/escrow.module.ts`
- [ ] **T-067:** `apps/api/src/modules/escrow/escrow.service.ts`:
  - createDeposit(agreementId, amount): depozito olustur (Stripe hold veya kayit)
  - release(id, adminOrLandlordId): depozitoyu serbest birak
  - refund(id, adminId): iade et
  - dispute(id, userId, reason): uyusmazlik baslat
  - resolveDispute(id, adminId, resolution): uyusmazlik coz (release veya refund)
  - getByAgreement(agreementId): sozlesme escrow durumu
- [ ] **T-068:** `apps/api/src/modules/escrow/escrow.controller.ts`:
  - POST /escrow/deposit -> depozito olustur (JWT)
  - POST /escrow/:id/release -> serbest birak (JWT, landlord/admin)
  - POST /escrow/:id/refund -> iade (JWT, admin)
  - POST /escrow/:id/dispute -> uyusmazlik (JWT, taraf)
  - POST /escrow/:id/resolve -> coz (JWT, admin)
  - GET /escrow/agreement/:agreementId -> escrow durumu (JWT, taraf/admin)

### 2.9 Notifications Modulu
- [ ] **T-069:** `apps/api/src/modules/notifications/notifications.module.ts`
- [ ] **T-070:** `apps/api/src/modules/notifications/notifications.service.ts`:
  - create(userId, type, title, message, data?): bildirim olustur
  - findByUser(userId, pagination, unreadOnly?): kullanici bildirimleri
  - markAsRead(id, userId): okundu isaretle
  - markAllAsRead(userId): tumunu okundu isaretle
  - getUnreadCount(userId): okunmamis sayisi
  - deleteOld(days): eski bildirimleri temizle (cron)
- [ ] **T-071:** `apps/api/src/modules/notifications/notifications.controller.ts`:
  - GET /notifications -> bildirimler (JWT, query: unreadOnly)
  - GET /notifications/unread-count -> okunmamis sayisi (JWT)
  - PATCH /notifications/:id/read -> okundu isaretle (JWT)
  - PATCH /notifications/read-all -> tumunu okundu isaretle (JWT)

### 2.10 KYC Modulu
- [ ] **T-072:** `apps/api/src/modules/kyc/kyc.module.ts`
- [ ] **T-073:** `apps/api/src/modules/kyc/kyc.service.ts`:
  - initiate(userId): KYC sureci baslat (status: PENDING)
  - uploadDocument(userId, type, frontUrl, backUrl?, selfieUrl?): belge yukle
  - getStatus(userId): KYC durumu
  - review(id, adminId, approved, rejectionReason?): admin inceleme
  - getPendingReviews(pagination): bekleyen inceleme listesi (admin)
- [ ] **T-074:** `apps/api/src/modules/kyc/kyc.controller.ts`:
  - POST /kyc/initiate -> baslat (JWT)
  - POST /kyc/documents -> belge yukle (JWT)
  - GET /kyc/status -> durum (JWT)
  - GET /kyc/pending -> bekleyen incelemeler (JWT, admin)
  - POST /kyc/:id/review -> incele (JWT, admin)

### 2.11 Reviews Modulu
- [ ] **T-075:** `apps/api/src/modules/reviews/reviews.module.ts`
- [ ] **T-076:** `apps/api/src/modules/reviews/reviews.service.ts`:
  - create(reviewerId, dto): review olustur (sozlesmesi olan tenant only)
  - findByProperty(propertyId, pagination): mulk review'lari
  - findByUser(userId, pagination): kullanicinin review'lari
  - getAverageRating(propertyId): ortalama puan
- [ ] **T-077:** `apps/api/src/modules/reviews/reviews.controller.ts`:
  - POST /reviews -> olustur (JWT, tenant)
  - GET /reviews/property/:propertyId -> mulk review'lari (public)
  - GET /reviews/my -> benim review'larim (JWT)

### 2.12 Admin Modulu
- [ ] **T-078:** `apps/api/src/modules/admin/admin.module.ts`
- [ ] **T-079:** `apps/api/src/modules/admin/admin.service.ts`:
  - getDashboardStats(): toplam kullanici, mulk, sozlesme, odeme, gelir istatistikleri
  - getUsers(pagination, filters): kullanici yonetimi
  - updateUserRole(userId, role): rol degistir
  - suspendUser(userId): kullanici askiya al
  - getPaymentOverview(dateRange): odeme genel gorunumu
  - getDisputeQueue(pagination): uyusmazlik kuyrugu
  - getReports(type, dateRange): raporlar (gelir, kullanici, mulk)
- [ ] **T-080:** `apps/api/src/modules/admin/admin.controller.ts`:
  - GET /admin/dashboard -> istatistikler (JWT, admin)
  - GET /admin/users -> kullanicilar (JWT, admin)
  - PATCH /admin/users/:id/role -> rol degistir (JWT, admin)
  - PATCH /admin/users/:id/suspend -> askiya al (JWT, admin)
  - GET /admin/payments -> odeme gorunumu (JWT, admin)
  - GET /admin/disputes -> uyusmazliklar (JWT, admin)
  - GET /admin/reports/:type -> raporlar (JWT, admin)

### 2.13 File Upload Servisi
- [ ] **T-081:** `apps/api/src/common/services/file-upload.service.ts`:
  - generatePresignedUploadUrl(key, contentType): S3 pre-signed URL olustur
  - generatePresignedDownloadUrl(key): S3 indirme URL
  - deleteFile(key): S3 dosya sil
  - Gelistirme ortaminda lokal dosya sistemi fallback

### 2.14 Health Check
- [ ] **T-082:** `apps/api/src/modules/health/health.module.ts` + `health.controller.ts`:
  - GET /health -> { status: 'ok', timestamp, uptime, database: 'connected', redis: 'connected' }

### 2.15 Backend Testleri
- [ ] **T-083:** `apps/api/jest.config.ts` (jest ayarlari, path mapping)
- [ ] **T-084:** `apps/api/test/auth.e2e-spec.ts` - Auth endpoint integration testleri:
  - Register basarili, duplicate email hata, login basarili, yanlis sifre, refresh token, logout
- [ ] **T-085:** `apps/api/test/properties.e2e-spec.ts` - Property endpoint testleri:
  - CRUD, arama, yetki kontrolleri

---

## FAZ 3: Frontend (Next.js)

### 3.1 Next.js Iskelet
- [ ] **T-086:** `apps/web/package.json` - Dependencies:
  - next, react, react-dom
  - @tanstack/react-query, zustand
  - tailwindcss, @tailwindcss/postcss, postcss
  - lucide-react (ikonlar)
  - date-fns (tarih formatlama)
  - @openideth/shared
  - DevDeps: typescript, @types/react, @types/node
- [ ] **T-087:** `apps/web/tsconfig.json` (Next.js uyumlu, path aliases: @/*)
- [ ] **T-088:** `apps/web/next.config.ts` (standalone output, transpilePackages: @openideth/shared)
- [ ] **T-089:** `apps/web/postcss.config.mjs` (tailwindcss plugin)
- [ ] **T-090:** `apps/web/src/app/globals.css` (Tailwind v4 import + CSS variables tema)
- [ ] **T-091:** `apps/web/tailwind.config.ts` (content paths, tema extend - renkler, fontlar)

### 3.2 Altyapi ve Yardimci Dosyalar
- [ ] **T-092:** `apps/web/src/lib/api-client.ts` - API client:
  - fetchApi(endpoint, options): base URL + auth header + error handling
  - get, post, patch, delete helper metodlari
  - Token refresh interceptor (401'de otomatik refresh)
- [ ] **T-093:** `apps/web/src/lib/auth.ts` - Auth yardimcilari:
  - getToken/setToken/removeToken (localStorage)
  - isAuthenticated(): token varlik kontrolu
  - getUserFromToken(): JWT decode ile user bilgisi
- [ ] **T-094:** `apps/web/src/lib/utils.ts`:
  - cn() (clsx + tailwind-merge), formatCurrency(), formatDate(), truncate()
- [ ] **T-095:** `apps/web/src/hooks/use-auth.ts`:
  - useAuth() hook: user, login, register, logout, isLoading, isAuthenticated
  - Zustand store ile auth state yonetimi
- [ ] **T-096:** `apps/web/src/hooks/use-properties.ts`:
  - TanStack Query hooks: useProperties, useProperty, useMyListings, useCreateProperty, useUpdateProperty, useFavorites, useToggleFavorite
- [ ] **T-097:** `apps/web/src/hooks/use-agreements.ts`:
  - TanStack Query hooks: useAgreements, useAgreement, useCreateAgreement, useSignAgreement
- [ ] **T-098:** `apps/web/src/hooks/use-payments.ts`:
  - TanStack Query hooks: usePayments, useUpcomingPayments, useCreatePayment, usePaymentStats
- [ ] **T-099:** `apps/web/src/hooks/use-notifications.ts`:
  - TanStack Query hooks: useNotifications, useUnreadCount, useMarkAsRead
- [ ] **T-100:** `apps/web/src/providers/query-provider.tsx`:
  - QueryClientProvider wrapper (staleTime, retry config)
- [ ] **T-101:** `apps/web/src/providers/auth-provider.tsx`:
  - AuthProvider: token'dan user state'i yukle, protected route yonetimi

### 3.3 UI Bileşenleri (shadcn/ui bazli)
- [ ] **T-102:** `apps/web/src/components/ui/button.tsx` - Button (variant: default/outline/ghost/destructive, size: sm/md/lg)
- [ ] **T-103:** `apps/web/src/components/ui/input.tsx` - Input (label, error, helper text)
- [ ] **T-104:** `apps/web/src/components/ui/card.tsx` - Card (header, content, footer)
- [ ] **T-105:** `apps/web/src/components/ui/badge.tsx` - Badge (variant: default/success/warning/error)
- [ ] **T-106:** `apps/web/src/components/ui/dialog.tsx` - Modal/Dialog
- [ ] **T-107:** `apps/web/src/components/ui/select.tsx` - Select dropdown
- [ ] **T-108:** `apps/web/src/components/ui/table.tsx` - Table (header, body, row, cell)
- [ ] **T-109:** `apps/web/src/components/ui/textarea.tsx` - Textarea
- [ ] **T-110:** `apps/web/src/components/ui/avatar.tsx` - Avatar (initials fallback)
- [ ] **T-111:** `apps/web/src/components/ui/dropdown-menu.tsx` - Dropdown Menu
- [ ] **T-112:** `apps/web/src/components/ui/tabs.tsx` - Tabs
- [ ] **T-113:** `apps/web/src/components/ui/toast.tsx` + `use-toast.ts` - Toast notification sistemi
- [ ] **T-114:** `apps/web/src/components/ui/skeleton.tsx` - Loading skeleton

### 3.4 Layout Bileşenleri
- [ ] **T-115:** `apps/web/src/components/layout/header.tsx` - Public header (logo, nav, auth buttons)
- [ ] **T-116:** `apps/web/src/components/layout/footer.tsx` - Public footer (linkler, copyright)
- [ ] **T-117:** `apps/web/src/components/layout/sidebar.tsx` - Dashboard sidebar (rol bazli navigasyon)
- [ ] **T-118:** `apps/web/src/components/layout/dashboard-header.tsx` - Dashboard header (user menu, notifications bell, breadcrumb)
- [ ] **T-119:** `apps/web/src/components/layout/dashboard-layout.tsx` - Dashboard layout (sidebar + header + content wrapper)

### 3.5 Feature Bileşenleri
- [ ] **T-120:** `apps/web/src/components/properties/property-card.tsx` - Mulk kart bileşeni (resim, baslik, fiyat, konum, detay)
- [ ] **T-121:** `apps/web/src/components/properties/property-grid.tsx` - Mulk grid/liste gorunumu
- [ ] **T-122:** `apps/web/src/components/properties/property-search-filters.tsx` - Arama filtreleri (sehir, fiyat aralik, oda, tip)
- [ ] **T-123:** `apps/web/src/components/properties/property-form.tsx` - Mulk olustur/duzenle formu
- [ ] **T-124:** `apps/web/src/components/properties/property-image-gallery.tsx` - Resim galerisi
- [ ] **T-125:** `apps/web/src/components/agreements/agreement-card.tsx` - Sozlesme kart
- [ ] **T-126:** `apps/web/src/components/agreements/agreement-form.tsx` - Sozlesme olusturma formu
- [ ] **T-127:** `apps/web/src/components/payments/payment-table.tsx` - Odeme tablosu
- [ ] **T-128:** `apps/web/src/components/payments/payment-stats.tsx` - Odeme istatistikleri kart
- [ ] **T-129:** `apps/web/src/components/dashboard/stats-card.tsx` - Istatistik karti (ikon, baslik, deger, degisim)
- [ ] **T-130:** `apps/web/src/components/notifications/notification-bell.tsx` - Bildirim zili (unread count)
- [ ] **T-131:** `apps/web/src/components/notifications/notification-list.tsx` - Bildirim listesi

### 3.6 Public Sayfalar
- [ ] **T-132:** `apps/web/src/app/layout.tsx` - Root layout (providers, font, metadata)
- [ ] **T-133:** `apps/web/src/app/page.tsx` - Landing page:
  - Hero section (baslik, aciklama, CTA butonlari)
  - "Nasil Calisir" 3 adim section
  - One cikan mulkler grid (mock data veya API)
  - CTA banner (kaydol)
  - Footer
- [ ] **T-134:** `apps/web/src/app/(public)/layout.tsx` - Public layout (header + footer)
- [ ] **T-135:** `apps/web/src/app/(public)/properties/page.tsx` - Property search page:
  - Arama bari + filtreler (sidebar veya top)
  - Property grid (sayfalama, loading skeleton)
  - Sonuc sayisi
- [ ] **T-136:** `apps/web/src/app/(public)/properties/[id]/page.tsx` - Property detail:
  - Resim galerisi, baslik, fiyat, konum
  - Detaylar (oda, alan, amenities)
  - Ev sahibi bilgisi (avatar, isim)
  - Review'lar
  - Basvur/Ilgileniyorum CTA
- [ ] **T-137:** `apps/web/src/app/(auth)/login/page.tsx` - Login sayfasi:
  - Email + password form
  - "Sifremi unuttum" linki
  - "Hesabin yok mu? Kaydol" linki
  - Hata mesajlari
- [ ] **T-138:** `apps/web/src/app/(auth)/register/page.tsx` - Register sayfasi:
  - Email, password, isim, rol secimi (tenant/landlord) formu
  - Sartlari kabul et checkbox
  - "Hesabin var mi? Giris yap" linki
- [ ] **T-139:** `apps/web/src/app/(auth)/layout.tsx` - Auth layout (centered card)

### 3.7 Dashboard Sayfalari (Landlord)
- [ ] **T-140:** `apps/web/src/app/(dashboard)/layout.tsx` - Dashboard layout (sidebar + header, auth guard)
- [ ] **T-141:** `apps/web/src/app/(dashboard)/dashboard/page.tsx` - Dashboard anasayfa:
  - Rol bazli icerik (landlord vs tenant)
  - Istatistik kartlari (toplam mulk/sozlesme/gelir veya gider/bekleyen)
  - Son aktiviteler listesi
  - Hizli islemler
- [ ] **T-142:** `apps/web/src/app/(dashboard)/properties/page.tsx` - Ilanlarim (landlord):
  - Mulk listesi tablo/grid gorunumu
  - Durum badge'leri
  - Yeni ilan ekle butonu
  - Arama/filtre
- [ ] **T-143:** `apps/web/src/app/(dashboard)/properties/new/page.tsx` - Yeni mulk olustur:
  - Cok adimli form (temel bilgi -> detay -> resimler -> onizleme)
  - Resim yukleme (drag & drop)
  - Amenity secimi
- [ ] **T-144:** `apps/web/src/app/(dashboard)/properties/[id]/edit/page.tsx` - Mulk duzenle
- [ ] **T-145:** `apps/web/src/app/(dashboard)/agreements/page.tsx` - Sozlesmelerim:
  - Sozlesme listesi (durum filtre: active, draft, expired)
  - Yeni sozlesme olustur butonu (landlord)
- [ ] **T-146:** `apps/web/src/app/(dashboard)/agreements/new/page.tsx` - Sozlesme olustur:
  - Mulk secimi, kiraciya davet, tarihler, kira bedeli, sartlar
- [ ] **T-147:** `apps/web/src/app/(dashboard)/agreements/[id]/page.tsx` - Sozlesme detay:
  - Taraflar, sartlar, durum
  - Imzala butonu (imzalanmamissa)
  - Sonlandir butonu (aktifse)
  - Odeme gecmisi
  - Belge goruntule/indir
- [ ] **T-148:** `apps/web/src/app/(dashboard)/payments/page.tsx` - Odemeler:
  - Odeme tablosu (tarih, tutar, durum, method)
  - Filtreler (durum, tarih araligi)
  - Istatistik kartlari (toplam gelir, bekleyen)
- [ ] **T-149:** `apps/web/src/app/(dashboard)/payments/pay/page.tsx` - Odeme yap (tenant):
  - Sozlesme secimi, tutar, method secimi
  - Stripe checkout veya kripto odeme

### 3.8 Dashboard Sayfalari (Shared)
- [ ] **T-150:** `apps/web/src/app/(dashboard)/profile/page.tsx` - Profil:
  - Kullanici bilgileri formu (isim, email, telefon)
  - Avatar yukleme
  - Sifre degistirme
- [ ] **T-151:** `apps/web/src/app/(dashboard)/favorites/page.tsx` - Favorilerim (tenant):
  - Favori mulk grid'i
  - Favoriden cikar butonu
- [ ] **T-152:** `apps/web/src/app/(dashboard)/kyc/page.tsx` - KYC dogrulama:
  - Mevcut durum gosterimi
  - Belge yukleme formu (on, arka, selfie)
  - Durum takibi (timeline)
- [ ] **T-153:** `apps/web/src/app/(dashboard)/notifications/page.tsx` - Bildirimler:
  - Bildirim listesi (tip ikonu, baslik, mesaj, zaman)
  - Okundu/okunmamis toggle
  - Tumunu okundu isaretle

### 3.9 Admin Sayfalari
- [ ] **T-154:** `apps/web/src/app/(dashboard)/admin/page.tsx` - Admin dashboard:
  - Genel istatistikler (kullanici, mulk, odeme, gelir grafigi)
  - Son aktiviteler
  - Uyari/aksiyonlar (bekleyen KYC, uyusmazlik)
- [ ] **T-155:** `apps/web/src/app/(dashboard)/admin/users/page.tsx` - Kullanici yonetimi:
  - Kullanici tablosu (isim, email, rol, durum, kayit tarihi)
  - Filtre (rol, durum), arama
  - Rol degistir, askiya al aksiyonlari
- [ ] **T-156:** `apps/web/src/app/(dashboard)/admin/properties/page.tsx` - Mulk moderasyonu:
  - Mulk tablosu (baslik, sahip, durum, dogrulama)
  - Dogrula/reddet aksiyonlari
- [ ] **T-157:** `apps/web/src/app/(dashboard)/admin/payments/page.tsx` - Odeme gozetimi:
  - Odeme tablosu (tum odemeler)
  - Filtreler, istatistikler
- [ ] **T-158:** `apps/web/src/app/(dashboard)/admin/disputes/page.tsx` - Uyusmazlik cozumu:
  - Uyusmazlik listesi, detay, cozum aksiyonlari

---

## FAZ 4: Smart Contracts (Solidity)

### 4.1 Hardhat Kurulumu
- [ ] **T-159:** `packages/contracts/package.json` (hardhat, @openzeppelin/contracts, ethers, chai, typechain)
- [ ] **T-160:** `packages/contracts/hardhat.config.ts`:
  - Solidity 0.8.24, optimizer 200 runs
  - Networks: localhost (8545), sepolia, mainnet
  - TypeChain output
- [ ] **T-161:** `packages/contracts/tsconfig.json`

### 4.2 Smart Contracts
- [ ] **T-162:** `packages/contracts/contracts/RewardToken.sol` - ERC-20 odul tokeni:
  - "OpenIDEth Reward" / "OIDR"
  - AccessControl: DEFAULT_ADMIN_ROLE, MINTER_ROLE
  - mint(to, amount): MINTER_ROLE only
  - ERC20Permit (gasless approval)
  - ERC20Burnable
  - Pausable (admin acil durdurma)

- [ ] **T-163:** `packages/contracts/contracts/PropertyRegistry.sol`:
  - Struct: Property { owner, dataHash, isVerified, uri, registeredAt }
  - registerProperty(dataHash, uri): mulk kaydet, PropertyRegistered event
  - verifyProperty(propertyId): VERIFIER_ROLE, PropertyVerified event
  - transferOwnership(propertyId, newOwner): sadece sahip
  - getProperty(propertyId): mulk bilgisi
  - getPropertiesByOwner(owner): sahip mulkleri
  - AccessControl: VERIFIER_ROLE
  - Pausable

- [ ] **T-164:** `packages/contracts/contracts/EscrowContract.sol`:
  - Struct: Escrow { tenant, landlord, amount, token, status, createdAt, releaseTime }
  - Enum: EscrowStatus { Active, Released, Refunded, Disputed }
  - deposit(landlord, releaseTime) payable: ETH depozito
  - depositToken(landlord, token, amount, releaseTime): ERC20 depozito
  - release(escrowId): landlord + releaseTime gecmis olmali
  - refund(escrowId): ARBITRATOR_ROLE veya iki taraf onay
  - dispute(escrowId): taraflardan biri
  - resolveDispute(escrowId, toTenant): ARBITRATOR_ROLE
  - ReentrancyGuard, Pausable
  - Pull-over-push: withdraw() ile para cekme
  - Events: Deposited, Released, Refunded, Disputed, DisputeResolved

- [ ] **T-165:** `packages/contracts/contracts/RentalAgreement.sol`:
  - Struct: Agreement { landlord, tenant, propertyId, monthlyRent, deposit, startDate, endDate, documentHash, status, landlordSigned, tenantSigned }
  - Enum: Status { Draft, Active, Terminated, Expired }
  - createAgreement(params): landlord olusturur
  - signAgreement(agreementId): taraf imzalar, iki taraf imzalayinca Active
  - terminateAgreement(agreementId, reason): taraf sonlandirir
  - verifyDocument(agreementId, hash): belge hash dogrulama
  - getAgreement(agreementId): detay
  - Events: AgreementCreated, AgreementSigned, AgreementActivated, AgreementTerminated

- [ ] **T-166:** `packages/contracts/contracts/PaymentProcessor.sol`:
  - Struct: Payment { payer, payee, amount, token, agreementId, timestamp, platformFee }
  - payRent(agreementId) payable: ETH ile kira ode
  - payRentToken(agreementId, token, amount): ERC20 ile ode
  - setPlatformFee(feeBps): admin, max 1000 (10%)
  - setTreasury(address): platform hazine adresi
  - Otomatik split: payee alir (amount - fee), treasury alir (fee)
  - SafeERC20 kullanimi
  - Events: RentPaid, PlatformFeeUpdated, TreasuryUpdated
  - ReentrancyGuard, Pausable

### 4.3 Deploy Scripts
- [ ] **T-167:** `packages/contracts/scripts/deploy.ts`:
  - Deploy sirasi: RewardToken -> PropertyRegistry -> EscrowContract -> RentalAgreement -> PaymentProcessor
  - Adres kaydi (JSON dosyasina yaz)
  - Rol atamalari (MINTER_ROLE, VERIFIER_ROLE, ARBITRATOR_ROLE)
  - Console log (deployed addresses)
- [ ] **T-168:** `packages/contracts/scripts/verify.ts` - Etherscan dogrulama scripti

### 4.4 Contract Testleri
- [ ] **T-169:** `packages/contracts/test/RewardToken.test.ts`:
  - Deploy, mint, transfer, burn, pause, permit
  - Rol kontrolleri (unauthorized mint reject)
- [ ] **T-170:** `packages/contracts/test/PropertyRegistry.test.ts`:
  - Register, verify, transfer, unauthorized access
- [ ] **T-171:** `packages/contracts/test/EscrowContract.test.ts`:
  - Deposit (ETH + token), release, refund, dispute, resolve
  - Reentrancy guard testi, zaman kilidi
- [ ] **T-172:** `packages/contracts/test/RentalAgreement.test.ts`:
  - Create, sign (both parties), terminate, document verify
- [ ] **T-173:** `packages/contracts/test/PaymentProcessor.test.ts`:
  - Pay rent (ETH + token), fee calculation, treasury split

---

## FAZ 5: Worker ve Arka Plan Islemleri

- [ ] **T-174:** `apps/api/src/modules/worker/worker.module.ts` - BullMQ worker module
- [ ] **T-175:** `apps/api/src/modules/worker/processors/email.processor.ts`:
  - PAYMENT_REMINDER: odeme hatirlatma maili
  - AGREEMENT_NOTIFICATION: sozlesme bildirim maili
  - KYC_STATUS: KYC durum guncelleme maili
  - WELCOME: kayit hosgeldin maili
- [ ] **T-176:** `apps/api/src/modules/worker/processors/payment-reminder.processor.ts`:
  - Yaklasan odemeleri kontrol et (3 gun, 1 gun, vadesinde)
  - Bildirim olustur + email gonder
- [ ] **T-177:** `apps/api/src/modules/worker/processors/blockchain-event.processor.ts`:
  - Placeholder - Faz 3 blockchain event'lerini isle
  - Odeme onay, escrow guncelleme

---

## FAZ 6: CI/CD ve DevOps

- [ ] **T-178:** `.github/workflows/ci.yml` - CI pipeline:
  - Trigger: push + PR (main, develop)
  - Jobs:
    - lint: pnpm lint
    - test-api: pnpm --filter api test (postgres service container)
    - test-contracts: pnpm --filter contracts test (hardhat)
    - build: pnpm build (tum paketler)
  - Node 20, pnpm cache
  - PostgreSQL 16 service container (test-api icin)
  - Redis service container
- [ ] **T-179:** `.github/workflows/deploy.yml` - Deploy pipeline (placeholder):
  - Trigger: push to main
  - Docker build + push to registry
  - Placeholder deploy step

---

## FAZ 7: Dokumantasyon ve Son Kontrol

- [ ] **T-180:** `.env.example` doldurulmus ve guncel
- [ ] **T-181:** Docker compose up ile tum servisler ayaga kalkiyor
- [ ] **T-182:** API health check basarili (GET /api/v1/health)
- [ ] **T-183:** Frontend render ediliyor (GET /)
- [ ] **T-184:** Hardhat node calisiyor (port 8545)
- [ ] **T-185:** Prisma migration basarili
- [ ] **T-186:** Seed data yuklenmis
- [ ] **T-187:** Auth akisi calisiyor (register -> login -> me)
- [ ] **T-188:** Property CRUD calisiyor

---

## Ozet

| Faz | Gorev Sayisi | Aciklama |
|-----|-------------|----------|
| 1 - Altyapi | T-001 ~ T-029 | Monorepo, shared, database, docker |
| 2 - Backend | T-030 ~ T-085 | NestJS API tum moduller + testler |
| 3 - Frontend | T-086 ~ T-158 | Next.js tum sayfalar + bilesenler |
| 4 - Contracts | T-159 ~ T-173 | Solidity sozlesmeleri + testler |
| 5 - Worker | T-174 ~ T-177 | BullMQ arka plan islemleri |
| 6 - CI/CD | T-178 ~ T-179 | GitHub Actions |
| 7 - Dogrulama | T-180 ~ T-188 | Son kontrol + test |
| **Toplam** | **188 gorev** | |

---

## Notlar

- Her faz baslangicinda bu dosya guncellenecektir
- Her gorev tamamlandiginda [x] ile isaretlenecektir
- Review sonrasi degisiklikler bu dosyaya eklenecektir
- Blockchain (Faz 4) opsiyoneldir, Yaklasim B oncelikli olarak ilerlenecektir
- Strategy pattern sayesinde Faz 4 bagimsiz olarak eklenebilir
