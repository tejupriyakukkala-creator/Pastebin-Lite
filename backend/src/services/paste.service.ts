import { Paste } from "../models/paste.model.js";
import { generatePasteId, generateDeleteToken, hashDeleteToken, verifyDeleteToken } from "../utils/id.js";
import { getEnv } from "../config/env.js";

export class PasteNotFoundError extends Error {
  public readonly code = "PASTE_NOT_FOUND";
  constructor(message = "Paste not found") {
    super(message);
    this.name = "PasteNotFoundError";
  }
}

export class PasteExpiredError extends Error {
  public readonly code = "PASTE_EXPIRED";
  constructor(message = "Paste has expired") {
    super(message);
    this.name = "PasteExpiredError";
  }
}

export class PasteViewLimitError extends Error {
  public readonly code = "PASTE_VIEW_LIMIT_REACHED";
  constructor(message = "Paste has reached its view limit") {
    super(message);
    this.name = "PasteViewLimitError";
  }
}

export class ForbiddenTokenError extends Error {
  public readonly code = "FORBIDDEN";
  constructor(message = "Invalid or missing delete token") {
    super(message);
    this.name = "ForbiddenTokenError";
  }
}

export interface CreatePasteInput {
  content: string;
  ttl_seconds?: number | null;
  max_views?: number | null;
}

export interface CreatePasteResult {
  id: string;
  url: string;
  expires_at: string | null;
  max_views: number | null;
  delete_token: string;
}

export interface FetchPasteResult {
  content: string;
  remaining_views: number | null;
  expires_at: string | null;
}

export interface PasteMetaResult {
  id: string;
  status: "available";
  remaining_views: number | null;
  expires_at: string | null;
}

export async function createPaste(
  input: CreatePasteInput,
  reqNow: Date,
  realNow: Date
): Promise<CreatePasteResult> {
  const { BASE_URL, PURGE_GRACE_SECONDS } = getEnv();

  const ttlSeconds = input.ttl_seconds && input.ttl_seconds >= 1 ? input.ttl_seconds : null;
  const maxViews = input.max_views && input.max_views >= 1 ? input.max_views : null;

  const expiresAt = ttlSeconds ? new Date(reqNow.getTime() + ttlSeconds * 1000) : null;
  const purgeAt = ttlSeconds
    ? new Date(realNow.getTime() + (ttlSeconds + PURGE_GRACE_SECONDS) * 1000)
    : null;

  const deleteToken = generateDeleteToken();
  const deleteTokenHash = hashDeleteToken(deleteToken);

  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    attempts++;
    const pasteId = generatePasteId();

    try {
      await Paste.create({
        pasteId,
        content: input.content,
        createdAt: reqNow,
        expiresAt,
        maxViews,
        views: 0,
        purgeAt,
        deleteTokenHash,
      });

      return {
        id: pasteId,
        url: `${BASE_URL}/p/${pasteId}`,
        expires_at: expiresAt ? expiresAt.toISOString() : null,
        max_views: maxViews,
        delete_token: deleteToken,
      };
    } catch (err: any) {
      if (err.code === 11000 && attempts < maxAttempts) {
        continue;
      }
      throw err;
    }
  }

  throw new Error("Failed to generate unique paste ID after multiple attempts");
}

export async function fetchPasteWithAtomicView(
  pasteId: string,
  now: Date
): Promise<FetchPasteResult> {
  const filter = {
    pasteId,
    $and: [
      { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
      { $or: [{ maxViews: null }, { $expr: { $lt: ["$views", "$maxViews"] } }] },
    ],
  };

  const doc = await Paste.findOneAndUpdate(
    filter,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (doc) {
    const remainingViews =
      doc.maxViews === null ? null : Math.max(0, doc.maxViews - doc.views);

    return {
      content: doc.content,
      remaining_views: remainingViews,
      expires_at: doc.expiresAt ? doc.expiresAt.toISOString() : null,
    };
  }

  // Not returned: diagnose reason with a separate read
  const existing = await Paste.findOne({ pasteId });
  if (!existing) {
    throw new PasteNotFoundError();
  }

  if (existing.expiresAt && existing.expiresAt <= now) {
    throw new PasteExpiredError();
  }

  if (existing.maxViews !== null && existing.views >= existing.maxViews) {
    throw new PasteViewLimitError();
  }

  throw new PasteNotFoundError();
}

export async function getPasteMeta(
  pasteId: string,
  now: Date
): Promise<PasteMetaResult> {
  const doc = await Paste.findOne({ pasteId });

  if (!doc) {
    throw new PasteNotFoundError();
  }

  if (doc.expiresAt && doc.expiresAt <= now) {
    throw new PasteExpiredError();
  }

  if (doc.maxViews !== null && doc.views >= doc.maxViews) {
    throw new PasteViewLimitError();
  }

  const remainingViews =
    doc.maxViews === null ? null : Math.max(0, doc.maxViews - doc.views);

  return {
    id: doc.pasteId,
    status: "available",
    remaining_views: remainingViews,
    expires_at: doc.expiresAt ? doc.expiresAt.toISOString() : null,
  };
}

export async function deletePasteWithToken(
  pasteId: string,
  token: string
): Promise<void> {
  const doc = await Paste.findOne({ pasteId }).select("+deleteTokenHash");

  if (!doc) {
    throw new PasteNotFoundError();
  }

  const valid = verifyDeleteToken(token, doc.deleteTokenHash);
  if (!valid) {
    throw new ForbiddenTokenError();
  }

  await Paste.deleteOne({ _id: doc._id });
}
