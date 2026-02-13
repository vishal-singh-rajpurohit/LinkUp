const SECRET = import.meta.env.VITE_API_CHAT_SECRET_KEY;

function b64ToU8(b64: string): Uint8Array {
  b64 = b64.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";

  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function hexToU8(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function concatU8(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}


function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  return new Uint8Array(u8).buffer;
}

export async function getAesKey(): Promise<CryptoKey> {
  if (!SECRET) throw new Error("Missing VITE_API_CHAT_SECRET_KEY");

  const isHex = /^[0-9a-fA-F]{64}$/.test(SECRET);
  const keyBytes = isHex ? hexToU8(SECRET) : b64ToU8(SECRET);

  if (keyBytes.length !== 32) {
    throw new Error("VITE_API_CHAT_SECRET_KEY must be 32 bytes (64 hex OR base64 of 32 bytes).");
  }

  const keyData = toArrayBuffer(keyBytes);

  return await globalThis.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
}

export default async function decryptMsg(payload: string): Promise<string> {
  const parts = payload.split(":");
  if (parts.length !== 3) throw new Error("Invalid payload format (expected iv:tag:cipher)");

  const [ivB64, tagB64, cipherB64] = parts;

  const iv = b64ToU8(ivB64);
  const tag = b64ToU8(tagB64);
  const cipher = b64ToU8(cipherB64);

  const cipherPlusTag = concatU8(cipher, tag);

  console.log("decryptMsg called with payload:");
  const key = await getAesKey();
  const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv: toArrayBuffer(iv) }, key, toArrayBuffer(cipherPlusTag));

  console.log("Decryption successful, plaintext bytes:", new Uint8Array(plainBuf));
  return new TextDecoder().decode(new Uint8Array(plainBuf));
}
