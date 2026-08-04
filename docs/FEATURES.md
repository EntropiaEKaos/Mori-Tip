# 🌟 Mori — Documentação Completa de Features

> Documentação técnica de **cada feature** da plataforma Mori, com APIs, tabelas, componentes e exemplos.

---

## 📊 Resumo

**32 tabelas · 70+ endpoints · 40+ páginas · 10 integrações externas**

---

## 📱 Rede Social (v1.0)

### 1. Feed Social
**O que faz:** Timeline de posts com curtidas, comentários, follows.

- **Tabela:** `posts`, `comments`, `likes`, `follows`
- **APIs:** `GET|POST /api/posts`, `POST /api/posts/:id/like`, `GET|POST /api/posts/:id/comments`
- **Componente:** `<PostCard />` com 6 reações (🌅🏔️🌊🌲⭐✨)
- **Tipos de post:** text, photo, video, carousel, tip, review, promo
- **Filtros fotográficos:** 8 filtros (Original, Praia, Serra, Vintage, P&B, Vívido, Pôr do Sol, Cinema) aplicados via Canvas API e queimados na imagem
- **Paginação:** Feed limitado a 50 posts por request, polling de 5s para atualizações
- **Algoritmo:** Para Você (todos) / Seguindo (apenas quem você segue)

### 2. Momentos (Stories)
**O que faz:** Posts efêmeros com duração configurável.

- **Tabela:** `moments`, `moment_views`
- **APIs:** `GET|POST /api/moments`, `POST /api/moments/:id/view`
- **Componente:** `<MomentsBar />` com viewer fullscreen
- **Duração:** 1–24h (slider no composer)
- **Viewer:** Progresso animado por barra, navegação automática
- **Reactions:** 6 emojis (❤️🔥😮😂😢👏) via `POST /api/moments/:id/react`

### 3. Chat (Mensagens)
**O que faz:** Mensageria 1:1 estilo WhatsApp.

- **Tabela:** `conversations`, `conversation_members`, `messages`
- **APIs:** `GET|POST /api/conversations`, `GET|POST /api/conversations/:id/messages`
- **Componente:** `<ChatPage />` com bolhas em gradiente
- **Polling:** 2s com `?since=` timestamp
- **Mídia:** Imagens comprimidas no client (max 800px)
- **Indicadores:** Não lidas (badge no menu), lidas (check azul)

### 4. Lives (WebRTC)
**O que faz:** Transmissão ao vivo com câmera/microfone.

- **Tabela:** `lives`, `live_messages`, `rtc_signals`
- **APIs:** `GET|POST /api/lives`, `GET|DELETE /api/lives/:id`, `GET|POST /api/lives/:id/chat`, `GET|POST /api/rtc/:roomId`
- **Componente:** `<LiveRoomPage />` com controles de host
- **Tecnologia:** WebRTC mesh + sinalização via DB (offer/answer/ICE)
- **STUN:** `stun.l.google.com:19302` (configurável)
- **Chat:** Polling de 2s
- **Notificação:** Followers recebem push ao iniciar

### 5. Polls (Enquetes)
**O que faz:** Enquetes em posts (2-6 opções).

- **Tabela:** `post_polls`, `post_poll_votes`
- **APIs:** `POST /api/polls`, `PATCH /api/polls`
- **Recompensa:** +5 XP por voto

---

## ✈️ Travel (v1.0 + v2.5)

### 6. Roteiros de Viagem
**O que faz:** Itinerários com paradas dia a dia.

- **Tabela:** `itineraries`, `itinerary_collaborators`
- **APIs:** `GET|POST /api/itineraries`, `GET|DELETE /api/itineraries/:id`, `GET|POST|DELETE /api/itineraries/:id/collaborators`
- **Componente:** Página `/roteiros` e `/roteiros/[id]`
- **Recompensa:** +40 XP por criar
- **Colaboração:** Convite por @username, roles (viewer/editor/admin)

