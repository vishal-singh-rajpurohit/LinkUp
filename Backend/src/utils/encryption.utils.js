import crypto from "crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12; // recommended for GCM

function loadKeyFromEnv() {
  const raw = process.env.CHAT_SECRET_KEY; // <-- set this in backend .env
  if (!raw) throw new Error("Missing API_CHAT_SECRET_KEY in env");

  // 64 hex chars => 32 bytes
  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, "hex");

  // base64 => must decode to 32 bytes
  const b = Buffer.from(raw, "base64");
  if (b.length === 32) return b;

  throw new Error("API_CHAT_SECRET_KEY must be 32 bytes (64 hex chars OR base64 of 32 bytes).");
}

const KEY = loadKeyFromEnv();

/**
 * Encrypt plaintext -> returns "iv:tag:cipher" (all base64)
 * Store returned string in DB message field (no schema change).
 */

function encryptMessage(plainText) {
  if (typeof plainText !== "string") throw new Error("encryptMsg expects a string");

  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return `${iv.toString("base64")}:${tag.toString("base64")}:${ciphertext.toString("base64")}`;
}


// function encryptMessage(message){
//     if(typeof message !== "string") throw new Error("message is not type of String");
//     const key = process.env.CHAT_SECRET_KEY;
//     return crypto.AES.encrypt(message,key)
// }


export { encryptMessage };