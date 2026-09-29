"use client";

import { useEffect, useId, useRef } from "react";
import { GitFork, X } from "lucide-react";
import BrandMark from "./components/brand-mark";

const provider = "inline-flex h-11 items-center justify-center gap-2.5 rounded-xl border border-line bg-surface px-4 text-sm font-semibold no-underline shadow-card transition hover:border-accent/50 hover:bg-soft motion-safe:hover:-translate-y-0.5";

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
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[min(90vw,24rem)] overflow-y-auto rounded-2xl border border-line bg-surface p-0 text-ink shadow-pop backdrop:bg-black/55 backdrop:backdrop-blur-sm"
    >
      <div className="relative isolate overflow-hidden p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 -z-10 h-52 w-52 rounded-full bg-accent-soft blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 -z-10 h-48 w-48 rounded-full bg-highlight-soft opacity-80 blur-3xl" aria-hidden="true" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sign-in dialog"
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-soft hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
        <BrandMark className="mx-auto mt-2 block h-16 w-16" />
        <p id={titleId} className="mt-4 text-center text-xl font-bold tracking-tight">
          Welcome to nerdiez
        </p>
        <p id={descriptionId} className="mt-1 text-center text-sm leading-6 text-muted">
          {description}
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          {/* A native navigation is required to leave the Next.js router for the OAuth backend. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a onClick={onContinue} href="/oauth2/authorization/keycloak?idp=google" className={provider}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-8Z" /><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23Z" /><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8l3.7-2.8Z" /><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4Z" /></svg>
            Continue with Google
          </a>
          {/* A native navigation is required to leave the Next.js router for the OAuth backend. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a onClick={onContinue} href="/oauth2/authorization/keycloak?idp=github" className={provider}>
            <GitFork className="h-4 w-4" />
            Continue with GitHub
          </a>
        </div>
        <p className="mt-5 text-center text-xs text-muted">Read freely. Sign in to write, ask, reply, and vote.</p>
      </div>
    </dialog>
  );
}
