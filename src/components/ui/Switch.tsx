'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex items-center space-x-3">
        <div className="relative">
          <input
            type="checkbox"
            ref={ref}
            id={switchId}
            className={cn(
              'peer h-6 w-6 shrink-0 cursor-pointer appearance-none rounded-full border-2 border-gray-300 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:border-neutral-600 dark:bg-neutral-800 dark:focus:ring-offset-neutral-950',
              'checked:border-primary-600 checked:bg-primary-600 checked:dark:border-primary-600 checked:dark:bg-primary-600',
              'after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform after:shadow-sm peer-checked:after:translate-x-full',
              className
            )}
            {...props}
          />
        </div>
        {label && (
          <label htmlFor={switchId} className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
            {label}
          </label>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';