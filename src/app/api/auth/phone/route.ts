// Login por telefone indisponível até a verificação server-side do Firebase ID Token.
// O fluxo anterior aceitava isMock e números arbitrários, permitindo tomar contas por telefone.
export async function POST() {
  return Response.json(
    { error: "Login por telefone temporariamente indisponível. Entre com usuário e senha." },
    { status: 503 },
  );
}
