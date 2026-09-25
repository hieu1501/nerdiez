"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useAuth } from "@/app/auth-provider";

// Signed-out users stay on the current page and get the sign-in dialog; after sign-in they land on `href`.
export default function SignedInLink({ href, prompt, onClick, ...props }: ComponentProps<typeof Link> & { href: string; prompt: string }) {
  const { status, requestSignIn } = useAuth();
  return <Link href={href} {...props} onClick={(event) => {
    onClick?.(event);
    if (status !== "anonymous" || event.defaultPrevented) return;
    event.preventDefault();
    requestSignIn(prompt, href);
  }} />;
}
