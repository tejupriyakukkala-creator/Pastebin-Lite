import { Router } from "express";
import { pingDatabase } from "../services/db.service.js";

const router = Router();

async function handleHealthCheck(_req: any, res: any) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  const ping = await pingDatabase();
  if (ping.ok) {
    res.status(200).json({
      ok: true,
      details: {
        uptime_seconds: Math.floor(process.uptime()),
        latency_ms: ping.latencyMs,
      },
    });
  } else {
    res.status(503).json({
      ok: false,
    });
  }
}

router.get("/healthz", handleHealthCheck);
router.get("/health", handleHealthCheck);

export default router;
