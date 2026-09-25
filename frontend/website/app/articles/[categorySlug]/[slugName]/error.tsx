"use client";

import ContentError from "@/app/components/content-error";

export default function ArticleError({ retry }: { retry: () => void }) {
  return <ContentError retry={retry} title="Article is temporarily unavailable" />;
}
