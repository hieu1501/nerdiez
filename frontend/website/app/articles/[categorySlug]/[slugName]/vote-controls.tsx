"use client";

import { useCallback, useEffect, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import SignInDialog from "@/app/sign-in-dialog";
import {
  ApiError,
  fetchArticleDetail,
  setArticleVote,
  type PostVoteStatsDTO,
  type VoteValue,
} from "@/lib/api";

interface VoteButtonProps {
  direction: "up" | "down";
  count: number;
  active: boolean;
  disabled: boolean;
  onVote: () => void;
}

// Firefox otherwise restores a button's dynamic disabled state before React hydrates it.
const disableButtonStateRestoration = { autoComplete: "off" } as const;

function VoteButton({ direction, count, active, disabled, onVote }: VoteButtonProps) {
  const Icon = direction === "up" ? ThumbsUp : ThumbsDown;
  const activeClass =
    direction === "up"
      ? "border-upvote bg-upvote text-paper hover:bg-upvote/90"
      : "border-downvote bg-downvote text-paper hover:bg-downvote/90";

  return (
    <button
      {...disableButtonStateRestoration}
      type="button"
      aria-label={direction === "up" ? "Like article" : "Dislike article"}
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
  categorySlug: string;
  slugName: string;
  initialVoteStats: PostVoteStatsDTO;
  initialUserVote: VoteValue | null;
}

export default function VoteControls({
  categorySlug,
  slugName,
  initialVoteStats,
  initialUserVote,
}: VoteControlsProps) {
  const [voteStats, setVoteStats] = useState(initialVoteStats);
  const [userVote, setUserVote] = useState<VoteValue | null>(initialUserVote);
  const [loadingVote, setLoadingVote] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchArticleDetail(categorySlug, slugName)
      .then((detail) => {
        if (cancelled) return;
        setVoteStats(detail.voteStats);
        setUserVote(detail.userVote);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoadingVote(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categorySlug, slugName, initialVoteStats, reloadKey]);

  const retryLoad = useCallback(() => {
    setLoadingVote(true);
    setLoadFailed(false);
    setMessage(null);
    setReloadKey((key) => key + 1);
  }, []);

  const vote = useCallback(
    async (selectedVote: Exclude<VoteValue, 0>) => {
      if (loadingVote || loadFailed || submitting) return;
      const nextVote: VoteValue = userVote === selectedVote ? 0 : selectedVote;
      setSubmitting(true);
      setMessage(null);

      try {
        const result = await setArticleVote(categorySlug, slugName, nextVote);
        setVoteStats(result.votes);
        setUserVote(result.userVote);
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          setSignInOpen(true);
        } else {
          setMessage("Your reaction could not be saved. Please try again.");
        }
      } finally {
        setSubmitting(false);
      }
    },
    [categorySlug, slugName, userVote, loadingVote, loadFailed, submitting]
  );

  const disabled = loadingVote || loadFailed || submitting;
  const voteStatus =
    userVote === 1
      ? "You liked this article."
      : userVote === -1
        ? "You disliked this article."
        : "No reaction selected.";

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2" aria-busy={loadingVote || submitting}>
        <VoteButton
          direction="up"
          count={voteStats.upvoteCount}
          active={userVote === 1}
          disabled={disabled}
          onVote={() => vote(1)}
        />
        <VoteButton
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
              onClick={retryLoad}
            >
              Try again
            </button>
          </span>
        )}
        {!loadingVote && !loadFailed && <span>{message ?? voteStatus}</span>}
      </div>
      <SignInDialog
        id="reaction-sign-in-dialog"
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        description="Sign in to like or dislike this article."
      />
    </div>
  );
}
