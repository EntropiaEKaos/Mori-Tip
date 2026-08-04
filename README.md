# Mori 🧭 — Rede Social de Pousadas e Turismo

> **Versão atual:** 2.0 Premium — com Mori Concierge IA, Mercado Pago, Firebase Phone Auth, OneSignal Push, Marketplace, Reservas Premium e Gamificação.

Plataforma completa de turismo digital combinando rede social (Twitter + Instagram), lives WebRTC, marketplace, booking engine e assistente de inteligência artificial — tudo integrado com economia interna em **Moris** e pagamentos reais via Mercado Pago.

**Stack:** Next.js 16 (App Router) · React 19 · Drizzle ORM · PostgreSQL · Tailwind CSS 4 · WebRTC · Canvas API

---

## ✨ Funcionalidades Completas

| Módulo | Descrição |
|--------|-----------|
| **Feed social** | 7 tipos de post (texto, foto, carrossel, vídeo, dica, review, promo), 6 reações, 8 filtros fotográficos, comentários, follows, tags e geolocalização |
| **Momentos (Stories)** | Duração configurável de 1 a 24h, viewer fullscreen com progresso, views |
| **Mori Concierge IA** | Assistente inteligente que vasculha pousadas, guias e roteiros em tempo real via chat |
| **Lives WebRTC** | Transmissão ao vivo com câmera/mic, chat da live, sinalização via banco |
| **Chat estilo WhatsApp** | Conversas 1:1, texto e imagem, polling, indicadores de leitura e não lidas |
| **Roteiros de viagem** | Criação de itinerários dia a dia com paradas detalhadas |
| **Guias locais** | Perfis de guias com especialidades, idiomas e preço/dia |
| **Pousadas + Reservas** | Cadastro de pousadas, busca, modal de reserva com datas, Premium-gated |
| **Marketplace** | Compra e venda em Moris (físico, digital, experiência, serviço), fee 5% |
| **Gamificação** | 12 badges, níveis com XP, barra de progresso, bônus de level-up |
| **Carteira + Mercado Pago** | Saldo Moris + créditos ads, compra com BRL real, extrato financeiro |
| **Premium** | 500 Moris/30 dias, +200 bônus, unlock reservas, badge exclusiva |
| **Créditos de anúncio** | 4 pacotes (Starter a Agency), campanhas promovidas no feed |
| **Notificações** | In-app com 11 tipos + push via OneSignal (configurável no admin) |
| **Login Firebase Phone** | Autenticação por número de celular com SMS (simulação elegante + integração real) |
| **Admin completo** | Dashboard stats, gestão de usuários/posts/pousadas, broadcast, integrações (chaves API) |
| **Offline/Preview** | Páginas `/preview` e `/offline` para avaliação visual e demo |

---

## 🚀 Rodando Localmente

### Pré-requisitos
- Node.js 20+
- PostgreSQL 14+
- npm

### Setup
```bash
git clone <seu-repo>
cd mori
npm install

# Configure .env:
echo 'DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db' > .env
echo 'JWT_SECRET=seu-segredo-super-longo-e-aleatorio-aqui' >> .env

# Crie as tabelas:
npx drizzle-kit push

# Rode o app:
npm run dev

# Popule dados demo (outro terminal):
curl -X POST http://localhost:3000/api/seed
```

Abra **http://localhost:3000**

### Contas Demo
| Usuário | Senha | Papel |
|---------|-------|-------|
| `admin` | `admin123` | Admin Premium (acesso a `/admin`) |
| `marina` | `mori123` | Viajante Premium |
| `pousada_do_sol` | `mori123` | Host Premium + reservas |
| `guia_pedro` | `mori123` | Guia local verificado |
| `rafaelmochila` | `mori123` | Viajante fotógrafo |
| `juliana_trip` | `mori123` | Viajante / seller marketplace |
| `chale_verde` | `mori123` | Host Premium |

---

## ☁️ Deploy na Vercel (Produção)

