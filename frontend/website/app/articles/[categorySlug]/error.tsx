"use client";

import ContentError from "@/app/components/content-error";

export default function CategoryError({ retry }: { retry: () => void }) {
  return <ContentError retry={retry} title="Articles are temporarily unavailable" />;
}
