import { PieChart } from "lucide-react";
import ComingSoon from "@/components/layout/ComingSoon";

export default function LibraryPage() {
  return (
    <ComingSoon
      icon={PieChart}
      title="My Library"
      subtitle="A searchable archive of every paper you've generated, ready to reuse and export."
    />
  );
}
