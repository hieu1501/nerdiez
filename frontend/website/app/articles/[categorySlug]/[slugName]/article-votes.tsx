"use client";

import { useEffect, useState } from "react";
import { fetchArticleDetail, type VoteStatsDTO, type VoteValue } from "@/lib/api";
import VoteControls from "@/app/components/vote-controls";
import { rememberVoteStats } from "@/app/components/vote-store";

export default function ArticleVotes({ publicUri, initialVoteStats, initialUserVote }: {
  publicUri: string; initialVoteStats: VoteStatsDTO; initialUserVote: VoteValue | null;
}) {
  const [state, setState] = useState({ voteStats: initialVoteStats, userVote: initialUserVote, loading: true, failed: false });
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let cancelled = false;
    fetchArticleDetail(publicUri).then((detail) => {
      if (cancelled) return;
      rememberVoteStats("articles", publicUri, detail.voteStats);
      setState({ voteStats: detail.voteStats, userVote: detail.userVote, loading: false, failed: false });
    }).catch(() => {
      if (!cancelled) setState((old) => ({ ...old, loading: false, failed: true }));
    });
    return () => { cancelled = true; };
  }, [publicUri, reload]);
  return <VoteControls key={`${publicUri}:${state.voteStats.version}:${state.userVote}`} resource="articles" publicUri={publicUri}
    initialVoteStats={state.voteStats} initialUserVote={state.userVote} loadingVote={state.loading} loadFailed={state.failed}
    onRetry={() => { setState((old) => ({ ...old, loading: true, failed: false })); setReload((old) => old + 1); }} />;
}
