# MORI 3.0 — Mobile Foundation

## Entregue neste incremento
- Autenticação nativa usando Authorization: Bearer, sem injetar cabeçalho Cookie no React Native.
- Token salvo via expo-secure-store no Android/iOS.
- Login web mantém cookie httpOnly.
- API base configurada por EXPO_PUBLIC_API_URL e exigência de HTTPS no app nativo.
- Removido o login SMS simulado do fluxo mobile até haver validação real do OTP.
- Perfis EAS de APK interno Android e bundles de produção.

## Configuração manual necessária
1. Copie `mobile/.env.example` para `mobile/.env` e configure o domínio real HTTPS da API.
2. Configure `JWT_SECRET` forte no backend e bloqueie `/api/seed` antes de produção.
3. Configure o projeto Expo com `eas init` e substitua `your-expo-project-id-here` em `mobile/app.json`.
4. Prepare imagens PNG reais para os caminhos de ícone, splash e ícone adaptativo configurados em `app.json`.
5. Atualize o Expo SDK 51 e suas dependências com a matriz de compatibilidade oficial antes do build.
6. Instale as dependências, rode typecheck e faça testes em dispositivo; esta entrega ainda **não** foi certificada.
7. Para APK interno, execute `cd mobile && eas build --platform android --profile preview`.

## Pendências bloqueantes
- Auditoria de segurança do backend, webhook de pagamentos e rota seed.
- Revisar fluxo de logout, renovação/expiração de sessão e autenticação por telefone com Firebase real.
- Testes automatizados, build Android e iOS e publicações nas lojas.
- Revisão de regras de compras digitais conforme as políticas de cada loja.
