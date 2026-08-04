# 📱 Mori Mobile — Documentação Completa

## Visão Geral

O **Mori Mobile** é o app nativo da plataforma Mori, construído com **React Native + Expo** para garantir compatibilidade total com iOS e Android. A interface mantém 100% da identidade visual dourado/preto/branco, com componentes otimizados para telas pequenas e interações nativas (gestos, push notifications, câmera).

## Stack
- **React Native 0.74+**
- **Expo SDK 51+**
- **React Navigation 6** (Bottom Tabs + Native Stack)
- **Expo Router** (alternativa file-based)
- **TypeScript**
- **AsyncStorage** para tokens
- **Expo Notifications** para push
- **Expo Camera/Media** para captura de momentos

## Estrutura do Projeto

```
mobile/
├── App.tsx                  # Entry point com navegação principal
├── app.json                 # Configuração Expo (ícones, splash, bundle id)
├── package.json             # Dependências
├── tsconfig.json
├── babel.config.js
├── assets/
│   ├── icon.png             # Ícone 1024x1024 (bússola dourada em preto)
│   ├── splash.png           # Splash com bússola
│   └── adaptive-icon.png    # Android adaptive
├── src/
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── MainTabs.tsx     # Bottom tabs (Feed, Explorar, Roteiros, Pousadas, Perfil)
│   │   └── AuthStack.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx        # Email/senha + Firebase Phone (tabs)
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── OtpScreen.tsx          # SMS verification
│   │   ├── feed/
│   │   │   ├── FeedScreen.tsx
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostComposer.tsx       # 7 tipos + filtros
│   │   │   └── MomentsBar.tsx
│   │   ├── explore/
│   │   │   ├── ExploreScreen.tsx
│   │   │   └── SearchScreen.tsx
│   │   ├── travel/
│   │   │   ├── RoteirosScreen.tsx
│   │   │   ├── RoteiroDetailScreen.tsx
│   │   │   ├── PousadasScreen.tsx
│   │   │   ├── PousadaDetailScreen.tsx    # Com Reviews estruturados
│   │   │   ├── GuiasScreen.tsx
│   │   │   ├── GuiaDetailScreen.tsx
│   │   │   └── BookingScreen.tsx          # Modal de reserva
│   │   ├── social/
│   │   │   ├── ProfileScreen.tsx          # Com Highlights + Pinned
│   │   │   ├── HighlightsScreen.tsx
│   │   │   ├── ScheduledScreen.tsx
│   │   │   ├── NotificationsScreen.tsx
│   │   │   ├── ConciergeScreen.tsx        # IA
│   │   │   └── WalletScreen.tsx
│   │   ├── chat/
│   │   │   ├── ConversationsScreen.tsx
│   │   │   ├── ChatScreen.tsx
│   │   │   └── VoiceMessageRecorder.tsx  # Native
│   │   ├── live/
│   │   │   ├── LivesListScreen.tsx
│   │   │   └── LiveRoomScreen.tsx        # WebRTC + chat
│   │   ├── marketplace/
│   │   │   ├── MarketplaceScreen.tsx
│   │   │   ├── ProductDetailScreen.tsx
│   │   │   └── SellScreen.tsx
│   │   └── admin/
│   │       └── AdminDashboardScreen.tsx
│   ├── components/
│   │   ├── MoriCard.tsx
│   │   ├── GoldButton.tsx
│   │   ├── CompassLogo.tsx       # SVG inline
│   │   ├── FilterSelector.tsx
│   │   ├── ReactionBar.tsx
│   │   ├── StarRating.tsx
│   │   ├── ReviewCard.tsx
│   │   ├── HighlightRing.tsx
│   │   └── PaymentSheet.tsx
│   ├── services/
│   │   ├── api.ts                # Fetch wrapper
│   │   ├── auth.ts                # AsyncStorage JWT
│   │   ├── notifications.ts      # Push + socket
│   │   ├── media.ts               # Camera + upload
│   │   └── rtc.ts                 # WebRTC mesh
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── useLang.ts
│   ├── i18n/
│   │   ├── pt.ts
│   │   ├── en.ts
│   │   └── es.ts
│   └── theme/
│       ├── colors.ts
│       ├── typography.ts
│       └── spacing.ts
└── README.md
```

## Tema Mori Mobile