### 7. Guias Locais
**O que faz:** Perfis de guias profissionais.

- **Tabela:** `guides`
- **APIs:** `GET|POST /api/guides`
- **Componente:** Página `/guias` com filtros
- **Especialidades:** Array de tags
- **Idiomas:** Array de idiomas
- **Auto-promoção:** User vira `role=guide` ao criar perfil

### 8. Pousadas + Reservas
**O que faz:** Catálogo de pousadas com booking.

- **Tabela:** `inns`, `bookings`
- **APIs:** `GET|POST /api/inns`, `GET|PATCH /api/inns/:id`, `GET|POST /api/bookings`, `PATCH /api/bookings/:id`
- **Componente:** `/pousadas` (lista) e `/pousadas/[id]` (detalhe)
- **Reserva:** Premium-only, com check-in/out, hóspedes, Moris parciais
- **Status:** pending → confirmed → completed | cancelled
- **Auto-bookings:** Hosts Premium têm `acceptsBookings=true` automaticamente

### 9. Reviews Estruturados
**O que faz:** Avaliações 1-5 com prós/contras.

- **Tabela:** `reviews`
- **APIs:** `GET /api/reviews?type=&id=`, `POST /api/reviews`
- **Componente:** `<ReviewsSection />` com breakdown visual de estrelas
- **Auto-rating:** Rating agregado atualizado ao criar review
- **Targets:** `inn`, `guide`, `product`

---

## 💎 Sistema de Gamificação (v1.5)

### 10. XP, Níveis e Moris
**O que faz:** Recompensa usuários por contribuição.

- **Funções:** `awardXp`, `awardMoris`, `spendMoris`, `spendCredits` em `src/lib/gamification.ts`
- **Fórmula:** `xpForLevel(L) = floor(100 * (L-1)^1.5)`
- **Bônus level-up:** `nível * 25` Moris
- **Tabela:** `users.xp`, `users.level`, `users.moris`, `users.credits`

### 11. Badges
**O que faz:** 12 conquistas desbloqueáveis.

- **Tabela:** `badges`, `user_badges`
- **APIs:** `GET /api/gamification` (retorna todos com status)
- **Componente:** Página `/gamification` com grid de badges
- **Recompensas:** Cada badge dá XP + Moris ao desbloquear
- **Auto-check:** `checkAndAwardBadges()` após cada ação relevante
- **12 Badges disponíveis:** Primeira Pegada, Contador de Histórias, Social Butterfly, Popular, Explorador, Moment Maker, Hóspede VIP, Comerciante, Viajante Experiente, Lenda Mori, Membro Premium, Guia Local

### 12. Wallet
**O que faz:** Carteira com saldo e extrato.

- **Tabela:** `users.moris`, `users.credits`, `transactions`
- **APIs:** `GET|POST /api/wallet`
- **Componente:** `/wallet` com cards, pacotes, extrato
- **Pacotes de Moris:** Mochileiro (R$19,90), Explorador (R$39,90), Anfitrião (R$89,90), VIP (R$199,90)
- **Pacotes de Créditos:** Starter, Boost, Pro, Agency

---

## 🛍️ Marketplace (v1.5)

### 13. Produtos e Pedidos
**O que faz:** Loja interna com 4 tipos de produto.

- **Tabela:** `products`, `orders`
- **APIs:** `GET|POST /api/marketplace/products`, `GET|POST /api/marketplace/orders`
- **Componente:** `/marketplace` com grid de cards
- **Tipos:** physical, digital, experience, service
- **Moeda:** Apenas Moris
- **Fee:** 5% da plataforma, 95% para o seller
- **XP:** +25 (buyer), +40 (seller)

---

## 💰 Monetização (v1.5 + v2.0)

### 14. Premium
**O que faz:** Assinatura que libera reservas e mais.

