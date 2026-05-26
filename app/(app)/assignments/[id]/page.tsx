import PaperView from "@/components/paper/PaperView";
import { getMockPaper } from "@/lib/paper";

// Output question paper. Currently loads a mock structured paper; the backend
// phase swaps getMockPaper for an API fetch of the AI-generated, validated paper.
export default async function AssignmentOutputPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paper = getMockPaper(id);

  return <PaperView paper={paper} />;
}
