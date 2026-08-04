# 📱 Mori Mobile — App Nativo

Aplicativo nativo **Mori** com **Expo + React Native**, pronto para iOS e Android.

## Stack
- **Expo SDK 51**
- **React Native 0.74**
- **expo-router** (file-based navigation)
- **TypeScript**
- AsyncStorage para tokens
- Expo Notifications para push
- Expo Camera para fotos com filtro

## Estrutura

```
mobile/
├── app/                    # Rotas (expo-router)
│   ├── _layout.tsx        # Layout raiz com providers
│   ├── (auth)/            # Login + Register
│   │   └── login.tsx
│   ├── (tabs)/            # Bottom tabs
│   │   ├── _layout.tsx
│   │   ├── index.tsx       # Feed
│   │   ├── explore.tsx
│   │   ├── roteiros.tsx
│   │   ├── pousadas.tsx
│   │   └── profile.tsx
│   ├── concierge.tsx       # IA chat
│   ├── premium.tsx
│   ├── wallet.tsx
│   ├── settings.tsx
│   ├── inn/[id].tsx
│   └── itinerary/[id].tsx
├── src/
│   ├── components/         # CompassLogo, MoriCard, GoldButton
│   ├── context/            # AuthContext
│   ├── services/           # api.ts (fetch wrapper)
│   ├── theme/              # colors, spacing, typography
│   └── assets/
├── app.json                # Configuração Expo
├── package.json
├── babel.config.js
└── tsconfig.json
```

## Comandos

```bash
cd mobile
npm install
npx expo start              # Dev server
npx expo start --android    # Android
npx expo start --ios        # iOS
npx expo start --web        # Web (mesma API)
```

## Build de Produção

```bash
# Configurar EAS
npm install -g eas-cli
eas login
eas build:configure

# APK de teste
eas build --platform android --profile preview

# iOS / Android para stores
eas build --platform ios
eas build --platform android
```

## Configuração da API

Aponte para seu backend em `src/services/api.ts`:

```ts
const API_BASE = "https://mori.app.br";
```

## Credenciais Demo
- `admin` / `admin123`
- `marina` / `mori123`
- `pousada_do_sol` / `mori123`

## Recursos Implementados
- ✅ Login email/senha com JWT
- ✅ Login via SMS (Firebase Phone Auth simulation)
- ✅ Feed de posts com reações
- ✅ Busca de viajantes
- ✅ Roteiros (lista + detalhe)
- ✅ Pousadas (lista + detalhe)
- ✅ Perfil com nível e Moris
- ✅ Mori Concierge IA
- ✅ Premium
- ✅ Carteira (compra de Moris via Mercado Pago)
- ✅ Configurações com multi-language (PT/EN/ES)

## Próximos Passos
- [ ] Captura de fotos com filtros Canvas
- [ ] Push notifications
- [ ] Mensagens de voz
- [ ] Lives WebRTC
- [ ] Publicar nas stores
