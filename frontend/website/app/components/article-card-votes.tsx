"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import type { VoteStatsDTO } from "@/lib/api";
import { useVoteStats } from "./vote-store";

export default function ArticleCardVotes({ publicUri, voteStats }: { publicUri: string; voteStats: VoteStatsDTO }) {
  const stats = useVoteStats("articles", publicUri, voteStats);
  return <>
    <span className="inline-flex items-center gap-1.5"><ThumbsUp className="h-3.5 w-3.5 text-upvote" aria-hidden="true" />{stats.upvoteCount}<span className="sr-only"> likes</span></span>
    <span className="inline-flex items-center gap-1.5"><ThumbsDown className="h-3.5 w-3.5 text-downvote" aria-hidden="true" />{stats.downvoteCount}<span className="sr-only"> dislikes</span></span>
  </>;
}
