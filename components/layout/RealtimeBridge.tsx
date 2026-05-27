"use client";

import { useEffect } from "react";
import { subscribeToActivity } from "@/lib/socket";
import { useAssignments } from "@/lib/assignments";
import { useToasts } from "@/lib/toast";

export default function RealtimeBridge() {
  const applyStatus = useAssignments((s) => s.applyStatus);
  const push = useToasts((s) => s.push);

  useEffect(() => {
    return subscribeToActivity((a) => {
      applyStatus(a.assignmentId, a.status);
      const name = a.title || "Your assignment";
      if (a.status === "completed") push(`"${name}" is ready.`, "success");
      else if (a.status === "failed") push(`"${name}" failed to generate.`, "error");
    });
  }, [applyStatus, push]);

  return null;
}
