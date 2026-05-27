import { Images } from "lucide-react";
import ComingSoon from "@/components/layout/ComingSoon";

export default function GroupsPage() {
  return (
    <ComingSoon
      icon={Images}
      title="My Groups"
      subtitle="Organise your classes and student groups, then assign papers to them directly."
    />
  );
}