- **Campo:** `users.isPremium`, `users.premiumUntil`
- **APIs:** `GET|POST /api/premium`
- **Preço:** 500 Moris / 30 dias
- **Bônus:** +200 Moris na ativação
- **Benefícios:** Reservas, badge, pousadas do host com `acceptsBookings=true`

### 15. Créditos de Anúncio
**O que faz:** Moeda para promover posts.

- **Tabela:** `credit_packages`, `promotions`
- **APIs:** `GET|POST /api/promotions`
- **Custo:** 10 créditos/dia
- **Visual:** Posts com badge "Promovido" no feed

### 16. Mercado Pago (v2.0)
**O que faz:** Pagamentos reais em BRL por Moris.

- **Tabela:** `mp_payments`
- **APIs:** `POST /api/payments/checkout`, `POST /api/payments/webhook`
- **Provider:** Mercado Pago (Access Token configurável via Admin)
- **Modo:** Real (produção) ou Demo (sandbox)
- **Webhook:** IPN valida pagamento e credita Moris

---

## 🤖 Inteligência & Integrações (v2.0)

### 17. Mori Concierge (IA)
**O que faz:** Assistente de viagens com IA.

- **API:** `POST /api/ai/concierge`
- **Prompt:** Detecta intenção (pousada, guia, roteiro)
- **Busca:** Real-time no banco de dados
- **Output:** Mensagem + array de inns/guides/itineraries
- **UI:** Página `/concierge` com chat premium
- **Recompensa:** Encanta viajantes, aumenta conversão

### 18. Firebase Phone Auth
**O que faz:** Login por SMS.

- **Campo:** `users.phoneNumber`
- **API:** `POST /api/auth/phone`
- **Integração:** Firebase Identity Toolkit (configurável via Admin)
- **Fallback:** Simulação visual de SMS para sandbox

### 19. OneSignal Push
**O que faz:** Notificações push nativas.

- **Dispatcher:** `src/lib/notifications.ts`
- **Config:** App ID + REST API Key via Admin
- **Trigger:** Toda notificação in-app dispara push
- **Fallback:** Log no console se não configurado

### 20. Multi-language i18n
**O que faz:** Suporte a 3 idiomas.

- **Idiomas:** 🇧🇷 PT, 🇺🇸 EN, 🇪🇸 ES
- **API:** `GET /api/i18n/[lang]`
- **Componente:** `<LanguageSwitcher />` na sidebar
- **Persistência:** localStorage

---

## 📊 Storage (v2.5)

### 21. Storage Configurável
**O que faz:** Escolha onde armazenar mídias.

- **Tabela:** `system_settings` (chaves: `storage_provider`, `s3_*`, `cloudinary_*`)
- **Provider:** `server` (dataURL) | `s3` (AWS) | `r2` (Cloudflare) | `cloudinary`
- **API:** `POST /api/upload` (server-side) + `src/lib/storage.ts`
- **Configuração:** Via Admin → aba **Storage**
- **Assinatura AWS V4:** Implementada nativamente (sem SDK)

---

## 🏆 Stories Highlights (v2.5)

### 22. Destaques do Perfil
**O que faz:** Coleções fixas de momentos.

- **Tabela:** `highlights`
- **APIs:** `GET|POST /api/highlights`, `DELETE /api/highlights`
- **UI:** Anel dourado no perfil (estilo Instagram) + página `/highlights`
- **Capa:** Imagem do primeiro momento do highlight

---

## 📌 Pinned & Scheduled (v2.5)

### 23. Posts Fixados
**O que faz:** Até 3 posts no topo do perfil.

- **Tabela:** `pinned_posts`
- **APIs:** `GET /api/pin?userId=`, `POST /api/pin`, `DELETE /api/pin?postId=`
- **Limite:** 3 por usuário

### 24. Posts Agendados
**O que faz:** Agendar publicação para futuro.

