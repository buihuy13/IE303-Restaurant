import type { DeliveryStep } from "@/hooks/delivery/useDeliveryTracking";

type DeliveryTimelineProps = {
  steps: DeliveryStep[];
};

export function DeliveryTimeline({ steps }: DeliveryTimelineProps) {
  if (!steps.length) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-brand-black">
        Delivery status
      </h2>
      <ol className="relative space-y-4 border-l border-gray-200 pl-4">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const dotBase =
            "flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white";
          const labelBase = "text-sm font-semibold";
          const descBase = "text-xs text-brand-grey";

          let dotClass = "border-gray-300 text-gray-400";
          let labelClass = "text-brand-grey";

          if (step.state === "done") {
            dotClass = "border-brand-green bg-brand-green text-brand-white";
            labelClass = "text-brand-black";
          } else if (step.state === "current") {
            dotClass = "border-brand-orange bg-brand-orange text-brand-white";
            labelClass = "text-brand-black";
          } else if (step.state === "cancelled") {
            dotClass = "border-red-500 bg-red-500 text-brand-white";
            labelClass = "text-red-600";
          }

          return (
            <li key={step.id} className="relative pl-4">
              {!isLast && (
                <span className="absolute left-[11px] top-6 h-full w-px bg-gray-200" />
              )}
              <div className="flex items-start gap-3">
                <div className={`${dotBase} ${dotClass}`}>
                  <span className="text-xs font-bold">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <p className={`${labelBase} ${labelClass}`}>{step.label}</p>
                  <p className={descBase}>{step.description}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

