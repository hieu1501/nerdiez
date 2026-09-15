"use client";

import { useCallback, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useAuth } from "@/app/auth-provider";
import {
  ApiError,
  setResourceVote,
  type VoteStatsDTO,
  type VotableResource,
  type VoteValue,
} from "@/lib/api";

interface VoteButtonProps {
  direction: "up" | "down";
  count: number;
  active: boolean;
  disabled: boolean;
  onVote: () => void;
  label: string;
}

// Firefox otherwise restores a button's dynamic disabled state before React hydrates it.
const disableButtonStateRestoration = { autoComplete: "off" } as const;

function VoteButton({ direction, count, active, disabled, onVote, label }: VoteButtonProps) {
  const Icon = direction === "up" ? ThumbsUp : ThumbsDown;
  const activeClass =
    direction === "up"
      ? "border-upvote bg-upvote text-paper hover:bg-upvote/90"
      : "border-downvote bg-downvote text-paper hover:bg-downvote/90";

  return (
    <button
      {...disableButtonStateRestoration}
      type="button"
      aria-label={`${direction === "up" ? "Like" : "Dislike"} ${label}`}
      aria-pressed={active}
      disabled={disabled}
      onClick={onVote}
      className={`inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        active ? activeClass : "border-line text-muted hover:text-ink"
      }`}
    >
      <Icon className="h-4 w-4" />
      {count}
    </button>
  );
}

interface VoteControlsProps {
  resource: VotableResource;
  publicUri: string;
  initialVoteStats: VoteStatsDTO;
  initialUserVote: VoteValue | null;
  loadingVote?: boolean;
  loadFailed?: boolean;
  onRetry?: () => void;
}

export default function VoteControls({
  resource, publicUri, initialVoteStats, initialUserVote,
  loadingVote = false, loadFailed = false, onRetry,
}: VoteControlsProps) {
  const [voteStats, setVoteStats] = useState(initialVoteStats);
  const [userVote, setUserVote] = useState<VoteValue | null>(initialUserVote);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { requestSignIn } = useAuth();
  const label = resource === "articles" ? "article" : "reply";

  const vote = useCallback(
    async (selectedVote: Exclude<VoteValue, 0>) => {
      if (loadingVote || loadFailed || submitting) return;
      const nextVote: VoteValue = userVote === selectedVote ? 0 : selectedVote;
      setSubmitting(true);
      setMessage(null);

      try {
        const result = await setResourceVote(resource, publicUri, nextVote);
        setVoteStats(result.votes);
        setUserVote(result.userVote);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          requestSignIn(`Sign in to like or dislike this ${label}.`);
        } else if (error instanceof ApiError && error.status === 403) {
          setMessage("You don’t have permission to vote on this content.");
        } else {
          setMessage("Your reaction could not be saved. Please try again.");
        }
      } finally {
        setSubmitting(false);
      }
    },
    [resource, publicUri, userVote, loadingVote, loadFailed, submitting, requestSignIn, label]
  );

  const disabled = loadingVote || loadFailed || submitting;
  const voteStatus =
    userVote === 1
      ? `You liked this ${label}.`
      : userVote === -1
        ? `You disliked this ${label}.`
        : "No reaction selected.";

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2" aria-busy={loadingVote || submitting}>
        <VoteButton
          label={label}
          direction="up"
          count={voteStats.upvoteCount}
          active={userVote === 1}
          disabled={disabled}
          onVote={() => vote(1)}
        />
        <VoteButton
          label={label}
          direction="down"
          count={voteStats.downvoteCount}
          active={userVote === -1}
          disabled={disabled}
          onVote={() => vote(-1)}
        />
      </div>
      <div className="min-h-5 text-right text-xs text-muted" aria-live="polite">
        {loadingVote && <span>Loading your reaction…</span>}
        {loadFailed && (
          <span>
            Could not load your reaction.{" "}
            <button
              type="button"
              className="underline underline-offset-2 hover:text-ink"
              onClick={onRetry}
            >
              Try again
            </button>
          </span>
        )}
        {!loadingVote && !loadFailed && <span>{message ?? voteStatus}</span>}
      </div>
    </div>
  );
}
