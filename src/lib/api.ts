import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: number) {
  return NextResponse.json(data, { status: init ?? 200 });
}

export function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function handleApi<T>(fn: () => Promise<T>) {
  try {
    return ok(await fn());
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "UNAUTHORIZED") return bad("Não autenticado", 401);
    if (msg === "FORBIDDEN") return bad("Acesso negado", 403);
    console.error("[api]", e);
    return bad(msg, 500);
  }
}
