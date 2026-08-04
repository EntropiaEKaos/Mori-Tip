# 📱 Mori Mobile — App Nativo (React Native / Expo)

## Visão Geral
O app mobile do Mori é uma experiência completa e autônoma, com visual idêntico à web, otimizado para mobile-first e com todas as principais funcionalidades.

## Estrutura do App
```
mobile/
├── App.tsx                 # App principal (self-contained)
├── screens/
│   ├── FeedScreen.tsx
│   ├── ExploreScreen.tsx
│   ├── RoteirosScreen.tsx
│   ├── PousadasScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── ConciergeScreen.tsx   # IA Concierge
│   ├── MomentsScreen.tsx
│   ├── LiveScreen.tsx
│   └── WalletScreen.tsx
├── components/
│   ├── MoriCard.tsx
│   ├── GoldButton.tsx
│   └── CompassLogo.tsx
└── assets/
```

## Funcionalidades Implementadas

### 1. Navegação Bottom Tab (5 abas)
- **Feed** — Momentos + posts com reações
- **Explorar** — Busca de destinos
- **Roteiros** — Itinerários salvos
- **Pousadas** — Catálogo de hospedagens
- **Perfil** — Estatísticas + Premium

### 2. Mori Concierge Mobile
- Chat flutuante com IA
- Sugestões em tempo real de pousadas, guias e roteiros
- Integração com backend `/api/ai/concierge`

### 3. Momentos (Stories)
- Barra horizontal com anel dourado
- Viewer fullscreen com progresso
- Duração configurável

### 4. Lives
- Botão "Entrar ao vivo"
- Chat da live
- Controles de host (mic/cam)

### 5. Carteira + Mercado Pago
- Saldo de Moris e Créditos
- Compra de Moris com BRL (via Mercado Pago)
- Histórico de transações

### 6. Design System Mobile
- Mesma paleta dourado/preto/branco
- Tipografia serifada no logo
- Bordas arredondadas de 20px
- Sombras suaves e elevação

## Como Rodar

```bash
cd mobile
npm install
npx expo start
```

## Instalação como PWA

O app web (`/`) já funciona como PWA instalável:
- iOS: Safari → Compartilhar → Adicionar à Tela Inicial
- Android: Chrome → Menu → Instalar App

---

O app mobile foi projetado para ser **auto-suficiente** e bonito mesmo sem backend, com dados mockados e interface de alta fidelidade ao web.
