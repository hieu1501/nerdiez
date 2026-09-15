"use client";

import { useEffect, useId, useRef } from "react";
import { GitFork, X } from "lucide-react";

interface SignInDialogProps {
  id: string;
  open: boolean;
  onClose: () => void;
  description?: string;
  onContinue?: () => void;
}

export default function SignInDialog({
  id,
  open,
  onClose,
  description = "Choose a sign-in provider.",
  onContinue,
}: SignInDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      id={id}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[min(90vw,23rem)] overflow-y-auto rounded-lg border border-line/80 bg-paper p-0 text-ink shadow-[0_24px_80px_-24px_rgba(0,0,0,0.45)] backdrop:bg-ink/55 backdrop:backdrop-blur-sm"
    >
      <div className="relative isolate overflow-hidden p-5">
        <div
          className="pointer-events-none absolute -right-16 -top-20 -z-10 h-52 w-52 rounded-full bg-accent-soft blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-20 -z-10 h-48 w-48 rounded-full bg-soft opacity-80 blur-3xl"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sign-in dialog"
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-paper/70 text-muted shadow-sm transition-colors hover:border-line hover:bg-soft hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
        <p id={titleId} className="pr-10 text-lg font-bold">
          Sign in to Nerdy
        </p>
        <p id={descriptionId} className="mt-1.5 text-sm leading-6 text-muted">
          {description}
        </p>
        <div className="mt-5 flex flex-col gap-2">
          {/* A native navigation is required to leave the Next.js router for the OAuth backend. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            onClick={onContinue}
            href="/oauth2/authorization/keycloak?idp=google"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-paper/80 px-3 py-2 text-xs shadow-sm transition hover:border-accent/40 hover:bg-soft hover:text-ink motion-safe:hover:-translate-y-0.5"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-soft text-xs font-bold leading-none">
              G
            </span>
            Continue with Google
          </a>
          {/* A native navigation is required to leave the Next.js router for the OAuth backend. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            onClick={onContinue}
            href="/oauth2/authorization/keycloak?idp=github"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-paper/80 px-3 py-2 text-xs shadow-sm transition hover:border-accent/40 hover:bg-soft hover:text-ink motion-safe:hover:-translate-y-0.5"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-soft">
              <GitFork className="h-3.5 w-3.5" />
            </span>
            Continue with GitHub
          </a>
        </div>
      </div>
    </dialog>
  );
}
