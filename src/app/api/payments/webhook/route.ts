// IMPORTANTE: não processar notificações de pagamento antes de implementar
// verificação server-side no Mercado Pago, associação exata ao pedido
// e crédito idempotente numa transação de banco.
export async function POST() {
  return Response.json({ error: "Processamento de pagamentos indisponível." }, { status: 503 });
}
