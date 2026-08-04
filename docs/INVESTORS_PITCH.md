# 🧭 Mori — Pitch Deck para Investidores

> **Plataforma completa de turismo digital** com rede social, marketplace, reservas, lives, IA e monetização real.

---

## 1. O Problema

O turismo brasileiro é **gigantesco** (R$ 200+ bilhões/ano), mas **fragmentado**:

- Pousadas e guias locais não têm visibilidade digital eficiente
- Viajantes não encontram roteiros personalizados, guias confiáveis ou reservas seguras em um único lugar
- Não existe uma **economia interna** que incentive engajamento e recompense criadores de conteúdo de viagem
- Lives e stories de turismo são efêmeras e sem monetização

**Solução:** Mori — uma **rede social verticalizada** para turismo com economia interna em **Moris**, reservas Premium, marketplace e assistente de IA.

---

## 2. O Produto (MVP + Premium)

### 2.1 Rede Social de Luxo
- Feed com **7 tipos de post** (texto, foto, carrossel, vídeo, dica, review, promo)
- **8 filtros fotográficos** exclusivos (Praia, Serra, Vintage, P&B, Vívido, Pôr do Sol, Cinema)
- **6 reações** com emojis temáticos (🌅🏔️🌊🌲⭐✨)
- **Momentos** com duração configurável (1–24h)

### 2.2 Assistente IA — Mori Concierge 🧭
- Chat inteligente que busca em tempo real pousadas, guias e roteiros
- Respostas enriquecidas com **carrosséis clicáveis** de recomendações reais
- Diferencial competitivo de alto valor percebido

### 2.3 Lives WebRTC
- Transmissão ao vivo de pousadas e guias
- Sinalização via banco, chat em tempo real, notificação automática aos seguidores

### 2.4 Chat Privado (WhatsApp-like)
- Conversas 1:1 com texto e imagem
- Indicadores de leitura e não lidas

### 2.5 Roteiros e Guias
- Criação de itinerários dia a dia
- Perfis de guias locais com especialidades e preço/dia

### 2.6 Pousadas + Reservas Premium
- Cadastro de pousadas com aprovação
- **Sistema de reservas** exclusivo para contas Premium
- Fluxo completo: hóspede solicita → anfitrião confirma → concluída

### 2.7 Marketplace em Moris
- 4 tipos de produto: físico, digital, experiência, serviço
- Taxa de plataforma de **5%**
- Notificações e histórico de compras/vendas

### 2.8 Gamificação
- **12 badges** com recompensas em Moris e XP
- Sistema de níveis com bônus automático

### 2.9 Monetização Real (Mercado Pago)
- **4 pacotes de Moris** pagos em BRL (R$ 19,90 a R$ 199,90)
- Checkout integrado via Mercado Pago
- Webhook IPN com crédito automático de Moris

### 2.10 Premium (assinatura)
- **500 Moris / 30 dias** (+200 bônus)
- Unlock de reservas, badge exclusiva, pousadas aceitam booking

### 2.11 Créditos de Anúncio
- 4 pacotes (Starter a Agency)
- Campanhas promovidas no feed

### 2.12 Notificações Push (OneSignal)
- Push real via OneSignal configurável no painel admin

### 2.13 Login por Celular (Firebase)
- SMS verification com fallback de simulação elegante

---

## 3. Controle Total via Painel Admin

O **Admin** é o centro de comando da plataforma:

### 3.1 Dashboard de Métricas para Investidores (`/admin/metrics`)
- Usuários totais e Premium (% conversão)
- Reservas, pedidos marketplace, depósitos MP
- Receita em BRL
- Últimos cadastros
- Volume de Moris movimentados

### 3.2 Apps Mobile (`/admin/mobile`)
- Cadastro de versões iOS/Android/Web
- **Force Update** toggle
- Mínima versão suportada
- Release notes e URL da store

### 3.3 Feature Flags (`/admin/features`)
- Controle granular por role (user/host/guide/admin)
- Exigir Premium ou não
- Ativar/desativar funcionalidades em tempo real sem deploy

### 3.4 Integrações Globais (`/admin/settings`)
- Mercado Pago (Access Token, Public Key)
- Firebase (Project ID, API Key)
- OneSignal (App ID, REST Key)

### 3.5 Broadcast e Moderação
- Envio de comunicado para toda a base
- Ocultar/apagar posts
- Aprovar/suspender pousadas
- Banir/Verificar usuários

---

## 4. Modelo de Negócio

### 4.1 Receitas

| Fonte | Descrição | Ticket médio |
|-------|-----------|--------------|
| **Premium** | Assinatura 30 dias | R$ 39,90 (500 Moris) |
| **Marketplace fee** | 5% sobre vendas | Variável |
| **Anúncios** | Créditos de campanha | R$ 19,90–199,90 |
| **Depósitos MP** | Compra de Moris | R$ 19,90–199,90 |
| **Comissões de pousada** | 10% configurable | Variável |

