import { Router } from "express";
import {
  createPasteHandler,
  getPasteHandler,
  getPasteMetaHandler,
  deletePasteHandler,
} from "../controllers/paste.controller.js";
import { validateCreatePaste } from "../middleware/validate.middleware.js";
import {
  readLimiterMiddleware,
  createLimiterMiddleware,
} from "../middleware/rateLimit.middleware.js";

const router = Router();

// Paste creation
router.post("/pastes", createLimiterMiddleware, validateCreatePaste, createPasteHandler);

// Paste retrieval (atomic view counting)
router.get("/pastes/:id", readLimiterMiddleware, getPasteHandler);

// Additive: Paste non-consuming metadata
router.get("/pastes/:id/meta", readLimiterMiddleware, getPasteMetaHandler);

// Additive: Delete paste with authorization token
router.delete("/pastes/:id", deletePasteHandler);

export default router;
