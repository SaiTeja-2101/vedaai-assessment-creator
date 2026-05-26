import CreateAssignmentForm from "@/components/form/CreateAssignmentForm";

// Step 1 of the create flow: assignment details.
export default function NewAssignmentPage() {
  return (
    <div className="animate-rise relative min-h-full overflow-hidden bg-gradient-to-b from-[#EEEEEE] to-[#DADADA] px-4 py-6 lg:rounded-2xl lg:px-6 lg:py-8">
      {/* Soft glow at the bottom, matching the Figma blurred ellipse. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 h-[428px] w-[1113px] max-w-[120%] -translate-x-1/2 rounded-full bg-[rgba(76,76,76,0.25)] blur-[160px]"
      />
      <div className="relative">
        <CreateAssignmentForm />
      </div>
    </div>
  );
}
