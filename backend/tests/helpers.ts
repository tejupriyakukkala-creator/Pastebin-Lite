import { createApp } from "../src/app.js";
import type { Application } from "express";

let testApp: Application | null = null;

export function getTestApp(): Application {
  if (!testApp) {
    testApp = createApp();
  }
  return testApp;
}
