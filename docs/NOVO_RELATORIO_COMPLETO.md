# 🧭 Mori — Relatório Completo de Funcionalidades, Integrações e Arquitetura

> **Última grande atualização:** Integrações Mercado Pago, Firebase Phone Auth, OneSignal Push, Assistente IA Mori Concierge, Gamificação Expandida, Marketplace (feat. Moris), sistema de Reservas Premium e Design System de Luxo.

---

## Sumário

1. [Visão Geral da Plataforma](#1-visão-geral-da-plataforma)
2. [Identidade Visual e Design System (Dourado, Preto e Branco)](#2-identidade-visual-e-design-system)
3. [Sistema de Autenticação: Email, Usuário e Firebase Phone Login](#3-sistema-de-autenticação)
4. [Feed Social, Postagens e Filtros Fotográficos](#4-feed-social-postagens-e-filtros)
5. [Momentos (Stories) com Duração Configurável](#5-momentos-stories)
6. [Mori Concierge — Assistente de Viagens com Inteligência Artificial](#6-mori-concierge)
7. [Lives (Ao Vivo) via WebRTC](#7-lives-webrtc)
8. [Chat Completo Estilo WhatsApp](#8-chat)
9. [Roteiros de Viagem Personalizados](#9-roteiros)
10. [Guias Locais Credenciados](#10-guias-locais)
11. [Pousadas e Sistema de Reservas (Premium)](#11-pousadas-e-reservas)
12. [Marketplace: Compras e Vendas em Moris](#12-marketplace)
13. [Sistema de Gamificação, Badges e Níveis](#13-gamificação-badges-e-níveis)
14. [Carteira Mori (Moris, Créditos Ads e Mercado Pago)](#14-carteira-mori-e-mercado-pago)
15. [Monetização: Premium, Créditos e Anúncios Promovidos](#15-monetização)
16. [Sistema de Notificações (In-App & OneSignal Push)](#16-sistema-de-notificações)
17. [Painel Administrativo (Admin) e Configurações Globais](#17-painel-admin)
18. [Registros e Transações (Ledger Financeiro)](#18-ledger-de-transações)
19. [Arquitetura Técnica, APIs e Rotas](#19-arquitetura-técnica)
20. [Deploy em Produção (Vercel, Neon, Cloudflare)](#20-deploy-em-produção)

---

## 1. Visão Geral da Plataforma

**Mori** é a rede social completa para viajantes, anfitriões de pousadas e guias turísticos. Combina elementos de microblog (Twitter/X), compartilhamento visual (Instagram) e ferramentas de negócio como marketplace, booking engine e assistente inteligente de viagens. Toda a economia interna gira em torno da moeda digital **Moris**, que pode ser adquirida com dinheiro real (Mercado Pago) ou conquistada através de engajamento e contribuições na comunidade.

**Stack principal:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Drizzle ORM, PostgreSQL, JWT Auth, WebRTC.

---

## 2. Identidade Visual e Design System

### Paleta de Luxo Mori
| Cor | Hexadecimal | Uso |
|-----|-------------|-----|
| Dourado Principal | `#c5a84a` | Links, botões primários, badges, ícone da bússola, destaques |
| Dourado Escuro | `#9b8038` | Gradientes de botão, sombras, detalhes de profundidade |
| Preto Profundo | `#0f0f11` | Backgrounds principais, cabeçalhos, cards dark mode, texto principal |
| Papel Claro | `#fdfaf4` | Background geral das páginas de conteúdo e feed |
| Marfim Suave | `#f5f1e8` | Background de inputs e áreas de interação |
| Cinza Areia | `#eae3ce` | Bordas de cards padrão |

### Componentes Visuais
- **Símbolo da Bússola (SVG):** Presente em todo o layout: logotipo, canto de fotos publicadas, favicon e headers.
- **Sistema de Cards Mori:** Classe utilitária `.mori-card` com borda clara, elevação suave e transição ao hover que acende a borda dourada. Cada card de feed, pousada ou produto usa este design.
- **Tipografia:** Família nativa do sistema com tracking ajustado, pesos extrabold para destaque e uma atmosfera de revista de luxo.
- **Modo Offline:** Páginas dedicadas `/offline` e `/preview` com vitrine visual estática da plataforma, utilizáveis para avaliação estética sem backend ativo.
- **Responsividade:** Layout adaptativo mobile-first com sidebar colapsável em modo hamburguer, top bar compacta e badges de notificação.

---

## 3. Sistema de Autenticação

### Métodos Disponíveis
1. **Registro/Login Clássico:** Usuario + email + senha com hash bcrypt e JWT armazenado em cookie httpOnly (`mori_session`). Validação Zod no registro.
2. **Login via Número de Celular (Firebase Auth):** Interface dedicada de duas abas na página `/login`. O usuário insere o número de celular com DDI automático e recebe um código SMS. A API de verificação `/api/auth/phone` suporta:
   - Integração real com Firebase Identity Toolkit para verificação do token.
   - Modo simulação (fallback automático) que exibe o código gerado em um banner dourado flutuante para que avaliadores possam testar o fluxo completo sem configurar chaves Firebase.
   - Geração de conta automática se o número não existir no banco (com bônus de 150 Moris de boas-vindas).

### Segurança
- Senhas hash com bcrypt (custo 10).
- Token JWT com expiração de 30 dias.
- Middleware de autorização `requireUser()` e `requireAdmin()` em todas as APIs protegidas.
- Verificação de conta banida em toda requisição autenticada.

---

## 4. Feed Social, Postagens e Filtros

### Tipos de Postagem
O feed suporta um **composer universal** com seleção de tipo de post:

| Tipo | Ícone | Propósito |
|------|-------|-----------|
| Texto | — | Atualizações, pensamentos, dicas rápidas |
| Foto | 📷 | Compartilhamento de imagem única com filtro opcional |
| Carrossel | 🖼️ | Múltiplas fotos (até 8) com swipe horizontal no card |
| Vídeo | 🎬 | Clipes curtos carregados localmente |
| Dica | 💡 | Sugestões de viagem com badge especial no feed |
| Review | ⭐ | Avaliação de destinos e pousadas |
| Promo | 📢 | Posts patrocinados com badge "Promovido" (via sistema de créditos) |

### Filtros Fotográficos
O Mori oferece **8 filtros exclusivos para viagens** aplicados via Canvas API e queimados diretamente nos pixels da imagem antes do upload:

1. **Original** (sem filtro)
2. **Praia** — tons quentes, saturação elevada
3. **Serra** — tonalidade fria, contraste suave
4. **Vintage** — sépia intenso, brilho reduzido
5. **P&B** — preto e branco com alto contraste
6. **Vívido** — saturação máxima, cores vibrantes
7. **Pôr do Sol** — tons alaranjados, aquecimento sutil
8. **Cinema** — contraste alto, saturação reduzida

Os filtros são visualizados em tempo real no composer e aplicados definitivamente via redraw do canvas antes do envio ao servidor.

### Interações
- **Curtidas com Reações:** Ao passar o mouse/foco no botão de coração, um menu flutuante exibe 6 reações:
  - 🌅 Nascer do Sol
  - 🏔️ Montanha
  - 🌊 Mar
  - 🌲 Serra
  - ⭐ Favorito
  - ✨ Incrível
- **Comentários:** Em thread com preview inline e envio instantâneo.
- **Compartilhamento:** Via Share API nativa (mobile) ou cópia de link.
- **Tags e Localização:** Cada post pode ter tags (exibidas como badges) e geolocalização automática ou manual.

---

## 5. Momentos (Stories)

Substituem o conceito tradicional de stories com funcionalidades expandidas:

- **Barra de Momentos no Topo do Feed:** Exibe avatares dos usuários com borda dourada pulsante quando há momentos não visualizados.
- **Duração Configurável:** O autor escolhe entre **1 e 24 horas** de expiração via slider no momento da publicação.
- **Visualizador Fullscreen:** Progresso por barra de tempo, navegação automática entre momentos do mesmo autor, exibição de contagem de views e legenda.
- **Mídia:** Suporte a foto e vídeo. O filtro escolhido é aplicado visualmente.
- **Privacidade:** Views são registradas em `moment_views` com unique constraint por usuário.

---

## 6. Mori Concierge — Assistente de Viagens IA

> **Diferencial estratégico da plataforma.**

O **Mori Concierge** é um assistente inteligente de viagens integrado ao chat da plataforma, acessível em `/concierge`.

### Funcionalidades
- **Interface de chat luxuosa:** Bolhas douradas/preto, bolha de "digitando" animada com bússola giratória.
- **Reconhecimento de intenção de busca:** Analisa mensagens do usuário para detectar se ele procura:
  - Pousadas (palavras-chave: "hotel", "quarto", "hospedagem", "pousada")
  - Guias turísticos ("guia", "passeio", "tour", "trilha")
  - Roteiros ("roteiro", "itinerário", "viajar", "quantos dias")
- **Varredura dinâmica do banco de dados:** Consulta em tempo real as tabelas `inns`, `guides` e `itineraries` filtrando por cidade ou termo relevante.
- **Resposta enriquecida com carrosséis:** Dentro da bolha de resposta, são renderizados cards interativos clicáveis:
  - Cards de pousada com nome, cidade e preço/noite
  - Cards de guia com especialidade e valor/dia
  - Cards de roteiro com número de dias e orçamento estimado
- **Fallback inteligente:** Se nenhuma correspondência direta for encontrada, o assistente sugere aleatoriamente pousadas e guias em destaque para inspirar o usuário.

---

## 7. Lives (WebRTC)

- **Transmissão ao vivo:** Host captura câmera + microfone via `getUserMedia`.
- **Sinalização via banco de dados:** Oferta (offer), resposta (answer) e candidatos ICE são trocados via tabela `rtc_signals` lida por polling.
- **Servidores STUN:** Configurados com servidores públicos do Google.
- **Chat da live:** Mensagens em tempo real com polling de 2 segundos.
- **Controles de host:** Ligar/desligar câmera e microfone, encerrar transmissão.
- **Notificação automática:** Ao iniciar uma live, todos os seguidores recebem notificação no sistema e potencialmente push via OneSignal.

---

## 8. Chat (Mensagens)

Sistema completo de mensageria privada estilo WhatsApp:

- **Conversas 1:1:** Criadas ao clicar em "Mensagem" no perfil de qualquer usuário ou ao iniciar via busca.
- **Envio de texto e imagens:** Imagens são comprimidas no cliente (máx. 800px) e enviadas como data URL.
- **Polling inteligente:** A cada 2 segundos busca novas mensagens usando `?since=` com timestamp da última mensagem recebida.
- **Indicadores visuais:** Selo de não lidas no menu lateral, bolhas com gradiente preto (mensagens próprias) e branco (mensagens recebidas), duplo check azul.
- **Presença simulada:** Status "online" exibido no cabeçalho do chat.

---

## 9. Roteiros de Viagem

Ferramenta completa de planejamento:

- **Criação detalhada:** Título, descrição, cidade/estado, número de dias, orçamento estimado, tags e paradas.
- **Editor de paradas:** Formato texto com pipe separator (`dia|título|descrição|localização`) para inserção rápida de múltiplas etapas.
- **Visualização dia a dia:** Página de detalhe com cards numerados por dia e paradas sequenciais.
- **Gamificação:** Criar roteiro concede 40 XP e pode desbloquear badge de Explorador (primeiro roteiro).
- **Listagem pública:** Busca por cidade ou título, cards com autor, duração e orçamento.

---

## 10. Guias Locais

Marketplace de profissionais de turismo:

- **Perfil de guia:** Headline, biografia, cidade, estado, idiomas, especialidades e preço por dia.
- **Cadastro simplificado:** Qualquer usuário pode se tornar guia preenchendo o formulário em `/guias`. O campo `role` do usuário é automaticamente atualizado para `"guide"`.
- **Verificação:** Badge visual para guias verificados pela administração.
- **Busca:** Por cidade, especialidade ou nome. Filtro por disponibilidade.
- **Integração com chat:** Botão "Ver perfil" leva ao perfil do usuário onde é possível iniciar conversa direta.

---

## 11. Pousadas e Reservas (Premium)

### Cadastro de Pousadas
- Qualquer usuário pode cadastrar uma pousada (nome, cidade, estado, descrição, preço/noite, comodidades).
- Aprovação: automática para admins e usuários Premium; pendente para os demais.
- Capa e galeria de imagens.

### Sistema de Reservas
- **Exclusivo para Premium:** Apenas usuários com assinatura Premium ativa podem fazer reservas.
- **Gateway de reserva:** Modal completo com seleção de datas (check-in/check-out), número de hóspedes e valor parcial em Moris a ser abatido.
- **Fluxo de confirmação:**
  1. Hóspede solicita reserva (status: `pending`)
  2. Anfitrião recebe notificação e pode **Confirmar** ou **Recusar**
  3. Após confirmada, pode ser marcada como **Concluída**
  4. Hóspede pode cancelar enquanto pendente
- **Painel de reservas (`/reservas`):** Visão dupla — "Minhas estadias" (como hóspede) e "Como anfitrião" (para donos de pousadas).
- **Impacto no banco:** Tabela `bookings` com status rastreável, valores parciais pagos em Moris (`useMoris`) e comissão configurável da plataforma.

---

## 12. Marketplace

Loja interna completa operada com a moeda **Moris**:

- **Tipos de produto:**
  - **Físico:** Souvenirs, kits, produtos regionais.
  - **Digital:** PDFs de guias, mapas, roteiros.
  - **Experiência:** Passeios, workshops, vivências.
  - **Serviço:** Consultoria de viagem, fotografia.

### Fluxo de Compra e Venda
1. Vendedor publica produto definindo tipo, preço em Moris e estoque.
2. Comprador clica em **Comprar** (botão condicional: só aparece se logado e com estoque > 0).
3. Sistema chama `spendMoris()` debitando o valor total da carteira do comprador.
4. **Taxa da plataforma:** 5% do valor é retido (fee). O vendedor recebe 95% automaticamente.
5. Notificações são disparadas para ambas as partes.
6. XP é concedido ao comprador (25 XP) e ao vendedor (40 XP).

### Gestão de Pedidos
- Acesso via `/marketplace` ou API `/api/marketplace/orders`.
- Histórico duplo: "Compras" e "Vendas".
- Badge de Comerciante desbloqueável na primeira venda.

---

## 13. Gamificação, Badges e Níveis

Sistema completo de progressão de jogador:

### XP e Níveis
- **Fórmula de level:** `xpForLevel(L) = floor(100 * (L-1)¹·⁵)`.
- **Progressão visual:** Barra de progresso dourada no perfil e na página dedicada `/gamification`.
- **Bônus de level-up:** Ao subir de nível, o usuário recebe automaticamente `nível * 25` Moris como recompensa e uma notificação comemorativa.

### Conjunto de 12 Badges

| Badge | Condição | Recompensa |
|-------|----------|------------|
| 🏅 Primeira Pegada | 1 post | 50 XP, 20 Moris |
| 📖 Contador de Histórias | 10 posts | 150 XP, 50 Moris |
| 🦋 Social Butterfly | Seguir 5 pessoas | 80 XP, 30 Moris |
| ⭐ Popular | 10 seguidores | 120 XP, 40 Moris |
| 🧭 Explorador | 1 roteiro criado | 100 XP, 50 Moris |
| ✨ Moment Maker | 3 momentos | 90 XP, 30 Moris |
| 🏨 Hóspede VIP | 1ª reserva | 200 XP, 100 Moris |
| 🛍️ Comerciante | 1ª venda marketplace | 150 XP, 80 Moris |
| 🎖️ Viajante Experiente | Nível 5 | 0 XP, 100 Moris |
| 👑 Lenda Mori | Nível 10 | 0 XP, 500 Moris |
| 💎 Membro Premium | Assinar Premium | 100 XP, 200 Moris |
| 🗺️ Guia Local | Tornar-se guia | 150 XP, 100 Moris |

- O motor de verificação `checkAndAwardBadges()` é executado após cada ação relevante (post, reserva, venda, etc.) e também na inicialização do seed.
- Badges já conquistadas têm constraint unique `user_badges_unique` para evitar duplicação.

---

## 14. Carteira Mori e Mercado Pago

### Duas Moedas Digitais

| Moeda | Função | Como obter |
|-------|--------|------------|
| **Moris** (M) | Moeda principal da economia interna | Compra com BRL via Mercado Pago, bônus de nível, recompensas de badge, vendas no marketplace |
| **Créditos** (cr) | Combustível para campanhas de anúncio | Comprados com Moris nos pacotes (Starter, Boost, Pro, Agency) |

### Pacotes de Compra com Dinheiro Real (Mercado Pago)
Disponíveis na página `/wallet`:

| Pacote | Moris | Preço (BRL) | Bônus |
|--------|-------|-------------|-------|
| Mochileiro | 250 | R\$ 19,90 | — |
| Explorador | 600 | R\$ 39,90 | +50 |
| Anfitrião | 1500 | R\$ 89,90 | +200 |
| Mori VIP | 4000 | R\$ 199,90 | +800 |

### Fluxo de Pagamento Real
1. Usuário escolhe pacote na Wallet e clica em **Pagar R\$ XX,XX**.
2. Frontend chama `POST /api/payments/checkout` com `amountBrl` e `morisAmount`.
3. Backend consulta `system_settings.mercadopago_access_token`.
4. Cria Preferência de pagamento na API do Mercado Pago (ou gera link simulado para sandbox).
5. Redireciona o usuário ao checkout oficial do Mercado Pago ou ao link simulado.
6. Ao concluir, o Mercado Pago notifica o webhook `POST /api/payments/webhook`.
7. Webhook atualiza `mp_payments` para `approved`, credita Moris na conta do usuário via `awardMoris()` e registra transação.

### Extrato Financeiro
- Página `/wallet` exibe histórico completo de transações com ícones de crédito/débito, valores em Moris e Créditos, e timestamps relativos.
- Tabela `transactions` registra todas as movimentações com `kind`, metadados e timestamps.

---

## 15. Monetização

### Assinatura Premium
- **Preço:** 500 Moris por 30 dias.
- **Bônus de ativação:** 200 Moris creditados imediatamente.
- **Benefícios:**
  - Acesso ao sistema de reservas em pousadas.
  - Badge exclusiva 💎 Membro Premium.
  - Pousadas do owner têm `acceptsBookings = true` automaticamente.
  - Destaque no feed e busca.
- **Renovação:** Não automática — usuário deve reassinar ao expirar.

### Créditos de Anúncio
- **Pacotes:** Starter (50 cr), Boost (150 cr + 20), Pro (400 cr + 80), Agency (1000 cr + 300).
- **Preço dos pacotes:** 100 a 1200 Moris, dependendo do volume.
- **Uso:** Campanhas promocionais no feed.

### Posts Promovidos
- **Criação:** Em `/promote`, usuário gasta créditos para promover um post, produto ou link externo.
- **Custo:** 10 créditos por dia de campanha.
- **Mecanismo:** Um post do tipo `promo` com `isSponsored = true` é inserido no feed. O sistema registra impressões e cliques.
- **Gestão:** Tabela `promotions` com métricas, status e data de expiração.

---

## 16. Sistema de Notificações

### Notificações In-App
- **Tipos suportados:** `like`, `comment`, `follow`, `mention`, `message`, `live`, `system`, `booking`, `badge`, `order`, `promo`.
- **Badge no menu:** Polling de 5 segundos consulta `/api/notifications` para exibir contador de não lidas com bolinha vermelha.
- **Marcação em lote:** Botão "Marcar todas como lidas".
- **Histórico:** Página `/notifications` com ícones coloridos por tipo de evento e indicador de leitura.

### Push Notifications (OneSignal)
- **Dispatcher:** `src/lib/notifications.ts` — função `sendExternalNotification()`.
- **Integração configurável:** As credenciais do OneSignal (App ID e REST API Key) são armazenadas na tabela `system_settings` e configuráveis via painel Admin.
- **Disparo:** Ao criar notificação in-app, o dispatcher também envia push via REST API do OneSignal se as chaves estiverem configuradas.
- **Fallback elegante:** Se as chaves forem `"DEMO"` ou não estiverem definidas, o sistema loga no console sem quebrar.

---

## 17. Painel Administrativo (Admin)

Acessível em `/admin` apenas para role `admin`.

### Abas do Painel

| Aba | Funcionalidades |
|-----|-----------------|
| 📊 Visão Geral | Cards com total de usuários, posts, comentários, lives ao vivo, pousadas (pendentes/aprovadas), notificações, mensagens e usuários banidos |
| 👥 Usuários | Tabela com avatar, role, status. Ações: Alterar role (user/host/guide/admin), Verificar/Remover verificação, Banir/Desbanir |
| 📝 Publicações | Timeline de posts com moderação: Ocultar/Reexibir e Apagar permanentemente |
| 🏨 Pousadas | Lista com status de aprovação. Ações: Aprovar/Suspender e Excluir |
| 📢 Comunicados | Broadcast de notificação para toda a base de usuários |
| ⚙️ Integrações | Configuração global de chaves API: Mercado Pago (Access Token, Public Key), Firebase (Project ID, API Key), OneSignal (App ID, REST Key) |

### Persistência de Configurações
- Tabela `system_settings` com upsert por chave.
- API dedicada `GET|PATCH /api/admin/settings` com proteção `requireAdmin()`.

---

## 18. Ledger de Transações

Tabela `transactions` registra todo o histórico financeiro:

| Campo | Descrição |
|-------|-----------|
| `userId` | Titular da movimentação |
| `kind` | Tipo: `earn`, `spend`, `purchase_credits`, `booking`, `sale`, `deposit`, `reward` |
| `amountMoris` | Valor em Moris (positivo = crédito, negativo = débito) |
| `amountCredits` | Valor em créditos de anúncio |
| `description` | Texto descritivo automático |
| `meta` | JSON com metadados adicionais (ex.: ID do pedido) |

---

## 19. Arquitetura Técnica

### Estrutura de Diretórios
```
src/
  app/
    (app)/          # Shell autenticado (feed, admin, concierge, marketplace...)
    api/            # Route handlers REST (50+ endpoints)
    login|register|preview|offline/
  components/       # UI: app-shell, composer, post-card, moments-bar, compass-logo...
  db/               # schema.ts (25 tabelas + relations + 12 enums + 30+ índices)
  lib/              # auth.ts, gamification.ts, notifications.ts, rtc-client.ts, utils.ts
public/             # Ícones PWA, manifest.json
docs/               # Documentação técnica e de usuário
```

### Banco de Dados
- **25 tabelas** com índices otimizados.
- **12 enums nativos do PostgreSQL** para tipagem forte.
- **Relações** definidas via Drizzle Relations para queries com joins.
- **Unique indexes** em pares críticos (likes, follows, badges, moments views) para evitar duplicação.

### APIs — Total de Endpoints
| Categoria | Quantidade |
|-----------|------------|
| Auth | 4 |
| Social (posts, comments, likes, follows, moments) | 12 |
| Travel (itineraries, guides, inns, bookings) | 11 |
| Economy (wallet, premium, promotions, marketplace) | 8 |
| Comms (conversations, lives, rtc, notifications) | 10 |
| Admin (stats, users, posts, inns, broadcast, settings) | 6 |
| Ops (seed, upload, health, payments, ai) | 6 |
| **Total** | **~57 endpoints** |

---

## 20. Deploy em Produção

### Variáveis de Ambiente Necessárias
```env
DATABASE_URL=postgresql://...
JWT_SECRET=chave-secreta-minimo-32-caracteres
```

### Chaves via Painel Admin (Salvas em `system_settings`)
| Chave | Serviço |
|-------|---------|
| `mercadopago_access_token` | Mercado Pago — criação de preferências de pagamento |
| `mercadopago_public_key` | Mercado Pago — frontend SDK (opcional) |
| `onesignal_app_id` | OneSignal — identificador do app |
| `onesignal_api_key` | OneSignal — REST API Key para envio de push |
| `firebase_project_id` | Firebase — verificação de tokens de autenticação |
| `firebase_api_key` | Firebase — configuração do SDK cliente |

### Passos para Produção
1. Provisionar PostgreSQL gerenciado (Neon recomendado).
2. Configurar variáveis de ambiente na Vercel.
3. Executar `npx drizzle-kit push` no banco de produção.
4. Popular dados demo: `POST /api/seed` (remover ou proteger em produção real).
5. Configurar domínio customizado.
6. No painel Admin (`/admin` → Integrações), inserir chaves reais dos serviços.
7. Para PWA completo: adicionar service worker (ex.: Serwist).

---

## 📊 Métricas da Plataforma

| Dimensão | Quantidade |
|----------|------------|
| Tabelas no banco | 25 |
| APIs REST | ~57 endpoints |
| Páginas/rotas | ~38 rotas renderizadas |
| Badges de gamificação | 12 |
| Tipos de postagem | 7 |
| Tipos de produto no marketplace | 4 |
| Filtros de foto | 8 |
| Reações disponíveis | 6 |
| Pacotes de Moris (BRL) | 4 |
| Pacotes de Créditos | 4 |
| Roles de usuário | 4 (user, host, guide, admin) |
| Documentação | 5 arquivos markdown |

---

## 🧭 Conclusão

O Mori deixou de ser um MVP de rede social e tornou-se uma **plataforma completa de turismo digital**, com economia interna real (lastreada em pagamentos Mercado Pago), inteligência artificial integrada, gamificação robusta e uma identidade visual de luxo consistente em cada pixel.

Cada componente, API, rota e integração foi desenhado para operar de forma independente, permitindo que futuras evoluções (como app mobile React Native ou migração de mídia para CDN) sejam integradas sem reescrita.
