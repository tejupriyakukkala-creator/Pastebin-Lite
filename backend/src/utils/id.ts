import crypto from "node:crypto";

export function generatePasteId(): string {
  // 9 bytes produces a 12-character base64url string
  return crypto.randomBytes(9).toString("base64url");
}

export function generateDeleteToken(): string {
  // 18 bytes produces a 24-character base64url string
  return crypto.randomBytes(18).toString("base64url");
}

export function hashDeleteToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function verifyDeleteToken(providedToken: string, storedHash: string): boolean {
  try {
    const providedHash = hashDeleteToken(providedToken);
    const bufProvided = Buffer.from(providedHash, "hex");
    const bufStored = Buffer.from(storedHash, "hex");
    if (bufProvided.length !== bufStored.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufProvided, bufStored);
  } catch {
    return false;
  }
}

const PASTE_ID_REGEX = /^[A-Za-z0-9_-]{8,64}$/;

export function isValidPasteId(id: string): boolean {
  return PASTE_ID_REGEX.test(id);
}
