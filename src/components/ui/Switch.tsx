"use client";

import { forwardRef, InputHTMLAttributes, useId } from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, ...props }, ref) => {
    const generatedId = useId();
    const switchId = id || generatedId;

    return (
      <label
        htmlFor={switchId}
        className="inline-flex items-center gap-3 cursor-pointer select-none"
      >
        <div className="relative">
          <input
            ref={ref}
            id={switchId}
            type="checkbox"
            className="peer sr-only"
            {...props}
          />

          {/* Track */}
          <div
            className={cn(
              "h-7 w-12 rounded-full",
              "bg-gray-300 dark:bg-neutral-700",
              "transition-colors duration-200",
              "peer-checked:bg-primary-600",
              "peer-focus-visible:ring-2",
              "peer-focus-visible:ring-primary-500",
              "peer-focus-visible:ring-offset-2",
              "peer-focus-visible:ring-offset-white",
              "dark:peer-focus-visible:ring-offset-neutral-950",
              className,
            )}
          />

          {/* Thumb */}
          <div
            className={cn(
              "absolute left-1 top-1",
              "h-5 w-5 rounded-full",
              "bg-white shadow-sm",
              "transition-transform duration-200 ease-out",
              "peer-checked:translate-x-5",
            )}
          />
        </div>

        {label && (
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {label}
          </span>
        )}
      </label>
    );
  },
);

Switch.displayName = "Switch";
