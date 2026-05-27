import { BookOpen } from "lucide-react";
import ComingSoon from "@/components/layout/ComingSoon";

export default function ToolkitPage() {
  return (
    <ComingSoon
      icon={BookOpen}
      title="AI Teacher's Toolkit"
      subtitle="Lesson plans, rubrics and grading assistants powered by AI are on the way."
    />
  );
}
