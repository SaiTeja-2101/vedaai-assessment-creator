import { LayoutGrid } from "lucide-react";
import ComingSoon from "@/components/layout/ComingSoon";

export default function HomePage() {
  return (
    <ComingSoon
      icon={LayoutGrid}
      title="Home"
      subtitle="Your dashboard with recent activity and quick actions will live here. For now, head to Assignments to create and generate question papers."
    />
  );
}
