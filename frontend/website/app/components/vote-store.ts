"use client";

import { useSyncExternalStore } from "react";
import type { VotableResource, VoteStatsDTO } from "@/lib/api";

// Latest vote counts seen in this tab, so lists reflect votes cast elsewhere (e.g. in the
// article modal) without refetching. A reload starts empty and uses fresh server data.
const latest = new Map<string, VoteStatsDTO>();
const listeners = new Set<() => void>();
const keyOf = (resource: VotableResource, publicUri: string) => `${resource}:${publicUri}`;

export function rememberVoteStats(resource: VotableResource, publicUri: string, stats: VoteStatsDTO) {
  const key = keyOf(resource, publicUri);
  const current = latest.get(key);
  // The backend bumps `version` on every vote, so an older response never overwrites a newer one.
  if (current && current.version >= stats.version) return;
  latest.set(key, stats);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function useVoteStats(resource: VotableResource, publicUri: string, fallback: VoteStatsDTO): VoteStatsDTO {
  const remembered = useSyncExternalStore(subscribe, () => latest.get(keyOf(resource, publicUri)), () => undefined);
  return remembered && remembered.version > fallback.version ? remembered : fallback;
}
