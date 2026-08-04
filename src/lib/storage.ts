import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export type StorageProvider = "server" | "s3" | "r2" | "cloudinary";

export type StorageConfig = {
  provider: StorageProvider;
  s3?: {
    endpoint?: string;
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    publicUrl: string;
  };
  cloudinary?: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
};

export async function getStorageConfig(): Promise<StorageConfig> {
  const rows = await db.select().from(systemSettings);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const provider = (map.storage_provider as StorageProvider) || "server";
  return {
    provider,
    s3: provider === "s3" || provider === "r2"
      ? {
          endpoint: map.s3_endpoint,
          region: map.s3_region || "us-east-1",
          bucket: map.s3_bucket || "",
          accessKeyId: map.s3_access_key || "",
          secretAccessKey: map.s3_secret_key || "",
          publicUrl: map.s3_public_url || "",
        }
      : undefined,
    cloudinary: provider === "cloudinary"
      ? {
          cloudName: map.cloudinary_cloud_name || "",
          apiKey: map.cloudinary_api_key || "",
          apiSecret: map.cloudinary_api_secret || "",
        }
      : undefined,
  };
}

export async function uploadDataUrl(dataUrl: string, filename: string): Promise<string> {
  const config = await getStorageConfig();

  if (config.provider === "server") {
    // Local: data URL kept as-is (sandbox/demo behavior)
    return dataUrl;
  }

  if (config.provider === "s3" || config.provider === "r2") {
    if (!config.s3?.bucket || !config.s3.accessKeyId) {
      throw new Error("Configuração S3/R2 incompleta");
    }
    return uploadToS3(dataUrl, filename, config.s3);
  }

  if (config.provider === "cloudinary") {
    if (!config.cloudinary?.cloudName) {
      throw new Error("Configuração Cloudinary incompleta");
    }
    return uploadToCloudinary(dataUrl, config.cloudinary);
  }

  return dataUrl;
}

async function uploadToS3(
  dataUrl: string,
  filename: string,
  cfg: NonNullable<StorageConfig["s3"]>,
): Promise<string> {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("dataUrl inválido");
  const mime = match[1];
  const buffer = Buffer.from(match[2], "base64");
  const key = `mori/${new Date().getFullYear()}/${Date.now()}-${filename}`;

  // Use AWS S3 PutObject via signed request (no SDK required, works with R2 and S3)
  const endpoint = cfg.endpoint || `https://s3.${cfg.region}.amazonaws.com`;
  const url = `${endpoint}/${cfg.bucket}/${key}`;
  const date = new Date().toUTCString();
  const contentType = mime;
  const host = new URL(endpoint).host;

  // Build canonical request for AWS Signature V4
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${new Date().toISOString().slice(0, 10)}/${cfg.region}/s3/aws4_request`;
  const payloadHash = await sha256Hex(buffer);
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${toAmzDate(new Date())}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = ["PUT", `/${cfg.bucket}/${key}`, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");

  const stringToSign = [algorithm, toAmzDate(new Date()), credentialScope, await sha256Hex(canonicalRequest)].join("\n");
  const signingKey = await getSignatureKey(cfg.secretAccessKey, new Date().toISOString().slice(0, 10), cfg.region, "s3");
  const signature = await hmacSha256Hex(signingKey, stringToSign);
  const authHeader = `${algorithm} Credential=${cfg.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      Host: host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": toAmzDate(new Date()),
      Authorization: authHeader,
    },
    body: buffer,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`S3 upload failed: ${err}`);
  }
  return cfg.publicUrl
    ? `${cfg.publicUrl.replace(/\/$/, "")}/${key}`
    : `${endpoint}/${cfg.bucket}/${key}`;
}

async function uploadToCloudinary(
  dataUrl: string,
  cfg: NonNullable<StorageConfig["cloudinary"]>,
): Promise<string> {
  const form = new FormData();
  form.append("file", dataUrl);
  form.append("api_key", cfg.apiKey);
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = await cloudinarySign(cfg.apiSecret, { timestamp });
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary upload failed: ${err}`);
  }
  const data = await res.json();
  return data.secure_url as string;
}

async function cloudinarySign(secret: string, params: Record<string, number>): Promise<string> {
  const str = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return await hmacSha1Hex(secret + str);
}

// --- Crypto helpers (Web Crypto) ---
async function sha256Hex(data: string | Buffer): Promise<string> {
  const buf = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256Hex(key: ArrayBuffer | string, data: string): Promise<string> {
  const k = typeof key === "string" ? new TextEncoder().encode(key) : new Uint8Array(key);
  const cryptoKey = await crypto.subtle.importKey(
    "raw", k, { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha1Hex(message: string): Promise<string> {
  const k = new TextEncoder().encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    "raw", k, { name: "HMAC", hash: "SHA-1" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, new Uint8Array(0));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getSignatureKey(
  key: string, dateStamp: string, region: string, service: string,
): Promise<ArrayBuffer> {
  const kDate = await hmacSha256Raw("AWS4" + key, dateStamp);
  const kRegion = await hmacSha256Raw(kDate, region);
  const kService = await hmacSha256Raw(kRegion, service);
  return await hmacSha256Raw(kService, "aws4_request");
}

async function hmacSha256Raw(key: ArrayBuffer | string, data: string): Promise<ArrayBuffer> {
  const k = typeof key === "string" ? new TextEncoder().encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey(
    "raw", k, { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  return await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
}

function toAmzDate(d: Date): string {
  return d.toISOString().replace(/[:\-]|\.\d{3}/g, "");
}