### 1. Banco de dados gerenciado
Use um PostgreSQL serverless:
- **[Neon](https://neon.tech)** (recomendado — free tier generoso, serverless, branchable)
- [Supabase](https://supabase.com)
- [Vercel Postgres](https://vercel.com/storage/postgres)

Copie a string de conexão (`DATABASE_URL`).

### 2. Deploy do projeto
```bash
# Opção A: CLI
npm i -g vercel
vercel

# Opção B: GitHub
# Conecte o repositório em vercel.com/new
```

### 3. Environment Variables
No dashboard da Vercel: **Settings → Environment Variables**

```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
JWT_SECRET=uma-frase-longa-e-aleatoria-com-64-caracteres-no-minimo
```

### 4. Aplicar schema no banco de produção
```bash
# Localmente, apontando para o banco de produção:
DATABASE_URL="postgresql://..." npx drizzle-kit push
```

### 5. Seed (opcional)
```bash
curl -X POST https://seu-dominio.vercel.app/api/seed
```
> ⚠️ Em produção, **proteja ou remova** a rota `/api/seed`. Adicione um secret compartilhado ou delete o arquivo.

### 6. Configurar integrações via Admin
Acesse `/admin` → aba **Integrações** e preencha as chaves:
- **Mercado Pago:** Access Token (obtido em [mercadopago.com.br/developers](https://www.mercadopago.com.br/developers))
- **Firebase:** Project ID e Web API Key (obtidas no [Firebase Console](https://console.firebase.google.com))
- **OneSignal:** App ID e REST API Key (obtidas em [onesignal.com](https://onesignal.com))

### 7. Domínio customizado
**Vercel → Domains** → adicione seu domínio.

---

## 📁 Estrutura do Projeto

```
src/
  app/
    (app)/              # Shell autenticado (30+ páginas)
      admin/            # Painel admin com 6 abas
      concierge/        # Assistente IA
      feed/             # Feed + composer + momentos
      gamification/     # Níveis e badges
      guias/            # Guias locais
      lives/            # Lives WebRTC
      marketplace/      # Loja em Moris
      messages/         # Chat
      notifications/    # Inbox
      pousadas/         # Pousadas + modal reserva
      premium/          # Assinatura
      promote/          # Anúncios
      reservas/         # Bookings
      roteiros/         # Itinerários
      settings/         # Editar perfil
      u/[username]/     # Perfil público
      wallet/           # Carteira + Mercado Pago
    api/                # 57+ endpoints REST
    login|register|preview|offline/
  components/           # 8 componentes reutilizáveis
  db/                   # schema.ts (25 tabelas, 12 enums, 30+ índices)
  lib/                  # auth, gamification, notifications, rtc, utils
public/                 # Ícones PWA, manifest.json
docs/                   # Documentação completa (5 arquivos)
```

---

## 📊 Tabelas do Banco (25)

`users`, `posts`, `comments`, `likes`, `follows`, `notifications`, `conversations`, `conversation_members`, `messages`, `lives`, `live_messages`, `rtc_signals`, `moments`, `moment_views`, `inns`, `bookings`, `itineraries`, `guides`, `products`, `orders`, `badges`, `user_badges`, `promotions`, `credit_packages`, `mp_payments`, `transactions`, `system_settings`

---

## 📚 Documentação Completa

| Documento | Conteúdo |
|-----------|----------|
| [Relatório Completo de Funcionalidades](./docs/NOVO_RELATORIO_COMPLETO.md) | Todas as features, integrações e fluxos detalhados |
| [Documentação Técnica](./docs/TECHNICAL.md) | Arquitetura, APIs, segurança, performance |
| [Guia do Usuário](./docs/USER_GUIDE.md) | Como usar cada módulo da plataforma |
| [Modelo Econômico](./docs/ECONOMY.md) | Moris, Créditos, Premium e fluxos financeiros |

---

## 🔒 Segurança

- Senhas hash com bcrypt (custo 10)
- JWT httpOnly cookie com expiração de 30 dias
- Middleware `requireUser()` / `requireAdmin()` em APIs protegidas
- Verificação de conta banida em todas as requisições autenticadas
- Configurações sensíveis isoladas em `system_settings` no banco
- Webhook do Mercado Pago com verificação de status

---

## ⚡ Performance

- Build com `force-dynamic` global (compilação instantânea)
- Índices em author, createdAt, roomId, expiresAt
- Polling com `?since=` para economia de tráfego
- Compressão de imagens via Canvas API antes do upload
- Feed limitado a 50 posts por request

---

## 🧪 Scripts

```bash
npm run dev          # Dev server
npm run build        # Build produção
npm run start        # Iniciar produção
npx drizzle-kit push # Aplicar schema
npx next typegen     # Gerar tipos das rotas
npm exec tsc -- --noEmit  # TypeScript check
```

---

## 🗺️ Roadmap Futuro

- [ ] Storage de mídia externo (Cloudinary/R2/S3)
- [ ] WebSocket real (chat + notificações + presença)
- [ ] SFU para lives (LiveKit)
- [ ] App mobile React Native/Expo
- [ ] Mapa interativo (Mapbox/Leaflet)
- [ ] Calendário de disponibilidade por pousada
- [ ] Sistema de reviews 1-5 estrelas
- [ ] Pagamentos com PIX via Mercado Pago
- [ ] Cupons e descontos
- [ ] Programa de afiliados

---

## Licença

MIT — use, adapte, contribua e viaje com o Mori. 🧭
