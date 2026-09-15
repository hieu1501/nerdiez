"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchTalkSlice, type VoteStatsDTO, type VoteValue } from "@/lib/api";
import { PAGE_SIZE, publicIdentifier } from "@/lib/resource-links";
import VoteControls from "@/app/components/vote-controls";

export interface TalkVoteState {
  publicUri: string;
  voteStats: VoteStatsDTO;
  userVote: VoteValue | null;
}

const TalkVotesContext = createContext<{
  votes: TalkVoteState[]; loading: boolean; failed: boolean; retry: () => void;
} | null>(null);

export function TalkVotesProvider({ topicPublicUri, page, initialVotes, children }: {
  topicPublicUri: string; page: number; initialVotes: TalkVoteState[]; children: ReactNode;
}) {
  const [state, setState] = useState({ votes: initialVotes, loading: true, failed: false });
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (initialVotes.length === 0) return;
    let cancelled = false;
    fetchTalkSlice(topicPublicUri, page - 1, PAGE_SIZE).then((slice) => {
      if (!cancelled) setState({ votes: slice.items.map((talk) => ({ publicUri: publicIdentifier(talk.content.canonicalUri, "talks"), voteStats: talk.voteStats, userVote: talk.userVote })), loading: false, failed: false });
    }).catch(() => {
      if (!cancelled) setState((old) => ({ ...old, loading: false, failed: true }));
    });
    return () => { cancelled = true; };
  }, [topicPublicUri, page, initialVotes.length, reload]);
  return <TalkVotesContext.Provider value={{ ...state, retry: () => {
    setState((old) => ({ ...old, loading: true, failed: false }));
    setReload((old) => old + 1);
  } }}>{children}</TalkVotesContext.Provider>;
}

export function TalkVotes({ initialVote }: { initialVote: TalkVoteState }) {
  const state = useContext(TalkVotesContext);
  if (!state) throw new Error("TalkVotes must be inside TalkVotesProvider");
  const current = state.votes.find((vote) => vote.publicUri === initialVote.publicUri);
  const vote = current ?? initialVote;
  return <VoteControls key={`${vote.publicUri}:${vote.voteStats.version}:${vote.userVote}`} resource="talks" publicUri={vote.publicUri}
    initialVoteStats={vote.voteStats} initialUserVote={vote.userVote} loadingVote={state.loading} loadFailed={state.failed || !current} onRetry={state.retry} />;
}
