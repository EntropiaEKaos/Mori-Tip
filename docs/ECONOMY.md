# Mori — Economia (Moris & Créditos)

## Duas moedas

| Moeda | Símbolo mental | Obtida como | Gasta em |
|-------|----------------|-------------|----------|
| **Moris** | Moeda social/travel | Welcome, badges, levels, vendas | Premium, ads credits, marketplace, abatimento de reserva |
| **Créditos** | Moeda de mídia | Compra com Moris | Promoções no feed |

## Fluxos

```
Atividade social ──XP──► Nível ──bônus──► Moris
                └──badges──► Moris + XP

Moris ──compra──► Créditos ──campanha──► Post promovido
Moris ──assinatura──► Premium ──unlock──► Reservas
Moris ──marketplace──► Seller (95%) + Platform (5%)
Moris ──parcial──► Reserva em pousada
```

## Tabelas de preço (demo)

### Premium
- **500 Moris / 30 dias**
- Bônus imediato: **+200 Moris**
- Efeitos: `users.isPremium`, `inns.acceptsBookings` para pousadas do host

### Pacotes de créditos
| Pacote | Créditos | Bônus | Preço Moris |
|--------|----------|-------|-------------|
| Starter | 50 | 0 | 100 |
| Boost | 150 | 20 | 250 |
| Pro | 400 | 80 | 600 |
| Agency | 1000 | 300 | 1200 |

### Ads
- **10 créditos por dia** de campanha
- Cria registro em `promotions` + post `type=promo` com `isSponsored=true`

### Marketplace
- Preço livre em Moris definido pelo seller
- Fee plataforma: **5%**
- Status inicial do pedido: `paid` (escrow simplificado)

### Reservas
- Total em R$ = `pricePerNight * nights` (campo inteiro)
- `useMoris` abate do total (limitado ao saldo)
- Só usuários Premium criam booking; host confirma/cancela

## XP de referência
| Ação | XP |
|------|----|
| Post | 20 |
| Momento | 15 |
| Roteiro | 40 |
| Guia (criar perfil) | 50 |
| Reserva | 60 |
| Compra market | 25 |
| Venda market | 40 |
| Assinar Premium | 100 |

Level-up: bônus `nível * 25` Moris.

## Implementação
- Ledger: tabela `transactions` (amountMoris / amountCredits podem ser negativos)
- Funções: `awardMoris`, `spendMoris`, `spendCredits`, `awardXp` em `src/lib/gamification.ts`
- Saldos denormalizados em `users.moris` e `users.credits` para leitura rápida

## Produção
Para dinheiro real:
1. Stripe/Pix credita Moris após pagamento webhook
2. Saque de sellers (KYC + fila)
3. Congelar Moris em escrow até `orders.status=delivered`
4. Anti-fraude em loops de self-trading
