# Mori 🧭

Rede social de pousadas e turismo — mistura de Twitter + Instagram com lives WebRTC, momentos, roteiros, guias, reservas Premium, gamificação, créditos de anúncio e marketplace em **Moris**.

**Stack:** Next.js 16 (App Router) · React 19 · Drizzle ORM · PostgreSQL · Tailwind CSS 4 · WebRTC

---

## ✨ Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **Feed social** | Posts (texto, foto, carrossel, vídeo, dica, review, promo), curtidas com reações, comentários, follows |
| **Momentos** | Stories de até 24h com duração configurável pelo autor |
| **Lives** | Transmissão ao vivo via WebRTC + chat |
| **Chat** | Conversas 1:1 estilo WhatsApp com imagens |
| **Roteiros** | Montagem de itinerários dia a dia |
| **Guias locais** | Perfis de guias com especialidades e preço/dia |
| **Pousadas + Reservas** | Cadastro de pousadas; reservas liberadas para contas **Premium** |
| **Premium** | Assinatura em Moris (30 dias), badge, bônus e unlock de reservas |
| **Gamificação** | XP, níveis, badges e brindes em Moris |
| **Carteira** | Saldo de Moris + créditos de ads + extrato |
| **Divulgação** | Compre créditos e promova posts/produtos no feed |
| **Marketplace** | Venda interna (físico, digital, experiência, serviço) paga em Moris |
| **Admin** | Painel com stats, usuários, posts, pousadas e broadcast |
| **Offline/Preview** | Páginas `/preview` e `/offline` para avaliação visual |

---

## 🚀 Rodando localmente

### Pré-requisitos
- Node.js 20+
- PostgreSQL 14+
- npm

### 1. Clone e instale
```bash
git clone <seu-repo>
cd <pasta>
npm install
```

### 2. Variáveis de ambiente
Crie `.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
JWT_SECRET=troque-por-um-segredo-longo-e-aleatorio
```

### 3. Schema do banco
```bash
npx drizzle-kit push
```

### 4. Seed (dados demo)
```bash
npm run dev
# em outro terminal:
curl -X POST http://localhost:3000/api/seed
```

### 5. App
```bash
npm run dev
# http://localhost:3000
```

### Credenciais demo
| Usuário | Senha | Papel |
|---------|-------|-------|
| `admin` | `admin123` | Admin |
| `marina` | `mori123` | Viajante Premium |
| `pousada_do_sol` | `mori123` | Host Premium |
| `guia_pedro` | `mori123` | Guia local |
| `juliana_trip` | `mori123` | Viajante |

---

## ☁️ Deploy na Vercel

### 1. Banco Postgres gerenciado
Use um dos:
- [Neon](https://neon.tech) (recomendado)
- [Supabase](https://supabase.com)
- [Vercel Postgres](https://vercel.com/storage/postgres)

Copie a connection string (`DATABASE_URL`).

### 2. Projeto na Vercel
```bash
npm i -g vercel
vercel
```
Ou conecte o repositório GitHub em [vercel.com/new](https://vercel.com/new).

### 3. Environment Variables (Vercel → Settings → Environment Variables)
```
DATABASE_URL=postgresql://...
JWT_SECRET=um-segredo-forte-de-pelo-menos-32-chars
```

### 4. Aplicar schema em produção
Localmente (apontando para o DB de produção) ou via CI:
```bash
DATABASE_URL="postgresql://..." npx drizzle-kit push
```

### 5. Seed opcional em produção
```bash
curl -X POST https://seu-app.vercel.app/api/seed
```

### 6. Domínio
Em **Vercel → Domains**, adicione seu domínio customizado.

### Observações de produção
- WebRTC usa STUN público do Google; para NAT restritivo considere TURN (Twilio/Metered).
- Imagens são armazenadas como data URLs no Postgres (demo). Em produção, migre para S3/R2/Cloudinary e salve só a URL.
- Aumente `JWT_SECRET` e desative `/api/seed` em produção (proteja com secret ou remova a rota).
- Para PWA offline mais robusto, adicione um service worker (ex.: `next-pwa` / Serwist).

### Build scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```
A Vercel detecta Next.js automaticamente (`build` + `start` gerenciados pela plataforma).

---

## 📁 Estrutura

```
src/
  app/
    (app)/          # shell autenticado (feed, chat, admin, etc.)
    api/            # route handlers
    login|register|preview|offline/
  components/       # UI (composer, post-card, moments, shell...)
  db/               # drizzle client + schema
  lib/              # auth, gamification, utils, rtc
public/             # ícones, manifest PWA
docs/               # documentação técnica e de usuário
```

---

## 📚 Documentação

- [Documentação técnica](./docs/TECHNICAL.md)
- [Guia do usuário](./docs/USER_GUIDE.md)
- [Modelo econômico (Moris)](./docs/ECONOMY.md)

---

## 🧪 Scripts úteis

```bash
npx next typegen
npm exec tsc -- --noEmit
npm run build
npx drizzle-kit push
```

---

## Licença

MIT — use, adapte e viaje com o Mori.
