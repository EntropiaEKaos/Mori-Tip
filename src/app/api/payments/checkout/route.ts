// Compras com dinheiro real ficam bloqueadas no lançamento web até
// validação de preço no servidor e confirmação segura dos pagamentos.
export async function POST() {
  return Response.json(
    { error: "Compra de Moris temporariamente indisponível." },
    { status: 503 },
  );
}
