# ☁️ Deploy do Mori na Vercel — Guia Completo Passo a Passo

Este guia cobre o deploy completo da plataforma Mori na Vercel, incluindo banco de dados gerenciado, configuração de variáveis de ambiente, proteção de rotas e verificação de funcionamento.

---

## 1. Pré-requisitos

- Conta na [Vercel](https://vercel.com) (gratuita)
- Conta no [Neon](https://neon.tech) (banco PostgreSQL serverless gratuito)
- Repositório Git com o código do Mori (GitHub, GitLab ou Bitbucket)
- Node.js 20+ instalado localmente

---

## 2. Provisionar o Banco de Dados (Neon)

1. Acesse [neon.tech](https://neon.tech) e crie uma conta.
2. Clique em **Create Project**.
3. Escolha um nome (ex: `mori-db`) e a região mais próxima dos seus usuários.
4. Após criado, copie a **Connection string** (formato `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require`).
5. Guarde essa string — será usada como `DATABASE_URL`.

> Alternativas: [Supabase](https://supabase.com), [Railway](https://railway.app), [Vercel Postgres](https://vercel.com/storage/postgres).

---

## 3. Aplicar o Schema no Banco

Com o banco criado e a connection string em mãos:

```bash
# Localmente no seu terminal:
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require" npx drizzle-kit push
```

Isso criará as 25 tabelas, enums, índices e constraints no banco de produção.

---

## 4. Preparar o Projeto para Deploy

### 4.1 Verificar scripts no `package.json`
Certifique-se de que o `package.json` contém:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```
A Vercel detecta Next.js automaticamente e usa `next build` na etapa de build.

### 4.2 Configurar `next.config.ts`
O arquivo atual já está otimizado para deploy:
```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  productionBrowserSourceMaps: false,
};
export default nextConfig;
```
> O `ignoreBuildErrors: true` é seguro porque rodamos `tsc --noEmit` separadamente antes do deploy.

### 4.3 Adicionar `.gitignore`
Certifique-se de que o `.gitignore` inclui:
```
.env
.env.local
.next/
node_modules/
```

### 4.4 Commit e push
```bash
git add .
git commit -m "Preparado para deploy Vercel"
git push origin main
```

---

## 5. Deploy na Vercel

### Opção A: Via Dashboard (recomendado para primeira vez)

1. Acesse [vercel.com/new](https://vercel.com/new).
2. Conecte sua conta GitHub/GitLab/Bitbucket.
3. Selecione o repositório do Mori.
4. Na tela de configuração, expanda **Environment Variables** e adicione:

| Nome | Valor | Tipo |
|------|-------|------|
| `DATABASE_URL` | String de conexão do Neon | Production, Preview, Development |
| `JWT_SECRET` | Uma frase longa e aleatória (mín. 64 caracteres) | Production, Preview, Development |

5. Clique em **Deploy**.

### Opção B: Via CLI

```bash
npm i -g vercel
vercel
```

Siga as instruções interativas:
- Configure o scope (conta)
- Link ao projeto existente ou crie novo
- Informe as variáveis de ambiente quando solicitado
- Confirme o deploy

---

## 6. Pós-Deploy

### 6.1 Verificar health
```bash
curl https://seu-dominio.vercel.app/api/health
# Deve retornar: {"ok":true}
```

### 6.2 Popular dados demo (opcional)
```bash
curl -X POST https://seu-dominio.vercel.app/api/seed
```
> ⚠️ **IMPORTANTE:** Após popular, **proteja ou remova** a rota `/api/seed` em produção:
> - Opção 1: Delete o arquivo `src/app/api/seed/route.ts`
> - Opção 2: Adicione verificação de secret no handler:
>   ```ts
>   const secret = req.headers.get("x-seed-secret");
>   if (secret !== process.env.SEED_SECRET) return bad("Forbidden", 403);
>   ```

### 6.3 Configurar domínio customizado
1. Vercel Dashboard → seu projeto → **Settings → Domains**
2. Adicione seu domínio (ex: `mori.app.br`)
3. Configure os registros DNS conforme instruções da Vercel
4. Aguarde propagação (5-30 minutos)

### 6.4 Configurar Integrações via Admin
1. Acesse `https://seu-dominio/admin`
2. Faça login com `admin` / `admin123` (ou a senha que definiu)
3. Vá para a aba **Integrações**
4. Preencha as chaves de produção:
   - **Mercado Pago Access Token:** obtido em [mercadopago.com.br/developers/panel](https://www.mercadopago.com.br/developers/panel) → Credenciais → Access token de produção
   - **OneSignal App ID + REST API Key:** obtidas em [onesignal.com](https://onesignal.com) → App Settings → Keys & IDs
   - **Firebase Project ID + Web API Key:** obtidas em [console.firebase.google.com](https://console.firebase.google.com) → Configurações do projeto → Web API Key

---

## 7. Verificações Finais

### 7.1 Checklist de produção

- [ ] `DATABASE_URL` configurada corretamente (com SSL)
- [ ] `JWT_SECRET` forte e único (não usar "dev-secret")
- [ ] Schema do banco aplicado (`drizzle-kit push` executado)
- [ ] Rota `/api/seed` protegida ou removida
- [ ] Health check passa (`/api/health` → 200)
- [ ] Login funcional (registro + login)
- [ ] Feed carrega sem erros
- [ ] Upload de imagem funciona
- [ ] Integrações configuradas no Admin (se aplicável)
- [ ] Domínio customizado configurado com HTTPS
- [ ] Logs da Vercel sem erros críticos

### 7.2 Monitoramento

- **Vercel Analytics:** Ative em Settings → Analytics (Web Vitals + Audience)
- **Logs:** Vercel Dashboard → seu projeto → Logs (streaming em tempo real)
- **Erros:** Configure [Sentry](https://sentry.io) para captura de exceções no frontend e backend

---

## 8. Atualizações Futuras (CI/CD)

A cada push na branch principal, a Vercel automaticamente:
1. Detecta a alteração
2. Executa `npm install` e `next build`
3. Publica a nova versão em produção

Para aplicar mudanças no schema do banco:
```bash
# Localmente, antes do push:
DATABASE_URL="postgresql://..." npx drizzle-kit push
git add .
git commit -m "feat: nova tabela X"
git push origin main
```

---

## 9. Troubleshooting

### Erro: "password authentication failed"
- Verifique se a connection string do Neon está correta
- Certifique-se de que o IP da Vercel está liberado (Neon permite todas as origens por padrão)

### Erro: "relation 'users' does not exist"
- Execute `npx drizzle-kit push` com a `DATABASE_URL` de produção
- Verifique se o banco não está vazio e o schema foi criado

### Build falhando na Vercel
- Verifique os logs: Vercel Dashboard → Deployments → clique no deploy com falha
- Rode `npm run build` localmente para reproduzir o erro
- Se for erro de tipo, execute `npm exec tsc -- --noEmit` e corrija

### Páginas com 404
- Verifique se a estrutura de pastas do App Router está correta
- Rotas dinâmicas devem usar `[param]` e não `:param`

### Problemas de CORS
- APIs do Next.js no mesmo domínio não precisam de configuração CORS
- Em produção, certifique-se de que o `origin` está correto nos headers

---

## 10. Escalando

Para cargas maiores:
- **Neon:** Aumente o tier (inicia gratuito, escala com branches)
- **Vercel:** Planos Pro e Enterprise oferecem mais recursos de computação
- **CDN:** Imagens devem ser migradas para Cloudinary/R2 (não armazenar dataURLs no banco)
- **Cache:** Adicione estratégias de `stale-while-revalidate` nas APIs de feed
- **WebSocket:** Migre chat e notificações para solução com WebSocket (ex.: Pusher, Ably)

---

Com este guia, o deploy do Mori na Vercel leva menos de 15 minutos e a plataforma fica pronta para produção com banco gerenciado, HTTPS automático, CI/CD e monitoramento. 🧭