```ts
// theme/colors.ts
export const colors = {
  gold: "#c5a84a",
  goldDeep: "#9b8038",
  black: "#0f0f11",
  white: "#ffffff",
  ivory: "#faf8f3",
  paper: "#f8f6f0",
  text: "#1a1815",
  muted: "#8a826a",
  line: "#e8e2d4",
};
```

## Componentes Nativos Customizados

### MoriCard
Wrapper que aplica cantos arredondados de 28px, borda `#e8e2d4`, sombra ultra-soft e elevação ao toque.

### GoldButton
Botão com gradiente dourado, texto preto profundo, sombra interna branca e animação de escala ao toque.

### FilterSelector
Grid horizontal com thumbnails aplicando os 8 filtros Mori em tempo real via `gl-react-native` ou `expo-gl`.

### ReactionBar
Barra flutuante com 6 reações (❤️🔥😮😂😢👏) que aparece ao segurar o botão de like.

### VoiceMessageRecorder
Gravação com `expo-av`, waveform animada, envio como blob para API.

### HighlightRing
Anel com gradiente tricolor (dourado → preto → dourado) ao redor do avatar, com tappable area para abrir o viewer fullscreen.

## API Endpoints Utilizados

O app consome a **mesma API** do web (Next.js Route Handlers):

- `POST /api/auth/login` · `register` · `phone`
- `GET /api/auth/me`
- `GET|POST /api/posts`
- `POST /api/posts/:id/like`
- `GET|POST /api/posts/:id/comments`
- `GET|POST /api/moments`
- `POST /api/moments/:id/react`
- `GET|POST /api/conversations` · `.../messages`
- `GET|POST /api/lives` · `.../chat` · `/api/rtc/:roomId`
- `GET|POST /api/itineraries` · `.../collaborators`
- `GET|POST /api/guides`
- `GET|POST /api/inns` · `/api/inns/:id`
- `GET|POST /api/bookings`
- `GET|POST /api/marketplace/products` · `orders`
- `GET /api/wallet` · `POST /api/payments/checkout`
- `GET|POST /api/premium`
- `GET|POST /api/reviews`
- `GET|POST /api/promotions`
- `GET|POST /api/highlights`
- `GET|POST /api/pin`
- `GET|POST /api/scheduled-posts`
- `GET|POST /api/polls`
- `GET /api/ai/concierge`
- `GET /api/i18n/:lang`

## Comandos de Setup

```bash
# Criar projeto
npx create-expo-app mori-mobile --template blank-typescript
cd mori-mobile

# Instalar dependências
npx expo install expo-camera expo-av expo-notifications expo-image-picker
npx expo install expo-localization expo-haptics expo-secure-store
npm install @react-navigation/native @react-navigation/bottom-tabs \
            @react-navigation/native-stack react-native-screens \
            react-native-safe-area-context react-native-svg \
            @react-native-async-storage/async-storage

# Rodar
npx expo start

# Build para iOS/Android
eas build --platform ios
eas build --platform android
```

## Configuração de Notificações Push

```ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

// Registrar para push
const token = await Notifications.getExpoPushTokenAsync({
  projectId: "your-expo-project-id",
});
await api.post("/api/users/me/push-token", { token: token.data });
```

## Recursos Específicos do Mobile

| Recurso | Tecnologia |
|---------|------------|
| Câmera para momentos | `expo-camera` |
| Captura de fotos com filtro | Canvas via `react-native-view-shot` |
| Push notifications | `expo-notifications` + OneSignal |
| Mensagens de voz | `expo-av` + upload multipart |
| Live streaming | WebRTC mesh + signaling DB |
| Pagamentos | Stripe SDK / Mercado Pago SDK |
| Haptic feedback | `expo-haptics` |
| Localização | `expo-location` |
| Calendário de reservas | `react-native-calendars` |

## PWA Instalável (alternativa)

A web `/` é instalável como PWA:
- iOS: Safari → Compartilhar → Adicionar à Tela Inicial
- Android: Chrome → Menu → Instalar App
- O `manifest.json` já está configurado com ícones 192/512.

## Próximos Passos

1. Buildar APK de testes: `eas build --platform android --profile preview`
2. Publicar na Play Store e App Store
3. Adicionar deep linking (`mori://post/:id`)
4. Implementar offline-first com SQLite
