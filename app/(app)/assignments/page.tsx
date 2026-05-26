import AssignmentsView from "@/components/assignments/AssignmentsView";

// Shows the empty state when there are no assignments, otherwise the filled
// list with search + CRUD. Data currently comes from a client store; it will
// be swapped for an API fetch in the backend phase.
export default function AssignmentsPage() {
  return <AssignmentsView />;
}
