import pino from "pino";

const isTest = process.env.NODE_ENV === "test";
const logLevel = process.env.LOG_LEVEL || (isTest ? "silent" : "info");

export const logger = pino({
  level: logLevel,
  redact: ["req.body.content", "content", "delete_token", "deleteTokenHash"],
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
