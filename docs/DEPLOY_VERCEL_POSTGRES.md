# ☁️ Deploy Mori na Vercel + Vercel Postgres (Guia Completo)

## 1. Visão Geral
- **Frontend:** Vercel (Next.js)
- **Banco:** Vercel Postgres (PostgreSQL serverless)
- **PWA:** Manifest já configurado, instalável
- **Mobile:** React Native + Expo (apps separados)

## 2. Pré-requisitos
- Conta gratuita em [vercel.com](https://vercel.com)
- Repositório GitHub com o código

## 3. Deploy Passo a Passo

### 3.1 Criar projeto na Vercel
1. Acesse [vercel.com/new](https://vercel.com/new)
2. Conecte GitHub
3. Selecione o repositório `mori`
4. Clique em **Add New Database** → **Postgres**
5. A Vercel cria o banco E configura `DATABASE_URL` automaticamente

### 3.2 Configurar Variáveis de Ambiente
Vá em **Settings → Environment Variables** e adicione:

| Variável | Valor |
|----------|-------|
| `JWT_SECRET` | string aleatória 64+ chars |

A `DATABASE_URL` é injetada automaticamente pelo Vercel Postgres.

### 3.3 Deploy
Clique em **Deploy**. A Vercel:
- Detecta Next.js automaticamente
- Roda `npm install` + `next build`
- Sobe para CDN global

### 3.4 Aplicar Schema no Banco
Após o primeiro deploy, no seu terminal local:
```bash
# Pegue a connection string em Settings → Data → Postgres
npx drizzle-kit push
```

Ou via Vercel CLI:
```bash
npm i -g vercel
vercel env pull .env.production
DATABASE_URL=$(cat .env.production | grep DATABASE_URL | cut -d'"' -f2) npx drizzle-kit push
```

### 3.5 Popular dados demo (opcional)
```bash
curl -X POST https://seu-projeto.vercel.app/api/seed
```

### 3.6 Domínio Customizado
**Settings → Domains** → adicione seu domínio (ex: `mori.app.br`).

## 4. Configurar Integrações (via Admin)

Acesse `https://seu-dominio.com/admin` e vá na aba **Integrações**:

- **Mercado Pago:** Obtenha em [mercadopago.com.br/developers](https://www.mercadopago.com.br/developers)
- **Firebase:** [console.firebase.google.com](https://console.firebase.google.com)
- **OneSignal:** [onesignal.com](https://onesignal.com)

As chaves são salvas no banco e ativam imediatamente.

## 5. Variáveis Opcionais (Avançado)

| Variável | Uso |
|----------|-----|
| `MP_ACCESS_TOKEN` | Override do Access Token MP |
| `ONESIGNAL_APP_ID` | Override do App ID OneSignal |
| `FIREBASE_PROJECT_ID` | Override do Project ID Firebase |

## 6. Checklist de Produção

- [ ] Build passou sem erros
- [ ] Healthcheck `/api/health` → `{ "ok": true }`
- [ ] Schema aplicado no Postgres
- [ ] `JWT_SECRET` forte e único
- [ ] `/api/seed` removida ou protegida em produção
- [ ] Domínio com HTTPS ativo
- [ ] Integrações configuradas (se usadas)
- [ ] Sentry/Vercel Analytics ativado

## 7. Custos Estimados

| Serviço | Plano Free | Quando Cobrar |
|---------|------------|---------------|
| Vercel Hosting | 100GB banda, deployments ilimitados | Banda extra |
| Vercel Postgres | 256MB storage, 60h compute | Acima do limite |
| Mercado Pago | Sem mensalidade | Por transação |
| OneSignal | 10k push/mês | Acima do limite |
| Firebase Auth | 50k verificações/mês | Acima do limite |

## 8. Monitoramento

- **Vercel Logs:** Dashboard → Deployments → Logs (streaming)
- **Vercel Analytics:** Settings → Analytics (Web Vitals)
- **Sentry (recomendado):** Adicione o SDK para tracking de erros

## 9. CI/CD Automático

Cada `git push` na branch principal:
1. Dispara novo build
2. Aplica migrations automaticamente (configure com `vercel.json` se necessário)
3. Atualiza produção sem downtime

## 10. Troubleshooting

| Erro | Solução |
|------|---------|
| `relation "users" does not exist` | Rode `npx drizzle-kit push` |
| `password authentication failed` | Verifique `DATABASE_URL` no painel |
| `CORS error` | API está no mesmo domínio, não precisa de config |
| Build OOM | Use `force-dynamic` no layout (já configurado) |

## 11. PWA — Instalação Mobile

A landing page é uma **PWA completa**:
- iOS: Safari → Compartilhar → Adicionar à Tela Inicial
- Android: Chrome → Menu → Instalar App

O app aparece com o ícone da bússola dourada e abre em modo standalone.

Pronto! Seu Mori está em produção. 🧭
