/**
 * Two-segment progress bar for the create flow (step 1 = details, step 2 = review).
 * Completed/active segments are dark; upcoming ones are light grey.
 */
export default function ProgressSteps({
  current = 1,
  total = 2,
}: {
  current?: number;
  total?: number;
}) {
  return (
    <div className="flex w-full items-center gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-[5px] flex-1 rounded-full transition-colors duration-300 ${
            i < current ? "bg-[#5E5E5E]" : "bg-[#DADADA]"
          }`}
        />
      ))}
    </div>
  );
}
