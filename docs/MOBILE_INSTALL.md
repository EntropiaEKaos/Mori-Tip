# 📱 Instalação do App Mobile Mori

## Estrutura do Projeto

O app mobile Mori é um projeto **Expo (React Native)** totalmente independente, localizado em `mobile/`.

```
mobile/
├── app.config.js           # Configuração Expo
├── package.json            # Dependências
├── babel.config.js
├── tsconfig.json
├── README.md
├── app/                    # Rotas (expo-router file-based)
│   ├── (auth)/
│   │   └── login.tsx       # Login email + Firebase Phone
│   └── (tabs)/
│       ├── _layout.tsx     # Bottom tabs
│       ├── index.tsx       # Feed
│       ├── explore.tsx
│       ├── roteiros.tsx
│       ├── pousadas.tsx
│       └── profile.tsx
├── src/
│   ├── components/         # CompassLogo, MoriCard, GoldButton
│   ├── context/            # AuthContext
│   ├── services/           # api.ts (fetch wrapper)
│   ├── theme/              # colors, spacing, typography
│   └── app/                # Telas: concierge, premium, wallet, settings, inn/[id], itinerary/[id]
└── assets/
    ├── icon.svg            # Ícone 1024x1024
    └── splash.svg          # Splash com bússola
```

## Setup Local

```bash
cd mobile
npm install --legacy-peer-deps
npx expo start
```

## Configurar API

Edite `src/services/api.ts`:
```ts
const API_BASE = "https://mori.app.br"; // ou http://localhost:3000 em dev
```

## Build de Produção

```bash
# Instalar EAS CLI
npm install -g eas-cli
eas login
eas build:configure

# Build de teste (APK)
eas build --platform android --profile preview

# Builds para stores
eas build --platform ios
eas build --platform android
```

## Telas Implementadas

| Rota | Função |
|------|--------|
| `/(auth)/login` | Login email/senha + SMS Firebase |
| `/(tabs)/` | Feed com posts e reactions |
| `/(tabs)/explore` | Busca de viajantes |
| `/(tabs)/roteiros` | Lista de roteiros |
| `/(tabs)/pousadas` | Catálogo de pousadas |
| `/(tabs)/profile` | Perfil + Moris + navegação |
| `/concierge` | Chat IA com Mori |
| `/premium` | Assinatura Premium |
| `/wallet` | Carteira + compra de Moris |
| `/settings` | Config + multi-language |
| `/inn/[id]` | Detalhe da pousada |
| `/itinerary/[id]` | Detalhe do roteiro |

## Stack

- **Expo SDK 51**
- **React Native 0.74.5**
- **expo-router 3.5** (file-based routing)
- **TypeScript 5.3**
- **AsyncStorage** para tokens
- **react-native-svg** para a bússola

## Componentes Nativos

- **CompassLogo** — SVG da bússola dourada
- **MoriCard** — Card com borda dourada em hover
- **GoldButton** — Botão com gradiente dourado

## Tema Mori Mobile (`src/theme/index.ts`)

```ts
export const colors = {
  gold: "#c5a84a",
  goldDeep: "#9b8038",
  black: "#0f0f11",
  white: "#ffffff",
  ivory: "#faf8f3",
  // ...
};
```

## Comandos Úteis

```bash
npx expo start                    # Dev
npx expo start --clear            # Limpa cache
npx expo start --tunnel           # Tunnel (acesso externo)
npx expo doctor                   # Diagnóstico
eas build:configure               # Setup EAS
eas build --platform android      # Build APK
eas submit --platform ios         # Submit App Store
```

## Próximos Passos

1. **Configurar EAS Build** com conta Expo
2. **Adicionar assets reais** (PNG 1024x1024)
3. **Integrar Firebase** com chaves reais
4. **Configurar push** com OneSignal
5. **Implementar captura de fotos** com filtros Canvas
6. **Publicar nas stores**

## Notas Importantes

- O projeto `mobile/` é **independente** do `src/`
- Tem seu próprio `package.json`, `tsconfig.json` e `node_modules`
- As dependências devem ser instaladas via `cd mobile && npm install`
- O `tsconfig.json` raiz **exclui** `mobile/` para evitar conflitos
- A API consumida é a **mesma do web** (Next.js)
