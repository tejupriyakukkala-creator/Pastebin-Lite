import type { Request, Response, NextFunction } from "express";
import { getNow, getRealNow } from "../utils/clock.js";
import { isValidPasteId } from "../utils/id.js";
import {
  createPaste,
  fetchPasteWithAtomicView,
  getPasteMeta,
  deletePasteWithToken,
  PasteNotFoundError,
  ForbiddenTokenError,
} from "../services/paste.service.js";

function extractId(param: string | string[] | undefined): string | null {
  if (!param) return null;
  const id = Array.isArray(param) ? param[0] : param;
  return typeof id === "string" ? id : null;
}

export async function createPasteHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const reqNow = getNow(req);
    const realNow = getRealNow();

    const result = await createPaste(req.body, reqNow, realNow);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getPasteHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = extractId(req.params.id);

    if (!id || !isValidPasteId(id)) {
      throw new PasteNotFoundError();
    }

    const now = getNow(req);
    const result = await fetchPasteWithAtomicView(id, now);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getPasteMetaHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = extractId(req.params.id);

    if (!id || !isValidPasteId(id)) {
      throw new PasteNotFoundError();
    }

    const now = getNow(req);
    const result = await getPasteMeta(id, now);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function deletePasteHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = extractId(req.params.id);

    if (!id || !isValidPasteId(id)) {
      throw new PasteNotFoundError();
    }

    const authHeader = req.headers.authorization;
    let token = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    } else if (typeof req.headers["x-delete-token"] === "string") {
      token = req.headers["x-delete-token"].trim();
    }

    if (!token) {
      throw new ForbiddenTokenError("Missing delete token in Authorization header");
    }

    await deletePasteWithToken(id, token);
    res.status(200).json({ success: true, message: "Paste deleted successfully" });
  } catch (err) {
    next(err);
  }
}
