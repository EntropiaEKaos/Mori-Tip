import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { uploadDataUrl } from "@/lib/storage";

export async function POST(req: Request) {
  return handleApi(async () => {
    await requireUser();
    const { dataUrl, filename } = await req.json();
    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
      throw new Error("dataUrl inválido");
    }
    if (dataUrl.length > 5_500_000) {
      throw new Error("Imagem muito grande (máx ~4MB)");
    }
    const ext = dataUrl.startsWith("data:image/png") ? "png"
      : dataUrl.startsWith("data:image/gif") ? "gif"
      : dataUrl.startsWith("data:video/") ? "mp4"
      : "jpg";
    const url = await uploadDataUrl(dataUrl, filename || `upload-${Date.now()}.${ext}`);
    return { url };
  });
}
