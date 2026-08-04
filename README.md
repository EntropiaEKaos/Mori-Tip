# Mori 🧭 — Rede Social de Pousadas e Turismo

> **Versão atual:** 2.5 Premium — Highlights, Pinned Posts, Scheduled, Polls, Reviews Estruturados, Multi-language, App Mobile.

Plataforma completa de turismo digital combinando rede social (Twitter + Instagram), lives WebRTC, marketplace, booking engine, assistente de IA e roteiros colaborativos — tudo integrado com economia interna em **Moris** e pagamentos reais via Mercado Pago.

**Stack:** Next.js 16 (App Router) · React 19 · Drizzle ORM · PostgreSQL · Tailwind CSS 4 · WebRTC · Canvas API · React Native (Expo) para mobile

---

## ✨ Funcionalidades (v2.5)

### 📱 Rede Social
- 7 tipos de post (texto, foto, carrossel, vídeo, dica, review, promo)
- 6 reações com emojis + 8 filtros fotográficos aplicados via Canvas
- Momentos (Stories) de 1–24h com viewer fullscreen e reactions
- Chat estilo WhatsApp com polling
- Lives WebRTC com chat ao vivo
- **Pinned Posts** (até 3 fixados no perfil)
- **Polls/Enquetes** em posts
- **Story Highlights** (destaques fixos no perfil, estilo Instagram)
- **Story Reactions** (6 emojis em momentos)
- Comentários em thread, follows, tags, geolocalização

### ✈️ Travel
- **Roteiros de viagem** com paradas dia a dia
- **Roteiros Colaborativos** (convite por @username, roles)
- **Guias locais** com especialidades e preço/dia
- **Pousadas** com busca, comodidades e página de detalhe
- **Reviews estruturados** (1-5⭐, prós/contras) para pousadas, guias e produtos
- Sistema de **Reservas Premium** com calendário e Moris

### 💎 Economia
- **Moris** — moeda interna (welcome, rewards, vendas)
- **Créditos** — moeda de anúncios
- **Premium** — 500 Moris/30d, +200 bônus, unlock reservas
- **Marketplace** — 4 tipos de produto, fee 5%
- **Wallet** com extrato completo

### 🤖 Inteligência & Integrações
- **Mori Concierge IA** — chat que vasculha pousadas, guias e roteiros
- **Mercado Pago** — checkout real com 4 pacotes de Moris (BRL)
- **Firebase Phone Auth** — login por SMS com OTP
- **OneSignal Push** — notificações externas
- **Multi-language** — 🇧🇷 PT, 🇺🇸 EN, 🇪🇸 ES
- **Push Notifications** em tempo real

### 📊 Gamificação
- 12 badges com recompensas em Moris e XP
- Níveis com fórmula exponencial
- Level-up automático com bônus
- Página dedicada `/gamification`

### 🎨 Admin
- Stats em tempo real
- Gestão de usuários (role, ban, verify)
- Moderação de posts (hide/delete)
- Aprovação de pousadas
- Broadcast de notificações
- **Configurações de Integrações** (chaves de API)

### 📱 Mobile
- App React Native + Expo (iOS + Android)
- PWA instalável (web)
- Documentação completa em `docs/MOBILE_APP.md`

### ✨ UI/UX Premium
- Paleta dourado (#c5a84a) + preto (#0f0f11) + branco
- Glassmorphism nas barras
- Hover effects com glow dourado
- Bússola SVG em todo o app
- Tipografia serifada de luxo

---

## 🚀 Setup Local

```bash
git clone <repo>
cd mori
npm install

# .env
echo 'DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db' > .env
echo 'JWT_SECRET=seu-segredo-longo-e-aleatorio' >> .env

npx drizzle-kit push
npm run dev

# Seed (outro terminal)
curl -X POST http://localhost:3000/api/seed
```

Abra **http://localhost:3000**

### Contas Demo
| Usuário | Senha | Perfil |
|---------|-------|--------|
| `admin` | `admin123` | Admin Premium |
| `marina` | `mori123` | Viajante Premium |
| `pousada_do_sol` | `mori123` | Host |
| `guia_pedro` | `mori123` | Guia verificado |
| `juliana_trip` | `mori123` | Viajante/Seller |

---

## ☁️ Deploy Vercel + Vercel Postgres

Veja guia completo em [`docs/DEPLOY_VERCEL_POSTGRES.md`](./docs/DEPLOY_VERCEL_POSTGRES.md).

TL;DR:
1. Crie projeto na Vercel e adicione **Vercel Postgres**
2. Adicione `JWT_SECRET` em Environment Variables
3. Após deploy, rode `npx drizzle-kit push` apontando para o banco de produção
4. Acesse `/admin` → **Integrações** e configure as chaves

---

## 📊 Banco de Dados

**32 tabelas** com Drizzle ORM, 14 enums nativos PostgreSQL, 30+ índices.

| Categoria | Tabelas |
|-----------|---------|
| Core | users, posts, comments, likes, follows, notifications |
| Realtime | conversations, messages, lives, live_messages, rtc_signals, moment_views |
| Travel | inns, bookings, guides, itineraries, itinerary_collaborators |
| Economy | products, orders, credit_packages, promotions, mp_payments, transactions, system_settings |
| Gamification | badges, user_badges |
| Conteúdo | moments, highlights, reviews, scheduled_posts, pinned_posts, story_reactions, post_polls, post_poll_votes |

---

## 📚 Documentação

| Doc | Conteúdo |
|-----|----------|
| [CHANGELOG.md](./docs/CHANGELOG.md) | Todas as novidades por versão |
| [TECHNICAL.md](./docs/TECHNICAL.md) | Arquitetura e APIs |
| [DEPLOY_VERCEL_POSTGRES.md](./docs/DEPLOY_VERCEL_POSTGRES.md) | Deploy em produção |
| [MOBILE_APP.md](./docs/MOBILE_APP.md) | App React Native + Expo |
| [USER_GUIDE.md](./docs/USER_GUIDE.md) | Guia do usuário |
| [ECONOMY.md](./docs/ECONOMY.md) | Moris & Créditos |

---

## 🛠 Scripts

```bash
npm run dev
npm run build
npx drizzle-kit push
npx next typegen
npm exec tsc -- --noEmit
```

---

## 📈 Roadmap

- [x] Highlights, Pinned, Scheduled
- [x] Multi-language (PT/EN/ES)
- [x] Reviews estruturados 1-5
- [x] Roteiros colaborativos
- [x] Polls em posts
- [x] Story Reactions
- [ ] Mapa interativo (Mapbox)
- [ ] WebSocket real-time
- [ ] SFU para lives
- [ ] Storage externo de mídia
- [ ] App nas stores

---

## Licença

MIT — use, adapte, contribua e viaje com o Mori. 🧭