- **Tabela:** `scheduled_posts`
- **APIs:** `GET|POST /api/scheduled-posts`, `DELETE`, `PUT` (cron job)
- **UI:** Página `/scheduled`
- **Status:** pending → published

---

## 🛡️ Admin (v1.0 + v2.0)

### 25. Painel de Administração
**O que faz:** Controle total da plataforma.

- **Aba Visão Geral:** Cards com estatísticas
- **Aba Usuários:** Tabela com role, ban, verify
- **Aba Publicações:** Moderação (hide/delete)
- **Aba Pousadas:** Aprovação, suspensão, exclusão
- **Aba Comunicados:** Broadcast de notificação
- **Aba Integrações:** Mercado Pago, Firebase, OneSignal
- **Aba Storage:** S3, R2, Cloudinary

---

## 📱 Mobile (v2.5)

### 26. App Mobile Nativo
**O que faz:** App React Native + Expo.

- **Stack:** Expo SDK 51, React Native 0.74, expo-router
- **Plataformas:** iOS, Android, Web
- **Telas:** Login (email + SMS), Feed, Explorar, Roteiros, Pousadas, Perfil, Concierge, Premium, Wallet, Settings
- **Build:** `eas build -p android` ou `eas build -p ios`
- **Localização:** `mobile/`
- **Documentação:** `docs/MOBILE_APP.md`

---

## 🎨 UI/UX (v2.5)

### 27. Design System Premium
**O que faz:** Visual consistente de luxo.

- **Paleta:** Dourado #c5a84a, Preto #0f0f11, Branco #fdfaf4
- **Glassmorphism:** `backdrop-filter: blur(20px)`
- **Mori Card:** Borda dourada em hover + elevação
- **ModernLoader:** Bússola animada com 3 pontos
- **Skeleton:** Shimmer suave
- **Glow Card:** Borda animada em hover
- **Language Switcher:** PT/EN/ES elegante

---

## 🛠️ Infraestrutura (v1.0)

### 28. Auth & Segurança
- bcrypt (custo 10) para senhas
- JWT httpOnly com expiração 30 dias
- Middleware `requireUser()` / `requireAdmin()`
- Verificação de ban em todas as requisições

### 29. Banco de Dados
- 32 tabelas com Drizzle ORM
- 14 enums PostgreSQL
- 30+ índices otimizados
- Relations com joins

### 30. Deploy
- **Frontend:** Vercel
- **DB:** Vercel Postgres
- **PWA:** Manifest + ícones
- **Mobile:** Expo EAS Build
- **Docs:** `docs/DEPLOY_VERCEL_POSTGRES.md`

---

## 📊 Estatísticas

| Métrica | Valor |
|---------|-------|
| Tabelas no DB | 32 |
| Endpoints API | 70+ |
| Páginas | 40+ |
| Componentes React | 15+ |
| Badges de gamificação | 12 |
| Tipos de post | 7 |
| Filtros de foto | 8 |
| Reações disponíveis | 12 (6 posts + 6 stories) |
| Pacotes de Moris | 4 (BRL) + 4 (créditos) |
| Idiomas suportados | 3 |
| Integrações externas | 5 (MP, Firebase, OneSignal, S3, Cloudinary) |
| Providers de storage | 4 |
| Tipos de produto no marketplace | 4 |
| Tarefas agendadas suportadas | Posts + Polls + Scheduled |

---

## 🎯 Diferenciais Competitivos

1. **Mori Concierge IA** — único no segmento
2. **Sistema de Roteiros Colaborativos** — inovação de produto
3. **Reviews estruturados com prós/contras** — melhor UX de avaliação
4. **Multi-language PT/EN/ES** — preparado para LATAM
5. **Storage S3/R2/Cloudinary configurável** — flexibilidade
6. **Wallet multi-moeda (Moris + Créditos)** — economia gamificada
7. **Highlights + Pinned + Polls** — recursos modernos de redes sociais
8. **PWA + Mobile nativo** — presença em todas as plataformas
