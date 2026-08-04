import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";

// Since we don't have file storage, accept dataURLs and just return them.
// This keeps images inline in DB. Limit size ~2MB after base64.
export async function POST(req: Request) {
  return handleApi(async () => {
    await requireUser();
    const { dataUrl } = await req.json();
    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
      throw new Error("dataUrl inválido");
    }
    if (dataUrl.length > 2_800_000) {
      throw new Error("Imagem muito grande (máx ~2MB)");
    }
    return { url: dataUrl };
  });
}