### 4.2 Unidade Econômica

- **DAU/MAU** meta: 15–20%
- **Conversão Premium:** 8–12% (benchmark: Duolingo, Notion)
- **ARPU Premium:** R$ 39,90/mês
- **LTV:** R$ 240–400 (6–10 meses retenção)
- **CAC:** R$ 15–25 (orgânico via gamificação + referral)

### 4.3 Projeção Conservadora (12 meses)

| Mês | Usuários | Premium | Receita mensal |
|-----|----------|---------|----------------|
| 3 | 5.000 | 400 | R$ 15.960 |
| 6 | 15.000 | 1.500 | R$ 59.850 |
| 9 | 35.000 | 4.200 | R$ 167.580 |
| 12 | 70.000 | 9.800 | R$ 391.020 |

**ARR projetado:** R$ 4,7 milhões (ano 1)

---

## 5. Diferenciais Competitivos

1. **Economia interna em Moris** — gamificação + monetização real
2. **Mori Concierge IA** — único no mercado brasileiro de turismo
3. **Lives de pousadas e guias** — conteúdo ao vivo com monetização
4. **Reservas Premium** — conversão direta de assinatura para revenue
5. **Marketplace vertical** — experiências autênticas pagas em Moris
6. **Controle total via Admin** — feature flags, apps mobile, integrações

---

## 6. Road Map (Próximos 12 meses)

### Q1 (MVP → Produto)
- [x] Mori Concierge IA
- [x] Mercado Pago + Wallet
- [x] Firebase Phone Auth
- [x] OneSignal Push
- [x] Feature Flags + Apps Mobile no Admin
- [ ] Calendário de disponibilidade por pousada
- [ ] Mapa interativo (Mapbox)

### Q2 (Escala)
- [ ] WebSocket real (chat + notificações)
- [ ] SFU para lives (LiveKit)
- [ ] App mobile MVP (React Native)
- [ ] Reviews 1–5 estrelas
- [ ] Programa de afiliados

### Q3 (Monetização Avançada)
- [ ] PIX nativo (sem sair do app)
- [ ] Escrow marketplace (pagar → entregar → liberar)
- [ ] Dashboard de anunciantes (CTR, gasto, pause)
- [ ] Cupons e descontos

### Q4 (Expansão)
- [ ] White-label para redes de pousadas
- [ ] Parcerias com companhias aéreas e operadoras
- [ ] Internacionalização (espanhol + inglês)

---

## 7. Equipe

- **Fundador & Product:** Visão completa do produto, código e estratégia
- **Tech Lead (a definir):** Arquitetura, performance, DevOps
- **Growth & Community (a definir):** Aquisição orgânica, parcerias, conteúdo

---

## 8. Ask

**Rodada Seed:** R$ 1,5–2,5 milhões

**Uso dos recursos:**
- 40% Produto & Tech (app mobile, WebSocket, SFU)
- 30% Growth & Marketing (parcerias, conteúdo, SEO)
- 20% Operações & Legal (KYC, compliance, suporte)
- 10% Reserva (runway 18 meses)

**Valuation:** R$ 12–18 milhões (pós-money)

---

## 9. Prints Conceituais (Descrição para Investidores)

### 9.1 Tela de Feed
- Header com logo da bússola dourada
- Barra de Momentos no topo com avatares e anel dourado pulsante
- Composer com 7 tipos de post (ícones coloridos)
- Cards de post com borda dourada sutil ao hover
- Reações flutuantes ao passar o mouse no coração

### 9.2 Mori Concierge (Chat IA)
- Interface de chat luxuosa (bolhas pretas/douradas)
- Resposta com carrossel de 3 pousadas clicáveis
- Card de guia local com preço/dia destacado
- Card de roteiro com duração e orçamento

### 9.3 Carteira + Mercado Pago
- Cards grandes com saldo de Moris e Créditos
- 4 pacotes de Moris com preço em R$ e bônus
- Botão "Pagar R$ XX,XX" que abre checkout Mercado Pago
- Extrato com ícones de crédito/débito

### 9.4 Painel Admin — Métricas para Investidores
- 4 cards grandes: Usuários, Premium (%), Reservas, Receita BRL
- Tabela de últimos cadastros
- Gráfico de volume de Moris movimentados (mock)

### 9.5 Apps Mobile (Admin)
- Formulário de nova versão com toggle "Force Update"
- Lista de versões publicadas com status ativo/inativo

### 9.6 Feature Flags (Admin)
- Toggle por role (user/host/guide/admin)
- Checkbox "Exigir Premium"
- Status ativo/inativo com ícone de toggle

---

## 10. Contato

**Fundador:** [Seu nome]  
**Email:** invest@mori.app  
**Site:** https://mori.app  
**Demo:** https://3000-xxx.vercel.app (sandbox)

---

*Documento confidencial — uso exclusivo para potenciais investidores.*
