import PaperScreen from "@/components/paper/PaperScreen";

export default async function AssignmentOutputPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PaperScreen id={id} />;
}
