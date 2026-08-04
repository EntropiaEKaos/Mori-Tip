# ☁️ Deploy Mori na Vercel + PostgreSQL (Vercel Postgres)

Guia completo e atualizado para deploy do Mori na Vercel usando **Vercel Postgres** (banco serverless gerenciado diretamente pela Vercel).

---

## 1. Pré-requisitos

- Conta gratuita na [Vercel](https://vercel.com)
- Repositório GitHub com o código do Mori
- Node.js 20+ localmente

---

## 2. Criar o Projeto na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Conecte sua conta GitHub
3. Selecione o repositório `mori`
4. Na tela de configuração, clique em **"Add New Database"** → **Vercel Postgres**

A Vercel cria automaticamente:
- Um banco PostgreSQL serverless
- A variável `DATABASE_URL` já configurada
- Branch de preview automático

Clique em **Deploy**.

---

## 3. Aplicar o Schema no Banco

Após o primeiro deploy bem-sucedido:

```bash
# Pegue a connection string no painel da Vercel:
# Settings → Environment Variables → DATABASE_URL

# Execute localmente:
npx drizzle-kit push
```

Ou use o **Vercel CLI** para rodar migrations no banco de produção:

```bash
vercel env pull .env.production
DATABASE_URL=$(vercel env get DATABASE_URL) npx drizzle-kit push
```

---

## 4. Configurar Variáveis de Ambiente

No painel da Vercel, adicione as seguintes variáveis:

| Nome | Valor | Observação |
|------|-------|------------|
| `JWT_SECRET` | Uma string longa e aleatória (mín. 64 caracteres) | Obrigatória |
| `DATABASE_URL` | Gerada automaticamente pelo Vercel Postgres | Já deve existir |

---

## 5. Seed Inicial (Dados Demo)

```bash
curl -X POST https://seu-projeto.vercel.app/api/seed
```

> **Importante:** Após popular os dados, **remova ou proteja** a rota `/api/seed` em produção.

---

## 6. Domínio Customizado

1. Vercel Dashboard → seu projeto → **Settings → Domains**
2. Adicione seu domínio (ex: `mori.app.br`)
3. Siga as instruções de DNS

---

## 7. Configurar Integrações (Mercado Pago, Firebase, OneSignal)

Após o deploy, acesse `/admin` e vá até a aba **Integrações**. Insira as chaves reais:

- Mercado Pago Access Token
- Firebase Project ID + API Key
- OneSignal App ID + REST API Key

Todas as chaves são salvas na tabela `system_settings`.

---

## 8. PWA — Instalação no Celular

O Mori já possui manifest.json configurado. Para instalar como app:

- **iOS:** Abra no Safari → Compartilhar → Adicionar à Tela Inicial
- **Android:** Abra no Chrome → Menu → Instalar App

---

## 9. Monitoramento e Logs

- **Vercel Logs:** Dashboard → Deployments → Logs
- **Vercel Analytics:** Ative em Settings → Analytics
- **Sentry (recomendado):** Adicione o SDK do Sentry para capturar erros de produção

---

## 10. Checklist Final

- [ ] Build passou sem erros
- [ ] Healthcheck responde `{ "ok": true }`
- [ ] Login e registro funcionam
- [ ] Feed carrega corretamente
- [ ] Upload de foto funciona
- [ ] Integrações configuradas no Admin
- [ ] Domínio apontando corretamente
- [ ] Rota `/api/seed` removida/protegida

Pronto! Seu Mori está rodando em produção com PostgreSQL serverless, CI/CD automático e PWA instalável. 🧭
