import ContentEditor from "@/app/me/content-editor";
export default async function Page({ params }: { params: Promise<{ publicUri: string }> }) {
  const { publicUri } = await params;
  return <ContentEditor key={publicUri} resource="topics" publicUri={publicUri} />;
}
