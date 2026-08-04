# Mori — Documentação Técnica

## 1. Visão geral da arquitetura

```
Browser (React 19 client components)
    │  fetch / cookies
    ▼
Next.js App Router
    ├─ Server Components / layouts
    ├─ Route Handlers (src/app/api/**)
    └─ Auth via JWT httpOnly cookie
           │
           ▼
     Drizzle ORM  ──►  PostgreSQL
```

- **Frontend:** Client Components para feed, chat, lives, marketplace; layout compartilhado em `src/app/(app)/layout.tsx` com `AppShell`.
- **Backend:** Route Handlers REST sob `/api/*`.
- **Auth:** `bcryptjs` + `jsonwebtoken`, cookie `mori_session`.
- **Realtime aproximado:** polling curto (2–5s) para chat, notificações, lives chat e sinalização WebRTC.
- **WebRTC:** mesh host→viewers; sinalização persistida em `rtc_signals`.

## 2. Banco de dados

Schema em `src/db/schema.ts` (Drizzle + `pg-core`).

### Tabelas principais

| Tabela | Função |
|--------|--------|
| `users` | Contas, roles, premium, xp/level, moris, credits |
| `posts` / `comments` / `likes` / `follows` | Social |
| `moments` / `moment_views` | Momentos (≤24h) |
| `inns` | Pousadas + flags de reserva/monetização |
| `bookings` | Reservas (premium) |
| `guides` | Guias locais |
| `itineraries` | Roteiros |
| `products` / `orders` | Marketplace |
| `credit_packages` / `promotions` | Ads |
| `badges` / `user_badges` | Gamificação |
| `transactions` | Extrato da carteira |
| `conversations` / `messages` | Chat |
| `lives` / `live_messages` / `rtc_signals` | Lives |
| `notifications` | Inbox |

### Enums relevantes
`user_role`, `post_type`, `booking_status`, `order_status`, `product_type`, `promo_status`, `live_status`, `notification_type`.

### Migrações
Usamos `drizzle-kit push` (sem arquivos de migration versionados neste template):
```bash
npx drizzle-kit push
```

## 3. Autenticação e autorização

Arquivo: `src/lib/auth.ts`

- Register/Login geram JWT `{ userId, role }` e setam cookie httpOnly.
- `getCurrentUser()` lê cookie e carrega user (bloqueia `isBanned`).
- `requireUser()` / `requireAdmin()` lançam `UNAUTHORIZED` / `FORBIDDEN` capturados por `handleApi`.

**Premium gate (reservas):**
```ts
if (!me.isPremium && me.role !== "admin") throw new Error("...");
```
Hosts Premium têm `inns.acceptsBookings = true` ao assinar (`/api/premium`).

## 4. Economia e gamificação

Arquivo: `src/lib/gamification.ts`

### Moris
Moeda interna. Usos:
- Assinar Premium
- Comprar créditos de ads
- Comprar no marketplace
- Abater parcialmente reservas
- Recompensas de badge/nível

### Créditos
Moeda de mídia paga. Comprados com Moris via pacotes em `credit_packages`. Gastos em `/api/promotions` (10 créditos/dia).

### XP / níveis
```
xpForLevel(L) = floor(100 * (L-1)^1.5)
```
Ações dão XP (post, moment, itinerary, booking, sale…). Level-up gera bônus em Moris + notificação.

### Badges
Seed em `DEFAULT_BADGES`. `checkAndAwardBadges(userId)` avalia requirements (`posts:10`, `level:5`, …) e concede XP/Moris.

## 5. APIs (mapa)

### Auth
- `POST /api/auth/register|login|logout`
- `GET /api/auth/me`

### Social
- `GET|POST /api/posts`
- `POST /api/posts/:id/like`
- `GET|POST /api/posts/:id/comments`
- `GET /api/users?q=`
- `GET /api/users/:username` · `POST .../follow`
- `GET|POST /api/moments` · `POST /api/moments/:id/view`

### Travel
- `GET|POST /api/itineraries` · `GET|DELETE /api/itineraries/:id`
- `GET|POST /api/guides`
- `GET|POST /api/inns` · `GET|PATCH /api/inns/:id`
- `GET|POST /api/bookings` · `PATCH /api/bookings/:id`

### Economy
- `GET|POST /api/wallet`
- `GET|POST /api/premium`
- `GET|POST /api/promotions`
- `GET|POST /api/marketplace/products`
- `GET|POST /api/marketplace/orders`
- `GET /api/gamification`

### Comms / Live
- `GET|POST /api/conversations` · `.../:id/messages`
- `GET|POST /api/lives` · chat · RTC signaling
- `GET|POST /api/notifications`

### Admin / ops
- `/api/admin/*` (stats, users, posts, inns, broadcast)
- `GET|POST /api/seed`
- `POST /api/upload` (dataURL, limite ~2.8MB)
- `GET /api/health`

## 6. Frontend — rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing dark/gold |
| `/feed` | Feed + Momentos + Composer |
| `/roteiros` `/guias` `/pousadas` `/reservas` | Travel |
| `/marketplace` `/wallet` `/promote` `/premium` `/gamification` | Economy |
| `/lives` `/messages` `/notifications` | Realtime-ish |
| `/admin` | Painel |
| `/preview` `/offline` | Avaliação offline |

Identidade: dourado `#c5a84a`, preto `#0f0f11`, papel `#fdfaf4`. Logo SVG `CompassLogo`.

## 7. WebRTC (lives)

1. Host cria live → `roomId`.
2. Host captura `getUserMedia` e escuta signals.
3. Viewer envia `join` → host cria `RTCPeerConnection`, manda `offer`.
4. ICE candidates trocados via `/api/rtc/:roomId`.
5. STUN: `stun.l.google.com:19302`.

Limitações: sem TURN; mesh não escala para muitos viewers; ideal SFU (LiveKit/mediasoup) em produção.

## 8. Segurança (checklist produção)

- [ ] `JWT_SECRET` forte e único
- [ ] Remover ou proteger `/api/seed`
- [ ] Rate limit em auth e upload
- [ ] Storage externo de mídia (não dataURL no PG)
- [ ] CSRF same-site já ajuda (cookie Lax); validar origem se necessário
- [ ] Validação Zod em todos os bodies críticos
- [ ] Backups do Postgres
- [ ] Não logar tokens/PII

## 9. Performance

- Índices em author/createdAt, roomId, expiresAt de moments.
- Polling: ajustar intervalos ou migrar para SSE/WebSocket.
- Imagens: comprimir no client (canvas) antes do upload.
- Feed limitado a 50 posts por request.

## 10. Extensões sugeridas

1. Pagamentos reais (Stripe/Pix) → conversão BRL↔Moris
2. SFU para lives
3. Service Worker completo (Serwist)
4. Busca full-text (Postgres `tsvector`)
5. Moderação com fila e reports
6. App mobile (Expo) consumindo as mesmas APIs
