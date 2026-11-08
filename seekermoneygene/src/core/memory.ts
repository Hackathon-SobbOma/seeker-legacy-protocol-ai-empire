import { randomUUID } from "node:crypto";
import type { MemoryRecord } from "../types.js";

export class OmegaMemory {
  private store = new Map<string, MemoryRecord>();

  write(kind: string, payload: Record<string, unknown>, tags: string[] = []): MemoryRecord {
    const now = new Date().toISOString();
    const record: MemoryRecord = { id: randomUUID(), kind, payload, createdAt: now, updatedAt: now, tags };
    this.store.set(record.id, record);
    return record;
  }

  get(id: string): MemoryRecord | undefined {
    return this.store.get(id);
  }

  list(kind?: string): MemoryRecord[] {
    const all = [...this.store.values()];
    return kind ? all.filter((r) => r.kind === kind) : all;
  }

  update(id: string, payload: Record<string, unknown>): MemoryRecord | undefined {
    const existing = this.store.get(id);
    if (!existing) return undefined;
    const next: MemoryRecord = {
      ...existing,
      payload: { ...existing.payload, ...payload },
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, next);
    return next;
  }

  size(): number {
    return this.store.size;
  }
}
