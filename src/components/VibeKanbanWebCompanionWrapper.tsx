"use client";

import { VibeKanbanWebCompanion } from "vibe-kanban-web-companion";

export function VibeKanbanWebCompanionWrapper() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return <VibeKanbanWebCompanion />;
}
