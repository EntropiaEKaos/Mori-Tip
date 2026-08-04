# 🆕 Changelog & Novidades — Mori

Documentação cronológica de todas as funcionalidades, integrações e melhorias adicionadas.

---

## v2.5 — Highlights, Polls, Reviews, Pinned, Scheduled, Multi-language

### 🎯 Novas Funcionalidades
1. **Story Highlights (Destaques do Perfil)**
   - Tabela `highlights` com título, capa e momentIds
   - Anel dourado/preto estilo Instagram no perfil
   - Página `/highlights` para gerenciar (criar/deletar)
   - API: `GET|POST /api/highlights`, `DELETE /api/highlights?id=`

2. **Pinned Posts (Posts Fixados)**
   - Até 3 posts fixados no topo do perfil
   - Botão de pin/desafixar no card (só para o dono)
   - Tabela `pinned_posts` com constraint unique
   - API: `GET /api/pin?userId=`, `POST /api/pin`, `DELETE /api/pin?postId=`

3. **Scheduled Posts (Agendamento)**
   - Tabela `scheduled_posts` com `scheduledFor` futuro
   - Página `/scheduled` com composer de agendamento
   - Endpoint `PUT /api/scheduled-posts` para cron job publicar automaticamente
   - Concede XP ao publicar

4. **Polls em Posts (Enquetes)**
   - Tabelas `post_polls` e `post_poll_votes`
   - 2-6 opções por enquete
   - Data de fechamento opcional
   - XP de 5 por voto
   - API: `POST /api/polls`, `PATCH /api/polls`

5. **Reviews Estruturados (Avaliações 1-5)**
   - Tabela `reviews` com rating 1-5, título, conteúdo, prós/contras
   - Funciona para `inn`, `guide` e `product`
   - Componente `<ReviewsSection />` reutilizável com breakdown visual
   - Atualiza rating agregado automaticamente
   - API: `GET /api/reviews?type=&id=`, `POST /api/reviews`

6. **Itinerary Collaboration (Roteiros Colaborativos)**
   - Tabela `itinerary_collaborators` com roles (viewer/editor/admin)
   - Página `/roteiros/[id]` mostra colaboradores e permite convidar
   - Notificação ao convidado
   - API: `GET|POST|DELETE /api/itineraries/[id]/collaborators`

7. **Story Reactions (Reações em Momentos)**
   - 6 emojis: ❤️🔥😮😂😢👏
   - Tabela `story_reactions` com unique constraint
   - Notificação ao autor
   - API: `POST /api/moments/[id]/react`

8. **Multi-language i18n**
   - 3 idiomas: 🇧🇷 PT, 🇺🇸 EN, 🇪🇸 ES
   - Componente `<LanguageSwitcher />` na sidebar
   - API: `GET /api/i18n/[lang]`
   - Persistência via localStorage

9. **Página de Detalhe de Pousada** (`/pousadas/[id]`)
   - Hero com cover, descrição, comodidades com ícones
   - Reviews estruturados integrados
   - Modal de reserva com datas e Moris
   - Posts da pousada

10. **Roteiro com Colaboradores** (`/roteiros/[id]`)
    - UI de convite por @username
    - Avatares dos colaboradores
    - Dias com timeline visual

### 🎨 UI/UX Moderno
- **Glass effect** nas barras de navegação
- **Mori Card** com hover dourado e elevação suave
- **ModernLoader** com bússola animada em 3 pontos
- **Skeleton** com shimmer para carregamento
- **GlowCard** com borda animada em hover
- **Pousada Cards** clicáveis com link para detalhe
- **LanguageSwitcher** na sidebar (PT/EN/ES)

### 📱 Mobile
- Documentação completa em `docs/MOBILE_APP.md`
- Estrutura de pastas para React Native + Expo
- Tema Mori (cores, tipografia)
- Componentes nativos planejados

---

## v2.0 — Mercado Pago, Firebase, OneSignal, Mori Concierge IA

### 💳 Mercado Pago (Real Money)
- Endpoint `POST /api/payments/checkout` cria preferências reais
- Webhook `POST /api/payments/webhook` recebe IPN e credita Moris
- 4 pacotes de Moris (R$ 19,90 a R$ 199,90)
- Fallback elegante para modo demo

### 📱 Firebase Phone Auth
- Login por SMS via Firebase Identity Toolkit
- Modal de OTP com 2 etapas
- Simulação visual de SMS no sandbox
- Tabela `users.phoneNumber` para autenticação alternativa

### 🔔 OneSignal Push
- Dispatcher `src/lib/notifications.ts`
- Configurável via Admin (App ID + REST Key)
- Fallback elegante quando não configurado

### 🤖 Mori Concierge (IA)
- Endpoint `POST /api/ai/concierge`
- Reconhece intenção (pousada/guia/roteiro)
- Carrosséis de cards dentro do balão de resposta
- Página `/concierge` com chat premium

### ⚙️ Painel Admin — Integrações
- Aba dedicada para chaves de API
- Mercado Pago, Firebase, OneSignal
- Salvo em `system_settings`

---

## v1.5 — Gamificação, Marketplace, Reservas Premium

### 🏆 Gamificação
- 12 badges com XP e Moris
- Níveis com fórmula `xpForLevel = 100*(L-1)^1.5`
- Bônus de level-up automático
- Página `/gamification`

### 🛍️ Marketplace
- 4 tipos: físico, digital, experiência, serviço
- Compra/venda em Moris
- Fee 5% da plataforma
- Histórico de ordens

### 🏨 Reservas
- Premium-gated
- Modal com datas, hóspedes, Moris
- Painel duplo (hóspede/anfitrião)
- Status: pending → confirmed → completed

### 📢 Anúncios (Promoções)
- 4 pacotes de créditos
- Posts promovidos no feed
- Impressões e cliques

---

## v1.0 — Lançamento

- Rede social com feed, posts, curtidas, comentários
- Momentos (stories) de 1-24h
- Chat estilo WhatsApp
- Lives WebRTC
- Roteiros de viagem
- Guias locais
- Pousadas com busca
- Carteira e Premium
- 4 filtros de foto (posteriormente 8)

---

## Tabelas por Versão

| Versão | Tabelas Adicionadas |
|--------|---------------------|
| v1.0 | users, posts, comments, likes, follows, notifications, conversations, conversation_members, messages, lives, live_messages, rtc_signals, moments, moment_views, inns, itineraries, guides |
| v1.5 | bookings, products, orders, badges, user_badges, credit_packages, promotions, transactions |
| v2.0 | mp_payments, system_settings |
| v2.5 | highlights, reviews, scheduled_posts, pinned_posts, itinerary_collaborators, story_reactions, post_polls, post_poll_votes |

**Total atual: 32 tabelas**
