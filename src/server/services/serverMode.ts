import { env } from "~/env";

export function isLocalMode(): boolean {
  return env.SERVER_MODE === "local";
}

export function isGlobalMode(): boolean {
  return env.SERVER_MODE === "global";
}

export function getLocalServerId(): string | null {
  return isLocalMode() ? (env.LOCAL_SERVER_ID ?? null) : null;
}
